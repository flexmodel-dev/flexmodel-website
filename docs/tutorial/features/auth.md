---
sidebar_position: 40
---

# 身份认证

Flexmodel 采用三层认证体系（Three-Tier Authentication），覆盖从平台管理到租户数据访问的全部场景。该体系遵循 **Control
Plane / Data Plane** 分离原则——平台管理操作与租户业务数据访问使用不同的认证通道，确保安全边界清晰。

## 三层认证体系概览

```
请求进入 AuthFilter
  │
  ├─ ① Platform Auth（平台认证）
  │     JWT Token → 管理后台用户
  │     适用：Control Plane 操作（项目管理、用户/角色管理、IdP 配置等）
  │
  ├─ ② Service Auth（服务认证）
  │     API Key（fm_ak_* 前缀）→ 机器/服务身份
  │     适用：M2M 场景（CI/CD、MCP 客户端、脚本调用等）
  │
  ├─ ③ Federated Auth（联邦认证）
  │     外部 IdP Token → 租户外部用户
  │     适用：Data Plane 操作（查询记录、GraphQL、触发器等）
  │
  └─ 全部失败 → 401 Unauthorized
```

认证链按顺序依次尝试，任一层成功即终止并填充 `SessionContextHolder`。三层之间互不干扰——平台 JWT 不会触发 OIDC
introspection，API Key 不会尝试联邦认证。

### Control Plane vs Data Plane

| 层                 | 认证方式                         | 职责                          | 典型场景            |
|-------------------|------------------------------|-----------------------------|-----------------|
| **Control Plane** | Platform Auth + Service Auth | 管理平台资源（创建项目、配置 IdP、管理用户/角色） | 管理后台、CI/CD、运维脚本 |
| **Data Plane**    | Federated Auth               | 访问项目业务数据（查询记录、GraphQL、触发器）  | 外部应用、终端用户、第三方集成 |

:::tip 为什么需要分离？

Control Plane 操作（如修改认证配置）如果允许 Data Plane 身份（如 OIDC
认证的外部用户）执行，会导致安全边界模糊——外部用户可能修改项目自身的认证方式，从而绕过安全控制。分离后，Data Plane
身份只能访问业务数据，不能触碰管理配置。

:::

## 第一层：Platform Auth（平台认证）

平台认证基于 JWT + RBAC，服务于管理后台用户。所有管理端 API 访问通过 JWT Token 进行安全验证。

### 关键概念

| 概念 | 说明 |
|------|------|
| 用户 (User) | 系统使用者，拥有登录凭证 |
| 角色 (Role) | 权限的集合，用户通过关联角色获得权限 |
| 资源 (Resource) | 系统中受保护的对象（API、页面等） |
| 权限 (Permission) | 对资源的操作授权 |

### JWT 认证流程

1. 用户登录后获取 JWT Access Token（有效期 7 天）和 Refresh Token（有效期 30 天，通过 HttpOnly Cookie 传递）
2. 后续请求在 Header 中携带 Access Token：`Authorization: Bearer <token>`
3. 服务端验证 Token 有效性并提取用户信息
4. 根据用户角色判断是否有权限访问目标资源
5. Access Token 过期后可通过 Refresh Token 自动续期

### 认证成功后的上下文

| 字段                    | 值                    | 说明              |
|-----------------------|----------------------|-----------------|
| `userId`              | JWT 中的 `account`     | 系统用户 ID         |
| `caller`              | 同 `userId`           | 调用者标识           |
| `projectId`           | URL 中的 `{projectId}` | 当前项目（如请求包含项目路径） |
| `projectDatabaseName` | 项目对应的数据库名            | 用于数据隔离          |

## 第二层：Service Auth（服务认证）

Service Auth 通过 API Key 实现，用于机器对机器（M2M）场景——外部系统集成、CI/CD 流水线、MCP 客户端等。API Key 为系统级功能，由平台统一管控。

### 特性

| 特性     | 说明                                     |
|--------|----------------------------------------|
| 密钥格式   | `fm_ak_{type}_{random}` 前缀，便于识别和过滤     |
| 密钥类型   | 支持 `anon`、`service`、`custom` 等类型       |
| 项目范围控制 | 通过 `projectIds` 白名单字段限制可访问的项目范围（空表示全部） |
| 只读模式   | 可配置为只读权限（`readOnly` 标志）                |
| 密钥轮换   | 支持重新生成（Regenerate）密钥，旧密钥立即失效           |
| 安全存储   | 仅存储 SHA-256 哈希，明文仅在创建时返回一次             |

### 使用方式

API Key 可通过请求头 `Authorization: Bearer fm_ak_xxx` 传递。AuthFilter 通过 `fm_ak_` 前缀自动识别并路由到 Service Auth
通道。

### 项目范围控制

API Key 的 `projectIds` 字支段持白名单机制：

- **空值或未设置**：允许访问所有项目
- **逗号分隔的项目 ID 列表**：仅允许访问指定项目

```json
// 仅允许访问 project-a 和 project-b
{
  "projectIds": "project-a,project-b"
}

// 允许访问所有项目
{
  "projectIds": ""
}
```

### 认证成功后的上下文

| 字段                    | 值                    | 说明           |
|-----------------------|----------------------|--------------|
| `caller`              | API Key 的 `name`     | 密钥名称作为调用者标识  |
| `projectId`           | URL 中的 `{projectId}` | 当前项目（需在白名单内） |
| `projectDatabaseName` | 项目对应的数据库名            | 用于数据隔离       |

