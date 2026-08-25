// Placeholder entry to satisfy TypeScript build
export function start() {
  console.log('model-platform placeholder');
  // 在开发模式下可选启动 HTTP API，便于本地调试与契约测试
  if (process.env.MODEL_PLATFORM_ENABLE_API === 'true') {
    import('./api/server.js')
      .then((m) => m.startApiServer())
      .catch((err) => console.error('failed to start model-platform api', err));
  }
}
