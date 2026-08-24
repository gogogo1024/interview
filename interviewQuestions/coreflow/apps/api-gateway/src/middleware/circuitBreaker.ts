import { createLogger } from '@coreflow/common-utils';
const logger = createLogger('api-gateway:middleware:circuit');

export function circuitBreaker(opts?: { failuresBeforeOpen?: number; resetMs?: number }) {
  const failuresBeforeOpen = opts?.failuresBeforeOpen ?? 5;
  const resetMs = opts?.resetMs ?? 60_000;
  let failures = 0;
  let openUntil = 0;

  return async function <T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    if (openUntil > now) throw new Error('circuit open');
    try {
      const r = await fn();
      failures = 0;
      return r;
    } catch (err) {
      failures += 1;
      if (failures >= failuresBeforeOpen) {
        openUntil = now + resetMs;
        logger.warn('circuit opened', { openUntil });
      }
      throw err;
    }
  };
}

export default circuitBreaker;
