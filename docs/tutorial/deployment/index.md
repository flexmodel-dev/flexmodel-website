# 运维部署

## 部署要求

1. 硬件配置要求：内存至少 1GB，磁盘 40GB

2. 运行环境要求：Linux

## Docker

需要通过jdbc连接数据源

以下为已经适配，集成测试用例测试通过的数据库版本

**关系型数据库**

| 数据库名称      | 兼容版本/已验证版本    | 连接参数                   |
|------------|---------------|------------------------|
| MySQL      | 8.0           |                        |
| MariaDB    | 10.3.6        |                        |
| Oracle     | 21c           |                        |
| SQL Server | 2017-CU12     |                        |
| PostgreSQL | 16-3.4-alpine |                        |
| DB2        | 11.5.0.0a     | progressiveStreaming=2 |
| SQLite     | 3.45.3        |                        |
| Informix   | 14.10         |                        |
| GBase      | 8s            | DELIMIDENT=y;          |
| 达梦         | DM8           |                        |
| TiDB       | v7.1.5        |                        |

**文档型数据库**

| 数据库名称   | 兼容版本 | 连接参数 |
|---------|------|------|
| MongoDB | 5.0  |      |

```shelll
docker run -p 8080:8080 -e JAVA_OPTS="-Dfile.encoding=UTF-8 -Duser.timezone=GMT+08 -Dflexmodel.datasource.dk-kind=mysql -Dflexmodel.datasource.url=jdbc:mysql://mysql:3306/${MYSQL_DATABASE} -Dflexmodel.datasource.username=root -Dflexmodel.datasource.password=${MYSQL_ROOT_PASSWORD}" -t cjbi/flexmodel:latest 
```

## Docker-compose

请见Github代码仓库，以下为docker-compose部署示例：

https://github.com/flexmodel-dev/flexmodel-quickstarts/tree/main/docker-compose
