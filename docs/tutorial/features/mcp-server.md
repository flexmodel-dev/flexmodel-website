---
sidebar_position: 50
---

# MCP Server

Flexmodel 实现了 MCP（Model Context Protocol）服务器，通过标准化的 MCP 协议将核心能力以工具形式开放给 AI 客户端，让 AI 应用能够直接管理 Flexmodel 项目、数据模型和数据记录。

## MCP 协议概述

MCP（Model Context Protocol）是一种标准化协议，用于 AI 模型与外部工具之间的交互。通过 MCP 协议，AI 客户端（如 Claude Desktop、Cursor 等）可以发现、调用和管理服务器提供的工具。

Flexmodel 基于 Quarkus MCP Server HTTP 扩展实现 MCP 协议，MCP 服务路径为 `/api/mcp`。

## 提供的工具

Flexmodel MCP Server 提供 3 组共 15 个工具：

### 项目管理工具（ProjectTools）

| 工具名称 | 说明 |
|---------|------|
| `list_projects` | 列出所有项目 |
| `get_project` | 获取项目详情 |
| `create_project` | 创建新项目 |
| `delete_project` | 删除项目 |

### 数据建模工具（ModelingTools）

| 工具名称 | 说明 |
|---------|------|
| `list_models` | 列出项目中的所有模型 |
| `get_model` | 获取模型详情 |
| `create_entity_model` | 创建实体模型 |
| `create_enum_model` | 创建枚举模型 |
| `delete_model` | 删除模型 |

### 数据操作工具（DataTools）

| 工具名称 | 说明 |
|---------|------|
| `query_records` | 分页查询数据记录 |
| `get_record` | 获取单条记录 |
| `create_record` | 创建数据记录 |
| `update_record` | 更新数据记录 |
| `delete_record` | 删除数据记录 |

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

任何支持 MCP 协议的客户端都可以通过 `/api/mcp` 端点连接到 Flexmodel，在 URL 中携带 `api_key` 参数完成认证。MCP 工具的参数格式与 REST API 一致，例如 `query_records` 的 filter 参数使用与 [查询条件](../records.md#过滤filter) 相同的 DSL 语法。

## 使用场景

- **AI 辅助建模**: 让 AI 助手根据需求描述自动创建数据模型
- **数据查询与分析**: AI 助手直接查询数据并进行分析
- **自动化运维**: AI 助手管理项目配置和数据维护
- **智能应用集成**: 在 AI 应用中无缝使用 Flexmodel 的数据能力
