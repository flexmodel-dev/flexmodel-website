---
sidebar_position: 30
---

# 对象存储

Flexmodel 提供了统一的对象存储抽象层，支持本地存储和 S3 兼容存储（包括 AWS S3、阿里云 OSS 等），让用户无需关心底层存储差异即可管理 Bucket 和文件对象。

## 关键概念

### 存储桶（Bucket）
存储桶是对象的顶层容器，类似于文件夹的概念。每个存储桶可以配置为使用不同的存储后端。

### 存储后端（Storage Backend）
Flexmodel 支持两种存储后端：

| 后端类型 | 说明 |
|---------|------|
| Local | 本地文件系统存储，适用于开发和小规模部署 |
| S3 | S3 兼容存储（AWS S3、阿里云 OSS 等），适用于生产环境 |

### 文件操作
支持对文件对象的以下操作：

| 操作 | 说明 |
|------|------|
| 上传 (Upload) | 将文件上传到指定 Bucket |
| 下载 (Download) | 从 Bucket 下载文件 |
| Head | 获取文件元信息（大小、类型等） |
| 删除 (Delete) | 删除 Bucket 中的文件 |

## 存储配置

存储后端通过 `application.properties` 配置：

```properties
# 本地存储配置（默认）
flexmodel.storage.provider=local
flexmodel.storage.local.path=/data/storage

# S3 存储配置
flexmodel.storage.provider=s3
flexmodel.storage.s3.endpoint=https://s3.amazonaws.com
flexmodel.storage.s3.region=us-east-1
flexmodel.storage.s3.access-key=your-access-key
flexmodel.storage.s3.secret-key=your-secret-key
```

## API 端点

对象存储相关的 REST API 基础路径为 `/api/projects/{projectId}/buckets`：

| 端点 | 说明 |
|------|------|
| `GET /buckets` | 获取存储桶列表 |
| `POST /buckets` | 创建存储桶 |
| `GET /buckets/{bucketName}` | 获取存储桶详情 |
| `DELETE /buckets/{bucketName}` | 删除存储桶 |
| `POST /buckets/{bucketName}/upload` | 上传文件 |
| `GET /buckets/{bucketName}/download/{key}` | 下载文件 |
| `HEAD /buckets/{bucketName}/head/{key}` | 获取文件元信息 |

更多端点请参考 Swagger UI (`/q/swagger-ui`)。
