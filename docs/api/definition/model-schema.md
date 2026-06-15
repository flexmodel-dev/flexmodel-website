---
sidebar_position: 21
---

# Model Schema

## 简介

Flexmodel框架支持JSON格式和独有的IDL（Flexmodel接口定义语言）定义模型，此文档为Schema定义描述。

## JSON对象配置

对象分为三种，`ENTITY`、`ENUM`和`NATIVE_QUERY`，实体对应数据库物理表，`ENUM`为枚举类型，`NATIVE_QUERY`为本地查询。

对象包含以下公共属性：

| 属性                   | 类型     | 可选属性 | 描述         |
|----------------------|--------|------|------------|
| name                 | String | 否    | 对象名称       |
| comment              | String | 是    | 注释         |
| type                 | String | 否    | 对象类型       |
| additionalProperties | Object | 是    | 其他属性，可用于扩展 |

下文将介绍不通类型对象专有属性

### 实体描述

实体包含字段和索引两部分：

| 属性      | 类型    | 可选属性 | 描述   |
|---------|-------|------|------|
| fields  | Array | 否    | 字段列表 |
| indexes | Array | 是    | 索引列表 |

1. 字段描述

目前支持以下类型：

| 名称       | 描述                         |  
|----------|----------------------------|  
| ID       | 唯一标识符，通常用于区分不同记录。          |  
| String   | 字符串类型，用于存储文本数据。            |  
| Text     | 文本类型，适用于存储大量文本信息。          |  
| Float    | 精确的小数类型，常用于财务数据。           |  
| Int      | 整数类型，通常用于存储整数值。            |  
| Long     | 大整数类型，适用于存储超出标准整数范围的值。     |  
| Boolean  | 布尔类型，仅能存储真（true）或假（false）。 |  
| DateTime | 日期时间类型，用于存储日期和时间信息。        |  
| Date     | 日期类型，仅用于存储日期，不包含时间。        |  
| Time     | 时间类型，仅用于存储时间。              |  
| JSON     | JSON格式，用于存储结构化数据。          |  
| Enum     | 枚举类型，定义一组有限的可能值。           |  
| Relation | 关系类型，表示与数据的关联。             |  

字段包含以下公共属性：

| 属性                   | 类型      | 可选属性 | 描述               |
|----------------------|---------|------|------------------|
| name                 | String  | 否    | 对象名称             |
| comment              | String  | 是    | 注释               |
| type                 | String  | 否    | 对象类型             |
| unique               | Boolean | 是    | 是否唯一，默认值为`false` |
| nullable             | Boolean | 是    | 可为空，默认值为`true`   |
| defaultValue         | Any     | 是    | 默认值              |
| additionalProperties | Object  | 是    | 其他属性，可用于扩展       |

以下为各种类型字段的专有属性：

**ID**

| 属性             | 类型     | 可选属性 | 描述                                                                                                       |
  |----------------|--------|------|----------------------------------------------------------------------------------------------------------|
| generatedValue | String | 否    | 可配置`AUTO_INCREMENT`\|`UUID`\|`ULID`\|`BIGINT_NOT_GENERATED`\|`STRING_NOT_GENERATED`，默认值为`AUTO_INCREMENT` |

**String**

| 属性     | 类型     | 可选属性 | 描述           |
|--------|--------|------|--------------|
| length | Number | 是    | 长度，默认值为`255` |

**Text**

| 属性 | 类型 | 可选属性 | 描述 |
    |----|----|------|----|

**Float**

| 属性        | 类型     | 可选属性 | 描述            |
    |-----------|--------|------|---------------|
| precision | Number | 是    | 数据长度，默认值为`20` |
| scale     | Number | 是    | 小数长度，默认值为`2`  |

**Int**

| 属性 | 类型 | 可选属性 | 描述 |
|----|----|------|----|

**Long**

| 属性 | 类型 | 可选属性 | 描述 |
|----|----|------|----|

**Boolean**

| 属性 | 类型 | 可选属性 | 描述 |
|----|----|------|----|

**DateTime**

| 属性             | 类型     | 可选属性 | 描述                                                                       |
|----------------|--------|------|--------------------------------------------------------------------------|
| generatedValue | String | 是    | 生成当前日期时间，可配置`NOW_ON_CREATE`\|`NOW_ON_UPDATE`\|`NOW_ON_CREATE_AND_UPDATE` |

**Date**

| 属性             | 类型     | 可选属性 | 描述                                                                     |
|----------------|--------|------|------------------------------------------------------------------------|
| generatedValue | String | 是    | 生成当前日期，可配置`NOW_ON_CREATE`\|`NOW_ON_UPDATE`\|`NOW_ON_CREATE_AND_UPDATE` |

**Time**

| 属性             | 类型     | 可选属性 | 描述                                                                     |
|----------------|--------|------|------------------------------------------------------------------------|
| generatedValue | String | 是    | 生成当前日期，可配置`NOW_ON_CREATE`\|`NOW_ON_UPDATE`\|`NOW_ON_CREATE_AND_UPDATE` |

**JSON**

