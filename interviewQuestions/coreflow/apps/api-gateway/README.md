# api-gateway

公共统一 tRPC 接入网关。

开发与运行（ESM）：

```bash
cd apps/api-gateway
pnpm install
pnpm run dev    # 开发模式（ts-node/esm）

# 构建与运行
pnpm run build
pnpm run start
```

说明：本包使用 `type: "module"`（ESM），开发时通过 `ts-node/esm` 直接运行 TypeScript，构建后以 Node 运行编译后的输出。
