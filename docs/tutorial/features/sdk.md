---
sidebar_position: 50
---

# TypeScript SDK

Flexmodel 提供官方 TypeScript SDK (`@flexmodel/sdk`)，让前端和 Node.js 开发者以模型命名空间 + 选项对象的方式对数据层进行
CRUD 操作，同时支持边缘函数调用、对象存储、GraphQL 查询、服务编排（流程）以及管理后台（Admin API），并支持链式构建器处理复杂查询场景。

## 安装

```bash npm2yarn
npm install @flexmodel/sdk
```

## 快速开始

```typescript
import { data, configure } from '@flexmodel/sdk'

// 配置（可选，默认连接 localhost:8080）
configure({ apiKey: 'fm_ak_xxxxx', projectId: 'my-project' })

// 查询
const { list, total } = await data.Student.findMany({
  where: { classId: { _eq: 1 }, age: { _gt: 15 } },
  orderBy: 'name',
  page: 1,
  size: 20,
})

// 获取单条
const student = await data.Student.findOne('001', { expand: ['classId'] })

// 创建
const created = await data.Student.create({ name: 'Alice', age: 16 })

// 批量创建
const batch = await data.Student.createMany([
  { name: 'Alice', age: 16 },
  { name: 'Bob', age: 17 },
])

// 全量更新
await data.Student.update(1, { data: { name: 'Alicia' } })

// 批量更新（每条记录必须包含 id 字段）
await data.Student.updateMany({ data: [
  { id: 1, name: 'Alicia' },
  { id: 2, name: 'Bob Updated' },
] })

// 部分更新
await data.Student.merge(1, { data: { name: 'Alicia' } })

// 删除
await data.Student.delete(1)

// 批量删除
await data.Student.deleteMany({ ids: [1, 2, 3] })

// 计数
const count = await data.Student.count({ where: { age: { _gt: 18 } } })
```

也可以使用 `data.from()` 显式选择模型：

```typescript
const { list, total } = await data.from('Student').findMany({
  where: { classId: { _eq: 1 }, age: { _gt: 15 } },
})
```

## 单例便捷 API

SDK 提供预初始化的全局单例，通过 `data` 和 `configure` 直接使用：

### `data`

数据操作命名空间的便捷导出，直接引用全局单例的 `data` 属性：

```typescript
import { data } from '@flexmodel/sdk'

// Proxy 属性访问（推荐）
await data.Student.findMany()

// from() 显式选择
await data.from('Student').findMany()
```

### `flexmodelClient`

全局单例实例，`data` 即引用其 `data` 属性。在边缘函数中，运行时会自动调用 `setAuthToken()` 和 `setProjectId()`
注入上下文，因此函数代码中可直接使用：

```typescript
import { flexmodelClient } from '@flexmodel/sdk'

const { list } = await flexmodelClient.data.from('Student').findMany({ page: 1, size: 10 })
```

### `configure(options?)`

配置全局单例的便捷函数，修改 `baseURL`、`apiKey`、`authToken`、`projectId`：

```typescript
import { data, configure } from '@flexmodel/sdk'

configure({
  baseURL: 'https://api.example.com',
  apiKey: 'fm_ak_xxxxx',
  projectId: 'my-project',
})

const students = await data.Student.findMany()
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `baseURL` | `string` | API 地址，浏览器默认同源，Node/Deno 需提供 |
| `apiKey` | `string` | API Key（`fm_ak_` 前缀），提供后所有请求自动注入认证头 |
| `authToken` | `string` | 认证令牌（优先级高于 apiKey），传入 undefined 清除 |
| `projectId` | `string` | 数据 API 的默认项目 ID，可在 per-call 时通过 `.project()` 覆盖 |

### `data.schema<T>()`

类型窄化方法，传入 Schema interface 后获得模型级类型推断：

```typescript
import { data } from '@flexmodel/sdk'

interface MySchema {
  Student: { id: number; name: string; age: number }
}

const typed = data.schema<MySchema>()
typed.Student.findMany()  // Student 有类型提示
```

## FlexmodelClient（显式实例化）

需要多实例或隔离场景时，可手动创建 `FlexmodelClient`：

```typescript
import { FlexmodelClient } from '@flexmodel/sdk'

const client = new FlexmodelClient({
  apiKey: 'fm_ak_xxxxx',
  projectId: 'my-project',
})

