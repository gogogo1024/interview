import { createLogger } from '@coreflow/common-utils';
const logger = createLogger('api-gateway:middleware:auth');

export async function requireAuth(ctx: any) {
  if (!ctx?.user) {
    logger.warn('unauthorized request', { ctx });
    const err: any = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  return ctx;
}

export default requireAuth;
