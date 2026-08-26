import { createLogger, loadImageServiceEnv } from '@coreflow/common-utils';

const logger = createLogger('image-service:config');

// Hot-reload callbacks
let onConfigUpdateHandlers: Array<(cfg: any) => void> = [];

export function subscribeToConfigUpdates(handler: (cfg: any) => void) {
  onConfigUpdateHandlers.push(handler);
}

export function getConfig() {
  const env = loadImageServiceEnv();
  const cfg = {
    IMAGE_SERVICE_PORT: env.IMAGE_SERVICE_PORT,
    WORKER_CONCURRENCY: env.WORKER_CONCURRENCY,
    redis: { host: env.REDIS_HOST, port: env.REDIS_PORT },
    temporal: { host: env.TEMPORAL_HOST, namespace: env.TEMPORAL_NAMESPACE, taskQueue: env.TEMPORAL_TASK_QUEUE },
    inference: { maxBatchSize: env.MAX_BATCH_SIZE, maxBatchWaitMs: env.MAX_WAIT_MS, defaultTimeoutMs: env.DEFAULT_TIMEOUT_MS },
    worker: { id: env.WORKER_ID },
    scheduler: { pollMs: env.SCHEDULE_POLL_MS },
    enableApi: env.IMAGE_SERVICE_ENABLE_API,
  } as const;
  logger.debug('config loaded', cfg);
  return cfg;
}

export default getConfig;

let runtimeConfig = getConfig();

export async function initConfig() {
  const env = loadImageServiceEnv();
  if (!env.ENABLE_REMOTE_CONFIG) return runtimeConfig;

  try {
    const ssm = env.AWS_SSM_PATHS ? env.AWS_SSM_PATHS.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
    const secrets = env.AWS_SECRET_NAMES ? env.AWS_SECRET_NAMES.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
    // Dynamically import AWS appconfig helper at runtime to avoid bundlers resolving AWS SDK during build
    let remote: Record<string, any> = {};
    try {
      // use Function wrapper to prevent static analysis by bundlers
      const dynImport = new Function('m', 'return import(m)') as (m: string) => Promise<any>;
      const mod = await dynImport('@coreflow/common-utils/dist/config/aws-appconfig.js');
      if (mod && typeof mod.loadConfigFromAws === 'function') {
        remote = await mod.loadConfigFromAws({
          region: env.AWS_REGION,
          ssmPaths: ssm,
          secretNames: secrets,
          appConfigApplication: env.AWS_APP_CONFIG_APPLICATION,
          appConfigEnvironment: env.AWS_APP_CONFIG_ENVIRONMENT,
          appConfigProfile: env.AWS_APP_CONFIG_PROFILE,
        });
      }
    } catch (err) {
      logger.warn('Runtime dynamic import of aws-appconfig failed', { error: (err as Error).message });
    }

    // Merge remote values into runtimeConfig (shallow merge for known keys)
    const merged = {
      ...runtimeConfig,
      ...(remote.imageService ?? {}),
      redis: { ...(runtimeConfig as any).redis, ...(remote.redis ?? {}) },
      temporal: { ...(runtimeConfig as any).temporal, ...(remote.temporal ?? {}) },
      inference: { ...(runtimeConfig as any).inference, ...(remote.inference ?? {}) },
      worker: { ...(runtimeConfig as any).worker, ...(remote.worker ?? {}) },
      scheduler: { ...(runtimeConfig as any).scheduler, ...(remote.scheduler ?? {}) },
    } as any;

    runtimeConfig = merged;
    logger.info('Applied remote config', { sources: { ssm: ssm?.length ?? 0, secrets: secrets?.length ?? 0 } });

    // start background poll if configured
    if (env.REMOTE_CONFIG_POLL_MS && env.REMOTE_CONFIG_POLL_MS > 0) {
      try {
        const dynImport = new Function('m', 'return import(m)') as (m: string) => Promise<any>;
        const mod = await dynImport('@coreflow/common-utils/dist/config/aws-appconfig.js');
        if (mod && typeof mod.startAwsConfigPoll === 'function') {
          mod.startAwsConfigPoll({
            region: env.AWS_REGION,
            ssmPaths: ssm,
            secretNames: secrets,
            appConfigApplication: env.AWS_APP_CONFIG_APPLICATION,
            appConfigEnvironment: env.AWS_APP_CONFIG_ENVIRONMENT,
            appConfigProfile: env.AWS_APP_CONFIG_PROFILE,
            pollMs: env.REMOTE_CONFIG_POLL_MS,
            onUpdate: (cfg: Record<string, any>) => {
              runtimeConfig = {
                ...runtimeConfig,
                ...(cfg.imageService ?? {}),
                redis: { ...(runtimeConfig as any).redis, ...(cfg.redis ?? {}) },
                temporal: { ...(runtimeConfig as any).temporal, ...(cfg.temporal ?? {}) },
                inference: { ...(runtimeConfig as any).inference, ...(cfg.inference ?? {}) },
                worker: { ...(runtimeConfig as any).worker, ...(cfg.worker ?? {}) },
                scheduler: { ...(runtimeConfig as any).scheduler, ...(cfg.scheduler ?? {}) },
              } as any;
              
              logger.info('Remote config updated', { 
                updatedFields: Object.keys(cfg),
                handlerCount: onConfigUpdateHandlers.length 
              });
              
              // Trigger hot-reload for interested components
              for (const handler of onConfigUpdateHandlers) {
                try {
                  handler(runtimeConfig);
                } catch (err) {
                  logger.error('Config update handler failed', { error: (err as Error).message });
                }
              }
            },
          });
        }
      } catch (err) {
        logger.warn('Failed starting remote config poll', { error: (err as Error).message });
      }
    }
  } catch (err) {
    logger.warn('Failed to apply remote config', { error: (err as Error).message });
  }

  return runtimeConfig;
}
