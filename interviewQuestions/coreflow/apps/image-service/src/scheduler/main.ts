import { GpuScheduler } from '@coreflow/gpu-sdk';
import { createLogger } from '@coreflow/common-utils';
import { NodeManager } from './node-manager.js';

const logger = createLogger('image-service:scheduler');

async function main() {
  const scheduler = new GpuScheduler();
  const nodeManager = new NodeManager(scheduler);
  nodeManager.start();

  logger.info('Scheduler started');

  setInterval(() => {
    const assignment = scheduler.scheduleNext();
    if (assignment) logger.info('Assigned task', assignment);
  }, Number(process.env.SCHEDULE_POLL_MS || 1000));

  process.on('SIGINT', async () => {
    logger.info('Scheduler shutting down');
    process.exit(0);
  });
}

main().catch((err) => {
  createLogger('image-service:scheduler').error('Scheduler failed', err as any);
  process.exit(1);
});
