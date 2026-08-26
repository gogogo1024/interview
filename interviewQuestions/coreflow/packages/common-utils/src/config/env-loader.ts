import { validateSchema } from '../env';
import { createLogger } from '../logger';

const logger = createLogger('common-utils:config');

// Image-service specific env definition
const IMAGE_SERVICE_ENV_DEF = {
  IMAGE_SERVICE_PORT: { type: 'number', default: 4001 },
  WORKER_CONCURRENCY: { type: 'number', default: 1 },
  SCHEDULE_POLL_MS: { type: 'number', default: 1000 },
  MAX_BATCH_SIZE: { type: 'number', default: 4 },
  MAX_WAIT_MS: { type: 'number', default: 50 },
  DEFAULT_TIMEOUT_MS: { type: 'number', default: 30000 },
  IMAGE_SERVICE_ENABLE_API: { type: 'boolean', default: false },
  WORKER_ID: { type: 'string', default: 'worker-1' },
  REDIS_HOST: { type: 'string', default: 'redis.default.svc.cluster.local' },
  REDIS_PORT: { type: 'number', default: 6379 },
  TEMPORAL_HOST: { type: 'string', default: 'temporal.default.svc.cluster.local:7233' },
  TEMPORAL_NAMESPACE: { type: 'string', default: 'default' },
  TEMPORAL_TASK_QUEUE: { type: 'string', default: 'image-gen' },
  // remote config / AWS
  ENABLE_REMOTE_CONFIG: { type: 'boolean', default: false },
  REMOTE_CONFIG_POLL_MS: { type: 'number', default: 0 },
  AWS_REGION: { type: 'string' },
  AWS_APP_CONFIG_APPLICATION: { type: 'string' },
  AWS_APP_CONFIG_ENVIRONMENT: { type: 'string' },
  AWS_APP_CONFIG_PROFILE: { type: 'string' },
  AWS_SSM_PATHS: { type: 'string' },
  AWS_SECRET_NAMES: { type: 'string' },
};

export type ImageServiceEnv = {
  IMAGE_SERVICE_PORT: number;
  WORKER_CONCURRENCY: number;
  SCHEDULE_POLL_MS: number;
  MAX_BATCH_SIZE: number;
  MAX_WAIT_MS: number;
  DEFAULT_TIMEOUT_MS: number;
  IMAGE_SERVICE_ENABLE_API: boolean;
  WORKER_ID: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  TEMPORAL_HOST: string;
  TEMPORAL_NAMESPACE: string;
  TEMPORAL_TASK_QUEUE: string;
  // remote config
  ENABLE_REMOTE_CONFIG: boolean;
  REMOTE_CONFIG_POLL_MS: number;
  AWS_REGION?: string;
  AWS_APP_CONFIG_APPLICATION?: string;
  AWS_APP_CONFIG_ENVIRONMENT?: string;
  AWS_APP_CONFIG_PROFILE?: string;
  AWS_SSM_PATHS?: string;
  AWS_SECRET_NAMES?: string;
};

export function loadImageServiceEnv(): ImageServiceEnv {
  const raw = validateSchema(IMAGE_SERVICE_ENV_DEF as any) as Record<string, any>;
  logger.debug('loaded image-service env', raw);
  return {
    IMAGE_SERVICE_PORT: Number(raw.IMAGE_SERVICE_PORT),
    WORKER_CONCURRENCY: Number(raw.WORKER_CONCURRENCY),
    SCHEDULE_POLL_MS: Number(raw.SCHEDULE_POLL_MS),
    MAX_BATCH_SIZE: Number(raw.MAX_BATCH_SIZE),
    MAX_WAIT_MS: Number(raw.MAX_WAIT_MS),
    IMAGE_SERVICE_ENABLE_API: Boolean(raw.IMAGE_SERVICE_ENABLE_API),
    WORKER_ID: String(raw.WORKER_ID),
    REDIS_HOST: String(raw.REDIS_HOST),
    REDIS_PORT: Number(raw.REDIS_PORT),
    TEMPORAL_HOST: String(raw.TEMPORAL_HOST),
    TEMPORAL_NAMESPACE: String(raw.TEMPORAL_NAMESPACE),
    TEMPORAL_TASK_QUEUE: String(raw.TEMPORAL_TASK_QUEUE),
    DEFAULT_TIMEOUT_MS: Number(raw.DEFAULT_TIMEOUT_MS),
      ENABLE_REMOTE_CONFIG: Boolean(raw.ENABLE_REMOTE_CONFIG),
      REMOTE_CONFIG_POLL_MS: Number(raw.REMOTE_CONFIG_POLL_MS),
      AWS_REGION: raw.AWS_REGION ? String(raw.AWS_REGION) : undefined,
      AWS_APP_CONFIG_APPLICATION: raw.AWS_APP_CONFIG_APPLICATION ? String(raw.AWS_APP_CONFIG_APPLICATION) : undefined,
      AWS_APP_CONFIG_ENVIRONMENT: raw.AWS_APP_CONFIG_ENVIRONMENT ? String(raw.AWS_APP_CONFIG_ENVIRONMENT) : undefined,
      AWS_APP_CONFIG_PROFILE: raw.AWS_APP_CONFIG_PROFILE ? String(raw.AWS_APP_CONFIG_PROFILE) : undefined,
      AWS_SSM_PATHS: raw.AWS_SSM_PATHS ? String(raw.AWS_SSM_PATHS) : undefined,
      AWS_SECRET_NAMES: raw.AWS_SECRET_NAMES ? String(raw.AWS_SECRET_NAMES) : undefined,
  };
}
