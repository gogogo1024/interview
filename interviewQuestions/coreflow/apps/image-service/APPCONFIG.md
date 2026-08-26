# AWS AppConfig 可调参数指南

本文档说明如何通过 AWS AppConfig 管理 GPU Worker 和 Scheduler 的核心可调参数，实现零停机更新。

## 概述

GPU Worker 和 Scheduler 支持以下参数通过 AWS AppConfig 进行热更新（无需重启服务）：

### 调度参数（Scheduler）
- `scheduler.pollMs` - 节点心跳轮询间隔（毫秒）
  - 默认值：1000ms
  - 范围：100-60000ms
  - 影响：节点发现和心跳保活频率

### 推理参数（GPU Worker）
- `inference.maxBatchSize` - 单个批次的最大项目数
  - 默认值：4
  - 范围：1-256
  - 影响：批处理吞吐量和延迟权衡

- `inference.maxBatchWaitMs` - 等待批次满或超时的最大时间（毫秒）
  - 默认值：50ms
  - 范围：10-5000ms
  - 影响：最坏情况延迟 SLA

- `inference.defaultTimeoutMs` - 单个推理请求的默认超时（毫秒）
  - 默认值：30000ms (30秒)
  - 范围：1000-300000ms
  - 影响：推理请求的最大执行时间

## 在 AWS AppConfig 中创建配置

### 前置条件
- AWS AppConfig 应用已创建
- 环境变量配置：
  - `ENABLE_REMOTE_CONFIG=true` - 启用远程配置
  - `REMOTE_CONFIG_POLL_MS=5000` - 轮询间隔（毫秒）
  - `AWS_APP_CONFIG_APPLICATION` - AppConfig 应用名称
  - `AWS_APP_CONFIG_ENVIRONMENT` - AppConfig 环境名称
  - `AWS_APP_CONFIG_PROFILE` - AppConfig 配置文件名称

### 配置文件格式

在 AWS AppConfig 中创建以下 JSON 格式的配置文件：

```json
{
  "scheduler": {
    "pollMs": 1000
  },
  "inference": {
    "maxBatchSize": 4,
    "maxBatchWaitMs": 50,
    "defaultTimeoutMs": 30000
  }
}
```

### 参数验证规则

- `scheduler.pollMs`：必须在 100-60000 范围内
- `inference.maxBatchSize`：必须在 1-256 范围内
- `inference.maxBatchWaitMs`：必须在 10-5000 范围内
- `inference.defaultTimeoutMs`：必须在 1000-300000 范围内

所有参数都是可选的；省略的参数将使用默认值。

## 热更新工作流

### 启用热更新

```bash
# 启动服务时启用远程配置轮询
ENABLE_REMOTE_CONFIG=true \
REMOTE_CONFIG_POLL_MS=5000 \
pnpm dev-supervised --only @coreflow/image-service
```

### 监控热更新

启动后，检查日志中的这些信息：

1. **初始加载**（启动时）：
   ```
   AppConfig tunable parameters applied: { 
     tunableParams: { 
       scheduler: { pollMs: 1000 }, 
       inference: { maxBatchSize: 4, maxBatchWaitMs: 50, ... }
     } 
   }
   ```

2. **热更新应用**（参数变化时）：
   ```
   Remote config updated: { 
     updatedFields: [...],
     tunableParams: { scheduler: { pollMs: 500 }, ... }
   }
   ```

3. **热更新触发**（Worker/Scheduler 响应时）：
   ```
   Worker hot-reload applied: { changes: ["maxBatchSize=8", "maxWaitMs=100"] }
   Scheduler hot-reload applied: { changes: ["pollMs=500"] }
   ```

## 性能调优指南

### 高吞吐量场景
- 增大 `maxBatchSize` (8-16)
- 增加 `maxBatchWaitMs` (100-200ms)
- 保持 `pollMs` 较小 (500-1000ms)

### 低延迟场景
- 减小 `maxBatchSize` (1-2)
- 减小 `maxBatchWaitMs` (10-30ms)
- 可增加 `pollMs` (1000-2000ms)

### 高可用性场景
- 减小 `pollMs` (500ms) 提高故障检测速度
- 增加 `defaultTimeoutMs` (45000-60000ms) 应对网络不稳定

## 限制和注意事项

### 仅支持热更新的参数

✅ 支持热更新（无需重启）：
- scheduler.pollMs
- inference.maxBatchSize
- inference.maxBatchWaitMs
- inference.defaultTimeoutMs

❌ 不支持热更新（需要重启）：
- Redis 连接参数
- Temporal 连接参数
- 服务端口
- Worker ID

这样的设计避免了级联效应，保持运维复杂度低。

### 实施建议

1. **小步推进** - 每次改动单个参数的 5-10%
2. **监控指标** - 更新后监控吞吐量、延迟、错误率
3. **回滚准备** - 记录之前的参数值，以便快速回滚
4. **定时评估** - 根据实际负载每周评估一次参数

## 故障排查

### 问题：AppConfig 参数不生效

检查以下几点：

```bash
# 1. 检查环境变量是否正确设置
echo $ENABLE_REMOTE_CONFIG
echo $REMOTE_CONFIG_POLL_MS
echo $AWS_APP_CONFIG_APPLICATION

# 2. 检查日志中是否有加载失败的信息
grep -i "appconfig\|remote config" logs/*

# 3. 验证 AWS 凭证和权限
aws appconfig get-configuration \
  --application <app-name> \
  --environment <env-name> \
  --configuration <config-profile>
```

### 问题：热更新后参数没有立即生效

- 轮询延迟：参数变化到被检测到需要 `REMOTE_CONFIG_POLL_MS` 毫秒
- 热更新延迟：Scheduler 的轮询循环需要在下一个间隔生效
- 正常：总延迟 = 轮询间隔 + 处理延迟，通常 < 2 倍的 REMOTE_CONFIG_POLL_MS

## 参考

- [AWS AppConfig 文档](https://docs.aws.amazon.com/appconfig/latest/userguide/)
- [配置 Schema](./appconfig-schema.json)
- [配置示例](./appconfig-example.json)
