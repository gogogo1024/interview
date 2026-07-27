# Issue 3 — Error Handling & Observability 审计与实施记录

日期：2026-07-28

概述
- 本次变更目标：统一错误分类映射、引入请求级 trace-id、结构化日志，且不破坏现有响应契约。
- 已新增/修改关键文件：
  - 新增 `apps/api/src/observability/context.ts`（AsyncLocalStorage 传递 traceId）
  - 新增 `apps/api/src/observability/logger.ts`（结构化 JSON 日志）
  - 新增 `apps/api/src/observability/errors.ts`（`ApiError` 与 gRPC code 映射）
  - 新增 `apps/api/src/grpc/wrapHandler.ts`（统一包装所有 handler：注入 trace、日志、错误规范化）
  - 修改 `apps/api/src/grpc/server.ts`（注册服务时用包装器包裹 handlers）

1) Handler 错误处理审计（逐文件摘要）

- `admin.handler.ts`：读操作（list/get）多数不捕获异常（异常冒泡）；写/管理操作使用 `try/catch`，在 catch 中返回 `{ success: false, error }`。
- `auth.handler.ts`：`register`/`login` 使用 try/catch 并返回 error 字段；`getCurrentUser` 在异常时抛出；`validateSession` 捕获异常并返回 `valid:false`（兼容性处理）。
- `bookmarks.handler.ts`：切换接口使用 try/catch 返回 error；状态/列表接口在异常时吞掉错误并返回默认值（例如空数组或 false）。
- `comments.handler.ts`：create/delete 使用 try/catch 返回 error；getPostComments 不捕获异常（异常冒泡）。
- `feed.handler.ts`：`getHomeFeed`/`getExploreFeed` 不捕获异常（异常冒泡到上层）。
- `follows.handler.ts`：toggleFollow 使用 try/catch 返回 error；计数/状态接口在异常时返回默认值。
- `likes.handler.ts`：toggle 接口使用 try/catch 返回 error；状态查询在异常时返回默认值。
- `notifications.handler.ts`：读取接口在异常时返回空集合；写/修改/删除接口使用 try/catch 返回 error。
- `search.handler.ts`：searchPosts/searchUsers 不捕获异常（冒泡）。
- `posts.handler.ts`：create/update/delete 使用 try/catch 返回 error；getPost/getPosts/getUserPosts 不捕获异常。
- `users.handler.ts`：getUser 不捕获异常；updateProfile 使用 try/catch 返回 error。

2) 已实现的可观察性与错误规范

- 请求追踪：在 `wrapGrpcHandler` 中每个 RPC 生成 `traceId`，并通过 `AsyncLocalStorage`（`context.ts`）在异步链中传播；可通过 `getTraceId()` 在任意服务/库中读取。
- 结构化日志：`logger.ts` 输出 JSON，包括 `timestamp`、`level`、`event`、`traceId` 与附加 meta。
- 错误 taxonomy：`ApiError` 类及常用 helper（`badRequest`, `notFound`, `unauthorized` 等）映射到 gRPC status codes（`errors.ts`）。
- handler 包装器：`wrapGrpcHandler` 为每个方法记录 `grpc.request.start`/`grpc.request.end`/`grpc.request.error`，并在抛出异常时将 `traceId` 附加到错误消息；如果抛出的错误含 numeric `code`，会保留该 code，否则默认映射为 `INTERNAL`。

3) 与 TASK.md 要求的对照（当前状态）

- 审计每个 handler：已完成（本文件即审计结果）。
- 统一错误 taxonomy → gRPC code：基础设施已完成（`ApiError` + 映射），服务层/handler 层需要逐步采用 `ApiError` 以实现精确的 gRPC 状态（当前为部分完成）。
- 请求级追踪传播到服务层与日志：已完成（`AsyncLocalStorage` + `logger`）。
- traceId 返回给客户端：部分完成 — 目前包装器在 error 字段或抛出错误时会把 `traceId` 拼接到错误文本，便于客户端上报；如果希望“始终把 traceId 返回给客户端（成功/失败）”，推荐将 `traceId` 放到 gRPC response metadata（待实现，需在 transport 层写入 metadata）。
- 结构化请求日志：已实现基础日志；推荐在业务层添加更多业务上下文（userId/postId 等）。
- 不破坏现有响应契约：目前单元测试已通过（10 个文件 / 139 测试），变更未破坏现有契约。但若将部分接口从“返回 `{ success:false, error }`”改为直接抛出 gRPC error（非 200 返回），将改变客户端行为 —— 推荐逐步迁移并在 handler 层保留兼容转换。

4) 风险与兼容性建议（迁移策略）

- 风险：直接把服务层抛出的 `ApiError` 映射为 gRPC 错误会改变某些 RPC 的行为（部分客户端依赖 `200` + `error` 字段），需要逐接口评估并采用分阶段策略。
- 建议迁移步骤：
  1. 在服务内部开始抛 `ApiError(code, message)`（例如 `notFound('Post not found')`）。
  2. handler 使用 `try/catch`：对于语义上应返回 `{ success:false }` 的 RPC，catch 后把 `ApiError` 转为兼容的 `{ success:false, error: message }`，同时在 response metadata 写入 `traceId` + numeric `code`；对于语义上应直接失败的 RPC（查询类），让 `ApiError` 垂直冒泡由 `wrapGrpcHandler` 映射为 gRPC 错误。
  3. 逐步移除对文本 error 检查的客户端依赖并切换为检查 gRPC status + metadata（traceId）。

5) 优先级建议（下一步要做的事）

- 优先（短期，必须）：
  - 把本次审计写入仓库（已完成，本文件）。
  - 在 `wrapGrpcHandler` 中把 `traceId` 写入 gRPC response metadata（保证客户端总能拿到 traceId，而不是仅在 error 时拼接文本）。
- 推荐（中期）：
  - 在关键服务（posts/comments/likes/bookmarks）开始使用 `ApiError` 抛错，并在 handler 做兼容转换。添加对应单元测试覆盖改变后的行为。 
  - 在业务热点处添加更丰富的结构化日志（`logger.info('action', { userId, postId })`）。
- 远期（可选）：
  - 将日志输出接入集中式后端（例如 Loki/ELK 或云日志），并导出 traceId 到 APM。

6) 验证步骤（本地）

运行单元测试：

```bash
pnpm --filter @chirp/api test
```

启动服务并查看日志：

```bash
pnpm --filter @chirp/api start
# 然后观察 stdout 中的 JSON 日志，按 traceId 聚合
```

示例：在服务中抛出 `ApiError`：

```ts
import { notFound } from '../observability/errors';
// ...
if (!post) throw notFound('Post not found');
```

7) 我可以继续完成的任务（选项）

- A：实现将 `traceId` 写入 gRPC response metadata（优先级高，需我改 `wrapGrpcHandler`/server 注册逻辑并验证），或
- B：把几个核心 service（posts/comments/likes）转为抛 `ApiError` 并在 handler 做兼容处理（需增加/更新单元测试）。

如需我继续，我会按你选择的选项逐步实施并在每一步提交独立的 commit。

---

文件作者: 自动化审计脚本 + 开发者协作记录
