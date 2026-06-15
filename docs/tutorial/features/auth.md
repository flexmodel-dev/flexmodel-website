---
sidebar_position: 40
---

# 身份认证

Flexmodel 提供了完整的身份认证体系，包括系统级的 RBAC 权限管理和项目级的身份提供商集成。

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

所有 API 访问通过 JWT Token 进行安全验证：

1. 用户登录后获取 JWT Token
2. 后续请求在 Header 中携带 Token：`Authorization: Bearer <token>`
3. 服务端验证 Token 有效性并提取用户信息
4. 根据用户角色判断是否有权限访问目标资源

## 项目级身份提供商

每个项目可以配置独立的身份认证方式，支持以下提供商：

| 提供商类型 | 说明 |
|----------|------|
| OIDC | OpenID Connect 协议，支持标准 OAuth 2.0 授权流程 |
| LDAP | LDAP 目录服务认证 |
| Script | 自定义脚本认证，通过 JavaScript 实现灵活的认证逻辑 |

### OIDC 认证

配置 OIDC 提供商后，用户可通过第三方身份源（如企业 IdP、社交账号）登录：

- 支持标准 OAuth 2.0 授权码流程
- 支持 Discovery URL 自动配置
- 自动映射用户信息到系统角色

### Script 认证

Script 提供商允许通过 JavaScript 脚本自定义认证逻辑：

```javascript
// 脚本上下文提供以下变量：
// context.request — HTTP 请求信息
// context.username — 用户名
// context.password — 密码

// 返回认证结果
return {
  success: true,
  username: context.username,
  attributes: { role: 'admin' }
};
```

## API 端点

身份认证相关的 REST API：

| 端点 | 说明 |
|------|------|
| `POST /api/auth/login` | 用户登录 |
| `POST /api/auth/register` | 用户注册 |
| `GET /api/auth/users` | 获取用户列表 |
| `GET /api/auth/roles` | 获取角色列表 |
| `GET /api/projects/{projectId}/auth-providers` | 获取项目身份提供商配置 |
| `POST /api/projects/{projectId}/auth-providers` | 创建身份提供商配置 |

更多端点请参考 Swagger UI (`/q/swagger-ui`)。
