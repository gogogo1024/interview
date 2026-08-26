import { GpuScheduler } from '@coreflow/gpu-sdk';
import { createLogger } from '@coreflow/common-utils';
import { NodeManager } from './node-manager.js';
import { initConfig, getConfig } from '../config';

const logger = createLogger('image-service:scheduler');

async function main() {
  const scheduler = new GpuScheduler();
  const nodeManager = new NodeManager(scheduler);
  nodeManager.start();

  logger.info('Scheduler started');

  const cfg = getConfig();
  setInterval(() => {
    const assignment = scheduler.scheduleNext();
    if (assignment) logger.info('Assigned task', assignment);
  }, cfg.scheduler.pollMs);

  process.on('SIGINT', async () => {
    logger.info('Scheduler shutting down');
    process.exit(0);
  });
}

main().catch((err) => {
  createLogger('image-service:scheduler').error('Scheduler failed', err as any);
  process.exit(1);
});
