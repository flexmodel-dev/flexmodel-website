---
sidebar_position: 11
---

# AI 助手

应用内的 AI 对话入口：顶部常驻助手、应用机器人、AI 对话页面、工作台组件，以及
「新建应用 > AI 创建应用」。模型基于 langchain4j function calling 调用真实工具，
页面助手与 MCP Server 共用同一套工具定义。

## 统一会话与应用上下文

AI 会话只有一套：按机器人 + 用户隔离，不按应用拆分。

- **内置助手**（保留 ID `assistant`）全站共用一份会话历史，无论从管理区还是任意应用内打开。
  进入某个应用后发送消息会自动把当前应用作为 **隐藏上下文**传给模型（页面不展示、用户无需输入），
  模型优先围绕该应用回答与操作。
- 消息中可以用 **`@应用名` 显式指定应用**，支持多个（如 `@库存管理 @订单管理 对比一下本月数据`）；
  提及按应用名称精确/前缀匹配，优先于隐藏上下文，未匹配到则忽略该提及。
- 既没有隐藏上下文也没有 `@` 提及时，助手处于跨应用模式：通过 `list_apps`/`create_app`
  等工具探索与创建应用。
- **应用机器人**（应用内配置的机器人）同样走统一会话，其应用上下文固定为机器人所属应用。

## 入口与形态

| 入口           | 位置                                                            | 说明                                                                                   |
|----------------|-----------------------------------------------------------------|----------------------------------------------------------------------------------------|
| 顶部 AI 助手   | 所有页面顶栏右侧                                                | 展开右侧面板；管理区展示「应用搭建助手」文案，业务页自动携带当前应用上下文             |
| AI 创建应用    | 应用管理 > 新建应用 > AI 创建应用                               | 在新建应用对话框内输入需求或选择推荐提示词，确认后打开右侧助手直接创建应用             |
| AI 对话页面    | 导航绑定「AI 对话」内置页面，或 `/apps/:appId/ai/chat/:robotId` | 完整对话页，使用配置的机器人，支持历史会话、新对话、机器人设置与侧栏继续               |
| 工作台 AI 组件 | 工作台布局                                                      | 使用配置的机器人：`shortcut` 展示机器人介绍与输入框并打开助手；`embedded` 内嵌完整对话 |

AI 对话页面、工作台组件与顶部助手面板按机器人共享同一份会话状态：
同一用户在同一机器人下的会话处处可见。

## 机器人

只有内置「AI 对话」页面和工作台 AI 组件需要配置机器人，入口就在使用位置：

- 工作台 AI 组件或 AI 对话页面没有机器人时展示提示与「创建机器人」按钮，创建后直接开始对话。
- AI 对话页面头部的「机器人」按钮可查看、编辑、删除机器人。
- 机器人包含名称、描述、欢迎语、推荐问题（最多 6 条，每条 100 字以内）、角色提示词与启用状态；
  每个应用最多 20 个机器人，第一个启用的机器人作为默认对话对象。
- 仅应用所有者或管理员可创建、修改、删除机器人；机器人被导航或工作台组件引用时不允许删除。
- 停用的机器人不能被普通成员使用；所有者/管理员仍可管理。

顶部 AI 助手不展示、也不要求创建机器人：它使用保留 ID `assistant` 的内置助手，
任何登录用户都可直接对话，会话不写入机器人表。

## 模型接入

