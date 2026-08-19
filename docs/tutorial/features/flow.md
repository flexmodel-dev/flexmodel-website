---
sidebar_position: 10
---

# 流程编排

Flexmodel 提供了基于 BPMN 风格的可视化流程编排能力，允许用户在无需编写代码的情况下，通过拖拽节点的方式构建复杂的后端业务逻辑。

## 关键概念

### 流程定义（Flow Definition）
流程定义是流程的蓝图，描述了节点之间的连接关系和执行逻辑。一个流程定义可以包含多个部署版本。

### 流程部署（Flow Deployment）
流程定义发布后生成流程部署，部署是流程定义的一个可执行版本。

### 流程实例（Flow Instance）
流程部署启动后产生流程实例，代表一次具体的流程执行过程。

## 支持的节点类型

| 节点类型 | 说明 |
|---------|------|
| 开始事件 (StartEvent) | 流程的起点，每个流程必须有一个 |
| 结束事件 (EndEvent) | 流程的终点，执行到此节点后流程结束 |
| 排排网关 (ExclusiveGateway) | 条件分支节点，根据表达式选择唯一的执行路径 |
| 服务任务 (ServiceTask) | 执行服务逻辑的节点，支持 JavaScript 脚本执行 |
| 用户任务 (UserTask) | 需要人工干预的节点，等待用户操作后继续 |
| 调用活动 (CallActivity) | 调用另一个子流程的节点，支持同步调用 |

## 插件体系

流程引擎支持通过插件机制扩展功能：

- **表达式计算插件** (ExpressionCalculatorPlugin) — 计算流程中的条件表达式
- **ID 生成插件** (IdGeneratorPlugin) — 生成流程实例的唯一标识
- **监听器插件** (ListenerPlugin) — 在节点执行前后触发自定义逻辑

插件通过 CDI 容器管理，可以通过 `PluginConfig` 注册自定义插件。

## 脚本执行

服务任务和用户任务支持 JavaScript 脚本执行，脚本运行在 QuickJS 引擎中，可通过 `context` 对象访问：

- `context.data` — 当前流程实例的数据
- `context.request` — HTTP 请求信息
- `context.response` — HTTP 响应操作
- `context.dbs` — 数据库操作（findById、findMany 等）

## API 端点

流程编排相关的 REST API 基础路径为 `/api/projects/{projectId}/flows`：

| 端点 | 说明 |
|------|------|
| `GET /flows` | 获取流程定义列表 |
| `POST /flows` | 创建流程定义 |
| `PUT /flows/{flowId}` | 更新流程定义 |
| `DELETE /flows/{flowId}` | 删除流程定义 |
| `POST /flows/{flowId}/deploy` | 部署流程定义 |
| `POST /flows/{flowId}/start` | 启动流程实例 |
| `GET /instances` | 获取流程实例列表 |
| `GET /instances/{instanceId}` | 获取流程实例详情 |

更多端点请参考 Swagger UI (`/q/swagger-ui`)。

## 生命周期事件

Flow 引擎在关键生命周期点发布事件，启用 RabbitMQ 桥接后会转发到一个 topic 交换机，外部系统可通过订阅这些事件感知流程状态变化并接入下游业务。

### 事件结构

每条事件载荷均为 JSON。 **公共字段**（所有事件都包含）：

| 字段        | 类型   | 说明                 |
|-------------|--------|----------------------|
| `projectId` | string | 所属项目 ID          |
| `caller`    | string | 触发来源标识         |
| `timestamp` | long   | 事件产生时间（毫秒） |

> routing key 不在 JSON 载荷中，而是作为 AMQP 消息的 `routing key` 随 envelope 投递，订阅端从消息信封读取（见下方示例）。

各事件按类型额外携带字段：

| 事件                           | routing key                        | 额外字段                                                                         | 触发时机                         |
|--------------------------------|------------------------------------|----------------------------------------------------------------------------------|----------------------------------|
| FlowCreatedEvent               | `flow.created`                     | flowModuleId, flowKey                                                            | 定义创建成功后                   |
| FlowUpdatedEvent               | `flow.updated`                     | flowModuleId                                                                     | 定义更新成功后                   |
| FlowDeployedEvent              | `flow.deployed`                    | flowModuleId, flowDeployId                                                       | 定义部署成功后                   |
| FlowDeletedEvent               | `flow.deleted`                     | flowModuleId                                                                     | 定义软删后                       |
| FlowInstanceStartedEvent       | `flow.instance.started`            | flowDeployId, flowInstanceId, variables                                          | 实例启动后                       |
| FlowInstanceCompletedEvent     | `flow.instance.completed`          | flowDeployId, flowInstanceId, variables                                          | 实例完成（COMPLETED/END）后      |
| FlowInstanceFailedEvent        | `flow.instance.failed`             | flowDeployId, flowInstanceId, error                                              | 实例失败后                       |
| FlowInstanceTerminatedEvent    | `flow.instance.terminated`         | flowInstanceId                                                                   | 实例终止后（子流程级联逐个发送） |
| UserTaskSuspendedEvent         | `flow.usertask.suspended`          | flowDeployId, flowInstanceId, nodeInstanceId, nodeKey, variables, nodeAttributes | 用户任务挂起前                   |
| UserTaskCommittedEvent         | `flow.usertask.committed`          | flowDeployId, flowInstanceId, nodeInstanceId, nodeKey, nodeAttributes            | 用户任务提交完成                 |
| UserTaskRollbackSuspendedEvent | `flow.usertask.rollback.suspended` | flowDeployId, flowInstanceId, nodeInstanceId, nodeKey, nodeAttributes            | 用户任务回滚挂起前               |

