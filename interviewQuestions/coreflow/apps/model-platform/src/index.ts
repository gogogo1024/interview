// Placeholder entry to satisfy TypeScript build
import { getConfig } from './config';

let serverModuleRef: any | undefined;

export async function start() {
  console.log('model-platform placeholder');
  // 在开发模式下可选启动 HTTP API，便于本地调试与契约测试
  if (getConfig().MODEL_PLATFORM_ENABLE_API === true) {
    try {
      const m = await import('./api/server.js');
      serverModuleRef = m;
      await m.startApiServer();
    } catch (err) {
      console.error('failed to start model-platform api', err);
    }
  }
}

export async function stop() {
  if (!serverModuleRef) return;
  try {
    await serverModuleRef.stopApiServer?.();
  } catch (err) {
    console.error('failed to stop model-platform api', err);
  } finally {
    serverModuleRef = undefined;
  }
}
