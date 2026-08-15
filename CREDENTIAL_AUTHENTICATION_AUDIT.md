# 凭证存储与身份验证实现审计报告

**生成日期**: 2026-08-15  
**代码库**: interviewQuestions/llm-web-refactoring-test-gogogo1024  
**审计范围**: 凭证存储、密码处理、会话管理、客户端-API信任建立

---

## 一、关键文件清单

### 1.1 身份验证核心服务
| 文件路径 | 功能 | 关键实现 |
|---------|------|---------|
| [apps/api/src/services/auth.service.ts](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/services/auth.service.ts) | 用户注册、登录、会话创建 | registerUser()、loginUser()、getCurrentUser() |
| [apps/api/src/services/utils.ts](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/services/utils.ts) | 密码哈希和验证 | hashPassword()、verifyPassword() |
| [apps/api/src/middleware/auth.ts](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/middleware/auth.ts) | JWT令牌创建和验证 | createSessionToken()、validateSessionToken() |

### 1.2 gRPC处理程序
| 文件路径 | 功能 | 职责 |
|---------|------|------|
| [apps/api/src/grpc/handlers/auth.handler.ts](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/grpc/handlers/auth.handler.ts) | 认证RPC端点 | register、login、logout、getCurrentUser |
| [apps/api/src/grpc/handlers/feed.handler.ts](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/grpc/handlers/feed.handler.ts#L2) | Feed服务认证检查 | validateSessionToken在行2被导入 |

### 1.3 客户端认证
| 文件路径 | 功能 | 类型 |
|---------|------|------|
| [apps/client-user/src/server/functions/auth.ts](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/client-user/src/server/functions/auth.ts) | 用户客户端认证流程 | registerUser、loginUser、logoutUser |
| [apps/client-admin/src/server/functions/auth.ts](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/client-admin/src/server/functions/auth.ts) | 管理员客户端认证流程 | loginAdmin、logoutAdmin |

### 1.4 数据库模式与迁移
| 文件路径 | 描述 |
|---------|------|
| [packages/db-schema/src/schema.ts](interviewQuestions/llm-web-refactoring-test-gogogo1024/packages/db-schema/src/schema.ts) | Drizzle ORM用户表定义 |
| [db/migrations/0000_thankful_polaris.sql](interviewQuestions/llm-web-refactoring-test-gogogo1024/db/migrations/0000_thankful_polaris.sql#L97) | SQL迁移，users表在第97行 |
| [packages/shared-types/src/session.ts](interviewQuestions/llm-web-refactoring-test-gogogo1024/packages/shared-types/src/session.ts) | 会话和JWT payload类型定义 |

### 1.5 安全文档
| 文件路径 | 内容 |
|---------|------|
| [docs/CREDENTIALS_FIX.md](interviewQuestions/llm-web-refactoring-test-gogogo1024/docs/CREDENTIALS_FIX.md) | 凭证安全漏洞和修复方案 |
| [CI_VALIDATION_REPORT.md](interviewQuestions/llm-web-refactoring-test-gogogo1024/CI_VALIDATION_REPORT.md#L155) | CI验证报告，第155行提及凭证存储漏洞 |

---

## 二、凭证存储实现方式

### 2.1 数据库表结构

**users表字段**（位置：[db/migrations/0000_thankful_polaris.sql#L97-L113](interviewQuestions/llm-web-refactoring-test-gogogo1024/db/migrations/0000_thankful_polaris.sql#L97-L113)）:

```sql
CREATE TABLE `users` (
  `id` text PRIMARY KEY NOT NULL,           -- 用户ID
  `email` text NOT NULL UNIQUE,             -- 邮箱（唯一）
  `username` text NOT NULL UNIQUE,          -- 用户名（唯一）
  `display_name` text NOT NULL,             -- 显示名称
  `avatar_url` text,                        -- 头像URL
  `bio` text,                               -- 个人简介
  `password_hash` text NOT NULL,            -- 密码哈希（关键字段）
  `role` text DEFAULT 'user' NOT NULL,      -- 角色(user/admin/moderator)
  `banned_at` integer,                      -- 封禁时间戳
  `banned_reason` text,                     -- 封禁原因
  `banned_by` text,                         -- 封禁管理员
  `created_at` integer DEFAULT unixepoch(), -- 创建时间
  `updated_at` integer DEFAULT unixepoch()  -- 更新时间
);
```

### 2.2 密码哈希实现

**策略**: 混合方案（新密码用bcrypt，旧密码用SHA-256）

**新密码存储** ([apps/api/src/services/utils.ts#L18-L22](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/services/utils.ts#L18-L22)):
```typescript
export async function hashPassword(password: string): Promise<string> {
  const bcryptHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return `${BCRYPT_PREFIX}${bcryptHash}`;  // 前缀"bcrypt$"标记算法
}
```
- **算法**: bcryptjs v2.4.3
- **成本因子**: 10轮（BCRYPT_ROUNDS）
- **盐**: 由bcrypt自动生成和管理（随机）
- **存储格式**: `bcrypt$<bcrypt哈希>`

**旧密码兼容** ([apps/api/src/services/utils.ts#L29-L37](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/services/utils.ts#L29-L37)):
```typescript
// Legacy SHA-256 verification
const hash = createHash("sha256");
hash.update(`${password}${LEGACY_SALT}`);  // LEGACY_SALT = "salt"
const computed = hash.digest("hex");
return computed === hashedPassword;
```
- **旧算法**: SHA-256
- **旧盐**: 固定值"salt"（**安全风险**）

### 2.3 增量迁移策略

**自动升级机制** ([apps/api/src/services/auth.service.ts#L84-87](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/services/auth.service.ts#L84-87)):
```typescript
// If user has a legacy SHA-256 hash, upgrade to bcrypt on successful login
if (!user.passwordHash.startsWith("bcrypt$")) {
  const newHash = await hashPassword(input.password);
  await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
}
```
- 用户使用正确密码成功登录时触发
- 自动重新哈希为bcrypt并更新数据库
- 无需用户交互，对用户透明

### 2.4 依赖项版本

[apps/api/package.json#L32-L33](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/package.json#L32-L33):
```json
"jsonwebtoken": "^9.0.2",
"bcryptjs": "^2.4.3"
```

---

## 三、登录和认证流程

### 3.1 用户注册流程

**客户端** → **API服务** → **数据库**

```
用户输入(邮箱/用户名/密码)
        ↓
[apps/client-user/src/server/functions/auth.ts#L9-28]
registerUser() → gRPC client.auth.register()
        ↓
[apps/api/src/grpc/handlers/auth.handler.ts#L7-27]
authHandler.register() → registerUser服务
        ↓
[apps/api/src/services/auth.service.ts#L21-60]
registerUser():
  1. 检查email是否存在 (eq(users.email, input.email))
  2. 检查username是否存在 (eq(users.username, input.username))
  3. 密码哈希: hashPassword(input.password) → bcrypt$...
  4. 生成用户ID: generateId()
  5. 插入users表: db.insert(users).values(...)
  6. 创建会话令牌: createSessionToken({userId, username, role})
        ↓
返回: {userId, sessionToken}
        ↓
[apps/client-user/src/server/functions/auth.ts#L27]
setSessionData({userId, username, sessionToken})
存储在cookie中
```

### 3.2 用户登录流程

```
用户输入(邮箱/密码)
        ↓
[apps/client-user/src/server/functions/auth.ts#L34-56]
loginUser() → gRPC client.auth.login()
        ↓
[apps/api/src/grpc/handlers/auth.handler.ts#L31-48]
authHandler.login() → loginUser服务
        ↓
[apps/api/src/services/auth.service.ts#L64-100]
loginUser():
  1. 查找用户: db.select().where(eq(users.email, input.email))
  2. 检查存在性: if (!user) throw unauthorized(...)
  3. 检查封禁状态: if (user.bannedAt) throw forbidden(...)
  4. 密码验证: verifyPassword(input.password, user.passwordHash)
     - 如果hash以"bcrypt$"开头 → 使用bcrypt.compare()
     - 否则 → 使用SHA-256验证（兼容旧密码）
  5. 密码升级: 如果是旧SHA-256哈希，重新哈希并更新
  6. 创建会话令牌: createSessionToken(...)
        ↓
返回: {userId, sessionToken}
        ↓
客户端验证会话: client.auth.validateSession({sessionToken})
        ↓
[apps/client-user/src/server/functions/auth.ts#L45-56]
setSessionData({userId, username, sessionToken})
```

### 3.3 会话验证流程

```
客户端在gRPC调用中包含sessionToken
        ↓
[各handler如feed.handler.ts#L2]
调用: validateSessionToken(request.sessionToken)
        ↓
[apps/api/src/middleware/auth.ts#L16-26]
validateSessionToken():
  1. 使用JWT_SECRET解码: jwt.verify(token, JWT_SECRET)
  2. 返回AuthContext: {userId, username, role}
  3. 验证失败 → throw unauthorized(...)
        ↓
授权检查:
  - requireAuth(token) → 要求认证
  - requireAdmin(context) → 要求admin/moderator角色
  - requireSuperAdmin(context) → 要求admin角色
```

---

## 四、客户端-API信任建立机制

### 4.1 会话令牌发行

**创建** ([apps/api/src/middleware/auth.ts#L29-43](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/middleware/auth.ts#L29-43)):
```typescript
export function createSessionToken(
  context: AuthContext,
  expiresInSeconds: number = 7 * 24 * 60 * 60,
): string {
  return jwt.sign(
    {
      userId: context.userId,
      username: context.username,
      role: context.role,
    },
    JWT_SECRET,
    { expiresIn: expiresInSeconds },
  );
}
```

- **发行者**: 仅由API服务端发行
- **有效期**: 7天（可配置）
- **载荷**: userId、username、role
- **签名密钥**: JWT_SECRET环境变量

### 4.2 JWT密钥管理

**定义** ([apps/api/src/middleware/auth.ts#L5](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/middleware/auth.ts#L5)):
```typescript
const JWT_SECRET = process.env.GRPC_JWT_SECRET || 
  "chirp-grpc-jwt-secret-key-at-least-32-chars";
```

- **环境变量**: GRPC_JWT_SECRET
- **默认值**: 硬编码字符串"chirp-grpc-jwt-secret-key-at-least-32-chars"
- **风险**: 默认值在代码中公开（**高危漏洞**）

### 4.3 会话存储

**用户端** ([apps/client-user/src/server/functions/auth.ts#L54-56](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/client-user/src/server/functions/auth.ts#L54-56)):
```typescript
await setSessionData({
  userId: response.userId,
  username: validateResponse.username,
  sessionToken: response.sessionToken,
});
```

**管理员端** ([apps/client-admin/src/server/functions/auth.ts#L44-50](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/client-admin/src/server/functions/auth.ts#L44-50)):
```typescript
await setAdminSessionData({
  userId: loginResponse.userId,
  username: validateResponse.username,
  role: role as "admin" | "moderator",
  sessionToken: loginResponse.sessionToken,
});
```

- **存储位置**: Cookie（由tanstack/react-start管理）
- **会话类型**: SessionData / AdminSessionData
- **包含内容**: userId、username、sessionToken、role（管理员）

### 4.4 会话恢复

**获取令牌** ([packages/shared-types/src/session.ts#L11-17](interviewQuestions/llm-web-refactoring-test-gogogo1024/packages/shared-types/src/session.ts#L11-17)):
```typescript
export interface GrpcSessionPayload {
  userId: string;
  username: string;
  role: "user" | "admin" | "moderator";
  iat: number;  // issued at
  exp: number;  // expiration
}
```

- 后续API调用通过gRPC client自动携带stored sessionToken
- client从cookie读取sessionToken并附加到每个请求

---

## 五、关键代码审查

### 5.1 密码验证函数

[apps/api/src/services/utils.ts#L26-37](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/services/utils.ts#L26-37):
```typescript
export async function verifyPassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  if (hashedPassword.startsWith(BCRYPT_PREFIX)) {
    const bcryptHash = hashedPassword.slice(BCRYPT_PREFIX.length);
    return bcrypt.compare(password, bcryptHash);
  }

  // Legacy SHA-256 verification
  const hash = createHash("sha256");
  hash.update(`${password}${LEGACY_SALT}`);
  const computed = hash.digest("hex");
  return computed === hashedPassword;
}
```

**优点**:
- ✅ 支持bcrypt安全哈希
- ✅ 向后兼容旧SHA-256
- ✅ 通过前缀检测算法类型

**缺点**:
- ⚠️ 旧算法使用固定盐"salt"（易破解）

### 5.2 登录时的密码升级

[apps/api/src/services/auth.service.ts#L78-87](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/services/auth.service.ts#L78-87):
```typescript
// Verify password
const valid = await verifyPassword(input.password, user.passwordHash);
if (!valid) {
  throw unauthorized("Invalid email or password");
}

// If user has a legacy SHA-256 hash, upgrade to bcrypt on successful login
if (!user.passwordHash.startsWith("bcrypt$")) {
  const newHash = await hashPassword(input.password);
  await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
}
```

**设计特点**:
- ✅ 增量迁移，无需强制重置
- ✅ 成功验证后才升级
- ✅ 对用户完全透明

---

## 六、潜在的安全漏洞

### 6.1 【高危】硬编码的JWT Secret

**位置**: [apps/api/src/middleware/auth.ts#L5](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/middleware/auth.ts#L5)

```typescript
const JWT_SECRET = process.env.GRPC_JWT_SECRET || 
  "chirp-grpc-jwt-secret-key-at-least-32-chars";
```

**风险**:
- Secret在源代码中公开
- 攻击者可以构造任意有效的JWT令牌
- 可以伪造任何用户的会话
- 在Docker/配置管理中可能被泄露

**严重性**: 🔴 **CRITICAL** - 可绕过整个认证系统

**修复建议**:
1. 移除默认值，强制从环境变量读取
2. 在CI/CD中设置强随机secret
3. 使用密钥管理服务（Vault、Azure KeyVault）
4. 定期轮换secret

### 6.2 【中危】旧SHA-256密码哈希

**位置**: [apps/api/src/services/utils.ts#L31-37](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/services/utils.ts#L31-37)

```typescript
// Legacy SHA-256 verification
const hash = createHash("sha256");
hash.update(`${password}${LEGACY_SALT}`);  // LEGACY_SALT = "salt"
```

**风险**:
- SHA-256不是设计用于密码存储的
- 固定盐"salt"对所有旧密码相同
- 容易受彩虹表攻击
- 高性能导致暴力破解快速

**示例破解时间**:
- 使用GPU，简单密码可在分钟内破解
- 固定盐使得预计算攻击可行

**严重性**: 🟠 **HIGH** - 已有旧用户受影响

**缓解状态**:
- ✅ 有增量迁移：旧用户登录时自动升级到bcrypt
- ⚠️ 但迁移需要用户主动登录

### 6.3 【中危】会话令牌过期时间过长

**位置**: [apps/api/src/middleware/auth.ts#L34](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/middleware/auth.ts#L34)

```typescript
expiresInSeconds: number = 7 * 24 * 60 * 60,  // 7天
```

**风险**:
- 7天有效期较长
- 如果令牌泄露，攻击窗口大
- 不符合OAuth 2.0最佳实践（通常1小时）

**修复建议**:
1. 缩短有效期至1小时
2. 实现刷新令牌机制
3. 添加令牌撤销列表

### 6.4 【低危】登录错误消息未区分

**位置**: [apps/api/src/services/auth.service.ts#L79](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/services/auth.service.ts#L79)

```typescript
throw unauthorized("Invalid email or password");
```

**风险**:
- 相同的错误消息对email不存在和密码错误
- 可能允许用户枚举（低优先级）

**好处**:
- ✅ 防止账户枚举攻击

---

## 七、信任建立问题

### 7.1 客户端-服务端信任

**当前实现**:
- ✅ 服务端独占签发权：令牌仅由API服务创建
- ✅ 防止客户端伪造：使用JWT_SECRET验证
- ⚠️ 但使用硬编码默认secret削弱了保护

**验证流程**:
```
客户端 → 包含sessionToken的gRPC请求
  ↓
API处理程序 → validateSessionToken(token)
  ↓
jwt.verify(token, JWT_SECRET) → 验证签名
  ↓
返回AuthContext或抛出异常
```

### 7.2 管理员权限检查

**权限层级** ([apps/api/src/middleware/auth.ts#L60-77](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/middleware/auth.ts#L60-77)):
```typescript
export function requireAdmin(context: AuthContext): void {
  if (context.role !== "admin" && context.role !== "moderator") {
    throw forbidden("Admin access required");
  }
}

export function requireSuperAdmin(context: AuthContext): void {
  if (context.role !== "admin") {
    throw forbidden("Super admin access required");
  }
}
```

**角色检查**:
- 用户角色存储在users表.role字段
- JWT payload中包含role
- 每个受保护的操作检查权限

### 7.3 管理员登录验证

[apps/client-admin/src/server/functions/auth.ts#L31-40](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/client-admin/src/server/functions/auth.ts#L31-40):
```typescript
// Check if user has admin or moderator role
const role = validateResponse.role;
if (role !== "admin" && role !== "moderator") {
  // Logout the session since they don't have admin access
  await client.auth.logout({ sessionToken: loginResponse.sessionToken });
  throw new Error("Access denied. Admin or moderator role required.");
}
```

**特点**:
- ✅ 管理员客户端在登录时验证角色
- ✅ 非授权用户自动登出
- ✅ 防止权限提升

---

## 八、安全测试覆盖

### 8.1 现有单元测试

[apps/api/src/services/auth.service.test.ts](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/services/auth.service.test.ts):

**覆盖的场景**:
- ✅ 成功注册
- ✅ 重复email拒绝
- ✅ 重复username拒绝
- ✅ 成功登录
- ✅ 错误凭证拒绝
- ✅ 旧SHA-256密码升级到bcrypt
- ✅ 被封禁账户拒绝

**示例**:
```typescript
it("migrates legacy SHA-256 password to bcrypt on login", async () => {
  const legacyHash = createHash("sha256")
    .update(`${password}salt`)
    .digest("hex");
  // ... 创建旧用户
  const result = await loginUser({ email, password });
  // ... 验证hash已升级为bcrypt$
  expect(updated?.passwordHash.startsWith("bcrypt$")).toBe(true);
});
```

### 8.2 gRPC处理程序测试

[apps/api/src/grpc/handlers/__tests__/auth.handler.test.ts](interviewQuestions/llm-web-refactoring-test-gogogo1024/apps/api/src/grpc/handlers/__tests__/auth.handler.test.ts):

**覆盖的场景**:
- ✅ 成功注册返回token
- ✅ 注册失败处理
- ✅ 成功登录返回token
- ✅ 登录失败处理
- ✅ getCurrentUser权限检查

### 8.3 缺失的测试

⚠️ **建议添加**:
1. JWT令牌过期测试
2. JWT签名验证测试
3. 令牌篡改检测
4. 会话撤销/注销测试
5. 并发登录测试
6. 密码强度验证

---

## 九、部署和配置建议

### 9.1 环境变量配置

**必需** ⚠️ (当前缺失):
```bash
# 强随机的JWT secret (最少32字符)
export GRPC_JWT_SECRET="$(openssl rand -hex 32)"

# 数据库密钥
export DATABASE_URL="..."

# 会话密钥
export SESSION_SECRET="$(openssl rand -hex 32)"
```

### 9.2 Docker/K8s配置

```yaml
spec:
  containers:
  - env:
    - name: GRPC_JWT_SECRET
      valueFrom:
        secretKeyRef:
          name: api-secrets
          key: jwt-secret
```

### 9.3 密钥轮换策略

**建议频率**: 每3个月  
**方法**: 保持旧密钥30天以验证现有令牌

---

## 十、合规性检查清单

- [ ] **环境变量强制**: 移除JWT_SECRET默认值
- [ ] **密钥管理**: 使用Vault或Azure KeyVault
- [ ] **TLS/HTTPS**: 确保所有通信加密
- [ ] **日志审计**: 记录认证事件（成功/失败）
- [ ] **速率限制**: 防止暴力破解（登录尝试限制）
- [ ] **CORS配置**: 限制允许的来源
- [ ] **CSP头**: 防止XSS令牌盗取
- [ ] **HttpOnly Cookies**: 会话cookie需设置httpOnly标志
- [ ] **Secure标志**: 仅通过HTTPS传输

---

## 十一、修复优先级

### 🔴 立即修复 (Critical)
1. **移除JWT_SECRET硬编码默认值** - 强制环境变量
2. **在CI中注入强随机密钥** - 防止测试泄露

### 🟠 高优先级 (High)
1. **缩短会话过期时间** - 7天→1小时
2. **实现刷新令牌** - 长期会话管理
3. **添加密码强度验证** - 客户端+服务端
4. **启用HTTPS/TLS** - 运输层安全

### 🟡 中优先级 (Medium)
1. **添加登录速率限制** - 防止暴力破解
2. **实现令牌黑名单/撤销** - 注销功能
3. **增加密钥轮换** - 定期更新secret
4. **审计日志记录** - 认证事件跟踪

---

## 十二、总结

### ✅ 优势
- bcrypt用于新密码（安全）
- 增量迁移策略（用户友好）
- 角色基访问控制（RBAC）
- 服务端令牌签发（防止伪造）
- 良好的单元测试覆盖

### ⚠️ 风险
- 硬编码JWT密钥（**高危**）
- 旧SHA-256哈希（已缓解但需继续迁移）
- 长会话过期（7天）
- 缺少密钥轮换机制

### 📋 建议行动
1. 立即配置环境变量，移除硬编码secret
2. 部署密钥管理服务
3. 缩短会话过期时间并实现刷新机制
4. 添加审计日志和监控

---

**报告完成日期**: 2026-08-15  
**下一步审核**: 修复关键漏洞后（建议2周内）
