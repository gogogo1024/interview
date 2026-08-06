# Developer Setup

**Prerequisites:** Node 20+, pnpm 9.15.0+

## Setup
```bash
pnpm install
pnpm run setup:hooks           # Enable pre-commit hooks
pnpm run proto:generate
pnpm run db:generate db:migrate db:seed
```

## Development
```bash
pnpm run dev                   # All services
pnpm run dev:api dev:user dev:admin  # Individual
```

## Tasks
```bash
pnpm run lint lint:fix typecheck    # Validation
pnpm run test:unit test:e2e         # Testing
pnpm run build clean                # Build
```

## Pre-commit
`.githooks/pre-commit` auto-validates staged files.

## CI Pipeline
1. Validate (dependencies) → Lint → Typecheck → Unit Tests
2. Build (on success) → E2E Tests (optional)

## Test Account
alice@test.com / password123

See [README.md](README.md) for more.
