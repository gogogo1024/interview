# temporal-common

职责：Temporal 客户端封装、工作流基类、通用重试策略、幂等工具。

快速使用示例：

- 构建

```bash
cd packages/temporal-common
pnpm install
pnpm run build
```

- 在代码中使用（示例）

```ts
import { TemporalClient } from '@coreflow/temporal-common';

const client = new TemporalClient({ namespace: 'default' });
await client.connect();
// 调用 startWorkflow / 获取 handle 等
```

说明：当前实现提供轻量封装与内存式幂等存储，便于在工作流中复用。根据实际部署，请安装并配置 `@temporalio/client` / `@temporalio/worker`。
