import { SimpleGpuWorker } from '@coreflow/gpu-sdk';
import { createLogger } from '@coreflow/common-utils';
import { BatchProcessor } from './batch-processor.js';
import { createModelRegistry } from './models/index.js';

const logger = createLogger('image-service:worker');

async function main() {
  const workerId = process.env.WORKER_ID || 'worker-1';
  const worker = new SimpleGpuWorker(workerId);
  const models = createModelRegistry();
  const batcher = new BatchProcessor(async (units) => {
    logger.info('Processing batch', { size: units.length });
    // TODO: 调用模型推理并保存结果
  }, { maxBatchSize: Number(process.env.MAX_BATCH_SIZE || 4), maxWaitMs: 50 });

  await worker.start();
  logger.info('GPU worker started', { workerId });

  // 示例：接收任务并加入批处理（真实场景来自消息队列或 gRPC/tRPC）
  process.on('message', async (msg: any) => {
    if (msg?.type === 'work') {
      await batcher.add({ id: String(msg.id), payload: msg.payload });
    }
  });

  process.on('SIGINT', async () => {
    logger.info('Shutting down worker');
    await worker.stop();
    process.exit(0);
  });
}

main().catch((err) => {
  createLogger('image-service:worker').error('Worker failed', err as any);
  process.exit(1);
});
