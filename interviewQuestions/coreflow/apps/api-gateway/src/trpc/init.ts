import { createLogger } from '@coreflow/common-utils';
import { createContext } from './context';

const logger = createLogger('api-gateway:trpc:init');

/**
 * 占位 tRPC handler 工厂。
 * 真实项目中此处会创建 tRPC router 并将其适配到 Next / Express 等。
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
      // TODO: 将来在此处调用真正的 tRPC router，例如 `appRouter.invoke(req, ctx)`
      return { status: 501, body: 'tRPC handler not implemented', ctx };
    },
  };
}

export default createTRPCHandler;
