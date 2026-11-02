---
sidebar_position: 50
---

# MCP Server

Flexmodel 实现了 MCP（Model Context Protocol）服务器，通过标准化的 MCP 协议将核心能力以工具形式开放给 AI 客户端，让 AI 应用能够直接管理 Flexmodel 项目、数据模型和数据记录。

## MCP 协议概述

MCP（Model Context Protocol）是一种标准化协议，用于 AI 模型与外部工具之间的交互。通过 MCP 协议，AI 客户端（如 Claude Desktop、Cursor 等）可以发现、调用和管理服务器提供的工具。

Flexmodel 基于 Quarkus MCP Server HTTP 扩展实现 MCP 协议，MCP 服务路径为 `/api/mcp`。

## 提供的工具

Flexmodel MCP Server 按项目、建模、数据、函数、应用和通用人员目录分组提供工具：

### 项目管理工具（ProjectTools）

| 工具名称 | 说明 |
|---------|------|
| `list_projects` | 列出所有项目 |
| `get_project` | 获取项目详情 |
| `create_project` | 创建新项目 |
| `delete_project` | 删除项目 |

### 数据建模工具（ModelingTools）

| 工具名称              | 说明                 |
|-----------------------|----------------------|
| `list_models`         | 列出项目中的所有模型 |
| `get_model`           | 获取模型详情         |
| `create_entity_model` | 创建实体模型         |
| `create_enum_model`   | 创建枚举模型         |
| `delete_model`        | 删除模型             |
| `execute_fml`         | 执行 FML 脚本        |

### 数据操作工具（DataTools）

| 工具名称 | 说明 |
|---------|------|
| `query_records` | 分页查询数据记录 |
| `get_record` | 获取单条记录 |
| `create_record` | 创建数据记录 |
| `update_record` | 更新数据记录 |
| `delete_record` | 删除数据记录 |

### 边缘函数工具（FunctionTools）

| 工具名称                  | 说明                         |
|---------------------------|------------------------------|
| `list_function_templates` | 列出函数模板                 |
| `list_functions`          | 列出项目中的边缘函数         |
| `get_function`            | 获取函数详情                 |
| `deploy_function`         | 部署函数到 Functions Runtime |
| `invoke_function`         | 调用函数                     |
| `delete_function`         | 删除函数                     |

### 应用工具（AppTools）

| 工具名称                                              | 说明                                                     |
|-------------------------------------------------------|----------------------------------------------------------|
| `list_apps` / `get_app` / `create_app`                | 查询或创建应用                                           |
| `list_app_forms` / `get_app_form` / `create_app_form` | 查询表单或创建表单及字段                                 |
| `save_app_form_layout`                                | 保存表单扁平布局与字段显示控制（`controlsJson`）         |
| `create_app_menu`                                     | 创建应用菜单并绑定表单、内置页面或链接                   |
| `create_app_mock_records`                             | 创建显式示例记录                                         |
| `list_app_workbenches` / `get_app_workbench`          | 查询工作台                                               |
| `get_app_workbench_capabilities`                      | 获取工作台组件契约                                       |
| `get_app_workbench_component_data`                    | 查询组件真实数据                                         |
| `create_app_workbench` / `save_app_workbench_layout`  | 创建工作台或保存布局                                     |
| `create_app_workbench_menu`                           | 创建关联工作台的菜单                                     |
| `get_app_approval_capabilities`                       | 获取审批节点配置、表单字段、子流程、限制及完整 Flow 示例 |
| `list_app_approval_flows` / `get_app_approval_flow`   | 查询应用审批流程及最新 revision                          |
| `save_app_approval_flow`                              | 新建或更新审批草稿                                       |
| `validate_app_approval_flow`                          | 发布前校验，返回带 nodeId 的问题列表                     |
| `set_app_approval_flow_status`                        | 发布启用或停用审批流程                                   |

`save_app_form_layout` 额外支持可选的 `controlsJson`，按字段名配置隐藏、必填、只读：

```json
{
  "title": {
    "hidden": {
      "scenes": [
        "CREATE",
        "UPDATE"
      ],
      "condition": {
        "status": {
          "_eq": "REJECTED"
        }
      }
    }
  },
  "amount": {
    "readonly": {
      "scenes": [
        "UPDATE"
      ]
    }
  }
}
```

`scenes` 非空，取 `CREATE` / `UPDATE`；`condition` 复用记录查询 filter DSL，缺省表示在所选场景始终生效。
省略 `controlsJson` 保留现有控制，传 `{}` 清空；控制键必须出现在 `itemsJson` 中，内置字段始终展示且只读、忽略控制。
条件中的字段名应先通过 `get_app_form` 确认。

