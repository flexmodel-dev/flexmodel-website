---
sidebar_position: 5
---

# 数据建模

Flexmodel 提供了可视化的数据建模能力，支持通过图形界面、FML（Flexmodel Modeling Language）脚本或 JSON Schema 定义数据模型，自动同步到数据库，让开发者专注于业务建模而无需手写 DDL。

## 关键概念

### 模型类型

Flexmodel 支持三种模型类型：

| 类型 | 说明 |
|------|------|
| 实体 (Entity) | 对应数据库表，包含字段、索引和关联关系 |
| 枚举 (Enum) | 定义枚举类型，可被实体字段引用 |
| 本地查询 (Native Query) | 直接编写 SQL 查询语句，用于复杂查询场景 |

对象包含以下公共属性：

| 属性 | 类型 | 可选 | 描述 |
|------|------|------|------|
| name | String | 否 | 对象名称 |
| comment | String | 是 | 注释 |
| type | String | 否 | 对象类型 |
| additionalProperties | Object | 是 | 其他属性，可用于扩展 |

### 字段类型

实体字段支持以下数据类型：

| 类型       | 说明 |
|----------|------|
| String   | 字符串，可配置长度 |
| Int      | 32 位整数 |
| Long     | 64 位长整数 |
| Float    | 精确的小数类型，常用于财务数据 |
| Boolean  | 布尔值，仅能存储 true 或 false |
| DateTime | 日期时间 |
| Date     | 日期，不包含时间 |
| Time     | 时间，不包含日期 |
| JSON     | JSON 对象 |
| EnumRef  | 枚举引用 |
| Relation | 模型引用（关联关系） |

### 字段公共属性

所有字段类型共享以下公共属性：

| 属性 | 类型 | 可选 | 描述 |
|------|------|------|------|
| name | String | 否 | 字段名称 |
| comment | String | 是 | 注释 |
| type | String | 否 | 字段类型 |
| unique | Boolean | 是 | 是否唯一，默认值为 `false` |
| nullable | Boolean | 是 | 可为空，默认值为 `true` |
| defaultValue | Any | 是 | 默认值 |
| additionalProperties | Object | 是 | 其他属性，可用于扩展 |

### 字段类型专有属性

各字段类型除公共属性外，还有以下专有属性：

**ID**

| 属性 | 类型 | 可选 | 描述                                                           |
|------|------|------|--------------------------------------------------------------|

**String**

| 属性 | 类型 | 可选 | 描述 |
|------|------|------|------|
| length | Number | 是 | 长度，默认值为 `255` |

**Text**

无专有属性。

**Float**

| 属性 | 类型 | 可选 | 描述 |
|------|------|------|------|
| precision | Number | 是 | 数据长度，默认值为 `20` |
| scale | Number | 是 | 小数长度，默认值为 `2` |

**Int / Long / Boolean / JSON**

无专有属性。

**DateTime / Date / Time**

| 属性 | 类型 | 可选 | 描述 |
|------|------|------|------|

**Enum**

| 属性 | 类型 | 可选 | 描述 |
|------|------|------|------|
| multiple | Boolean | 是 | 是否多条，默认值为 `false` |
| from | String | 否 | 枚举从哪里来，从枚举定义中获取 |

**Relation**

| 属性 | 类型 | 可选 | 描述 |
|------|------|------|------|
| multiple | Boolean | 否 | 是否多条，默认值为 `false` |
| from | String | 否 | 数据从哪里来，从实体定义中获取 |
| localField | String | 否 | 本地字段 |
| foreignField | String | 否 | 外键字段 |
| cascadeDelete | Boolean | 是 | 级联删除，控制删除当前数据时是否删除关联数据，默认值为 `false` |

### 字段修饰符

FML 语法中常用的字段修饰符（注解）：

| 修饰符 | 说明 |
|--------|------|
| `?` | 字段名后加 `?` 表示可空，如 `name?: String` |
| `@id` | 标记为主键字段 |
| `@unique` | 字段值唯一约束 |
| `@length(n)` | 字符串长度限制 |
| `@default(value)` | 默认值，支持固定值或内置函数（`uuid()`、`ulid()`、`now()`、`autoIncrement()`） |
| `@comment("text")` | 字段注释 |

### 索引

实体支持通过 `@index` 声明索引，FML 语法：

```
@index(name: "索引名", unique: false, fields: [fieldA, fieldB: (sort: "desc")])
```

索引包含以下属性：

| 属性 | 类型 | 可选 | 描述 |
|------|------|------|------|
| name | String | 否 | 索引名称 |
| unique | Boolean | 是 | 是否唯一，默认值 `false` |
| fields | Array | 否 | 索引字段列表 |

索引字段包含以下属性：

| 属性 | 类型 | 可选 | 描述 |
|------|------|------|------|
| fieldName | String | 否 | 字段名称 |
| direction | String | 否 | 排序方式，`ASC` \| `DESC`，默认值 `DESC` |

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

### 枚举定义

枚举对象包含以下属性：

