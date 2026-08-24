# 安装全仓库依赖
pnpm install

# 全量类型检查
pnpm typecheck

# 并行启动所有开发服务
pnpm dev

# 单独启动某个服务
pnpm --filter @coreflow/image-service dev:scheduler

# 重新生成 Prisma Client
pnpm db:generate

# 执行数据库迁移
pnpm db:migrate

# 构建所有包与应用
pnpm build