模型接入基于 [quarkus-langchain4j](https://docs.quarkiverse.io/quarkus-langchain4j/dev/index.html) 扩展的
OpenAI 兼容提供方。配置后顶部助手、AI 对话页面、工作台组件与 AI 创建应用都会调用真实模型：

```properties
quarkus.langchain4j.openai.base-url=https://api.deepseek.com
quarkus.langchain4j.openai.api-key=sk-...
quarkus.langchain4j.openai.chat-model.model-name=deepseek-flash
quarkus.langchain4j.openai.chat-model.temperature=0.2
quarkus.langchain4j.openai.timeout=60s
# 单次对话中最多连续执行的工具调用轮次
quarkus.langchain4j.ai-service.max-tool-executions=4
```

也可使用环境变量 `FLEXMODEL_AI_BASE_URL`、`FLEXMODEL_AI_API_KEY`、`FLEXMODEL_AI_MODEL`。
本地开发可在项目根目录或 `flexmodel-server/` 下创建 `.env`（已加入 `.gitignore`），Quarkus 会自动加载；
模型名以服务商 `/models` 返回为准（例如 DeepSeek 当前为 `deepseek-flash` / `deepseek-v4-pro`）。
`base-url` 需指向提供 `POST /chat/completions` 的 OpenAI 兼容服务。
未配置 API Key 时发送消息返回错误（不降级为模拟回复），本地开发无需外部依赖即可完成除发送外的全部操作。

## 工具与权限

页面助手与 MCP Server **共用同一套工具**：`AppTools` 与 `DirectoryTools` 使用 langchain4j
`@Tool`/`@P` 注解定义，Quarkus MCP Server 经 `quarkus.mcp.server.support-langchain4j-annotations`
自动注册同一批方法，MCP 客户端与页面 AI 看到的工具名、参数与行为完全一致。

工具覆盖应用、表单、布局、视图、工作台、导航、记录与审批全流程，共 29 个，例如：

| 工具                                                                                     | 说明                          |
|------------------------------------------------------------------------------------------|-------------------------------|
| `list_apps` / `get_app`                                                                  | 查看应用列表与详情            |
| `create_app`                                                                             | 创建应用（AI 创建应用第一步） |
| `list_app_forms` / `get_app_form` / `create_app_form`                                    | 表单与字段设计                |
| `save_app_form_layout` / `save_app_form_views`                                           | 布局、字段控制与视图页签      |
| `list_app_workbenches` / `create_app_workbench` / `save_app_workbench_layout`            | 工作台                        |
| `create_app_navigation` / `create_app_workbench_navigation`                              | 导航                          |
| `query_app_records` / `count_app_records` / `get_app_record` / `create_app_mock_records` | 记录查询与示例数据            |
| `get_app_approval_*` / `save_app_approval_flow` / `set_app_approval_flow_status`         | 审批流                        |
| `get_directory` / `resolve_members`                                                      | 通讯录与审批成员规则          |

完整工具清单与参数契约可从 MCP 端点 `tools/list` 获取。

访问控制由 `McpToolAccess` 统一处理：

- **MCP 调用**：走 API Key 服务身份；Key 可限定应用范围（`projectIds`）与只读（`readOnly`）。
- **页面 AI 调用**：走当前登录用户；查询要求登录，写操作（创建/修改应用内容）要求应用所有者或管理员，
  无权限时工具返回错误，模型会向用户说明。
- 全局助手会话没有应用上下文，模型通过 `list_apps` 探索，写操作按目标应用逐一鉴权。

模型调用失败时接口返回错误，不会把失败结果写入会话。

## 导航绑定

导航关联项选择「AI 对话」内置页面，与工作台绑定方式一致：对话机器人可选，
未选择时页面默认使用第一个启用的机器人。

```json
{
  "type": "ENTRY",
  "name": "数据查询助手",
  "iconName": "Bot",
  "destination": {"type": "BUILTIN", "id": "chatbot", "robotId": "<robot.id>"}
}
```

`robotId` 省略时等价于默认第一个启用的机器人；提供时必须属于当前应用。

工作台 AI 组件配置：

```json
{
  "type": "ai",
  "robotId": "<robot.id>",
  "displayMode": "shortcut",
  "showSuggestions": true
}
```

## API

机器人配置仍在应用维度，会话统一为一套接口：

| 方法   | 路径                                      | 说明                                             |
|--------|-------------------------------------------|--------------------------------------------------|
| GET    | `/api/apps/{appId}/ai/robots`             | 可用机器人列表                                   |
| POST   | `/api/apps/{appId}/ai/robots`             | 创建机器人                                       |
| PUT    | `/api/apps/{appId}/ai/robots/{robotId}`   | 更新机器人                                       |
| DELETE | `/api/apps/{appId}/ai/robots/{robotId}`   | 删除机器人（解除引用后）                         |
| GET    | `/api/ai/conversations?robotId={robotId}` | 当前用户最近 50 个会话（robotId 省略为内置助手） |
| POST   | `/api/ai/conversations`                   | 新建会话，请求体 `{robotId?}`                    |
| POST   | `/api/ai/conversations/{id}/messages`     | 发送消息（SSE 流式返回，见下）                   |
| DELETE | `/api/ai/conversations/{id}`              | 删除会话                                         |

发送消息的请求体为 `{content, appId?}`：`appId` 是隐藏的应用上下文
（进入应用后由前端自动携带），消息中 `@应用名` 提及优先且可指定多个应用。

### 流式返回（SSE）

两个发送消息接口均以 Server-Sent Events 流式返回，事件为 JSON 对象：

| `type`  | 字段           | 说明                                                     |
|---------|----------------|----------------------------------------------------------|
| `token` | `content`      | 回复增量文本，逐段下发                                   |
| `tool`  | `content`      | 模型正在执行的工具名（如 `query_app_records`）           |
| `done`  | `conversation` | 完成：携带落库后的完整会话（含本轮 user/assistant 消息） |
| `error` | `content`      | 模型调用失败原因；本轮不落库                             |

```text
data: {"type":"tool","content":"query_app_records","conversation":null}
data: {"type":"token","content":"共 1 条","conversation":null}
data: {"type":"done","content":null,"conversation":{...完整会话...}}
```

参数校验失败（空消息等）与模型未配置时在流开始前返回 400/500；流中途失败只发 `error` 事件。

会话在 `f_app_ai_conversation` 中按机器人 + 用户隔离，单个会话最多 100 条消息，单条消息最多 4000 个字符。

## 数据表

| 表                      | 说明                                                                                                      |
|-------------------------|-----------------------------------------------------------------------------------------------------------|
| `f_app_ai_robot`        | 机器人配置（`config` JSON）                                                                               |
| `f_app_ai_conversation` | 个人会话与消息（`messages` JSON）；`app_id` 仅为机器人所属应用（助手为 `global`），用于删除应用时级联清理 |

删除应用时一并清理其机器人与机器人会话（内置助手会话不归属应用，不受影响）。

## 当前限制

- MCP 工具尚未提供机器人列表与 AI 组件的写入说明。
- 应用整包导出不包含机器人：导入时若存在 AI 对话导航，会补建一个默认机器人；
  工作台中的 AI 组件会从导入布局中移除。
