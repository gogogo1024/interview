import { createServer } from 'http';
import { parse as parseUrl } from 'url';
import { createLogger } from '@coreflow/common-utils';
import { getConfig } from '../config';
import {
  ModelListInputSchema,
  ModelGetInputSchema,
  ModelVersionSchema,
} from '@coreflow/trpc-types';
import { z } from 'zod';

const logger = createLogger('model-platform:api');

// 简单内存模型列表，便于本地开发与契约测试
const models = [
  {
    id: 'mv_1',
    name: 'base-xl',
    type: 'base',
    base_model: 'gpt-base',
    status: 'production',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mv_2',
    name: 'lora-xyz',
    type: 'lora',
    base_model: 'base-xl',
    status: 'testing',
    created_at: new Date().toISOString(),
  },
] as const;

function jsonResponse(res: any, status: number, body: any) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function readJson(req: any) {
  return new Promise<any>((resolve, reject) => {
    let s = '';
    req.on('data', (chunk: any) => (s += chunk));
    req.on('end', () => {
      if (!s) return resolve({});
      try {
        resolve(JSON.parse(s));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Use a Symbol.for key to avoid global name conflicts for the model-platform API server.
const MODEL_PLATFORM_API_KEY = Symbol.for('coreflow.model-platform.api') as symbol;

type ModelPlatformState = {
  started?: boolean;
  server?: import('http').Server;
};

export function startApiServer(port = Number(getConfig().MODEL_PLATFORM_PORT || 4100)) {
  const g = globalThis as unknown as Record<symbol, ModelPlatformState | undefined>;
  const state = g[MODEL_PLATFORM_API_KEY];
  if (state?.started) return;
  g[MODEL_PLATFORM_API_KEY] = { ...(state || {}), started: true };

  const server = createServer(async (req, res) => {
    try {
      const parsed = parseUrl(req.url || '', true);
      const pathname = parsed.pathname || '/';

      if (req.method === 'POST' && pathname === '/models/list') {
        const body = await readJson(req).catch(() => ({}));
        const inRes = ModelListInputSchema.safeParse(body);
        if (!inRes.success) return jsonResponse(res, 400, { error: 'validation failed', issues: inRes.error.format() });

        // 过滤示例模型
        const list = models.filter((m) => {
          if (inRes.data.type && m.type !== inRes.data.type) return false;
          if (inRes.data.status && (m as any).status !== inRes.data.status) return false;
          return true;
        });

        const out = z.array(ModelVersionSchema).parse(list as any);
        return jsonResponse(res, 200, out);
      }

      if ((req.method === 'GET' && pathname === '/models/get') || (req.method === 'POST' && pathname === '/models/get')) {
        const inputBody = req.method === 'POST' ? await readJson(req).catch(() => ({})) : parsed.query;
        const inRes = ModelGetInputSchema.safeParse(inputBody);
        if (!inRes.success) return jsonResponse(res, 400, { error: 'validation failed', issues: inRes.error.format() });

        const found = models.find((m) => m.id === inRes.data.model_id);
        if (!found) return jsonResponse(res, 404, { error: 'model not found' });

        const out = ModelVersionSchema.parse(found as any);
        return jsonResponse(res, 200, out);
      }

      jsonResponse(res, 404, { error: 'not found' });
    } catch (err) {
      logger.error('server error', err as any);
      jsonResponse(res, 500, { error: 'internal error' });
    }
  });

  // store server instance for potential shutdown/restart handling
  (g[MODEL_PLATFORM_API_KEY] as ModelPlatformState).server = server;

  server.listen(port, () => logger.info('model-platform API listening', { port }));

  server.on('close', () => {
    const s = g[MODEL_PLATFORM_API_KEY];
    if (s) {
      s.started = false;
      delete s.server;
    }
  });

  return server;
}

export function stopApiServer(): Promise<void> {
  const gLocal = globalThis as unknown as Record<symbol, ModelPlatformState | undefined>;
  const s = gLocal[MODEL_PLATFORM_API_KEY];
  if (!s?.server) return Promise.resolve();
  return new Promise((resolve, reject) => {
    try {
      s.server!.close((err?: Error) => {
        if (s) {
          s.started = false;
          delete s.server;
        }
        if (err) reject(err);
        else resolve();
      });
    } catch (e) {
      if (s) {
        s.started = false;
        delete s.server;
      }
      resolve();
    }
  });
}

export default startApiServer;
