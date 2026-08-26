# 安装全仓库依赖
pnpm install

# 全量类型检查
pnpm typecheck

# 并行启动所有开发服务（多进程，推荐生产更贴近的调试）
pnpm dev

# 受监督单进程启动（仅开发/本地调试用）
# 在单个 Node 进程中按顺序启动多服务；SIGINT 会优雅关闭所有服务
pnpm run dev:supervised

# 受监督单进程启动的常见选项
# 仅启动特定服务
pnpm run dev:supervised -- --only=image-service,video-call-service

# 跳过某些服务
pnpm run dev:supervised -- --skip=model-platform

# 单独启动某个服务
pnpm --filter @coreflow/image-service dev:scheduler

# 重新生成 Prisma Client
pnpm db:generate

# 执行数据库迁移
pnpm db:migrate

# 构建所有包与应用
pnpm build

## 开发模式说明

### 多进程 vs 单进程

- **多进程（`pnpm dev`）**  
  - 每个服务独立进程，资源隔离，更贴近生产环境
  - 推荐用于集成测试、性能测试、稳定性验证
  - 见各服务 `README.dev.md` 的详细运行步骤

- **单进程（`pnpm run dev:supervised`）**  
  - 多服务在同一 Node 进程中运行，快速本地联调
  - **仅用于开发/本地调试**，不推荐生产或性能测试
  - 支持 `--only`/`--skip` 选择启动的服务
  - 自动检测端口冲突并回退到下一可用端口
  - NODE_ENV !== 'production' 时才允许运行（加 `--force` 可覆盖）
