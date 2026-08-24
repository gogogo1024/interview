import { createLogger } from '@coreflow/common-utils';
const logger = createLogger('api-gateway:middleware:rateLimit');

const counters = new Map<string, { count: number; ts: number }>();

export function rateLimit(limit = 100, windowMs = 60_000) {
  return async function (key = 'global') {
    const now = Date.now();
    const v = counters.get(key) ?? { count: 0, ts: now };
    if (now - v.ts > windowMs) {
      v.count = 0;
      v.ts = now;
    }
    v.count += 1;
    counters.set(key, v);
    const allowed = v.count <= limit;
    if (!allowed) logger.warn('rateLimit exceeded', { key, count: v.count });
    return allowed;
  };
}

export default rateLimit;