> - `variables`：事件产生时刻的流程变量快照（对象），已做防御性拷贝，不可变。
> - `nodeAttributes`：节点定义的扩展属性快照（即流程定义中该节点配置的 `properties`
    ，对象）。用户任务类事件携带，外部订阅者无需回查流程定义仓库即可读取节点配置（如审批人、表单、阈值等）。

### 事件数据结构

下列为各事件 JSON 载荷示例（省略公共字段 `projectId`/`caller`/`timestamp`）。

**定义层**

```json
// flow.created
{
  "flowModuleId": "m1",
  "flowKey": "leave-approval"
}

// flow.updated
{
  "flowModuleId": "m1"
}

// flow.deployed
{
  "flowModuleId": "m1",
  "flowDeployId": "d1"
}

// flow.deleted
{
  "flowModuleId": "m1"
}
```

**实例层**

```json
// flow.instance.started
{
  "flowDeployId": "d1",
  "flowInstanceId": "i1",
  "variables": {
    "amount": 100,
    "applicant": "alice"
  }
}

// flow.instance.completed
{
  "flowDeployId": "d1",
  "flowInstanceId": "i1",
  "variables": {
    "amount": 100,
    "approved": true
  }
}

// flow.instance.failed
{
  "flowDeployId": "d1",
  "flowInstanceId": "i1",
  "error": "表达式执行异常"
}

// flow.instance.terminated
{
  "flowInstanceId": "i1"
}
```

**用户任务层**

```json
// flow.usertask.suspended
{
  "flowDeployId": "d1",
  "flowInstanceId": "i1",
  "nodeInstanceId": "ni1",
  "nodeKey": "approveNode",
  "variables": {
    "amount": 500
  },
  "nodeAttributes": {
    "name": "审批",
    "assignee": "manager",
    "multiInstance": false
  }
}

// flow.usertask.committed
{
  "flowDeployId": "d1",
  "flowInstanceId": "i1",
  "nodeInstanceId": "ni1",
  "nodeKey": "approveNode",
  "nodeAttributes": {
    "name": "审批",
    "assignee": "manager"
  }
}

// flow.usertask.rollback.suspended
{
  "flowDeployId": "d1",
  "flowInstanceId": "i1",
  "nodeInstanceId": "ni2",
  "nodeKey": "approveNode",
  "nodeAttributes": {
    "name": "审批",
    "assignee": "manager"
  }
}
```

### 启用事件转发

事件转发默认关闭，需在 Flexmodel 服务端开启并连接 RabbitMQ broker：

```properties
mp.messaging.outgoing.flow-events-out.connector=smallrye-rabbitmq
mp.messaging.outgoing.flow-events-out.exchange.name=flexmodel.flow.events
mp.messaging.outgoing.flow-events-out.exchange.type=topic
mp.messaging.outgoing.flow-events-out.exchange.durable=true
mp.messaging.outgoing.flow-events-out.enabled=true
# broker 连接配置（或开启 DevServices）
quarkus.rabbitmq.host=localhost
quarkus.rabbitmq.username=guest
quarkus.rabbitmq.password=guest
```

启用后，事件会被转发到名为 `flexmodel.flow.events` 的 **topic** 交换机，routing key 即上表列出的 key。

### 订阅事件

topic 交换机支持按 routing key 通配符匹配队列绑定：

- `flow.created` — 仅订阅定义创建
- `flow.instance.*` — 订阅全部实例层事件
- `flow.#` — 订阅所有 Flow 生命周期事件

**Quarkus 服务订阅**（smallrye-messaging-rabbitmq）：

```java

@ApplicationScoped
public class FlowEventListener {

    @Incoming("flow-events-in")
    public void consume(org.eclipse.microprofile.reactive.messaging.Message<String> msg) {
        // 消息体为事件 JSON；可结合 incoming 通道的 routing-key 元数据分发
        System.out.println("received flow event: " + msg.getPayload());
        msg.ack();
    }
}

// application.properties
// mp.messaging.incoming.flow-events-in.connector=smallrye-rabbitmq
// mp.messaging.incoming.flow-events-in.exchange.name=flexmodel.flow.events
// mp.messaging.incoming.flow-events-in.exchange.routing-keys=flow.#
// mp.messaging.incoming.flow-events-in.queue.name=external.flow.events
// mp.messaging.incoming.flow-events-in.queue.durable=true
```

**通用 AMQP 客户端订阅**（以 Python pika 为例）：

```python
import pika, json
conn = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
ch = conn.channel()
ch.exchange_declare(exchange="flexmodel.flow.events", exchange_type="topic", durable=True)
q = ch.queue_declare(queue="external.flow.events", durable=True).method.queue
ch.queue_bind(exchange="flexmodel.flow.events", queue=q, routing_key="flow.#")
for method, _, body in ch.consume(q):
    event = json.loads(body)
    # routing key 从 AMQP envelope 读取，不在 JSON 载荷中
    print(method.routing_key, event["projectId"], event.get("flowInstanceId"))
```

:::note

v1 不包含 `node-instance-created`、`service-task-executed/failed`、`gateway-evaluated` 等事件，后续按相同模式按需追加。

:::
