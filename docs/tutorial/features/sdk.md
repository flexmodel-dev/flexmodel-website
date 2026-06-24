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
import { FlexmodelClient } from '@flexmodel/sdk'

const client = new FlexmodelClient({
  apiKey: 'fm_ak_xxxxx',
  projectId: 'my-project',
})

// 查询
const { list, total } = await client.data.from('Student').findMany({
  where: { classId: { _eq: 1 }, age: { _gt: 15 } },
  orderBy: 'name',
  page: 1,
  size: 20,
})

// 获取单条
const student = await client.data.from('Student').findOne('001', { expand: ['classId'] })

// 创建
const created = await client.data.from('Student').create({ name: 'Alice', age: 16 })

// 全量更新
await client.data.from('Student').update(1, { data: { name: 'Alicia' } })

// 部分更新
await client.data.from('Student').merge(1, { data: { name: 'Alicia' } })

// 删除
await client.data.from('Student').delete(1)

// 计数
const count = await client.data.from('Student').count({ where: { age: { _gt: 18 } } })
```

## 客户端初始化

```typescript
const client = new FlexmodelClient(options?: FlexmodelClientOptions)
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

所有数据 CRUD 通过 `client.data` 命名空间访问：

### `client.data.from(model)`

显式选择目标模型，返回 `ModelHandle`：

```typescript
const handle = client.data.from('Student')
await handle.findMany({ where: { age: { _eq: 18 } } })
```

### `client.data.Student`（Proxy 属性访问）

Proxy 拦截属性访问，运行时等价于 `from()`：

```typescript
// client.data.Student === client.data.from('Student')
await client.data.Student.findMany({ where: { age: { _eq: 18 } } })
```

### `project()` 覆盖 projectId

```typescript
await client.data.from('Student').project('other-project').findMany({})
```

## 便捷方法

`ModelHandle` 提供以下便捷方法，覆盖日常 CRUD 场景：

| 方法 | HTTP | 返回类型 | 说明 |
|------|------|---------|------|
| `findMany(opts?)` | GET | `PageDTO<T>` | 分页查询 |
| `findOne(id, opts?)` | GET | `T` | 按 ID 获取单条 |
| `create(data)` | POST | `T` | 创建单条记录 |
| `create(data[])` | POST | `T[]` | 批量创建 |
| `update(id, { data })` | PUT | `T` | 全量更新 |
| `merge(id, { data })` | PATCH | `T` | 部分更新 |
| `delete(id)` | DELETE | `void` | 删除 |
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
const result = await client.data.from('Student').findMany({
  where: { age: { _gte: 18 } },
  orderBy: 'name:DESC',
  page: 1,
  size: 20,
  expand: ['classId', 'courseIds'],
})
```

### findOne

```typescript
const student = await client.data.from('Student').findOne('001', { expand: ['classId'] })
```

### 创建

```typescript
// 单条
const created = await client.data.from('Student').create({ name: 'Alice', age: 16 })

// 批量
const batch = await client.data.from('Student').create([
  { name: 'Alice', age: 16 },
  { name: 'Bob', age: 17 },
])
```

### 计数

```typescript
const total = await client.data.from('Student').count({ where: { age: { _gt: 18 } } })
```

## 过滤器 DSL

`where` 选项使用 JSON 过滤器 DSL，与后端 [查询条件](/docs/api/definition/condition)完全对应：

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

await client.data.from('Student').findMany({ where })
```

## 链式构建器

复杂查询可使用 `ModelHandle.query()` 创建链式构建器：

```typescript
const result = await client.data.from('Student').query()
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

通过 `schema<T>()` 获得模型级类型推断：

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

const db = client.schema<MySchema>()

// IDE 自动补全模型名和字段
db.data.Student.findMany({ where: { age: { _eq: 18 } } })
```

无 schema 时同样可用（字段名为 `string`）：

```typescript
client.data.from('Student').findMany({ where: { age: { _eq: 18 } } })
```

## 错误处理

```typescript
import { FlexmodelApiError, FlexmodelAuthError } from '@flexmodel/sdk'

try {
  await client.data.from('Student').findOne(999)
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
| `update(id, {data})` | PUT | `/api/projects/{pid}/models/{model}/records/{id}` |
| `merge(id, {data})` | PATCH | `/api/projects/{pid}/models/{model}/records/{id}` |
| `delete(id)` | DELETE | `/api/projects/{pid}/models/{model}/records/{id}` |
| `count()` | GET | `/api/projects/{pid}/models/{model}/records` (page=1, size=0) |