await client.data.Student.findMany()
```

### 客户端初始化

```typescript
new FlexmodelClient(options?: FlexmodelClientOptions)
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `baseURL` | `string` | 否 | API 地址，浏览器默认同源（`window.location.origin`），Node/Deno 需提供 |
| `apiKey` | `string` | 否 | API Key（`fm_ak_` 前缀），提供后所有请求自动注入 `Authorization` 头 |
| `projectId` | `string` | 否 | 数据 API 的默认项目 ID，可通过 `.project()` per-call 覆盖 |

```typescript
// 浏览器同源
const client = new FlexmodelClient({ apiKey: 'fm_ak_xxx', projectId: 'demo' })

// 跨域
const client = new FlexmodelClient({
  baseURL: 'https://api.example.com',
  apiKey: 'fm_ak_xxx',
  projectId: 'demo',
})
```

## 数据操作命名空间

所有数据 CRUD 通过 `data` 命名空间访问：

### `data.Student`（Proxy 属性访问）

Proxy 拦截属性访问，运行时等价于 `from()`：

```typescript
// data.Student === data.from('Student')
await data.Student.findMany({ where: { age: { _eq: 18 } } })
```

### `data.from(model)`

显式选择目标模型，返回 `ModelHandle`：

```typescript
const handle = data.from('Student')
await handle.findMany({ where: { age: { _eq: 18 } } })
```

### `project()` 覆盖 projectId

```typescript
await data.Student.project('other-project').findMany({})
```

## 便捷方法

`ModelHandle` 提供以下便捷方法，覆盖日常 CRUD 场景：

| 方法 | HTTP | 返回类型 | 说明 |
|------|------|---------|------|
| `findMany(opts?)` | GET | `PageDTO<T>` | 分页查询 |
| `findOne(id, opts?)` | GET | `T` | 按 ID 获取单条 |
| `create(data)` | POST | `T` | 创建单条记录 |
| `create(data[])` | POST | `T[]` | 批量创建（调用 /batch 端点） |
| `createMany(data[])` | POST | `T[]` | 批量创建 |
| `update(id, { data })` | PUT | `T` | 全量更新 |
| `updateMany({ data })` | PUT | `T[]` | 批量更新，每条记录必须含 id |
| `merge(id, { data })` | PATCH | `T` | 部分更新 |
| `delete(id)` | DELETE | `void` | 删除 |
| `deleteMany({ ids })` | DELETE | `number` | 批量删除，返回删除数量 |
| `count(opts?)` | GET | `number` | 计数 |
| `query()` | — | `FluentQueryBuilder` | 链式构建器入口 |

### findMany 选项

```typescript
interface FindManyOptions<T> {
  where?: FilterNode       // 过滤条件
  orderBy?: SortInput      // 排序：'name' | 'name:DESC' | SortItem | 数组
  page?: number            // 页码（默认 1）
  size?: number            // 每页条数（默认 15）
  expand?: FieldSelection  // 关联加载：'class,teacher' | ['class', 'teacher']
  select?: FieldSelection  // 投影字段
}
```

```typescript
const result = await data.Student.findMany({
  where: { age: { _gte: 18 } },
  orderBy: 'name:DESC',
  page: 1,
  size: 20,
  expand: ['classId', 'courseIds'],
})
```

### findOne

```typescript
const student = await data.Student.findOne('001', { expand: ['classId'] })
```

### 创建

```typescript
// 单条
const created = await data.Student.create({ name: 'Alice', age: 16 })

// 批量（传入数组自动调用 /batch 端点）
const batch = await data.Student.create([
  { name: 'Alice', age: 16 },
  { name: 'Bob', age: 17 },
])

// 显式批量创建
const batch2 = await data.Student.createMany([
  { name: 'Alice', age: 16 },
  { name: 'Bob', age: 17 },
])
```

### 批量更新

每条记录必须包含 `id` 字段：

```typescript
const updated = await data.Student.updateMany({
  data: [
    { id: 1, name: 'Alicia' },
    { id: 2, name: 'Bob Updated' },
  ],
})
```

### 批量删除

```typescript
const deletedCount = await data.Student.deleteMany({ ids: [1, 2, 3] })
```

> 批量操作上限为 **200 条**记录，超出将返回 HTTP 400 错误。

### 计数

```typescript
const total = await data.Student.count({ where: { age: { _gt: 18 } } })
```

## 过滤器 DSL

