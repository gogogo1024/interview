# image-service

项目二：百万级图像生成与 GPU 调度服务。

开发与运行（ESM / TypeScript 直接运行）：

1. 安装依赖

```bash
cd apps/image-service
pnpm install
```

2. 开发模式（直接运行 TypeScript，使用 `ts-node/esm` loader）：

```bash
pnpm run dev:scheduler   # 启动调度器（开发模式）
pnpm run dev:worker      # 启动 worker（开发模式）
```

3. 构建与生产运行

```bash
pnpm run build
pnpm run start
```

说明：本包采用 ESM (`type: "module"`) 与 `ts-node/esm` 开发方式，构建后以 Node 运行编译输出（`node --enable-source-maps dist/scheduler/main.js`）。
