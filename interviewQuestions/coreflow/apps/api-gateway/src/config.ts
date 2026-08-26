import { createLogger } from '@coreflow/common-utils';

const logger = createLogger('api-gateway:config');

export function getConfig() {
  const cfg = {
    IMAGE_SERVICE_URL: process.env.IMAGE_SERVICE_URL ?? 'http://image-service:4001',
    MODEL_PLATFORM_URL: process.env.MODEL_PLATFORM_URL ?? 'http://model-platform:4100',
    VIDEO_SERVICE_URL: process.env.VIDEO_SERVICE_URL ?? 'http://video-call-service:4000',
  } as const;
  logger.debug('config loaded', cfg);
  return cfg;
}

export default getConfig;

export async function initConfig() {
  return getConfig();
}