| 属性 | 类型 | 可选 | 描述 |
|------|------|------|------|
| elements | Array | 否 | 枚举元素，字符串数组，只支持英文或者英文、数字、下划线组合 |

枚举可通过 `additionalProperties` 支持多语言：

<details>
<summary>点击展开/折叠代码</summary>

```json
{
  "name": "UserGender",
  "type": "ENUM",
  "elements": [
    "UNKNOWN",
    "MALE",
    "FEMALE"
  ],
  "additionalProperties": {
    "lang": {
      "zh_CN": {
        "UNKNOWN": "未知",
        "MALE": "男",
        "FEMALE": "女"
      },
      "en_US": {
        "UNKNOWN": "Unknown",
        "MALE": "Male",
        "FEMALE": "Female"
      }
    }
  }
}
```

</details>

### 本地查询

本地查询用于支持建模没办法实现的复杂查询，比较灵活，缺点是跨数据库移植性较差。

| 属性 | 类型 | 可选 | 描述 |
|------|------|------|------|
| statement | String | 否 | SQL 查询语句 |

示例 — 查询用户根据性别分组查询：

<details>
<summary>点击展开/折叠代码</summary>

```json
{
  "name": "分组查询",
  "type": "NATIVE_QUERY",
  "statement": "select count(id) as total, gender, max(age) as ageSum from Student group by gender"
}
```

</details>

## 建模方式

### 可视化建模

通过管理界面的数据建模页面，以表单方式创建和管理模型：

1. 在模型树中点击新建，选择模型类型（实体/枚举/本地查询）
2. 填写模型名称和基本信息
3. 为实体添加字段、配置字段属性和索引
4. 变更实时同步到数据库

### JSON Schema 配置

支持通过 JSON 格式定义模型，对象分为 `ENTITY`、`ENUM` 和 `NATIVE_QUERY` 三种类型。

**实体配置示例：**

<details>
<summary>点击展开/折叠代码</summary>

```json
[
  {
    "type": "ENTITY",
    "name": "Student",
    "fields": [
      {
        "name": "id",
        "type": "ID",
        "modelName": "Student",
        "unique": false,
        "nullable": true,
        "generatedValue": "BIGINT_NOT_GENERATED"
      },
      {
        "name": "studentName",
        "type": "String",
        "modelName": "Student",
        "unique": false,
        "nullable": true,
        "length": 255
      },
      {
        "name": "gender",
        "type": "Enum",
        "from": "UserGender",
        "multiple": false,
        "modelName": "Student",
        "unique": false,
        "nullable": true
      },
      {
        "name": "interest",
        "type": "Enum",
        "from": "user_interest",
        "multiple": true,
        "modelName": "Student",
        "unique": false,
        "nullable": true
      },
      {
        "name": "age",
        "type": "Int",
        "modelName": "Student",
        "unique": false,
        "nullable": true
      },
      {
        "name": "classId",
        "type": "Long",
        "modelName": "Student",
        "unique": false,
        "nullable": true
      },
      {
        "name": "studentDetail",
        "type": "Relation",
        "modelName": "Student",
        "unique": false,
        "nullable": true,
        "multiple": false,
        "from": "StudentDetail",
        "localField": "id",
        "foreignField": "studentId",
        "cascadeDelete": true
      }
    ],
    "indexes": [
      {
        "modelName": "Student",
        "name": "IDX_studentName",
        "fields": [
          {
            "fieldName": "studentName",
            "direction": "ASC"
          }
        ],
        "unique": false
      }
    ]
  },
  {
    "type": "ENTITY",
    "name": "StudentDetail",
    "fields": [
      {
        "name": "id",
        "type": "ID",
        "modelName": "StudentDetail",
        "unique": false,
        "nullable": true,
        "generatedValue": "AUTO_INCREMENT"
      },
      {
        "name": "studentId",
        "type": "Long",
        "modelName": "StudentDetail",
        "unique": false,
        "nullable": true
      },
      {
        "type": "Relation",
        "name": "student",
        "comment": "班级",
        "modelName": "StudentDetail",
        "multiple": false,
        "from": "Student",
        "localField": "studentId",
        "foreignField": "id",
        "cascadeDelete": false
      },
      {
        "name": "description",
        "type": "Text",
        "modelName": "StudentDetail",
        "unique": false,
        "nullable": true
      }
    ]
  },
  {
    "name": "UserGender",
    "type": "ENUM",
    "elements": [
      "UNKNOWN",
      "MALE",
      "FEMALE"
    ],
    "comment": "性别"
  },
  {
    "name": "user_interest",
    "type": "ENUM",
    "elements": [
      "chang",
      "tiao",
      "rap",
      "daLanQiu"
    ],
    "comment": "兴趣"
  }
]
```

</details>

此段配置会生成模型如下：

Student:

| 名称 | 类型 |
|------|------|
| studentDetail | StudentDetail |
| age | Int |
| id | ID |
| interest | user_interest[] |
| classId | Long |
| studentName | String |
| gender | UserGender |

StudentDetail:

| 名称 | 类型 |
|------|------|
| id | ID |
| studentId | Long |
| student | Student |
| description | Text |

### FML 脚本建模

