---
sidebar_position: 50
---

# MCP Server

Flexmodel 实现了 MCP（Model Context Protocol）服务器，通过标准化的 MCP 协议将核心能力以工具形式开放给 AI 客户端，让 AI 应用能够直接管理 Flexmodel 项目、数据模型和数据记录。

## MCP 协议概述

MCP（Model Context Protocol）是一种标准化协议，用于 AI 模型与外部工具之间的交互。通过 MCP 协议，AI 客户端（如 Claude Desktop、Cursor 等）可以发现、调用和管理服务器提供的工具。

Flexmodel 基于 Quarkus MCP Server HTTP 扩展实现 MCP 协议，MCP 服务路径为 `/mcp`。

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

## AI 客户端集成

### Claude Desktop

在 Claude Desktop 的 MCP 配置中添加 Flexmodel 服务器：

```json
{
  "mcpServers": {
    "flexmodel": {
      "url": "http://localhost:8080/mcp"
    }
  }
}
```

### 其他 MCP 客户端

任何支持 MCP 协议的客户端都可以通过 `/mcp` 端点连接到 Flexmodel。MCP 工具的参数格式与 REST API 一致，例如 `query_records` 的 filter 参数使用与 [查询条件](../../api/definition/condition.md) 相同的 DSL 语法。

## 使用场景

- **AI 辅助建模**: 让 AI 助手根据需求描述自动创建数据模型
- **数据查询与分析**: AI 助手直接查询数据并进行分析
- **自动化运维**: AI 助手管理项目配置和数据维护
- **智能应用集成**: 在 AI 应用中无缝使用 Flexmodel 的数据能力
