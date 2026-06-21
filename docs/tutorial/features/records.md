---
sidebar_position: 8
---

# 数据记录

Flexmodel 为每个数据模型自动生成 REST 和 GraphQL API，支持对记录进行完整的 CRUD 操作、分页查询、条件过滤、排序和关联数据展开。

## 关键概念

### 记录（Record）

记录是数据模型中的一行数据，以 JSON 对象表示。每个字段对应模型定义中的一个属性。

### 分页结果

列表查询返回分页结果，包含：

| 字段 | 说明 |
|------|------|
| `list` | 当前页的记录数组 |
| `total` | 满足条件的记录总数 |

## CRUD 操作

### 创建记录

通过 POST 请求创建记录，请求体为 JSON 对象。支持嵌套写入关联数据：

```json
{
  "studentName": "张三",
  "gender": "MALE",
  "age": 18,
  "classId": 1,
  "studentDetail": {
    "description": "张三的描述"
  },
  "courses": [
    { "courseNo": "Math", "courseName": "数学" },
    { "courseNo": "Eng", "courseName": "英语" }
  ]
}
```

- 关联对象中包含 `id` 字段时，视为更新已有记录
- 不包含 `id` 时，自动创建新记录

### 查询记录

支持单条查询和分页列表查询：

- **单条查询**：通过主键 ID 获取一条记录
- **列表查询**：支持分页、过滤、排序和关联展开

### 更新记录

- **全量更新（PUT）**：替换整条记录的所有字段
- **局部更新（PATCH）**：仅更新请求体中包含的字段，未传字段保持不变

### 删除记录

通过主键 ID 删除一条记录。

## 查询参数

### 分页

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | int | 1 | 当前页码 |
| `size` | int | 15 | 每页条数 |

### 过滤（Filter）

通过 `filter` 查询参数传入 JSON 格式的查询条件，详见[查询条件](../api/definition/condition.md)文档。

常用示例：

```json
// 精确匹配
{"status": {"_eq": "active"}}

// 快捷写法（等价于 _eq）
{"status": "active"}

// 范围查询
{"age": {"_gte": 18, "_lt": 65}}

// 字符串模糊搜索
{"name": {"_contains": "张"}}

// 多值匹配
{"status": {"_in": ["active", "pending"]}}

// OR 条件
{"_or": [{"gender": {"_eq": "MALE"}}, {"gender": {"_eq": "FEMALE"}}]}

// 关联字段查询（点号路径）
{"studentClass.className": {"_contains": "计算机"}}
```

### 排序（Sort）

通过 `sort` 查询参数传入 JSON 数组，每个元素包含 `field` 和 `sort`（`ASC` 或 `DESC`）：

```json
[
  {"field": "name", "sort": "ASC"},
  {"field": "id", "sort": "DESC"}
]
```

### 关联展开（Expand）

通过 `expand` 查询参数加载关联数据，逗号分隔多个字段名，支持嵌套展开：

```
?expand=studentClass,studentDetail
?expand=studentClass.teacher
```

不传 `expand` 时，不加载关联数据，仅返回本实体的字段。

## GraphQL API

每个模型自动生成对应的 GraphQL Query 和 Mutation：

### Query

| 查询 | 说明 |
|------|------|
| `{ model }` | 查询记录列表 |
| `{ modelById(id: ...) }` | 按 ID 查询单条记录 |
| `{ modelAggregate }` | 聚合查询 |

### Mutation

| 操作 | 说明 |
|------|------|
| `createModel(data: {...})` | 创建记录 |
| `updateModel(data: {...})` | 更新记录 |
| `updateModelById(id: ..., data: {...})` | 按 ID 更新记录 |
| `deleteModel(...)` | 删除记录 |
| `deleteModelById(id: ...)` | 按 ID 删除记录 |

## API 端点

数据记录相关的 REST API 基础路径为 `/api/projects/{projectId}/models/{modelName}/records`。

### 路径参数

所有端点共享以下路径参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `projectId` | String | 项目 ID |
| `modelName` | String | 模型名称（如 `Student`、`Classes`） |

---

### 获取记录列表

```
GET /records
```

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | int | `1` | 当前页码 |
| `size` | int | `15` | 每页条数 |
| `filter` | String | — | 查询条件（JSON 字符串，需 URL 编码），语法见[查询条件](/docs/api/definition/condition) |
| `sort` | String | — | 排序条件（JSON 数组字符串，如 `[{"field":"name","sort":"ASC"}]`） |
| `expand` | List\<String\> | — | 要展开的关联字段，逗号分隔。支持嵌套展开如 `classId.teacher`。不传则不加载关联数据 |

**响应：**

```json
{
  "total": 100,
  "list": [{ "id": "1", "name": "张三" }, ...]
}
```

---

### 获取单条记录

```
GET /records/{id}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | String | 记录主键值 |

**查询参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `expand` | List\<String\> | 要展开的关联字段，逗号分隔。支持嵌套展开 |

**响应：** JSON 对象，包含记录的所有字段。

---

### 创建记录

```
POST /records
```

**请求体：** `application/json`，JSON 对象，字段对应模型定义。

支持嵌套写入关联数据：
- 关联对象中包含 `id` 字段时 → 更新已有记录
- 不包含 `id` 时 → 自动创建新记录

```json
{
  "studentName": "张三",
  "gender": "MALE",
  "age": 18,
  "classId": 1,
  "studentDetail": {
    "description": "张三的描述"
  }
}
```

**响应：** 创建后的完整记录对象。

---

### 全量更新记录

```
PUT /records/{id}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | String | 记录主键值 |

**请求体：** `application/json`，JSON 对象。替换整条记录的所有字段。

**响应：** 更新后的完整记录对象。

---

### 局部更新记录

```
PATCH /records/{id}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | String | 记录主键值 |

**请求体：** `application/json`，JSON 对象。仅更新传入的字段，未传字段保持不变（忽略 null 值）。

**响应：** 更新后的完整记录对象。

---

### 删除记录

```
DELETE /records/{id}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | String | 记录主键值 |

**响应：** 204 No Content。

---

更多端点请参考 Swagger UI (`/q/swagger-ui`)。
