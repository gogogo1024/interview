import { createServer } from 'http';
import { parse as parseUrl } from 'url';
import { createLogger, Symbols } from '@coreflow/common-utils';
import { getConfig } from '../config';
import {
  ImageGenerateInputSchema,
  ImageGenerateOutputSchema,
  TaskIdInputSchema,
  ImageTaskSchema,
  ImageTask,
} from '@coreflow/trpc-types';

const logger = createLogger('image-service:api');

const tasks = new Map<string, ImageTask>();

function jsonResponse(res: any, status: number, body: any) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

type ImageApiState = {
  started?: boolean;
  server?: import('http').Server;
};

/**
 * Get the current API server state from the global registry
 */
function getApiState(): ImageApiState {
  const g = globalThis as any;
  return g[Symbols.IMAGE_API_STATE] || {};
}

export function startApiServer(port = Number(getConfig().IMAGE_SERVICE_PORT)) {
  const g = globalThis as any;
  const state = getApiState();
  if (state.started) return;
  g[Symbols.IMAGE_API_STATE] = { ...state, started: true };

  const server = createServer(async (req, res) => {
    try {
      const parsed = parseUrl(req.url || '', true);
      const pathname = parsed.pathname || '/';

      if (req.method === 'POST' && pathname === '/generate') {
        const body = await (req as any).json().catch((e: any) => {
          logger.warn('invalid json', e);
          return null;
        });
        if (!body) return jsonResponse(res, 400, { error: 'invalid json' });

        const input = ImageGenerateInputSchema.safeParse(body);
        if (!input.success) return jsonResponse(res, 400, { error: 'validation failed', issues: input.error.format() });

        const task_id = `task_${Date.now()}`;
        const now = new Date().toISOString();
        const task: ImageTask = {
          task_id,
          status: 'queued',
          image_url: undefined,
          error: undefined,
          created_at: now,
          completed_at: undefined,
        };
        tasks.set(task_id, task);

        const out = { task_id, status: task.status };
        const parsedOut = ImageGenerateOutputSchema.parse(out);
        return jsonResponse(res, 200, parsedOut);
      }

      if ((req.method === 'GET' && pathname === '/status') || (req.method === 'POST' && pathname === '/status')) {
        const inputBody =
          req.method === 'POST' ? await (req as any).json().catch(() => ({})) : parsed.query;
        const parsedIn = TaskIdInputSchema.safeParse(inputBody);
        if (!parsedIn.success) return jsonResponse(res, 400, { error: 'validation failed', issues: parsedIn.error.format() });

        const task = tasks.get(parsedIn.data.task_id);
        if (!task) return jsonResponse(res, 404, { error: 'task not found' });

        const out = ImageTaskSchema.parse(task);
        return jsonResponse(res, 200, out);
      }

      jsonResponse(res, 404, { error: 'not found' });
    } catch (err) {
      logger.error('server error', err as any);
      jsonResponse(res, 500, { error: 'internal error' });
    }
  });

  // store server instance for potential shutdown/restart handling
  (globalThis as any)[Symbols.IMAGE_API_STATE] = { ...getApiState(), server };

  server.listen(port, () => logger.info('image-service API listening', { port }));

  server.on('close', () => {
    const s = getApiState();
    if (s) {
      s.started = false;
      delete s.server;
      (globalThis as any)[Symbols.IMAGE_API_STATE] = s;
    }
  });

  return server;
}

export function stopApiServer(): Promise<void> {
  const s = getApiState();
  if (!s?.server) return Promise.resolve();
  return new Promise((resolve, reject) => {
    try {
      s.server!.close((err?: Error) => {
        const g = globalThis as any;
        const state = getApiState();
        if (state) {
          state.started = false;
          delete state.server;
          g[Symbols.IMAGE_API_STATE] = state;
        }
        if (err) reject(err);
        else resolve();
      });
    } catch (e) {
      // if close throws, ensure state cleaned
      const g = globalThis as any;
      const state = getApiState();
      if (state) {
        state.started = false;
        delete state.server;
        g[Symbols.IMAGE_API_STATE] = state;
      }
      resolve();
    }
  });
}

export default startApiServer;
