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

服务任务和用户任务支持 JavaScript 脚本执行，脚本运行在 GraalVM JavaScript 引擎中，可通过 `context` 对象访问：

- `context.data` — 当前流程实例的数据
- `context.request` — HTTP 请求信息
- `context.response` — HTTP 响应操作
- `context.dbs` — 数据库操作（findById、find 等）

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