| 属性 | 类型 | 可选属性 | 描述 |
|----|----|------|----|

**Enum**

| 属性       | 类型      | 可选属性 | 描述               |
|----------|---------|------|------------------|
| multiple | Boolean | 是    | 是否多条，默认值为`false` |
| from     | String  | 否    | 枚举从哪里来，从枚举定义中获取  |

**Relation**

| 属性            | 类型      | 可选属性 | 描述                                 |
|---------------|---------|------|------------------------------------|
| multiple      | Boolean | 否    | 是否多条，默认值为`false`                   |
| from          | String  | 否    | 数据从哪里来，从实体定义中获取                    |
| localField    | String  | 否    | 本地字段                               |
| foreignField  | String  | 否    | 外键字段                               |
| cascadeDelete | Boolean | 是    | 级联删除，控制删除当前数据时是否删除关联数据，默认值为`false` |

2. 索引描述

| 属性        | 父属性       | 类型      | 可选属性 | 描述                           |
|-----------|-----------|---------|------|------------------------------|
| name      | -         | String  | 否    | 索引名称                         |
| unique    | -         | Boolean | 是    | 是否唯一，默认值`false`              |
| fields    | -         | Array   | 否    | 索引字段                         |
| fieldName | fields[n] | Boolean | 否    | 字段名称                         |
| direction | fields[n] | String  | 否    | 排序方式，`ASC`\|`DESC`，默认值`DESC` |

**配置示例：**
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

此段代码会生成模型如下：

Student:

| 名称            | 类型              |  
|---------------|-----------------|
| studentDetail | StudentDetail   |  
| age           | Int             |  
| id            | ID              |  
| interest      | user_interest[] |  
| classId       | Long            |  
| studentName   | String          |  
| gender        | UserGender      |  

StudentDetail:

| 名称          | 类型      |  
|-------------|---------|
| id          | ID      |
| studentId   | Long    |
| student     | Student |
| description | Text    |

### 枚举描述

可支持建模选择枚举类型，可作为实体的枚举字段使用

| 属性       | 类型    | 可选属性 | 描述                            |
|----------|-------|------|-------------------------------|
| elements | Array | 否    | 枚举元素，字符串数组，只支持英文或者英文、数字、下划线组合 |

**配置示例：**

新增用户性别枚举，通过additionalProperties支持多语言

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

### 本地查询描述

用于支持建模没办法实现的复杂查询，比较灵活，缺点是跨数据库移植性较差。

| 属性        | 类型     | 可选属性 | 描述 |
|-----------|--------|------|----|
| statement | String | 否    | 语句 |

**配置示例：**

查询用户根据性别分组查询

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

## IDL 对象配置

Flexmodel IDL（Flexmodel接口定义语言）是一种简洁的模型定义语言，提供了比JSON更直观的语法来定义数据模型。

### 基本语法

IDL使用类似TypeScript的语法，支持以下基本元素：

- **模型定义**: `model ModelName { ... }`
- **枚举定义**: `enum EnumName { ... }`
- **字段定义**: `fieldName: Type @annotation(...)`
- **注解**: `@annotationName(parameter: value)`
- **注释**: `// 单行注释` 或 `/* 多行注释 */`

### 模型定义

#### 基本语法

```idl
model ModelName {
  fieldName: Type @annotation(...),
  optionalField?: Type @annotation(...),
}
```

#### 字段类型

支持以下字段类型：

| 类型            | 描述     | 示例                          |
|---------------|--------|-----------------------------|
| `String`      | 字符串类型  | `name: String @length(255)` |
| `Int`         | 整数类型   | `age: Int`                  |
| `Long`        | 长整数类型  | `id: Long`                  |
| `Float`       | 浮点数类型  | `price: Float`              |
| `Boolean`     | 布尔类型   | `active: Boolean`           |
| `DateTime`    | 日期时间类型 | `createdAt: DateTime`       |
| `Date`        | 日期类型   | `birthday: Date`            |
| `Time`        | 时间类型   | `startTime: Time`           |
| `JSON`        | JSON类型 | `config: JSON`              |
| `EnumType`    | 枚举类型   | `gender: UserGender`        |
| `ModelType`   | 关联类型   | `student: Student`          |
| `ModelType[]` | 关联数组类型 | `students: Student[]`       |

#### 字段修饰符

- **可选字段**: 在字段名后添加 `?` 表示该字段可为空
- **数组字段**: 在类型后添加 `[]` 表示该字段为数组类型

#### 常用注解

| 注解                | 描述    | 示例                                  |
|-------------------|-------|-------------------------------------|
| `@id`             | 主键标识  | `id: String @id`                    |
| `@unique`         | 唯一约束  | `email: String @unique`             |
| `@default(value)` | 默认值   | `status: String @default("active")` |
| `@length(n)`      | 字符串长度 | `name: String @length(255)`         |
| `@comment(text)`  | 字段注释  | `name: String @comment("用户姓名")`     |
| `@relation(...)`  | 关联关系  | `student: Student @relation(...)`   |

#### 主键注解

