---
sidebar_position: 50
---

# TypeScript SDK

Flexmodel 提供官方 TypeScript SDK (`@flexmodel/sdk`)，让前端和 Node.js 开发者以模型命名空间 + 选项对象的方式对数据层进行 CRUD 操作，同时支持链式构建器处理复杂查询场景。

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
