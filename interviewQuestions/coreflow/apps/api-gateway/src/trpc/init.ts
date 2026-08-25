import { createLogger } from '@coreflow/common-utils';
import { createContext } from './context';
import {
  ImageGenerateInputSchema,
  ImageGenerateOutputSchema,
  TaskIdInputSchema,
  ImageTaskSchema,
} from '@coreflow/trpc-types';
import { forwardToImageService } from '../adapters/imageService';

const logger = createLogger('api-gateway:trpc:init');

/**
 * 简单的 tRPC-like handler：
 * - 接收带 `method` 和 `params` 的 JSON 请求
 * - 使用 `@coreflow/trpc-types` 提供的 Zod schema 做输入/输出校验
 * - 对 image 相关方法转发到 image-service（或本地 mock）
 */
export function createTRPCHandler() {
  return {
    async handle(req: any) {
      logger.debug('received request in TRPC handler', { method: req?.method });
      const headers = (() => {
        try {
          if (req?.headers?.entries) return Object.fromEntries(req.headers.entries());
          if (req?.headers) return req.headers;
        } catch (_) {}
        return {};
      })();

      const ctx = await createContext({ headers });

      let body: any = {};
      try {
        body = await req.json();
      } catch (err) {
        logger.debug('no json body on request');
      }

      const method: string = body?.method || body?.path || '';
      const params = body?.params ?? body?.input ?? {};

      try {
        switch (method) {
          case 'image.generate': {
            const input = ImageGenerateInputSchema.parse(params);
            const res = await forwardToImageService('generate', input);
            if (!res?.ok) return { status: 502, body: { error: 'upstream error', details: res } };
            // validate upstream output against our schema
            const output = ImageGenerateOutputSchema.parse(res.body);
            return { status: 200, body: { result: output, ctx } };
          }

          case 'image.getStatus':
          case 'image.subscribe': {
            const input = TaskIdInputSchema.parse(params);
            // 查询上游服务
            const res = await forwardToImageService(`status`, input);
            if (!res?.ok) return { status: 502, body: { error: 'upstream error', details: res } };
            const task = ImageTaskSchema.parse(res.body);
            return { status: 200, body: { result: task, ctx } };
          }

          default:
            return { status: 404, body: { error: 'method not found', method } };
        }
      } catch (err) {
        logger.warn('trpc handler validation/dispatch error', err as any);
        return { status: 400, body: { error: 'validation or dispatch failed', details: (err as any)?.message || err } };
      }
    },
  };
}

export default createTRPCHandler;