```idl
// UUID主键
id: String @id @default(uuid())

// 自增主键
id: Long @id @default(autoIncrement())

// ULID主键
id: String @id @default(ulid())
```

#### 关联关系注解

```idl
// 一对一关系
studentDetail: StudentDetail @relation(localField: "id", foreignField: "studentId", cascadeDelete: true)

// 一对多关系
students: Student[] @relation(localField: "id", foreignField: "classId", cascadeDelete: true)

// 多对一关系
studentClass: Classes @relation(localField: "classId", foreignField: "id")
```

#### 索引注解

```idl
// 单字段索引
@index(name: "IDX_studentName", unique: false, fields: [studentName])

// 复合索引
@index(name: "IDX_student_class", unique: false, fields: [classId, studentName: (sort: "desc")])

// 唯一索引
@index(name: "IDX_email", unique: true, fields: [email])
```

### 枚举定义

#### 基本语法

```idl
enum EnumName {
  VALUE1,
  VALUE2,
  VALUE3
}
```

#### 示例

```idl
enum UserGender {
  UNKNOWN,
  MALE,
  FEMALE
}

enum ApiType {
  FOLDER,
  API
}
```

### 完整示例

#### 学生管理系统

```idl
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

#### 系统配置模型

```idl
// 数据源配置
model fs_datasource {
  name: String @id,
  type?: DatasourceType,
  config?: JSON,
  createdAt?: DateTime @default(now()),
  updatedAt?: DateTime @default(now()),
  enabled: Boolean @comment("数据源") @default(true),
}

// API定义
model fs_api_definition {
  id: String @id @unique @default(ulid()),
  name: String @length(255),
  parentId?: String @length(255),
  type: ApiType,
  method?: String @length(255),
  path?: String @length(255),
  createdAt: DateTime @default(now()),
  updatedAt: DateTime @default(now()),
  meta?: JSON,
  enabled: Boolean @comment("是否开启") @default(true),
}

// 用户模型
model fs_user {
  id: String @id @default(ulid()),
  username: String @length(255) @comment("用户名"),
  avatar?: String @length(255) @comment("头像"),
  password_hash: String @length(255) @comment("密码HASH"),
  created_at: DateTime @default(now()) @comment("创建时间"),
  updated_at: DateTime @default(now()) @comment("更新时间"),
  @index(name: "IDX_USERNAME", unique: true, fields: [username]),
  @comment("用户")
}

// 枚举定义
enum ApiType {
  FOLDER,
  API
}

enum DatasourceType {
  SYSTEM,
  USER
}
```

### 注解详解

#### @id 注解

标识主键字段，支持以下生成策略：

```idl
// UUID生成
id: String @id @default(uuid())

// 自增ID
id: Long @id @default(autoIncrement())

// ULID生成
id: String @id @default(ulid())

// 不自动生成
id: String @id
```

#### @default 注解

设置字段默认值：

```idl
// 字符串默认值
status: String @default("active")

// 数字默认值
count: Int @default(0)

// 布尔默认值
enabled: Boolean @default(true)

// 函数默认值
createdAt: DateTime @default(now())
```

#### @relation 注解

定义关联关系，支持以下参数：

| 参数              | 类型      | 描述     | 示例                          |
|-----------------|---------|--------|-----------------------------|
| `localField`    | String  | 本地字段名  | `localField: "id"`          |
| `foreignField`  | String  | 外键字段名  | `foreignField: "studentId"` |
| `cascadeDelete` | Boolean | 是否级联删除 | `cascadeDelete: true`       |

#### @index 注解

定义索引，支持以下参数：

| 参数       | 类型      | 描述     | 示例                                           |
|----------|---------|--------|----------------------------------------------|
| `name`   | String  | 索引名称   | `name: "IDX_studentName"`                    |
| `unique` | Boolean | 是否唯一   | `unique: false`                              |
| `fields` | Array   | 索引字段列表 | `fields: [studentName, age: (sort: "desc")]` |

### 语法规则

1. **标识符**: 支持字母、数字、下划线，不能以数字开头
2. **字符串**: 使用双引号包围，支持转义字符
3. **注释**: 支持单行注释 `//` 和多行注释 `/* */`
4. **分号**: 字段定义后必须使用逗号分隔
5. **空格**: 语法对空格不敏感，但建议保持良好的格式

### 与JSON格式的对比

| 特性    | IDL    | JSON   |
|-------|--------|--------|
| 语法简洁性 | ✅ 更简洁  | ❌ 冗长   |
| 可读性   | ✅ 更直观  | ❌ 结构复杂 |
| 注释支持  | ✅ 原生支持 | ❌ 不支持  |
| 类型安全  | ✅ 强类型  | ❌ 弱类型  |
| 工具支持  | ✅ 语法高亮 | ✅ 广泛支持 |

### 最佳实践

1. **命名规范**: 使用驼峰命名法，模型名首字母大写
2. **字段顺序**: 主键字段放在最前面，关联字段放在最后
3. **注释使用**: 为复杂字段和模型添加注释
4. **索引优化**: 为常用查询字段创建索引
5. **关联设计**: 合理设计关联关系，避免循环依赖 
