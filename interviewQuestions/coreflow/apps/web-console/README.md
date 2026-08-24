# web-console

统一前端控制台（React + Next.js）。

开发与运行（Next.js，ESM）：

```bash
cd apps/web-console
pnpm install
pnpm run dev

# 构建与运行
pnpm run build
pnpm run start
```

说明与注意事项：
- 本项目使用 `type: "module"` 以保持与仓库其它包的 ESM 策略一致；Next.js 在某些版本对 ESM 的支持需要额外注意，例如 `next.config.js` 可能需要改名为 `next.config.mjs` 或使用 CJS 兼容写法。
- 如果遇到运行时问题，请先确保 `next`、`react`、`react-dom` 已安装并参考 Next 官方迁移指南。
