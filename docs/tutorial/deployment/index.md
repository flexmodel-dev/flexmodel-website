

# 运维部署

## 运行模式

Flexmodel 支持两种运行模式：

- **JVM 模式** — 标准 Java 运行时，支持动态类加载，适合开发调试
- **Native 模式** — GraalVM Native Image 编译的原生可执行文件，毫秒级启动，内存占用降低 80%，推荐生产环境使用

详见 [Native 编译](./native-image) 文档。

## 部署要求

1. 硬件配置要求：内存至少 2GB，磁盘 40GB

2. 运行环境要求：Linux + Docker


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

请见Github代码仓库，以下为docker-compose部署示例：

https://github.com/flexmodel-dev/flexmodel/deploy
