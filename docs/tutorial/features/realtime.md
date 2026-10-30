---
sidebar_position: 9
---

# 实时订阅

Flexmodel 在数据记录发生变更（插入、更新、删除）时，会实时产生数据变更事件，并通过 WebSocket 推送给前端应用，适合在线协作、即时刷新等场景，无需额外中间件。

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
