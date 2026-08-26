import { z } from 'zod';
import { createLogger, loadImageServiceEnv } from '@coreflow/common-utils';

const logger = createLogger('image-service:config');

// ============================================================================
// Zod Schema for configuration validation
// ============================================================================

const RedisConfigSchema = z.object({
  host: z.string().min(1, 'Redis host cannot be empty'),
  port: z.number().int().min(1).max(65535, 'Redis port must be between 1 and 65535'),
});

const TemporalConfigSchema = z.object({
  host: z.string().min(1, 'Temporal host cannot be empty'),
  namespace: z.string().min(1, 'Temporal namespace cannot be empty'),
  taskQueue: z.string().min(1, 'Temporal task queue cannot be empty'),
});

const InferenceConfigSchema = z.object({
  maxBatchSize: z.number().int().min(1).max(256, 'Batch size must be 1-256'),
  maxBatchWaitMs: z.number().int().min(10).max(5000, 'Batch wait must be 10-5000ms'),
  defaultTimeoutMs: z.number().int().min(1000).max(300000, 'Timeout must be 1000-300000ms'),
});

const WorkerConfigSchema = z.object({
  id: z.string().min(1, 'Worker ID cannot be empty'),
});

const SchedulerConfigSchema = z.object({
  pollMs: z.number().int().min(100).max(60000, 'Poll interval must be 100-60000ms'),
});

const ImageServiceConfigSchema = z.object({
  IMAGE_SERVICE_PORT: z.number().int().min(1).max(65535, 'Port must be 1-65535'),
  WORKER_CONCURRENCY: z.number().int().min(1, 'Concurrency must be at least 1'),
  redis: RedisConfigSchema,
  temporal: TemporalConfigSchema,
  inference: InferenceConfigSchema,
  worker: WorkerConfigSchema,
  scheduler: SchedulerConfigSchema,
  enableApi: z.boolean(),
});

export type ImageServiceConfig = z.infer<typeof ImageServiceConfigSchema>;

// ============================================================================
// Configuration Loading & Validation
// ============================================================================

// Hot-reload callbacks
let onConfigUpdateHandlers: Array<(cfg: ImageServiceConfig) => void> = [];

export function subscribeToConfigUpdates(handler: (cfg: ImageServiceConfig) => void) {
  onConfigUpdateHandlers.push(handler);
}

/**
 * Apply tunable parameters from AppConfig to configuration
 * Merges AppConfig values (if present) with defaults, prioritizing AppConfig
 */
function applyTunableParams(cfg: ImageServiceConfig, appConfigData?: Record<string, any>): ImageServiceConfig {
  if (!appConfigData) {
    return cfg;
  }

  return {
    ...cfg,
    scheduler: {
      ...(cfg.scheduler ?? {}),
      ...(appConfigData.scheduler ?? {}),
    },
    inference: {
      ...(cfg.inference ?? {}),
      ...(appConfigData.inference ?? {}),
    },
  };
}

export function getConfig(): ImageServiceConfig {
  const env = loadImageServiceEnv();
  
  const rawConfig = {
    IMAGE_SERVICE_PORT: env.IMAGE_SERVICE_PORT,
    WORKER_CONCURRENCY: env.WORKER_CONCURRENCY,
    redis: { host: env.REDIS_HOST, port: env.REDIS_PORT },
    temporal: { host: env.TEMPORAL_HOST, namespace: env.TEMPORAL_NAMESPACE, taskQueue: env.TEMPORAL_TASK_QUEUE },
    inference: { maxBatchSize: env.MAX_BATCH_SIZE, maxBatchWaitMs: env.MAX_WAIT_MS, defaultTimeoutMs: env.DEFAULT_TIMEOUT_MS },
    worker: { id: env.WORKER_ID },
    scheduler: { pollMs: env.SCHEDULE_POLL_MS },
    enableApi: env.IMAGE_SERVICE_ENABLE_API,
  };

  // Validate configuration
  const validated = ImageServiceConfigSchema.parse(rawConfig);
  logger.debug('config loaded and validated from env', validated);
  return validated;
}

export default getConfig;

let runtimeConfig: ImageServiceConfig = getConfig();
let lastAppConfigData: Record<string, any> | undefined;

export async function initConfig(): Promise<ImageServiceConfig> {
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
    const merged: any = {
      ...runtimeConfig,
      ...(remote.imageService ?? {}),
      redis: { ...(runtimeConfig as any).redis, ...(remote.redis ?? {}) },
      temporal: { ...(runtimeConfig as any).temporal, ...(remote.temporal ?? {}) },
      inference: { ...(runtimeConfig as any).inference, ...(remote.inference ?? {}) },
      worker: { ...(runtimeConfig as any).worker, ...(remote.worker ?? {}) },
      scheduler: { ...(runtimeConfig as any).scheduler, ...(remote.scheduler ?? {}) },
    };

    // Validate merged configuration
    runtimeConfig = ImageServiceConfigSchema.parse(merged);

    // Apply tunable parameters from AppConfig (prioritizes AppConfig values)
    runtimeConfig = applyTunableParams(runtimeConfig, remote);
    lastAppConfigData = remote;
    
    logger.info('Applied remote config', { 
      sources: { ssm: ssm?.length ?? 0, secrets: secrets?.length ?? 0 },
      tunableParams: { scheduler: remote.scheduler, inference: remote.inference }
    });

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
              try {
                // Merge remote values with current config
                const merged: any = {
                  ...runtimeConfig,
                  ...(cfg.imageService ?? {}),
                  redis: { ...runtimeConfig.redis, ...(cfg.redis ?? {}) },
                  temporal: { ...runtimeConfig.temporal, ...(cfg.temporal ?? {}) },
                  inference: { ...runtimeConfig.inference, ...(cfg.inference ?? {}) },
                  worker: { ...runtimeConfig.worker, ...(cfg.worker ?? {}) },
                  scheduler: { ...runtimeConfig.scheduler, ...(cfg.scheduler ?? {}) },
                };

                // Validate merged configuration against schema
                const validated = ImageServiceConfigSchema.parse(merged);
                runtimeConfig = validated;
              
                // Apply tunable parameters from AppConfig (prioritizes AppConfig values)
                runtimeConfig = applyTunableParams(runtimeConfig, cfg);
                lastAppConfigData = cfg;
                
                logger.info('Remote config updated', { 
                  updatedFields: Object.keys(cfg),
                  handlerCount: onConfigUpdateHandlers.length,
                  tunableParams: { scheduler: cfg.scheduler, inference: cfg.inference }
                });
                
                // Trigger hot-reload for interested components
                for (const handler of onConfigUpdateHandlers) {
                  try {
                    handler(runtimeConfig);
                  } catch (err) {
                    logger.error('Config update handler failed', { error: (err as Error).message });
                  }
                }
              } catch (err) {
                logger.error('Failed to apply remote config update', { 
                  error: (err as Error).message,
                  validationError: err instanceof z.ZodError ? err.errors : undefined
                });
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

/**
 * Get current tunable parameters from AppConfig
 * Returns the last loaded AppConfig data with tunable parameters
 * Useful for logging/monitoring which parameters came from AppConfig
 */
export function getTunableParams() {
  if (!lastAppConfigData) {
    return null;
  }
  
  return {
    scheduler: lastAppConfigData.scheduler,
    inference: lastAppConfigData.inference,
  };
}
