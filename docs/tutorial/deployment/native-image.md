---
sidebar_position: 2
---

# Native 编译

Flexmodel 全面支持 **GraalVM Native Image** 技术，可将 Java 应用编译为独立的原生可执行文件，无需依赖 JVM 即可运行。

## 为什么选择 Native 编译？

| 指标     | JVM 模式    | Native 模式    | 提升     |
|--------|-----------|--------------|--------|
| 启动时间   | 3–5 秒     | **< 100 毫秒** | 30–50× |
| 内存占用   | 512 MB+   | **~70 MB**   | ~80% ↓ |
| 镜像体积   | 500 MB+   | **~200 MB**  | ~60% ↓ |
| CPU 预热 | 需要 JIT 预热 | **即刻峰值性能**   | —      |

## 构建 Native 可执行文件

### 前置条件

- **GraalVM JDK 25**（或 JDK 25 + `native-image` 工具）
- **Windows**: 需安装 Visual Studio 2022 与 C++ 桌面开发工具链
- **Linux**: 需安装 GCC 与 glibc 开发包
- **macOS**: 需安装 Xcode Command Line Tools

### 构建命令

在项目根目录执行：

```bash
mvn -Pnative -Dmaven.test.skip=true clean package -pl flexmodel-server -am
```

构建产物位于：

```
flexmodel-server/target/flexmodel-server-*-runner
```

### 运行验证

```bash
./flexmodel-server/target/flexmodel-server-*-runner
```

启动后你将看到类似以下日志，确认以 Native 模式运行：

```
__  ____  __  _____   ___  __ ____  ______
 --/ __ \/ / / / _ | / _ \/ //_/ / / / __/
 -/ /_/ / /_/ / __ |/ , _/ ,< / /_/ /\ \
--\___\_\____/_/ |_/_/|_/_/|_|\____/___/
INFO  [dev.flexmodel] Flexmodel Server (Native) started in 0.045s
```

## Docker 部署

### 预构建镜像

Flexmodel 提供预构建的 Native 镜像，可直接用于生产环境：

```bash
docker pull cjbi/flexmodel-server-native:latest
```

### Docker Compose

在 `deploy/docker-compose/.env` 中配置运行模式：

```bash
# 切换方式：修改 FLEXMODEL_SERVER_IMAGE 配置
#   native → FLEXMODEL_SERVER_IMAGE=cjbi/flexmodel-server-native:latest
#   jvm    → FLEXMODEL_SERVER_IMAGE=cjbi/flexmodel-server:latest
FLEXMODEL_SERVER_IMAGE=cjbi/flexmodel-server-native:latest
```

启动服务：

```bash
cd deploy/docker-compose
docker compose up -d
```

### 镜像切换

Flexmodel 同时提供 JVM 和 Native 两种镜像，通过环境变量一键切换：

| 运行模式   | 镜像                                    | 适用场景         |
|--------|---------------------------------------|--------------|
| JVM    | `cjbi/flexmodel-server:latest`        | 开发调试、需要动态类加载 |
| Native | `cjbi/flexmodel-server-native:latest` | 生产部署、高密度部署   |
