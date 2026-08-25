import { createServer } from 'http';
import { parse as parseUrl } from 'url';
import { createLogger } from '@coreflow/common-utils';
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

export function startApiServer(port = Number(process.env.IMAGE_SERVICE_PORT || 4001)) {
  // 防止重复启动
  if ((globalThis as any).__coreflow_image_api_started) return;
  (globalThis as any).__coreflow_image_api_started = true;

  const server = createServer(async (req, res) => {
    try {
      const parsed = parseUrl(req.url || '', true);
      const pathname = parsed.pathname || '/';

      if (req.method === 'POST' && pathname === '/generate') {
        const body = await readJson(req).catch((e) => {
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
        const inputBody = req.method === 'POST' ? await readJson(req).catch(() => ({})) : parsed.query;
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

  server.listen(port, () => logger.info('image-service API listening', { port }));
  return server;
}

export default startApiServer;
