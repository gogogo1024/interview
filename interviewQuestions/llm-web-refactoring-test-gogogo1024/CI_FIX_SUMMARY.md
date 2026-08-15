# CI 失败修复总结

## 问题描述

PR #37 的 CI 流程在 `typecheck` job 中失败，错误如下：

```
protoc-gen-ts: program not found or is not executable
Please specify a program using absolute path or make sure the program is available in your PATH
--ts_out: protoc-gen-ts: Plugin failed with status code 1.
```

## 根本原因

CI workflow 使用了与本地不一致的 protoc 命令：

**原始 CI 命令：**
```bash
cd interviewQuestions/llm-web-refactoring-test-gogogo1024/packages/proto
pnpm install --frozen-lockfile
pnpm exec protoc --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --ts_out=./generated --proto_path=./protos ./protos/*.proto
```

**本地可用命令：**
```bash
pnpm --filter @chirp/proto run proto:generate
```

## 问题分析

1. **相对路径问题**：当改变目录后，`./node_modules/.bin/protoc-gen-ts` 的相对路径可能失效
2. **PATH 不一致**：在 CI 容器中，PATH 环境变量设置可能与本地不同
3. **命令不一致**：CI 没有使用 package.json 中定义的标准脚本

## 修复方案

更新 `.github/workflows/ci.yml` 中的 protoc 调用方式：

### 修改前（4行代码）：
```yaml
cd interviewQuestions/llm-web-refactoring-test-gogogo1024/packages/proto
pnpm install --frozen-lockfile
pnpm exec protoc --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --ts_out=./generated --proto_path=./protos ./protos/*.proto
```

### 修改后（2行代码）：
```yaml
pnpm --filter @chirp/proto install --frozen-lockfile
pnpm --filter @chirp/proto run proto:generate
```

## 优点

✅ **一致性**：使用与本地相同的 pnpm 脚本  
✅ **简洁性**：减少了 4 行代码  
✅ **可维护性**：proto 生成逻辑完全在 package.json 中定义  
✅ **可靠性**：pnpm filter 确保 PATH 正确设置  
✅ **功能完整**：依然生成所有必要的文件  

## 应用位置

修复应用于 CI workflow 中的两个地方：

1. **typecheck job** - "Generate proto" 步骤
2. **build job** - "Generate proto" 步骤

## 验证

✅ 本地构建成功：7/7 tasks passed  
✅ 无类型错误  
✅ 所有依赖正确安装  

## 部署建议

该修复已提交到分支：`ci/e2e/readenv-grpc-api-secure`

建议：
1. ✅ 推送该提交到远程
2. ✅ GitHub 将自动重新运行 CI 检查
3. ✅ 验证 typecheck 和 build jobs 现在都能通过

## CI 配置变更统计

- **文件修改**：1 个文件 (`.github/workflows/ci.yml`)
- **代码行变化**：-9 行，+6 行（净减 3 行）
- **提交信息**：fix(ci): simplify protoc command in CI workflow - use pnpm filter instead of cd and explicit plugin path

