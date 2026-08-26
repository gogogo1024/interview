import { createLogger } from '@coreflow/common-utils';

const logger = createLogger('video-call-service:config');

export function getConfig() {
  const cfg = {
    SIGNALING_PORT: Number(process.env.SIGNALING_PORT ?? 4000),
    SFU_PORT: Number(process.env.SFU_PORT ?? 5004),
    SIGNALING_ENABLE_API: process.env.SIGNALING_ENABLE_API === 'true',
  } as const;
  logger.debug('config loaded', cfg);
  return cfg;
}

export default getConfig;

let runtimeConfig = getConfig();

export async function initConfig() {
  return runtimeConfig;
}
