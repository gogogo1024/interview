import { createLogger } from '@coreflow/common-utils';

const logger = createLogger('model-platform:config');

export function getConfig() {
  const cfg = {
    MODEL_PLATFORM_PORT: Number(process.env.MODEL_PLATFORM_PORT ?? 4100),
    MODEL_PLATFORM_ENABLE_API: process.env.MODEL_PLATFORM_ENABLE_API === 'true',
  } as const;
  logger.debug('config loaded', cfg);
  return cfg;
}

export default getConfig;

let runtimeConfig = getConfig();

export async function initConfig() {
  return runtimeConfig;
}
