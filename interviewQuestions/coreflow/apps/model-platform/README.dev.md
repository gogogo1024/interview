Development notes for model-platform

## Independent process (recommended)

- Start (dev):

  pnpm --filter @coreflow/model-platform run dev

  (The dev script runs `src/main.ts` which calls `start()` and installs a SIGINT handler.)

- Graceful shutdown / restart

  - Press Ctrl+C to stop; the process will call the exported `stop()` helper which attempts to call the API module's `stopApiServer()` if it was started.
  - To programmatically restart, import `start()` / `stop()` from `src/index.js` and call them in your custom dev harness.

## Supervised single-process dev (local debugging only)

- Run from monorepo root:

  pnpm run dev:supervised -- --only=model-platform

- This starts model-platform in a single Node process alongside other services (for quick local integration debugging).
- **Warning**: Not recommended for production, performance testing, or stability validation. Use independent process mode instead.
- See root README for CLI options (`--only`, `--skip`, `--force`).
