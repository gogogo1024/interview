/**
 * Adapter to forward signaling calls to video-call-service.
 */
import { getConfig } from '../config';

export async function forwardToVideoService(path: string, payload?: any) {
  const base = getConfig().VIDEO_SERVICE_URL;
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

  // Mock behavior for local development
  if (path === 'createCall' || path === '/createCall') {
    return { ok: true, body: { call_id: `call_${Date.now()}`, status: 'calling' } };
  }
  if (path === 'hangup' || path === '/hangup') {
    return { ok: true, body: { success: true } };
  }
  if (path === 'subscribe' || path === '/subscribe') {
    return { ok: true, body: { status: 'connected', participants: [] } };
  }

  return { ok: true, body: { path, payload } };
}

export default forwardToVideoService;

