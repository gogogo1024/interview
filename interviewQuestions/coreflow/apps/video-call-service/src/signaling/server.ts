import { createServer } from 'http';
import { parse as parseUrl } from 'url';
import { createLogger } from '@coreflow/common-utils';
import {
  CreateCallInputSchema,
  CallIdInputSchema,
  SubscribeOutputSchema,
  CallStatusSchema,
} from '@coreflow/trpc-types';
import { z } from 'zod';

const logger = createLogger('video-call:api');

type CallState = { status: z.infer<typeof CallStatusSchema>; participants: string[] };

const calls = new Map<string, CallState>();

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

export function startSignalingServer(port = Number(process.env.SIGNALING_PORT || 4000)) {
  if ((globalThis as any).__coreflow_video_signaling_started) return;
  (globalThis as any).__coreflow_video_signaling_started = true;

  const server = createServer(async (req, res) => {
    try {
      const parsed = parseUrl(req.url || '', true);
      const pathname = parsed.pathname || '/';

      if (req.method === 'POST' && pathname === '/createCall') {
        const body = await readJson(req).catch((e) => {
          logger.warn('invalid json', e);
          return null;
        });
        if (!body) return jsonResponse(res, 400, { error: 'invalid json' });

        const input = CreateCallInputSchema.safeParse(body);
        if (!input.success) return jsonResponse(res, 400, { error: 'validation failed', issues: input.error.format() });

        const call_id = `call_${Date.now()}`;
        calls.set(call_id, { status: 'calling', participants: [] });

        const out = { call_id, status: 'calling' };
        const outSchema = z.object({ call_id: z.string(), status: CallStatusSchema });
        const parsedOut = outSchema.parse(out);
        return jsonResponse(res, 200, parsedOut);
      }

      if (req.method === 'POST' && pathname === '/hangup') {
        const body = await readJson(req).catch(() => ({}));
        const inRes = CallIdInputSchema.safeParse(body);
        if (!inRes.success) return jsonResponse(res, 400, { error: 'validation failed', issues: inRes.error.format() });

        const call = calls.get(inRes.data.call_id);
        if (!call) return jsonResponse(res, 404, { error: 'call not found' });
        call.status = 'ended';
        return jsonResponse(res, 200, { success: true });
      }

      if (req.method === 'POST' && pathname === '/subscribe') {
        const body = await readJson(req).catch(() => ({}));
        const inRes = CallIdInputSchema.safeParse(body);
        if (!inRes.success) return jsonResponse(res, 400, { error: 'validation failed', issues: inRes.error.format() });

        const call = calls.get(inRes.data.call_id);
        if (!call) return jsonResponse(res, 404, { error: 'call not found' });

        const out = { status: call.status, participants: call.participants };
        const parsedOut = SubscribeOutputSchema.parse(out);
        return jsonResponse(res, 200, parsedOut);
      }

      jsonResponse(res, 404, { error: 'not found' });
    } catch (err) {
      logger.error('server error', err as any);
      jsonResponse(res, 500, { error: 'internal error' });
    }
  });

  server.listen(port, () => logger.info('video-call-service signaling API listening', { port }));
  return server;
}

export default startSignalingServer;
