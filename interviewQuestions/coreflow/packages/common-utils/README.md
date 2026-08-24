# common-utils

职责：统一错误码、鉴权中间件、日志工具、环境变量校验。

模块概览：

- `errors`: 统一的 `AppError` / 常见错误工厂与 `wrapAsync` 辅助。
- `auth`: 提供 `createExpressAuthMiddleware(verify)`，可与自定义 `verify` 函数配合使用；同时包含动态加载 `jsonwebtoken` 的验证辅助。
- `logger`: 轻量结构化日志，开发环境可读，生产环境输出 JSON。
- `env`: 环境变量读取与简单 Schema 校验工具。

快速使用示例：

```ts
import { createLogger, getEnv, createExpressAuthMiddleware, BadRequest } from '@coreflow/common-utils';

const logger = createLogger('image-service');
const port = getEnv('PORT', { default: 3000, parse: 'number' });

// express 中间件示例
// app.use(createExpressAuthMiddleware(async (token) => verifyToken(token)));
```

构建：

```bash
cd packages/common-utils
pnpm install
pnpm run build
```
