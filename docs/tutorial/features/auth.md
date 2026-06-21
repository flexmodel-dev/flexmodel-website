---
sidebar_position: 40
---

# 身份认证

Flexmodel 提供了完整的身份认证体系，包括系统级的 RBAC 权限管理、API Key 管理和项目级的身份提供商集成。

## 系统级认证（RBAC）

Flexmodel 采用基于角色的访问控制（RBAC）模型，管理用户对系统资源的访问权限。

### 关键概念

| 概念 | 说明 |
|------|------|
| 用户 (User) | 系统使用者，拥有登录凭证 |
| 角色 (Role) | 权限的集合，用户通过关联角色获得权限 |
| 资源 (Resource) | 系统中受保护的对象（API、页面等） |
| 权限 (Permission) | 对资源的操作授权 |

### JWT 安全验证

所有管理端 API 访问通过 JWT Token 进行安全验证：

1. 用户登录后获取 JWT Access Token（有效期 7 天）和 Refresh Token（有效期 30 天，通过 HttpOnly Cookie 传递）
2. 后续请求在 Header 中携带 Access Token：`Authorization: Bearer <token>`
3. 服务端验证 Token 有效性并提取用户信息
4. 根据用户角色判断是否有权限访问目标资源
5. Access Token 过期后可通过 Refresh Token 自动续期

## API Key 管理（系统级）

API Key 用于外部系统集成认证，如 MCP 客户端、脚本调用等场景。API Key 为系统级功能，由平台统一管控。

### 特性

| 特性 | 说明 |
|------|------|
| 密钥类型 | 支持 `anon`、`service`、`custom` 等类型 |
| 项目范围控制 | 通过 `projectIds` 白名单字段限制可访问的项目范围（空表示全部） |
| 只读模式 | 可配置为只读权限 |
| 密钥轮换 | 支持重新生成（Regenerate）密钥，旧密钥立即失效 |
| 安全存储 | 仅存储 SHA-256 哈希，明文仅在创建时返回一次 |

### 使用方式

API Key 可通过请求头 `X-API-Key` 或 URL 参数 `api_key` 传递，用于访问项目数据 API 和 MCP 端点。

## 项目级身份提供商

每个项目可以配置独立的身份认证方式，用于对外部请求进行认证。当前支持以下提供商：

| 提供商类型 | 说明 |
|----------|------|
| OIDC | OpenID Connect 协议，通过 Token Introspection 验证 Bearer Token |
| Function | 云函数认证，调用指定的云函数进行自定义认证逻辑 |

### OIDC 认证

配置 OIDC 提供商后，可通过外部身份源（如企业 IdP）签发的 Bearer Token 进行认证：

- 通过 Token Introspection 端点验证 Token 有效性
- 自动提取 `sub`（用户标识）和 `scope`（权限范围）
- 支持配置 `issuer`、`clientId`、`clientSecret`

### Function 认证

Function 提供商允许通过云函数实现自定义认证逻辑：

- 调用项目内指定的云函数进行认证
- 函数返回 HTTP 200 表示认证成功，其他状态码视为失败
- 认证上下文（请求信息、Bearer Token 等）作为函数输入传入

## API 端点

### 认证授权

| 端点 | 说明 |
|------|------|
| `POST /api/auth/login` | 用户登录（返回 Access Token + Refresh Token） |
| `POST /api/auth/refresh` | 刷新 Access Token（通过 Refresh Token Cookie） |
| `GET /api/auth/whoami` | 获取当前用户信息 |

### 用户与角色管理

| 端点 | 说明 |
|------|------|
| `GET /api/users` | 获取用户列表 |
| `GET /api/roles` | 获取角色列表 |
| `GET /api/resources` | 获取资源列表 |

### API Key 管理

| 端点 | 说明 |
|------|------|
| `GET /api-keys` | 获取 API Key 列表 |
| `POST /api-keys` | 创建 API Key（返回明文，仅此一次） |
| `POST /api-keys/{id}/regenerate` | 重新生成 API Key（轮换密钥） |
| `DELETE /api-keys/{id}` | 删除 API Key |

### 项目身份提供商

| 端点 | 说明 |
|------|------|
| `GET /api/projects/{projectId}/auth-providers` | 获取项目身份提供商配置 |
| `POST /api/projects/{projectId}/auth-providers` | 创建身份提供商配置 |
| `PUT /api/projects/{projectId}/auth-providers/{name}` | 更新身份提供商配置 |
| `DELETE /api/projects/{projectId}/auth-providers/{name}` | 删除身份提供商配置 |

更多端点请参考 Swagger UI (`/q/swagger-ui`)。
