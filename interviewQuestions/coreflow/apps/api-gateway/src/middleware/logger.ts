import { createLogger } from '@coreflow/common-utils';
const logger = createLogger('api-gateway:middleware:logger');

export function requestLogger(info?: { level?: string }) {
  return async function (ctx: any) {
    logger.info('request', { info, ctx });
    return ctx;
  };
}

export default requestLogger;
