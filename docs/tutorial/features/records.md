---
sidebar_position: 8
---

# 数据记录

Flexmodel 为每个数据模型自动生成 REST 和 GraphQL API，支持对记录进行完整的 CRUD 操作、分页查询、条件过滤、排序和关联数据展开。

## 关键概念

### 记录（Record）

记录是数据模型中的一行数据，以 JSON 对象表示。每个字段对应模型定义中的一个属性。

### 响应格式

所有 API 响应都使用 JSON 格式，当响应成功时返回格式就是数据本身，当响应失败时返回格式如下：

```json
{
  "code": -1,
  "message": "error",
  "errors": [
    {
      "foo": "bar"
    }
  ]
}
```

## Restful API

### API 端点

数据记录相关的 REST API 基础路径为 `/api/projects/{projectId}/models/{modelName}/records`。

### 路径参数

所有端点共享以下路径参数：

| 参数          | 类型     | 说明                          |
|-------------|--------|-----------------------------|
| `projectId` | String | 项目 ID                       |
| `modelName` | String | 模型名称（如 `Student`、`Classes`） |

---

### 获取记录列表

```
GET /records
```

**查询参数：**

| 参数       | 类型             | 默认值  | 说明                                                     |
|----------|----------------|------|--------------------------------------------------------|
| `page`   | int            | `1`  | 当前页码                                                   |
| `size`   | int            | `15` | 每页条数                                                   |
| `filter` | String         | —    | 查询条件（JSON 字符串，需 URL 编码），语法见上方[过滤（Filter）](#过滤filter)章节 |
| `sort`   | String         | —    | 排序条件（JSON 数组字符串，如 `[{"field":"name","sort":"ASC"}]`）   |
| `expand` | List\<String\> | —    | 要展开的关联字段，逗号分隔。支持嵌套展开如 `classId.teacher`。不传则不加载关联数据     |

**响应：**

```json
{
  "total": 100,
  "list": [
    {
      "id": "1",
      "name": "张三"
    },
    ...
  ]
}
```

---

### 获取单条记录

```
GET /records/{id}
```

**路径参数：**

| 参数   | 类型     | 说明    |
|------|--------|-------|
| `id` | String | 记录主键值 |

**查询参数：**

| 参数       | 类型             | 说明                   |
|----------|----------------|----------------------|
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

| 参数   | 类型     | 说明    |
|------|--------|-------|
| `id` | String | 记录主键值 |

**请求体：** `application/json`，JSON 对象。替换整条记录的所有字段。

**响应：** 更新后的完整记录对象。

---

### 局部更新记录

```
PATCH /records/{id}
```

**路径参数：**

| 参数   | 类型     | 说明    |
|------|--------|-------|
| `id` | String | 记录主键值 |

**请求体：** `application/json`，JSON 对象。仅更新传入的字段，未传字段保持不变（忽略 null 值）。

**响应：** 更新后的完整记录对象。

---

### 删除记录

```
DELETE /records/{id}
```

**路径参数：**

| 参数   | 类型     | 说明    |
|------|--------|-------|
| `id` | String | 记录主键值 |

**响应：** 204 No Content。

---

### CRUD 操作

#### 创建记录

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

#### 查询记录

支持单条查询和分页列表查询：

- **单条查询**：通过主键 ID 获取一条记录
- **列表查询**：支持分页、过滤、排序和关联展开

#### 更新记录

- **全量更新（PUT）**：替换整条记录的所有字段
- **局部更新（PATCH）**：仅更新请求体中包含的字段，未传字段保持不变

#### 删除记录

通过主键 ID 删除一条记录。

### 查询参数

#### 分页

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | int | 1 | 当前页码 |
| `size` | int | 15 | 每页条数 |

#### 过滤（Filter）

通过 `filter` 查询参数传入 JSON 格式的查询条件。查询条件使用灵活的 DSL 语法，支持比较、字符串、集合、范围和逻辑操作符。

##### 基础语法

- **同层字段隐式 AND**：同一层级的多个字段条件自动以 AND 组合，无需显式使用 `_and`
- **快捷等于写法**：`{"字段名": 值}` 等价于 `{"字段名": {"_eq": 值}}`
- **点号路径**：嵌套字段或关联字段可以用点号表示，如 `"address.city"` 或 `"studentClass.className"`

##### 比较操作符

| 操作符 | 描述 | 示例 |
|--------|------|------|
| `_eq` | 等于 | `{"name": {"_eq": "张三"}}` |
| `_ne` | 不等于 | `{"age": {"_ne": 18}}` |
| `_gt` | 大于 | `{"age": {"_gt": 18}}` |
| `_gte` | 大于等于 | `{"age": {"_gte": 18}}` |
| `_lt` | 小于 | `{"age": {"_lt": 65}}` |
| `_lte` | 小于等于 | `{"age": {"_lte": 65}}` |

##### 字符串操作符

| 操作符 | 描述 | 示例 |
|--------|------|------|
| `_contains` | 包含 | `{"name": {"_contains": "张"}}` |
| `_not_contains` | 不包含 | `{"name": {"_not_contains": "李"}}` |
| `_starts_with` | 以...开始 | `{"name": {"_starts_with": "张"}}` |
| `_ends_with` | 以...结束 | `{"name": {"_ends_with": "三"}}` |

##### 集合操作符

| 操作符 | 描述 | 示例 |
|--------|------|------|
| `_in` | 在...中 | `{"status": {"_in": ["active", "pending"]}}` |
| `_nin` | 不在...中 | `{"status": {"_nin": ["deleted"]}}` |

##### 范围操作符

| 操作符 | 描述 | 示例 |
|--------|------|------|
| `_between` | 在...之间 | `{"age": {"_between": [18, 65]}}` |

##### 逻辑操作符

| 操作符 | 描述 | 示例 |
|--------|------|------|
| `_and` | 与 | `{"_and": [{"age": {"_gte": 18}}, {"status": {"_eq": "active"}}]}` |
| `_or` | 或 | `{"_or": [{"status": {"_eq": "active"}}, {"status": {"_eq": "pending"}}]}` |

> 大多数场景下，同层字段已经隐式 AND，只有需要 OR 逻辑或复杂嵌套组合时才需要使用 `_and` / `_or`。

##### 查询示例

**单个条件：**

```json
{"username": {"_eq": "john_doe"}}
```

快捷写法：

```json
{"username": "john_doe"}
```

**多个条件（隐式 AND）：**

同层多个字段自动 AND，这是最推荐的写法：

```json
{
  "username": {"_eq": "john_doe"},
  "age": {"_gte": 18},
  "status": {"_eq": "active"}
}
```

等价于 SQL：`WHERE username = 'john_doe' AND age >= 18 AND status = 'active'`

**多个条件（OR）：**

```json
{
  "_or": [
    {"status": {"_eq": "active"}},
    {"status": {"_eq": "pending"}}
  ]
}
```

**混合条件（同层 AND + OR）：**

```json
{
  "age": {"_gte": 18},
  "createdAt": {"_between": ["2023-01-01 00:00:00", "2023-12-31 23:59:59"]},
  "_or": [
    {"gender": {"_eq": "MALE"}},
    {"gender": {"_eq": "FEMALE"}}
  ]
}
```

等价于 SQL：`WHERE age >= 18 AND createdAt BETWEEN '...' AND '...' AND (gender = 'MALE' OR gender = 'FEMALE')`

**字符串搜索：**

```json
{
  "_or": [
    {"name": {"_contains": "张"}},
    {"email": {"_contains": "zhang"}}
  ]
}
```

**枚举值查询：**

```json
{"status": {"_in": ["ACTIVE", "PENDING", "APPROVED"]}}
```

**日期时间查询：**

```json
{
  "createdAt": {"_gte": "2023-01-01 00:00:00"},
  "updatedAt": {"_lte": "2023-12-31 23:59:59"}
}
```

**同一字段多个条件：**

同一个字段也可以写多个操作符，自动 AND：

```json
{"age": {"_gte": 18, "_lt": 65}}
```

等价于 SQL：`WHERE age >= 18 AND age < 65`

#### 高级用法

**关联查询：**

支持通过嵌套对象查询关联数据：

```json
{
  "studentClass": {
    "className": {"_contains": "计算机"}
  }
}
```

也可以使用点号路径的扁平写法：

```json
{"studentClass.className": {"_contains": "计算机"}}
```

**多层关联查询：**

```json
{
  "studentClass": {
    "teacher": {
      "name": {"_contains": "李"}
    }
  }
}
```

点号路径写法：

```json
{"studentClass.teacher.name": {"_contains": "李"}}
```

**空值查询：**

```json
{"description": {"_eq": null}}
```

```json
{"description": {"_ne": null}}
```

**复杂嵌套组合：**

当需要多层 OR 与 AND 组合时，可以使用 `_and` / `_or` 嵌套：

```json
{
  "age": {"_gte": 18},
  "_or": [
    {
      "status": {"_eq": "active"},
      "role": {"_nin": ["banned"]}
    },
    {
      "role": {"_eq": "admin"}
    }
  ]
}
```

等价于 SQL：`WHERE age >= 18 AND ((status = 'active' AND role NOT IN ('banned')) OR role = 'admin')`

##### 注意事项

1. **数据类型匹配**：确保查询条件的值与字段类型匹配
2. **日期格式**：日期时间字段使用格式：`YYYY-MM-DD HH:mm:ss`
3. **字符串转义**：在 URL 中传递 JSON 时需要正确 URL 编码
4. **性能考虑**：复杂查询可能影响性能，建议在相关字段上创建索引
5. **大小写敏感**：字符串比较默认区分大小写
6. **渲染机制**：Flexmodel-Core 会先将 DSL 解析为内部条件语法树，再分别渲染为 SQL 或 Mongo 查询语句

#### 排序（Sort）

通过 `sort` 查询参数传入 JSON 数组，每个元素包含 `field` 和 `sort`（`ASC` 或 `DESC`）：

```json
[
  {"field": "name", "sort": "ASC"},
  {"field": "id", "sort": "DESC"}
]
```

#### 关联展开（Expand）

通过 `expand` 查询参数加载关联数据，逗号分隔多个字段名，支持嵌套展开：

```
?expand=studentClass,studentDetail
?expand=studentClass.teacher
```

不传 `expand` 时，不加载关联数据，仅返回本实体的字段。

## GraphQL API

GraphQL API 端点路径：`/api/projects/{projectId}/graphql`

每个模型自动生成对应的 GraphQL Query 和 Mutation：

### Query

| 查询                      | 说明 |
|-------------------------|------|
| `{ user }`              | 查询记录列表 |
| `{ userById(id: ...) }` | 按 ID 查询单条记录 |
| `{ userAggregate }`     | 聚合查询 |

### Mutation

| 操作                                     | 说明 |
|----------------------------------------|------|
| `createUser(data: {...})`              | 创建记录 |
| `updateUser(data: {...})`              | 更新记录 |
| `updateUserById(id: ..., data: {...})` | 按 ID 更新记录 |
| `deleteUser(...)`                      | 删除记录 |
| `deleteUserById(id: ...)`              | 按 ID 删除记录 |