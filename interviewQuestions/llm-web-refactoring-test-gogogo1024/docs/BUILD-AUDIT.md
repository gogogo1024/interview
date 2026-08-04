# Build Config Audit

Date: 2026-08-04

Summary
-------
I audited `turbo.json` and the monorepo scripts to ensure CI validates PRs efficiently and that local developer checks are practical.

Findings
--------
- `lint` and `typecheck` depended on `^build` in `turbo.json`. This caused lint/typecheck to wait for builds of dependent packages and slowed feedback loops.

Actions taken
-------------
- Removed `dependsOn: ["^build"]` for `lint` and `typecheck` so they run independently and provide faster failure feedback.
- Added a GitHub Actions workflow `.github/workflows/ci.yml` that:
  - installs dependencies (`pnpm install -w`)
  - runs `turbo run lint/typecheck/test:unit/build` with `--since=origin/master` to limit work to affected packages
  - runs `pnpm run test:e2e` (full E2E) as the final step
- Added a lightweight pre-commit hook (`.githooks/pre-commit`) that runs `biome` checks on staged files and formats them.
- Added `pnpm run setup:hooks` to configure hooks and `pnpm run ci:local` to run the same validation locally.

Notes & Recommendations
-----------------------
- Consider enabling turbo remote caching for CI to speed up builds further.
- Consider integrating Playwright trace/artifact upload in CI when E2E fails.
- For full pre-commit integration across contributors, consider adopting `husky` + `lint-staged` in a future change.
