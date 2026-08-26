Development notes for video-call-service

## Independent process (recommended)

- Start signaling API (dev):

  pnpm --filter @coreflow/video-call-service run dev:signaling

- Graceful shutdown / restart

  - Press Ctrl+C to stop; the process hooks SIGINT and will call the internal `SignalingServer.stop()` to perform graceful shutdown (including stopping the HTTP API if enabled).
  - To programmatically restart in a custom script, call the exported `stopSignalingServer()` then `startSignalingServer()` (both are exported by the runtime module).

## Supervised single-process dev (local debugging only)

- Run from monorepo root:

  pnpm run dev:supervised -- --only=video-call-service

- This starts video-call-service signaling and SFU in a single Node process alongside other services (for quick local integration debugging).
- **Warning**: Not recommended for production, performance testing, or stability validation. Use independent process mode instead.
- See root README for CLI options (`--only`, `--skip`, `--force`).