`where` 选项使用 JSON 过滤器 DSL，与后端 [查询条件](records.md#过滤filter)完全对应：

### 字段操作符

| 操作符 | 说明 | 示例 |
|--------|------|------|
| `_eq` | 等于 | `{ age: { _eq: 18 } }` |
| `_ne` | 不等于 | `{ status: { _ne: 'disabled' } }` |
| `_gt` | 大于 | `{ age: { _gt: 15 } }` |
| `_gte` | 大于等于 | `{ score: { _gte: 60 } }` |
| `_lt` | 小于 | `{ age: { _lt: 18 } }` |
| `_lte` | 小于等于 | `{ price: { _lte: 100 } }` |
| `_in` | 包含 | `{ role: { _in: ['admin', 'user'] } }` |
| `_nin` | 不包含 | `{ status: { _nin: ['deleted'] } }` |
| `_between` | 区间 | `{ age: { _between: [10, 20] } }` |
| `_contains` | 包含字符串 | `{ name: { _contains: '张' } }` |
| `_not_contains` | 不包含字符串 | `{ bio: { _not_contains: 'spam' } }` |
| `_starts_with` | 以…开头 | `{ email: { _starts_with: 'a@' } }` |
| `_ends_with` | 以…结尾 | `{ email: { _ends_with: '.com' } }` |

### 逻辑组合

并列字段自动 **AND**：

```typescript
{ classId: { _eq: 1 }, age: { _gt: 15 } }
```

显式逻辑操作符：

```typescript
// OR
{ _or: [{ classId: { _eq: 1 } }, { age: { _gt: 15 } }] }

// AND
{ _and: [{ classId: { _eq: 1 } }, { age: { _gt: 15 } }] }

// 嵌套
{
  _or: [
    { _and: [{ classId: { _eq: 1 } }, { age: { _gt: 15 } }] },
    { _and: [{ classId: { _eq: 2 } }, { age: { _lt: 12 } }] },
  ]
}
```

### 便捷函数构造

SDK 提供独立函数用于动态构建过滤条件：

```typescript
import { filterEq, filterGt, filterOr, filterAnd } from '@flexmodel/sdk'

const where = filterOr(
  filterAnd(filterEq('classId', 1), filterGt('age', 15)),
  filterAnd(filterEq('classId', 2), filterLt('age', 12)),
)

await data.Student.findMany({ where })
```

## 链式构建器

复杂查询可使用 `ModelHandle.query()` 创建链式构建器：

```typescript
const result = await data.Student.query()
  .eq('age', 18)
  .gt('score', 60)
  .where((f) => f.or(f.eq('classId', 1), f.eq('classId', 2)))
  .orderBy('name')
  .expand('class', 'teacher')
  .page(1, 20)
  .execute()
```

### 链式构建器方法

| 类别 | 方法 | 说明 |
|------|------|------|
| 操作入口 | `.select(...fields)` | 查询 |
| | `.insert(data)` | 插入 |
| | `.update(id)` | 全量更新 |
| | `.merge(id)` | 部分更新 |
| | `.delete(id?)` | 删除 |
| | `.count()` | 计数 |
| 过滤器 | `.eq / .ne / .gt / .gte / .lt / .lte / .in / .nin / .between / .contains / .notContains / .startsWith / .endsWith` | 链式追加 |
| 逻辑组合 | `.where(fn)` | 函数式条件 |
| | `.filter(raw)` | 原始 filter 对象 |
| 排序 | `.orderBy(field, dir)` | 排序 |
| 关联加载 | `.expand(...fields)` | 关联展开 |
| 分页 | `.page(num, size)` | 分页 |
| 数据设置 | `.set(data)` | update/merge 数据 |
| 终端方法 | `.execute()` | 执行 |
| | `.single()` | 取第一条，无则 null |

## 边缘函数（Functions）

Open client 的 `functions` 命名空间调用边缘函数（Java 服务端代理转发到 Deno Runtime）：

```typescript
const result = await flexmodelClient.functions.invoke('myFn', {key: 'value'})
```

| 路由模式  | 调用路径                                      |
|-----------|-----------------------------------------------|
| path      | `{baseURL}/open/{projectId}/functions/{name}` |
| subdomain | `{baseURL}/functions/{name}`                  |

## 对象存储（Storage）

`storage` 命名空间提供对象读写，对象级操作：

```typescript
// 列出对象
const files = await flexmodelClient.storage.list('my-bucket', 'photos/')
// 上传
await flexmodelClient.storage.upload('my-bucket', 'photo.jpg', fileBlob)
// 下载
const blob = await flexmodelClient.storage.download('my-bucket', 'photo.jpg')
// 获取元数据
const meta = await flexmodelClient.storage.head('my-bucket', 'photo.jpg')
// 删除
await flexmodelClient.storage.delete('my-bucket', 'photo.jpg')
```

## GraphQL

`graphql` 命名空间执行 GraphQL 查询：

```typescript
const result = await flexmodelClient.graphql.execute(`{ Student { id name age } }`)

// 带变量
const result2 = await flexmodelClient.graphql.execute(
    `query GetStudent($id: ID!) { Student(id: $id) { name } }`,
    {id: '001'},
)
```

## 服务编排（流程）Flow

流程命名空间按 API surface 分为两个层级：

| 客户端                 | 命名空间      | 能力                                                    |
|------------------------|---------------|---------------------------------------------------------|
| `FlexmodelClient`      | `client.flow` | **运行态**：实例查询/终止、流程启动/提交/回滚、历史查询 |
| `FlexmodelAdminClient` | `admin.flow`  | 运行态 + **设计态**：流程定义增删改查与部署             |

> Open client 的 `flow` 仅含 `instances` 与 `execution` 子命名空间， **不含 `definitions`**——从类型层面保证终端用户无法访问设计态接口。

> project 级命名空间（data/functions/storage/graphql/flow）可通过 `.project(id)` 选定项目，方法签名不含 projectId
> 参数。详见[选定项目](#选定项目-projectid)。

### 流程实例（`flow.instances`）

```typescript
// 列表查询（支持过滤与分页）
const {list, total} = await flexmodelClient.flow.instances.list({
    flowModuleId: 'fm_001', status: 1, page: 1, size: 20,
})

// 详情
const inst = await flexmodelClient.flow.instances.get('flow_inst_001')

// 终止（effectiveForSubFlowInstance 控制是否对子流程生效）
await flexmodelClient.flow.instances.terminate('flow_inst_001', true)
```

### 流程执行（`flow.execution`）

```typescript
// 启动流程实例
const startResult = await flexmodelClient.flow.execution.start({
    flowModuleId: 'fm_001',
    variables: {orderId: 'ORD-1001'},
})

// 提交任务
await flexmodelClient.flow.execution.commit(startResult.flowInstanceId!, {
    variables: {approved: true},
})

// 回滚任务
await flexmodelClient.flow.execution.rollback(startResult.flowInstanceId!, {taskInstanceId: 'ti_001'})

// 历史用户任务
const tasks = await flexmodelClient.flow.execution.getHistoryUserTasks('flow_inst_001')

// 历史元素（流程快照）
const elements = await flexmodelClient.flow.execution.getHistoryElements('flow_inst_001')
```

### 流程定义（`admin.flow.definitions`，仅 Admin）

```typescript
// 列表
const {list} = await adminClient.flow.definitions.list({flowName: '订单'})
// 详情（可指定 flowDeployId 查看某个部署版本）
const detail = await adminClient.flow.definitions.get('fm_001', 'fd_001')
// 创建
await adminClient.flow.definitions.create({flowKey: 'order_process', flowName: '订单流程', remark: '处理订单'})
// 更新（含流程模型 JSON）
await adminClient.flow.definitions.update('fm_001', {flowModel: '{}', flowName: '订单流程 v2'})
// 删除
await adminClient.flow.definitions.delete('fm_001')
// 部署
await adminClient.flow.definitions.deploy('fm_001')
```

### 流程路径映射

| 客户端 | 路径前缀                              |
|--------|---------------------------------------|
| Open   | `/api/open/{projectId}/flows/...`     |
| Admin  | `/api/projects/{projectId}/flows/...` |

## 类型安全

通过 `data.schema<T>()` 或 `client.schema<T>()` 获得模型级类型推断：

```typescript
interface Student {
  id: number
  name: string
  age: number
  classId: number
}

interface MySchema {
  Student: Student
}

// 单例方式
const typed = data.schema<MySchema>()
typed.Student.findMany({ where: { age: { _eq: 18 } } })

// 显式实例化方式
const db = client.schema<MySchema>()
db.data.Student.findMany({ where: { age: { _eq: 18 } } })
```

无 schema 时同样可用（字段名为 `string`）：

```typescript
data.Student.findMany({ where: { age: { _eq: 18 } } })
```

## 管理后台（Admin API）

管理后台使用 `FlexmodelAdminClient`（路径前缀 `/api/projects/{projectId}`），认证方式为 admin scope API Key 或系统 JWT。SDK
同样预初始化了 `adminClient` 单例与 `configureAdmin` 配置函数。

```typescript
import {adminClient, configureAdmin} from '@flexmodel/sdk'

configureAdmin({
    baseURL: 'https://api.example.com',
    apiKey: 'fm_ak_admin_xxxxx',
    projectId: 'my-project',
})
```

`FlexmodelAdminClient` 提供以下命名空间：

| 命名空间          | 说明                                                                 |
|-------------------|----------------------------------------------------------------------|
| `admin.data`      | 管理端数据 CRUD（admin 路径）                                        |
| `admin.projects`  | 项目管理：list/get/create/update/delete                              |
| `admin.users`     | 用户管理：list/create/delete                                         |
| `admin.apiKeys`   | API Key 管理：list/create/regenerate/delete                          |
| `admin.functions` | 边缘函数管理（deploy/get/list/delete）+ 调用 invoke                  |
| `admin.buckets`   | Bucket 管理：list/get/create/update/delete                           |
| `admin.graphql`   | 管理端 GraphQL 查询（`.execute()`）                                  |
| `admin.flow`      | 服务编排：设计态（`definitions`）+ 运行态（`instances`/`execution`） |

> project 级命名空间（data/functions/storage/graphql/buckets/flow）通过 `.project(id)` 选定项目，方法签名不含 projectId
> 参数。未调用时使用构造函数 / `configureAdmin()` 配置的默认 projectId。

```typescript
// 项目管理
const projects = await adminClient.projects.list()
await adminClient.projects.create({name: 'New Project'})

// API Key
const key = await adminClient.apiKeys.create({name: 'my-key', scope: 'open', readOnly: false})
await adminClient.apiKeys.regenerate(key.id)

// 部署边缘函数（使用默认 projectId）
await adminClient.functions.deploy('myFn', {
    'index.ts': 'export default async (req) => req.json()',
})
// 列表查询
const {list} = await adminClient.functions.list({name: 'order'})
// 选定项目后调用（多项目场景）
const {list: cross} = await adminClient.project('demo').functions.list()
// 调用边缘函数（admin 路径）
const result = await adminClient.functions.invoke('myFn', {key: 'value'})

// Bucket 管理
await adminClient.buckets.create({name: 'my-bucket'})
await adminClient.buckets.delete('old-bucket', true)   // 强制删除（含对象）
```

### 选定项目 `.project(id)`

`.project(id)` 返回绑定到指定项目的视图，包含 data/functions/storage/graphql/buckets/flow， 不影响 admin 实例的默认
projectId，适合多项目场景：

```typescript
const demo = adminClient.project('demo')
await demo.functions.deploy('myFn', {'index.ts': '...'})
await demo.buckets.create({name: 'my-bucket'})
await demo.flow.definitions.deploy('fm_001')
await demo.flow.instances.list({status: 1})
```

## 错误处理

```typescript
import { FlexmodelApiError, FlexmodelAuthError } from '@flexmodel/sdk'

try {
  await data.Student.findOne(999)
} catch (err) {
  if (err instanceof FlexmodelApiError) {
    console.log(err.status, err.code, err.message)
  }
  if (err instanceof FlexmodelAuthError) {
    console.log(err.message)  // API Key 无效或无权限
  }
}
```

错误类层级：

| 类 | 说明 |
|---|------|
| `FlexmodelError` | 基类 |
| `FlexmodelApiError` | 业务错误（非 2xx 且非 401），含 `status`、`code`、`message` |
| `FlexmodelAuthError` | 认证错误（401） |

## 跨环境支持

SDK 零外部依赖，仅使用 `fetch` 等标准 Web API：

| 环境 | 说明 |
|------|------|
| 浏览器 | 直接可用 |
| Node.js | Node 18+ 内置 fetch |
| Deno | 直接可用 |

## REST API 映射

SDK 便捷方法映射到后端数据记录 API（详见[数据记录](/docs/tutorial/features/records)）：

| SDK 方法 | HTTP 方法 | 后端路径 |
|---------|----------|---------|
| `findMany()` | GET | `/api/projects/{pid}/models/{model}/records` |
| `findOne(id)` | GET | `/api/projects/{pid}/models/{model}/records/{id}` |
| `create()` | POST | `/api/projects/{pid}/models/{model}/records` |
| `createMany()` | POST | `/api/projects/{pid}/models/{model}/records/batch` |
| `update(id, {data})` | PUT | `/api/projects/{pid}/models/{model}/records/{id}` |
| `updateMany({data})` | PUT | `/api/projects/{pid}/models/{model}/records/batch` |
| `merge(id, {data})` | PATCH | `/api/projects/{pid}/models/{model}/records/{id}` |
| `delete(id)` | DELETE | `/api/projects/{pid}/models/{model}/records/{id}` |
| `deleteMany({ids})` | DELETE | `/api/projects/{pid}/models/{model}/records/batch` |
| `count()` | GET | `/api/projects/{pid}/models/{model}/records` (page=1, size=0) |
