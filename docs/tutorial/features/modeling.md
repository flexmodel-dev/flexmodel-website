---
sidebar_position: 5
---

# 数据建模

Flexmodel 提供了可视化的数据建模能力，支持通过图形界面或 FML（Flexmodel Modeling Language）脚本定义数据模型，自动同步到数据库，让开发者专注于业务建模而无需手写 DDL。

## 关键概念

### 模型类型

Flexmodel 支持三种模型类型：

| 类型 | 说明 |
|------|------|
| 实体 (Entity) | 对应数据库表，包含字段、索引和关联关系 |
| 枚举 (Enum) | 定义枚举类型，可被实体字段引用 |
| 本地查询 (Native Query) | 直接编写 SQL 查询语句，用于复杂查询场景 |

### 字段类型

实体字段支持以下数据类型：

| 类型 | 说明 |
|------|------|
| String | 字符串，可配置长度 |
| Int | 32 位整数 |
| Long | 64 位长整数 |
| Float | 单精度浮点数 |
| Double | 双精度浮点数 |
| Decimal | 高精度小数 |
| BigInt | 大整数 |
| Boolean | 布尔值 |
| DateTime | 日期时间 |
| JSON | JSON 对象 |
| Bytes | 字节数组 |

### 字段修饰符

| 修饰符 | 说明 |
|--------|------|
| `?` | 字段名后加 `?` 表示可空，如 `name?: String` |
| `@id` | 标记为主键字段 |
| `@unique` | 字段值唯一约束 |
| `@length("n")` | 字符串长度限制 |
| `@default(value)` | 默认值，支持固定值或内置函数（`uuid()`、`ulid()`、`now()`、`autoIncrement()`） |
| `@comment("text")` | 字段注释 |

### 索引

实体支持通过 `@index` 声明索引，语法：

```
@index(name: "索引名", unique: false, fields: [fieldA, fieldB: (sort: "desc")])
```

- `name` — 索引名称（可选，省略时自动生成）
- `unique` — 是否唯一索引
- `fields` — 字段列表，支持按字段指定排序方向（`sort: "asc"` 或 `sort: "desc"`）

### 关联关系

实体之间通过 `@relation` 声明关联关系：

| 语法 | 说明 |
|------|------|
| `field: Target` | 一对一/多对一引用 |
| `field: Target[]` | 一对多引用（字段名后加 `[]`） |
| `@relation(localField, foreignField)` | 指定本地字段和关联字段 |
| `@relation(..., cascadeDelete: true)` | 启用级联删除 |

枚举类型可直接作为字段类型引用，多选枚举使用 `EnumType[]` 语法：

| 语法 | 说明 |
|------|------|
| `field: MyEnum` | 单选枚举引用 |
| `field: MyEnum[]` | 多选枚举引用 |

## 建模方式

### 可视化建模

通过管理界面的数据建模页面，以表单方式创建和管理模型：

1. 在模型树中点击新建，选择模型类型（实体/枚举/本地查询）
2. 填写模型名称和基本信息
3. 为实体添加字段、配置字段属性和索引
4. 变更实时同步到数据库

### FML 脚本建模

支持通过 FML（Flexmodel Modeling Language）脚本批量定义模型，完整语法示例：

```fml
// 班级模型
model Classes {
  id: String @id @default(uuid()),
  classCode: String @unique @length(255),
  className?: String @default("A班级"),
  students: Student[] @relation(localField: "id", foreignField: "classId", cascadeDelete: true),
}

// 学生模型
model Student {
  id: String @id @default(uuid()),
  studentName?: String @length(255),
  gender?: UserGender,
  interest?: User_interest[],
  age?: Int,
  classId?: Long,
  studentClass: Classes @relation(localField: "classId", foreignField: "id"),
  studentDetail: StudentDetail @relation(localField: "id", foreignField: "studentId", cascadeDelete: true),
  createdAt?: DateTime @default(now()),
  updatedAt?: DateTime @default(now()),
  @index(name: "IDX_studentName", unique: false, fields: [classId, studentName: (sort: "desc")]),
  @index(unique: false, fields: [studentName]),
  @index(unique: false, fields: [classId]),
}

// 学生详情模型
model StudentDetail {
  id: String @id @default(autoIncrement()),
  studentId?: Long,
  description?: String @length(255),
}

// 用户性别枚举
enum UserGender {
  UNKNOWN,
  MALE,
  FEMALE
}

// 用户爱好枚举
enum user_interest {
  chang,
  tiao,
  rap,
  daLanQiu
}
```

#### FML 语法要点

| 语法 | 说明 | 示例 |
|------|------|------|
| `model Name { ... }` | 定义实体 | `model Student { ... }` |
| `enum Name { ... }` | 定义枚举 | `enum UserGender { UNKNOWN, MALE }` |
| `seed ModelName [ ... ]` | 定义种子数据（JSON 格式） | `seed UserGender [{ ... }]` |
| `field?: Type` | 可空字段 | `name?: String` |
| `field: Type[]` | 一对多引用 | `students: Student[]` |
| `field: EnumType` | 单选枚举引用 | `gender?: UserGender` |
| `field: EnumType[]` | 多选枚举引用 | `interest?: User_interest[]` |
| `@relation(...)` | 关联关系声明 | `@relation(localField: "id", foreignField: "classId")` |
| `@index(...)` | 索引声明 | `@index(name: "IDX_name", fields: [fieldA])` |
| `@default(fn())` | 默认值 | `@default(uuid())` / `@default(now())` |
| `@unique` | 唯一约束 | `classCode: String @unique` |

FML 脚本支持在管理界面中直接编辑和执行，适合批量建模和模型迁移场景。

### ER 图视图

数据建模页面提供 ER 图视图模式，以可视化方式展示实体之间的关联关系，便于理解和审查数据模型设计。

## API 端点

数据建模相关的 REST API 基础路径为 `/api/projects/{projectId}/models`：

| 端点 | 说明 |
|------|------|
| `GET /models` | 获取模型列表 |
| `GET /models/{modelName}` | 获取单个模型 |
| `POST /models` | 创建模型 |
| `PUT /models/{modelName}` | 更新模型 |
| `DELETE /models/{modelName}` | 删除模型 |
| `POST /models/{modelName}/fields` | 创建字段 |
| `PUT /models/{modelName}/fields/{fieldName}` | 更新字段 |
| `DELETE /models/{modelName}/fields/{fieldName}` | 删除字段 |
| `POST /models/{modelName}/indexes` | 创建索引 |
| `PUT /models/{modelName}/indexes/{indexName}` | 更新索引 |
| `DELETE /models/{modelName}/indexes/{indexName}` | 删除索引 |
| `POST /models/fml/execute` | 执行 FML 脚本 |

更多端点请参考 Swagger UI (`/q/swagger-ui`)。
