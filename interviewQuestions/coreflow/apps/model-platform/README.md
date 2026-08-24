# model-platform

项目三：LoRA / 自研模型的生产化平台。

开发与运行（ESM）：

```bash
cd apps/model-platform
pnpm install
pnpm run dev

# 构建与运行
pnpm run build
pnpm run start
```

说明：本包使用 `type: "module"`（ESM），开发时通过 `ts-node/esm` 直接运行 TypeScript。
