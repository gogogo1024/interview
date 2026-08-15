# Developer Setup Guide

## Prerequisites
- **Node.js 20+** ([download](https://nodejs.org))
- **pnpm 9.15.0+** (install: `npm install -g pnpm`)
- **protoc 3.21.12+** (system dependency for code generation)
  - **macOS:** `brew install protobuf`
  - **Ubuntu/Debian:** `sudo apt-get install protobuf-compiler`

## Quick Start (First Time)

```bash
# 1. Install dependencies (includes all workspace packages)
pnpm install

# 2. Generate proto TypeScript code
pnpm run proto:generate

# 3. Generate database schema & run migrations
pnpm run db:generate
pnpm run db:migrate
pnpm run db:seed

# 4. Enable pre-commit hooks (optional but recommended)
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit

# 5. Start development servers
pnpm dev
```

## Development Commands

| Task | Command |
|------|---------|
| **Start all services** | `pnpm dev` |
| **Start individual services** | `pnpm dev:api`, `pnpm dev:user`, `pnpm dev:admin` |
| **Build all packages** | `pnpm build` |
| **Run linter** | `pnpm lint` |
| **Fix lint issues** | `pnpm lint:fix` |
| **TypeScript check** | `pnpm typecheck` |
| **Unit tests** | `pnpm test:unit` |
| **E2E tests** | `pnpm test:e2e` |
| **Clean build artifacts** | `pnpm clean` |

## Monorepo Structure

```
packages/
  proto/           → gRPC definitions, TypeScript generation
  grpc-client/     → gRPC client library (consumed by apps)
  db-schema/       → Database migrations, Drizzle ORM
  ui/              → Shared UI components
  shared-types/    → TypeScript type definitions

apps/
  api/             → Node.js backend (gRPC server)
  client-user/     → User-facing web app
  client-admin/    → Admin dashboard
```

## Important: pnpm Workspace

This is a **pnpm monorepo** with workspace protocol `workspace:*`. When you `pnpm install`:
- All packages installed under their `node_modules` (with hoisting)
- Internal packages symlinked via `workspace:*` protocol in `package.json`
- No separate per-package installs needed

## Troubleshooting

### Dependencies not resolving after clone?
```bash
# Full clean reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Proto types not found in IDE?
```bash
# Regenerate proto code
pnpm --filter @chirp/proto run build
```

### Pre-commit hook not running?
```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

### Database connection issues?
```bash
# Reset database and reseed
rm apps/api/dev.db
pnpm run db:migrate db:seed
```

## CI Pipeline Overview

The GitHub Actions workflow in `.github/workflows/ci.yml`:
1. **Validate** → Install dependencies, generate proto & DB code
2. **Check** → Lint & TypeScript type checking (fast feedback)
3. **Build** → Compile all packages (via turbo)
4. **Test** → Run unit tests, then E2E tests

See [CI_AUDIT.md](./docs/CI_AUDIT.md) for optimization details.

## Test Credentials
- Email: `alice@test.com`
- Password: `password123`

## Need Help?
- Check [README.md](./README.md) for project overview
- Review [CI_AUDIT.md](./docs/CI_AUDIT.md) for CI/build system details
- Check individual package README files for package-specific setup
