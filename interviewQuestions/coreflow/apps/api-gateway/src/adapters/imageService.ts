/**
 * 简单 adapter：将请求转发到 image-service（若设置了 IMAGE_SERVICE_URL），
 * 否则返回一个模拟响应，便于本地开发与单元测试。
 */
import { getConfig } from '../config';

export async function forwardToImageService(path: string, payload?: any) {
  const base = getConfig().IMAGE_SERVICE_URL;
  if (base) {
    try {
      const url = `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload ?? {}),
      });
      const body = await res.json().catch(() => null);
      return { ok: res.ok, status: res.status, body };
    } catch (err) {
      return { ok: false, error: (err as any)?.message || String(err) };
    }
  }

  // 模拟响应（本地开发/测试时使用）
  if (path === 'generate' || path === '/generate') {
    return {
      ok: true,
      body: { task_id: `task_${Date.now()}`, status: 'queued' },
    };
  }

  return { ok: true, body: { path, payload } };
}

export default forwardToImageService;
