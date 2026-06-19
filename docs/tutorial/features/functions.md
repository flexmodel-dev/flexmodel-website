---
sidebar_position: 60
---

# 云函数

:::caution 实验性功能

云函数功能目前处于实验性阶段，端到端集成测试尚未完成。API 界面可能随版本迭代发生变化，请谨慎在生产环境中使用。

:::

Flexmodel 提供了云函数（Cloud Functions）能力，对标 Supabase Functions，允许用户编写和部署自定义的 TypeScript/JavaScript 函数，在隔离的 Deno Worker 中执行。

## 关键概念

### 函数（Function）
一个云函数由名称、源代码文件和配置组成。函数创建后需要部署到 Sidecar 才能被调用。

### Deno Sidecar
云函数的运行时环境是一个独立的 Deno 进程（Sidecar），基于 Hono.js 框架提供 HTTP 服务。每个函数在独立的 Deno Worker 中执行，确保隔离性和安全性。

### Worker 隔离
每个云函数调用在独立的 Deno Worker 中执行：
- 函数之间互不影响
- 函数崩溃不会影响主服务
- 支持超时控制（默认 30 秒）

## 函数生命周期

```
创建 → 部署(Deploy) → 调用(Invoke)
              ↓
         ACTIVE / FAILED
```

1. **创建**: 定义函数名称和源代码
2. **部署**: 将函数源代码部署到 Deno Sidecar
3. **调用**: 通过 HTTP 或内部触发调用函数

## 多文件源码

函数支持多文件源码编辑，源代码以 JSON 数组形式存储：

```json
[
  { "name": "index.ts", "content": "import { handler } from './utils.ts'; ..." },
  { "name": "utils.ts", "content": "export function handler(req) { ... }" }
]
```

部署时使用 `file://` URL 加载，支持相对 import。

## 模板系统

Flexmodel 提供函数模板，帮助用户快速创建常见类型的函数：

- 通过模板选择界面选择函数类型
- 模板自动生成基础代码结构
- 用户可在模板基础上修改和扩展

## 函数执行上下文

函数在 Deno Worker 中运行时，可通过 Flexmodel SDK 访问数据：

```typescript
import { FlexmodelClient } from './sdk/flexmodel.ts';

const client = new FlexmodelClient();
// 查询数据
const records = await client.query('dev_test', 'Student', { page: 1, size: 10 });
```

## API 端点

云函数相关的 REST API 基础路径为 `/api/projects/{projectId}/functions`：

| 端点 | 说明 |
|------|------|
| `GET /functions` | 获取函数列表 |
| `POST /functions` | 创建函数 |
| `PUT /functions/{name}` | 更新函数 |
| `DELETE /functions/{name}` | 删除函数 |
| `POST /functions/{name}/deploy` | 部署函数到 Sidecar |
| `POST /api/runtime/projects/{projectId}/functions/{name}` | 调用函数 |
| `GET /function-templates` | 获取函数模板列表 |

更多端点请参考 Swagger UI (`/q/swagger-ui`)。