支持通过 FML（Flexmodel Modeling Language）脚本批量定义模型，完整语法示例：

```fml
// 班级模型
model Classes {
  id: String @id @default(uuid()),
  classCode: String @unique @length(255),
  className?: String @default("A班级"),
  students: Student[] @relation(localField: "id", foreignField: "classId", cascadeDelete: true),
  @comment("班级")
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
  @comment("学生")
}

// 学生详情模型
model StudentDetail {
  id: String @id @default(autoIncrement()),
  studentId?: Long,
  description?: String @length(255),
  @comment("学生详情")
}

// 用户性别枚举
enum UserGender {
  UNKNOWN,
  MALE,
  FEMALE,
  @comment("用户性别")
}

// 用户爱好枚举
enum user_interest {
  chang,
  tiao,
  rap,
  daLanQiu,
  @comment("用户爱好")
}
```

#### FML 语法要点

| 语法 | 说明 | 示例 |
|------|------|------|
| `model Name { ... }` | 定义实体 | `model Student { ... }` |
| `enum Name { ... }` | 定义枚举 | `enum UserGender { UNKNOWN, MALE }` |
| `seed ModelName { ... }` | 定义种子数据（JSON 格式，每条数据单独一行） | `seed UserGender { ... }` |
| `field?: Type` | 可空字段 | `name?: String` |
| `field: Type[]` | 一对多引用 | `students: Student[]` |
| `field: EnumType` | 单选枚举引用 | `gender?: UserGender` |
| `field: EnumType[]` | 多选枚举引用 | `interest?: User_interest[]` |
| `@relation(...)` | 关联关系声明 | `@relation(localField: "id", foreignField: "classId")` |
| `@index(...)` | 索引声明 | `@index(name: "IDX_name", fields: [fieldA])` |
| `@default(fn())` | 默认值 | `@default(uuid())` / `@default(now())` |
| `@unique` | 唯一约束 | `classCode: String @unique` |

#### 注解详解

**@id 注解**

标识主键字段，支持以下生成策略：

```fml
// UUID生成
id: String @id @default(uuid())

// 自增ID
id: Long @id @default(autoIncrement())

// ULID生成
id: String @id @default(ulid())

// 不自动生成
id: String @id
```

**@default 注解**

设置字段默认值：

```fml
// 字符串默认值
status: String @default("active")

// 数字默认值
count: Int @default(0)

// 布尔默认值
enabled: Boolean @default(true)

// 函数默认值
createdAt: DateTime @default(now())
```

**@relation 注解**

定义关联关系，支持以下参数：

| 参数 | 类型 | 描述 | 示例 |
|------|------|------|------|
| `localField` | String | 本地字段名 | `localField: "id"` |
| `foreignField` | String | 外键字段名 | `foreignField: "studentId"` |
| `cascadeDelete` | Boolean | 是否级联删除 | `cascadeDelete: true` |

```fml
// 一对一关系
studentDetail: StudentDetail @relation(localField: "id", foreignField: "studentId", cascadeDelete: true)

// 一对多关系
students: Student[] @relation(localField: "id", foreignField: "classId", cascadeDelete: true)

// 多对一关系
studentClass: Classes @relation(localField: "classId", foreignField: "id")
```

**@index 注解**

定义索引，支持以下参数：

| 参数 | 类型 | 描述 | 示例 |
|------|------|------|------|
| `name` | String | 索引名称 | `name: "IDX_studentName"` |
| `unique` | Boolean | 是否唯一 | `unique: false` |
| `fields` | Array | 索引字段列表 | `fields: [studentName, age: (sort: "desc")]` |

```fml
// 单字段索引
@index(name: "IDX_studentName", unique: false, fields: [studentName])

// 复合索引
@index(name: "IDX_student_class", unique: false, fields: [classId, studentName: (sort: "desc")])

// 唯一索引
@index(name: "IDX_email", unique: true, fields: [email])
```

#### 语法规则

1. **标识符**：支持字母、数字、下划线，不能以数字开头
2. **字符串**：使用双引号包围，支持转义字符
3. **注释**：支持单行注释 `//` 和多行注释 `/* */`
4. **分号**：字段定义后必须使用逗号分隔
5. **空格**：语法对空格不敏感，但建议保持良好的格式

#### 与 JSON 格式的对比

| 特性 | FML | JSON |
|------|-----|------|
| 语法简洁性 | ✅ 更简洁 | ❌ 冗长 |
| 可读性 | ✅ 更直观 | ❌ 结构复杂 |
| 注释支持 | ✅ 原生支持 | ❌ 不支持 |
| 类型安全 | ✅ 强类型 | ❌ 弱类型 |
| 工具支持 | ✅ 语法高亮 | ✅ 广泛支持 |

#### 最佳实践

1. **命名规范**：使用驼峰命名法，模型名首字母大写
2. **字段顺序**：主键字段放在最前面，关联字段放在最后
3. **注释使用**：为复杂字段和模型添加注释
4. **索引优化**：为常用查询字段创建索引
5. **关联设计**：合理设计关联关系，避免循环依赖

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
