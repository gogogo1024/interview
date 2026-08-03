问题：凭证存储与信任建立漏洞

发现：
- 密码哈希使用不安全的 SHA-256 且固定 salt（`password + "salt"`），易被暴力/彩虹表破解。
- 客户端代码在本地使用相同的 JWT secret 签发 gRPC session token（客户端/管理员端存在本地签名函数），并且仓库包含硬编码的默认 secret，导致令牌签名易被伪造或滥用。

风险：
- 任意账号密码泄露后可被快速暴力破解，影响所有用户。
- 固定/公开的 JWT secret 或客户端自签名允许攻击者构造有效会话令牌绕过认证，属高危漏洞。

修复概要：
1) 密码哈希：
   - 引入 `bcryptjs`，使用 bcrypt 对新注册/重置的密码进行哈希（带随机 salt，成本因子可配置）。
   - 保持向后兼容：保留对旧 SHA-256 哈希的校验（用于现有种子/老用户），在用户使用正确明文登录成功后即时将密码升级为 bcrypt 并写回数据库（增量迁移，无需用户交互）。
   - 在代码中实现：`apps/api/src/services/utils.ts`（`hashPassword` 与 `verifyPassword`）和 `apps/api/src/services/auth.service.ts`（`loginUser` 成功登录后升级哈希）。

2) 会话信任（token 签发）：
   - 禁止客户端/管理端本地签发 gRPC session token（移除或不用客户端本地 `jwt.sign`），改为优先使用 API 服务端颁发的 `sessionToken`（由注册/登录 RPC 返回），并将该 token 保存在服务器端会话（cookie）中以供后续 gRPC 调用复用。
   - 在客户端服务端改动：`apps/client-user` 与 `apps/client-admin` 的会话数据结构增加 `sessionToken` 字段；登录/注册流程保存 API 返回的 token；gRPC 辅助函数 `getGrpcSessionToken` / `getAdminGrpcSessionToken` 优先返回会话中存储的 server-issued token，而不再本地签名。

3) 测试：
   - 添加了单元测试：验证旧 SHA-256 哈希的用户能够登录且其密码哈希会在登录后被升级为 bcrypt（见 `apps/api/src/services/auth.service.test.ts` 新增用例）。

注意事项与下一步建议：
- 强烈建议在部署环境中设置强随机的 `GRPC_JWT_SECRET`、`SESSION_SECRET` 环境变量，并移除或避免使用代码内的默认值。
- 进一步建议采用长期密钥管理方案（如 Vault / Azure Key Vault）并考虑使用短期动态凭证或 OAuth 流程以提升安全性。

变更文件（概要）：
- apps/api/src/services/utils.ts        （bcrypt + 兼容校验）
- apps/api/src/services/auth.service.ts （登录时迁移哈希）
- apps/api/package.json                 （新增 bcryptjs 依赖）
- apps/client-user/src/lib/session.server.ts （会话扩展，保存 sessionToken）
- apps/client-user/src/lib/grpc.server.ts    （改为使用服务端颁发 token）
- apps/client-user/src/server/functions/auth.ts （保存 sessionToken 在会话）
- apps/client-admin/src/lib/session.server.ts （会话扩展，保存 sessionToken）
- apps/client-admin/src/lib/grpc.server.ts    （改为使用服务端颁发 token）
- apps/client-admin/src/server/functions/auth.ts （保存 sessionToken 在会话）
- apps/api/src/services/auth.service.test.ts （新增迁移测试）

如果你希望，我可以：
- 运行测试套件并修复可能的类型/运行错误；
- 将默认 secret 的使用改为“必须由环境提供”并在本地测试中设置适当的值；
- 为密钥管理/CI 注入提供一个简单的示例配置。