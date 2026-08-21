---
sidebar_position: 9
---

# 实时订阅

Flexmodel 在数据记录发生变更（插入、更新、删除）时，会实时产生数据变更事件。目前提供两种订阅方式：

- **WebSocket**：面向前端应用的实时推送，适合在线协作、即时刷新等场景，无需额外中间件。
- **RabbitMQ**：面向后端系统的异步消息投递，适合跨服务联动、数据同步、ETL 等场景，需接入 RabbitMQ broker。

两种方式互不影响，可单独或同时启用。

## 关键概念

### 数据变更事件

当任意模型的记录被创建、更新或删除时，引擎层会发出后置事件（INSERTED / UPDATED / DELETED）。实时订阅功能将这些事件转换为结构化消息推送给订阅者。

### 事件类型

| 事件类型 | 说明     |
|----------|----------|
| `INSERT` | 记录创建 |
| `UPDATE` | 记录更新 |
| `DELETE` | 记录删除 |

## WebSocket 订阅

WebSocket 方式默认启用，无需额外配置，适合前端应用实时接收数据变更。

### 连接端点

```
ws://<host>/api/projects/{projectId}/realtime
```

其中 `{projectId}` 为项目 ID，连接建立后服务端会自动将其解析为对应的数据库 schema。

### 消息协议

客户端与服务端通过 JSON 文本帧通信，消息均包含 `type` 字段标识类型。

#### 订阅

连接成功后，发送订阅消息开始接收事件：

```json
{
  "type": "subscribe",
  "id": "sub-1",
  "channel": "users"
}
```

| 字段      | 类型               | 说明                                                                            |
|-----------|--------------------|---------------------------------------------------------------------------------|
| `type`    | String             | 固定 `subscribe`                                                                |
| `id`      | String             | 订阅 ID，客户端分配，用于后续取消订阅                                           |
| `channel` | String \| String[] | 模型名，支持单表 `"users"`、多表 `["users","orders"]`、通配符 `"*"`（全部模型） |

服务端确认：

```json
{
  "type": "system",
  "event": "subscribe_ok",
  "id": "sub-1",
  "channel": "users"
}
```

#### 取消订阅

```json
{
  "type": "unsubscribe",
  "id": "sub-1"
}
```

服务端确认：

```json
{
  "type": "system",
  "event": "unsubscribe_ok",
  "id": "sub-1"
}
```

#### 心跳

```json
{
  "type": "heartbeat"
}
```

服务端响应：

```json
{
  "type": "system",
  "event": "heartbeat_ok"
}
```

### 事件推送

当订阅的模型发生数据变更时，服务端推送事件消息：

```json
{
  "type": "realtime",
  "sub_id": "sub-1",
  "event": "INSERT",
  "model": "users",
  "record_id": "1024",
  "timestamp": "2026-08-20T08:30:00Z",
  "affected_rows": 1,
  "data": {
    "id": 1024,
    "name": "张三"
  },
  "old_data": {
    "name": "李四"
  }
}
```

| 字段            | 说明                                                  |
|-----------------|-------------------------------------------------------|
| `type`          | 固定 `realtime`                                       |
| `sub_id`        | 匹配的订阅 ID                                         |
| `event`         | 事件类型（`INSERT` / `UPDATE` / `DELETE`）            |
| `model`         | 模型名                                                |
| `record_id`     | 记录主键                                              |
| `timestamp`     | ISO-8601 UTC 时间戳                                   |
| `affected_rows` | 影响行数                                              |
| `data`          | 变更后的数据（INSERT / UPDATE 包含；DELETE 可能为空） |
| `old_data`      | 变更前的数据（UPDATE / DELETE 包含；INSERT 为空）     |

### 客户端示例

```javascript
const ws = new WebSocket("ws://localhost:8080/api/projects/default/realtime");

ws.onopen = () => {
    ws.send(JSON.stringify({
        type: "subscribe",
        id: "sub-1",
        channel: "users"
    }));
};

ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === "realtime") {
        console.log(`[${msg.event}] ${msg.model}#${msg.record_id}`, msg.data);
    }
};
```

## RabbitMQ 订阅

RabbitMQ 方式将数据变更事件投递到消息中间件，供外部系统异步消费，适合跨服务数据同步、审计流水、ETL 等场景。

### 工作原理

数据变更事件被转发到名为 `flexmodel.events` 的 **topic** 交换机（与流程生命周期事件共用同一交换机），通过 routing key
区分事件类型。投递为尽力而为：失败仅告警，不阻塞数据写入主流程。

### Routing Key

格式为 `data.<projectId>.<modelName>.<operation>`：

| Routing Key                 | 说明                                  |
|-----------------------------|---------------------------------------|
| `data.default.users.insert` | `default` 项目 `users` 模型的插入事件 |
| `data.default.users.update` | `default` 项目 `users` 模型的更新事件 |
| `data.default.users.delete` | `default` 项目 `users` 模型的删除事件 |
| `data.*.users.*`            | 全部项目 `users` 模型全部变更         |
| `data.default.*.insert`     | `default` 项目全部模型的插入事件      |
| `data.#`                    | 全部项目全部数据变更事件              |

