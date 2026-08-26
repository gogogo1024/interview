Development notes for image-service

## Independent process (recommended)

- Start worker (dev):

  pnpm --filter @coreflow/image-service run dev:worker

- Graceful shutdown / restart

  - Press Ctrl+C to stop; the worker entrypoint installs SIGINT handlers and will call `stopApiServer()` (if the in-process HTTP API was enabled) and stop the GPU worker gracefully.
  - To programmatically restart the in-process API, import `stopApiServer()` / `startApiServer()` from `src/api/server.js` and call them as needed.

## Supervised single-process dev (local debugging only)

- Run from monorepo root:

  pnpm run dev:supervised -- --only=image-service

- This starts image-service in a single Node process alongside other services (for quick local integration debugging).
- **Warning**: Not recommended for production, performance testing, or stability validation. Use independent process mode instead.
- See root README for CLI options (`--only`, `--skip`, `--force`).
