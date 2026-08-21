---
sidebar_position: 20
---

# 任务调度

Flexmodel 内置了分布式任务调度系统，支持多种触发器类型和作业执行方式，可以与流程编排模块联动实现定时触发流程。

## 关键概念

### 触发器（Trigger）

触发器定义了作业的触发规则，按 `type` 字段分为两大类：

| 触发器类型 (`type`)     | 说明                   | 配置子类型                                    |
|-------------------------|------------------------|-----------------------------------------------|
| 定时触发器 (`schedule`) | 按时间计划周期性触发   | `cron`（Cron 表达式）、`interval`（固定间隔） |
| 事件触发器 (`event`)    | 由数据模型变更事件触发 | `event`                                       |

**Cron 触发器**（`config.type = "cron"`）：基于 Cron 表达式定时触发，格式为 `秒 分 时 日 月 周`，例如 `0 0 12 * * ?` 表示每天中午
12 点执行。

**间隔触发器**（`config.type = "interval"`）：按固定间隔重复触发，通过 `interval`（间隔数值）与 `intervalUnit`（单位：`second`/
`minute`/`hour`/`day`/`week`/`month`/`year`）定义周期，`repeatCount` 指定重复次数（省略或 `0` 表示无限重复）。

**事件触发器**（`config.type = "event"`）：监听指定模型的数据变更，通过 `modelName`（监听的模型）、`mutationTypes`（变更类型：
`create`/`update`/`delete`）与 `triggerTiming`（触发时机：`before` 操作前 / `after` 操作后，默认 `after`）配置。

### 作业（Job）

作业是触发器触发后执行的任务，通过 `jobType` 字段区分，目前支持以下作业类型：

| 作业类型 (`jobType`) | 对应 Job 类                     | 说明                   |
|----------------------|---------------------------------|------------------------|
| `FLOW`               | `ScheduledFlowExecutionJob`     | 触发后启动一个流程实例 |
| `FUNCTION`           | `ScheduledFunctionExecutionJob` | 触发后调用一个边缘函数 |

### 执行日志（JobExecutionLog）
每次作业执行都会记录日志，包含执行状态、耗时、错误信息等。

## 调度引擎

调度引擎基于 Quartz 框架实现，通过自定义 `FmJobStore` 将触发器与作业信息持久化到 FML 模型存储（`f_qrtz_*` 系列表）：

- **持久化存储**：触发器和作业定义存于数据库，服务重启时自动恢复（启动时扫描启用项目的定时触发器，对 Quartz 中缺失的调度任务按配置重建）
- **数据变更事件监听**：事件触发器由引擎事件总线驱动，监听模型 `INSERT`/`UPDATE`/`DELETE` 后分派关联作业，不走 Quartz 调度
- **执行日志**：支持分页查询，可按触发器、作业、状态、时间范围、是否成功过滤

:::note 仅定时触发器（`type = schedule`）注册到 Quartz 调度；事件触发器（`type = event`）由引擎事件总线直接触发，不参与 Quartz
调度。
:::

## 与流程编排联动

任务调度模块与流程编排模块深度集成：

1. 创建 Cron 或间隔触发器，将 `jobType` 设为 `FLOW`、`jobId` 指向流程模块
2. 触发器按计划启动对应的流程实例
3. 流程执行完成后，可在执行日志中查看结果

事件触发器同样可联动流程：当监听模型发生指定变更时，自动以变更数据作为流程变量启动流程实例。

## 暂停与恢复

触发器通过 `state` 字段（`true`/`false`）控制启停， **无需独立的 pause/resume 端点**：

- **暂停**：`PATCH /triggers/{id}`，请求体 `{ "state": false }`。定时触发器会从 Quartz 移除调度任务，不再触发；事件触发器不再响应数据变更
- **恢复**：`PATCH /triggers/{id}`，请求体 `{ "state": true }`。定时触发器会重新注册到 Quartz 并按计划执行

创建或全量更新（`PUT`）时也会根据 `state` 决定是否注册调度任务。

## API 端点

任务调度相关的 REST API 基础路径为 `/api/projects/{projectId}`：

### 触发器（`/triggers`）

| 端点                          | 说明                                                                            |
|-------------------------------|---------------------------------------------------------------------------------|
| `GET /triggers`               | 分页获取触发器列表，支持 `name`/`jobType`/`jobId`/`jobGroup`/`page`/`size` 过滤 |
| `GET /triggers/{id}`          | 获取单个触发器（含 `nextFireTime`/`previousFireTime` 等调度信息）               |
| `POST /triggers`              | 创建触发器                                                                      |
| `PUT /triggers/{id}`          | 全量更新触发器（会先移除旧调度任务再按新配置重建）                              |
| `PATCH /triggers/{id}`        | 部分更新触发器，主要用于切换 `state`（暂停/恢复）                               |
| `DELETE /triggers/{id}`       | 删除触发器并移除对应调度任务                                                    |
| `POST /triggers/{id}/execute` | 立即执行触发器（无视调度计划，手动触发一次）                                    |

### 作业执行日志（`/jobs/logs`）

| 端点             | 说明                                                                                                         |
|------------------|--------------------------------------------------------------------------------------------------------------|
| `GET /jobs/logs` | 分页获取作业执行日志，支持 `triggerId`/`jobId`/`status`/`startTime`/`endTime`/`isSuccess`/`page`/`size` 过滤 |

更多端点请参考 Swagger UI (`/api/q/swagger-ui`)。