### 消息载荷

消息体为 JSON，字段如下：

```json
{
  "routingKey": "data.default.users.insert",
  "projectId": "default",
  "event": "INSERT",
  "model": "users",
  "schema": "default",
  "recordId": "1024",
  "timestamp": 1724136600000,
  "affectedRows": 1,
  "data": {
    "id": 1024,
    "name": "张三"
  },
  "oldData": {}
}
```

| 字段           | 说明                                         |
|----------------|----------------------------------------------|
| `routingKey`   | 路由键，与 AMQP envelope 的 routing key 一致 |
| `projectId`    | 项目 ID                                      |
| `event`        | 事件类型（`INSERT` / `UPDATE` / `DELETE`）   |
| `model`        | 模型名                                       |
| `schema`       | 数据库名（由 projectId 解析）                |
| `recordId`     | 记录主键                                     |
| `timestamp`    | 事件时间戳（Unix 毫秒）                      |
| `affectedRows` | 影响行数                                     |
| `data`         | 变更后的数据                                 |
| `oldData`      | 变更前的数据（INSERT 时为空对象）            |

### 启用事件转发

数据变更事件转发默认关闭，需在 Flexmodel 服务端开启并连接 RabbitMQ broker：

```properties

# broker 连接配置（或开启 DevServices）
quarkus.rabbitmq.host=localhost
quarkus.rabbitmq.username=guest
quarkus.rabbitmq.password=guest
```

Docker Compose 部署时，通过环境变量控制：

```bash
FLEXMODEL_REALTIME_EVENTS_RABBITMQ_ENABLED=true
QUARKUS_RABBITMQ_HOST=rabbitmq
QUARKUS_RABBITMQ_USERNAME=flexmodel
QUARKUS_RABBITMQ_PASSWORD=flexmodel
```

### 订阅事件

topic 交换机支持按 routing key 通配符匹配队列绑定：

**Quarkus 服务订阅**（smallrye-messaging-rabbitmq）：

```java

@ApplicationScoped
public class DataChangeEventListener {

    @Incoming("events-in")
    public void consume(org.eclipse.microprofile.reactive.messaging.Message<String> msg) {
        System.out.println("received data change event: " + msg.getPayload());
        msg.ack();
    }
}

// application.properties
// mp.messaging.incoming.events-in.connector=smallrye-rabbitmq
// mp.messaging.incoming.events-in.exchange.name=flexmodel.events
// mp.messaging.incoming.events-in.exchange.routing-keys=data.#
// mp.messaging.incoming.events-in.queue.name=external.data.events
// mp.messaging.incoming.events-in.queue.durable=true
```

**通用 AMQP 客户端订阅**（以 Python pika 为例）：

```python
import pika, json

conn = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
ch = conn.channel()
ch.exchange_declare(exchange="flexmodel.events", exchange_type="topic", durable=True)
q = ch.queue_declare(queue="external.data.events", durable=True).method.queue
ch.queue_bind(exchange="flexmodel.events", queue=q, routing_key="data.#")

for method, _, body in ch.consume(q):
    event = json.loads(body)
    # routing key 也可从 JSON 载荷的 routingKey 字段读取
    print(method.routing_key, event["projectId"], event["model"], event["event"], event["recordId"])
```

## 两种方式对比

| 维度         | WebSocket                  | RabbitMQ                                     |
|--------------|----------------------------|----------------------------------------------|
| 适用场景     | 前端实时刷新、在线协作     | 跨服务联动、数据同步、ETL                    |
| 是否需中间件 | 否                         | 是（RabbitMQ）                               |
| 默认启用     | 是                         | 否                                           |
| 订阅粒度     | 项目维度 + 模型过滤        | routing key 通配符过滤                       |
| 投递保证     | 尽力而为（连接断开丢消息） | 尽力而为（broker 持久化需配置 durable 队列） |
| 消费模式     | 推送（服务端 → 客户端）    | 拉取（消费端按需消费）                       |

:::note

数据变更事件量可能较大（每次 CRUD 均触发），启用 RabbitMQ 转发前请评估 broker 容量与消费端处理能力。

:::