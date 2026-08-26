import { createLogger } from '@coreflow/common-utils';
import { createContext } from './context';

const logger = createLogger('api-gateway:trpc:init');

// 简单的 router builder 工具 — 在 root.ts 中会用到它来构造 `appRouter`
export function router<T extends Record<string, any>>(r: T): T {
  return r;
}

/**
 * tRPC-like HTTP handler — 在运行时通过动态导入 `./root.js` 获取 `appRouter`，
 * 避免模块循环引用在初始化阶段影响导入。
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
        // 动态导入 appRouter，避免循环导入问题
        const { appRouter } = await import('./root');

        // 使用 trpc 的 createCaller 调用 procedure（appRouter 是 @trpc/server 的 router）
        const caller = (appRouter as any).createCaller ? (appRouter as any).createCaller(ctx) : appRouter;
        const [ns, proc] = (method || '').split('.');
        const namespace = (caller as any)[ns];
        if (!namespace) return { status: 404, body: { error: 'namespace not found', ns } };
        const handler = namespace[proc];
        if (typeof handler !== 'function') return { status: 404, body: { error: 'procedure not found', proc } };

        // 调用 caller 上的方法，传入解析后的参数
        const result = await handler(params);
        return { status: 200, body: { result, ctx } };
      } catch (err) {
        logger.warn('trpc handler validation/dispatch error', err as any);
        return { status: 400, body: { error: 'validation or dispatch failed', details: (err as any)?.message || err } };
      }
    },
  };
}

export default createTRPCHandler;