## 第三层：Federated Auth（联邦认证）

联邦认证允许每个项目配置独立的 Identity Provider（IdP），对外部请求进行认证。这是 Data Plane 的核心认证通道——外部用户通过项目自身的身份源访问业务数据。

:::info Identity Provider vs Authorization Provider

在 IAM 领域，**Identity Provider (IdP)** 负责认证（"你是谁？"），**Authorization Provider / Policy Engine** 负责授权（"
你能做什么？"）。Flexmodel 的 Federated Auth 层只做认证，不做授权决策——认证成功后返回 `caller`（身份标识）和 `scopes`
（权限范围），但具体的资源访问控制由上层 RBAC 或后续的授权机制决定。

:::

### 支持的 Identity Provider 类型

| 类型       | 标识         | 说明                                                       |
|----------|------------|----------------------------------------------------------|
| OIDC     | `oidc`     | OpenID Connect 协议，通过 Token Introspection 验证 Bearer Token |
| Function | `function` | 云函数认证，委托给自定义逻辑进行认证                                       |

### OIDC Provider

OIDC Provider 通过 Token Introspection 验证外部 IdP 签发的 Bearer Token：

1. 从配置的 `issuer` 获取 OIDC Discovery Document（`/.well-known/openid-configuration`）
2. 提取 `introspection_endpoint` 地址
3. 使用 `client_id` + `client_secret` 对 Token 进行 Introspection
4. 验证 `active` 字段为 `true`
5. 提取 `sub`（用户标识）作为 `caller`，`scope` 作为 `scopes`

配置示例：

```json
{
  "name": "my-okta",
  "type": "oidc",
  "enabled": true,
  "config": {
    "issuer": "https://dev-12345.okta.com/oauth2/default",
    "clientId": "0oa1abc2def3ghi4jkl5",
    "clientSecret": "your-client-secret"
  }
}
```

### Function Provider

Function Provider 委托认证逻辑给项目内的云函数，适用于非标准认证场景：

1. 将完整的认证上下文（Bearer Token、请求方法、URL、Headers、Query 参数）作为函数输入
2. 调用项目内指定的云函数
3. 函数返回 HTTP 200 表示认证成功，其他状态码视为失败
4. 认证成功时，`caller` 固定为 `function-user`，`scopes` 固定为 `{read}`

配置示例：

```json
{
  "name": "custom-auth",
  "type": "function",
  "enabled": true,
  "config": {
    "functionName": "auth-validator"
  }
}
```

### 单 Provider 启用约束

同一项目同一时间只能有一个 IdP 处于启用状态。创建或启用新的 Provider 时，系统会自动禁用项目中其他已启用的
Provider。这确保了认证链的确定性——不会出现多个 IdP 同时竞争认证的情况。

### 认证成功后的上下文

| 字段                    | 值                                           | 说明     |
|-----------------------|---------------------------------------------|--------|
| `caller`              | OIDC: `sub` 字段；Function: `function-user`    | 外部用户标识 |
| `scopes`              | OIDC: Token 的 `scope` 字段；Function: `{read}` | 权限范围   |
| `projectId`           | URL 中的 `{projectId}`                        | 当前项目   |
| `projectDatabaseName` | 项目对应的数据库名                                   | 用于数据隔离 |

### 数据隔离

IdP 配置存储在项目自身的数据库（`f_auth_provider_config` 表），而非平台数据库。这意味着：

- 项目 A 的 OIDC 配置与项目 B 完全隔离
- 删除项目时，IdP 配置随项目数据库一起清除
- 不同项目可以对接不同的外部身份源

## 认证上下文（SessionContext）

三层认证成功后，都会填充统一的 `SessionContextHolder`（线程级上下文），供后续业务逻辑使用：

| 字段                    | Platform Auth | Service Auth   | Federated Auth              |
|-----------------------|---------------|----------------|-----------------------------|
| `projectId`           | URL 路径参数      | URL 路径参数       | URL 路径参数                    |
| `projectDatabaseName` | 项目数据库名        | 项目数据库名         | 项目数据库名                      |
| `userId`              | JWT `account` | —              | —                           |
| `caller`              | 同 `userId`    | API Key `name` | IdP `sub` 或 `function-user` |

请求结束后，`SessionContextHolder` 自动清除，避免上下文泄漏到后续请求。

## API 端点

### 平台认证

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

### 项目 Identity Provider 配置

| 端点                                                       | 说明            |
|----------------------------------------------------------|---------------|
| `GET /api/projects/{projectId}/auth-providers`           | 获取项目 IdP 配置列表 |
| `POST /api/projects/{projectId}/auth-providers`          | 创建 IdP 配置     |
| `PUT /api/projects/{projectId}/auth-providers/{name}`    | 更新 IdP 配置     |
| `DELETE /api/projects/{projectId}/auth-providers/{name}` | 删除 IdP 配置     |

:::warning 权限提醒

IdP 配置属于 Control Plane 操作，应仅允许 Platform Auth 或 Service Auth 身份访问。当前实现中，Federated Auth
认证的外部用户理论上也能调用这些端点——这是一个已知的安全改进点，后续版本将通过授权检查（Authorization）加以限制。

:::

更多端点请参考 Swagger UI (`/q/swagger-ui`)。
