---
sidebar_position: 20
---

# 任务调度

Flexmodel 内置了分布式任务调度系统，支持多种触发器类型和作业执行方式，可以与流程编排模块联动实现定时触发流程。

## 关键概念

### 触发器（Trigger）
触发器定义了作业的触发规则，支持以下类型：

| 触发器类型 | 说明 |
|----------|------|
| Cron 触发器 | 基于 Cron 表达式的定时触发 |
| 延时触发器 | 延迟指定时间后触发 |
| 事件触发器 | 由数据变更事件触发的执行 |

### 作业（Job）
作业是触发器触发后执行的任务。目前支持以下作业类型：

| 作业类型 | 说明 |
|---------|------|
| ScheduledFlowExecutionJob | 触发后启动一个流程实例 |
| ScheduledFunctionExecutionJob | 触发后调用一个边缘函数 |

### 执行日志（JobExecutionLog）
每次作业执行都会记录日志，包含执行状态、耗时、错误信息等。

## 调度引擎

调度引擎基于 Quartz 框架实现，通过 Quarkus Scheduler 扩展集成：

- 支持持久化存储触发器和作业信息（FML 模型存储）
- 支持数据变更事件监听，自动触发关联作业
- 执行日志支持分页查询和过滤

## 与流程编排联动

任务调度模块与流程编排模块深度集成：

1. 创建 Cron 触发器，指定关联的流程定义
2. 触发器按计划启动对应的流程实例
3. 流程执行完成后，可在执行日志中查看结果

## API 端点

任务调度相关的 REST API 基础路径为 `/api/projects/{projectId}`：

| 端点 | 说明 |
|------|------|
| `GET /triggers` | 获取触发器列表 |
| `POST /triggers` | 创建触发器 |
| `PUT /triggers/{triggerId}` | 更新触发器 |
| `DELETE /triggers/{triggerId}` | 删除触发器 |
| `POST /triggers/{triggerId}/pause` | 暂停触发器 |
| `POST /triggers/{triggerId}/resume` | 恢复触发器 |
| `GET /jobs/execution-logs` | 获取作业执行日志 |

更多端点请参考 Swagger UI (`/q/swagger-ui`)。