### 通用人员目录工具（DirectoryTools）

| 工具名称          | 说明                                                         |
|-------------------|--------------------------------------------------------------|
| `get_directory`   | 查询系统启用用户、角色、组织层级及人员选择规则，不需要 appId |
| `resolve_members` | 使用真实目录预览人员规则，稳定去重后返回用户 ID              |

目录只返回用于选择的成员信息，不返回密码等认证字段。人员来源支持 `users`、`roles`、`organizations`、`initiator`、`node`、
`variable`；范围支持 `self`、`directReports`、`allReports`、`manager`。`resolve_members` 的 `initiatorId` 和 `variablesJson`
仅为预览上下文，不会代替真实用户提交或签核。

## 通过 MCP 创建应用审批流程

连接后，可以向 AI 描述需求，例如：

> 在费用管理应用的报销表单上创建审批流程：先由发起人的直属上级审批；金额超过 5000 元时，再由财务角色会签；通过后结束。

工具调用顺序：

1. `list_apps`、`list_app_forms`：确定 appId、表单名和实际字段名。
2. `get_app_approval_capabilities(appId)`：读取节点配置与 `examples.simple` / `examples.gateway`
   。示例优先绑定当前应用的第一个真实表单，使用前需替换成目标表单。
3. `get_directory()`、`resolve_members(...)`：确定真实人员、角色或部门 ID，按需预览相对人员规则。
4. `list_app_approval_flows(appId)`：避免重复创建，查找需要引用的子流程。
5. `save_app_approval_flow(appId, flowJson)`：省略 flowId 创建草稿，保存返回的 flow_module_id 和 revision。
6. `validate_app_approval_flow(appId, flowJson)`：传入保存后的完整定义，修正问题直至返回空数组。
7. `set_app_approval_flow_status(appId, flowId, 2, revision)`：发布启用。

`flowJson` 是包含 `flow_name`、`flow_model`、可选 `flow_key` / `remark` 的 JSON 对象字符串；其中 **`flow_model` 本身也是
JSON 字符串**，内部为 `flowElementList`。节点的配置和设计器层级必须与连线一致，应从能力目录的完整示例开始修改。不要传入
FlowGram 节点树，也不要自行写入服务端 handler、handlerOwner 或发布元数据。

修改已有流程时，先读取最新定义，再携带 flowId 和 flowJson 中的 revision 保存。保存已启用流程会使其转为草稿，需重新发布；停用使用
status=3。发生版本冲突时重新读取并合并修改，已有运行实例保持原发布版本。

新增审批工具检查 API Key 的项目范围，且只读 Key 不能保存或发布。审计身份为 `api_key:<keyId>`
，不会冒充审批人。发布不会自动提交记录，用户需在记录详情显式提交审批；运行时要求 SQL 项目数据库。

## 认证

MCP 端点需要通过 URL query 参数 `api_key` 传递 API Key 进行身份认证。API Key 可在管理后台的「API Key」页面创建和管理。

在 URL 末尾追加 `?api_key=<your_api_key>` 即可：

```json
{
  "mcpServers": {
    "flexmodel": {
      "url": "http://localhost:8080/api/mcp?api_key=fm_ak_xxxxx"
    }
  }
}
```

缺少或无效的 API Key 将返回 401 认证错误。

### 安全建议

- 为 MCP 使用专用的 API Key，便于独立管理权限和轮换密钥
- 定期在管理后台轮换 API Key（重新生成）
- 避免将 API Key 硬编码在公开代码库中

## AI 客户端集成

### Claude Desktop

在 Claude Desktop 的 MCP 配置中添加 Flexmodel 服务器：

```json
{
  "mcpServers": {
    "flexmodel": {
      "url": "http://localhost:8080/api/mcp?api_key=fm_ak_xxxxx"
    }
  }
}
```

### 其他 MCP 客户端

任何支持 MCP 协议的客户端都可以通过 `/api/mcp` 端点连接到 Flexmodel，在 URL 中携带 `api_key` 参数完成认证。MCP 工具的参数格式与 REST API 一致，例如 `query_records` 的 filter 参数使用与 [查询条件](records.md#过滤filter) 相同的 DSL 语法。

## 使用场景

- **AI 辅助建模**: 让 AI 助手根据需求描述自动创建数据模型
- **数据查询与分析**: AI 助手直接查询数据并进行分析
- **自动化运维**: AI 助手管理项目配置和数据维护
- **智能应用集成**: 在 AI 应用中无缝使用 Flexmodel 的数据能力
