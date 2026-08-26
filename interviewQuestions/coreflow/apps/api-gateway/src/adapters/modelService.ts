/**
 * Adapter to forward model-platform requests to the model-platform app.
 */
import { getConfig } from '../config';

export async function forwardToModelService(path: string, payload?: any) {
  const base = getConfig().MODEL_PLATFORM_URL;
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

  // Mock responses for local development
  if (path === 'models/list' || path === '/models/list') {
    return {
      ok: true,
      body: [
        { id: 'mv_1', name: 'base-xl', type: 'base', base_model: 'gpt-base', status: 'production', created_at: new Date().toISOString() },
      ],
    };
  }
  if (path === 'models/get' || path === '/models/get') {
    return {
      ok: true,
      body: { id: 'mv_1', name: 'base-xl', type: 'base', base_model: 'gpt-base', status: 'production', created_at: new Date().toISOString() },
    };
  }

  return { ok: true, body: { path, payload } };
}

export default forwardToModelService;
