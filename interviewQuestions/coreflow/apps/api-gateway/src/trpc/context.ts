import { createLogger } from '@coreflow/common-utils';

const logger = createLogger('api-gateway:trpc:context');

export type RequestContext = {
  reqId?: string;
  user?: { id: string } | null;
  [k: string]: any;
};

/**
 * 占位：创建请求上下文（鉴权 / tracing / 请求级别资源）
 * 将来可接入真实鉴权逻辑（JWT / session）和 DB 连接复用
 */
export async function createContext(input?: { headers?: Record<string, string | string[]> }): Promise<RequestContext> {
  const ctx: RequestContext = {};
  try {
    const auth = input?.headers?.authorization || input?.headers?.Authorization;
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
      const token = auth.slice(7);
      logger.debug('createContext: received bearer token', { hasToken: !!token });
      // 占位：验证 token 并解析 user
      ctx.user = { id: 'anonymous' };
    }
  } catch (err) {
    logger.warn('createContext failed to parse auth', err as any);
  }
  return ctx;
}

export default createContext;
