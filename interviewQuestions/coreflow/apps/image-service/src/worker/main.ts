import { SimpleGpuWorker } from '@coreflow/gpu-sdk';
import { createLogger } from '@coreflow/common-utils';
import { BatchProcessor } from './batch-processor.js';
import { createModelRegistry } from './models/index.js';
import { initConfig, getConfig, subscribeToConfigUpdates } from '../config';

const logger = createLogger('image-service:worker');

let started = false;
let workerInstance: SimpleGpuWorker | undefined;
let batcherInstance: BatchProcessor | undefined;
let apiModuleRef: any | undefined;

let configUpdateHandler: ((cfg: any) => void) | null = null;

export async function start() {
  if (started) return;
  started = true;
  await initConfig();
  const cfg = getConfig();

  const workerId = cfg.worker.id || 'worker-1';
  workerInstance = new SimpleGpuWorker(workerId);
  const models = createModelRegistry();
  batcherInstance = new BatchProcessor(async (units: any[]) => {
    logger.info('Processing batch', { size: units.length });
    // TODO: 调用模型推理并保存结果
  }, { maxBatchSize: cfg.inference.maxBatchSize, maxWaitMs: cfg.inference.maxBatchWaitMs });

  await workerInstance.start();
  logger.info('GPU worker started', { workerId });

  // 仅在开发/本地模式下启动内置 HTTP API，便于本地调试与集成测试
  if (cfg.enableApi) {
    try {
      // 延迟导入以避免在 worker-only 运行时引入 HTTP 依赖
      apiModuleRef = await import('../api/server.js');
      // start server and keep module ref for graceful shutdown
      apiModuleRef.startApiServer?.(cfg.IMAGE_SERVICE_PORT);
      logger.info('image-service API enabled');
    } catch (err) {
      logger.warn('failed enabling image api', err as any);
    }
  }

  // Setup hot-reload handler for core inference parameters
  configUpdateHandler = (updatedCfg: any) => {
    const changes: string[] = [];
    
    // Only hot-reload inference parameters (batch size, wait time)
    if (batcherInstance && updatedCfg.inference) {
      const updated = batcherInstance.updateOptions({
        maxBatchSize: updatedCfg.inference.maxBatchSize,
        maxWaitMs: updatedCfg.inference.maxBatchWaitMs,
      });
      if (updated) {
        changes.push(...updated);
      }
    }
    
    if (changes.length > 0) {
      logger.info('Worker hot-reload applied', { changes });
    }
  };

  // Register for remote config updates
  subscribeToConfigUpdates(configUpdateHandler);

  // 示例：接收任务并加入批处理（真实场景来自消息队列或 gRPC/tRPC）
  process.on('message', async (msg: any) => {
    if (msg?.type === 'work') {
      await batcherInstance?.add({ id: String(msg.id), payload: msg.payload });
    }
  });
}

export async function stop() {
  if (!started) return;
  logger.info('Stopping image-service worker');
  started = false;
  try {
    await workerInstance?.stop();
  } catch (e) {
    logger.warn('error while stopping worker', e as any);
  }
  try {
    await apiModuleRef?.stopApiServer?.();
  } catch (e) {
    logger.warn('error while stopping image api', e as any);
  }
}

// Auto-run when executed directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start().catch((err) => {
    createLogger('image-service:worker').error('Worker failed', err as any);
    process.exit(1);
  });

  process.on('SIGINT', async () => {
    logger.info('Shutting down worker (SIGINT)');
    await stop();
    process.exit(0);
  });
}
