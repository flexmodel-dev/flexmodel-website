# 转换结果

在使用 GraphQL 查询数据时，由于查询的层级可能较深，有时需要将多层嵌套的数据进行扁平化处理，以便于前端使用。

```graphql
query MyQuery {
  courses: system_list_Student(where: {studentName: {_in: ["李四", "王五"]}}) {
    classId
    studentName
  }
  total: system_aggregate_Student(where: {studentName: {_in: ["李四", "王五"]}}) @transform(get: "_count") {
    _count
  }
  maxAge: system_aggregate_Student(where: {studentName: {_in: ["李四", "王五"]}}) @transform(get: "_max.age") {
    _max {
      age
    }
  }
}
```

返回结构示例

```json
{
  "data": {
    "total": 2,
    "maxAge": 18
  }
}
```


将 @transform 作用于对象/数组类型的选择集上，将其拍扁，提取出对应的字段。
