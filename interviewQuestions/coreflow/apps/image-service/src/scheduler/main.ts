import { GpuScheduler } from '@coreflow/gpu-sdk';
import { createLogger } from '@coreflow/common-utils';
import { NodeManager } from './node-manager.js';
import { initConfig, getConfig, subscribeToConfigUpdates, getTunableParams } from '../config';

const logger = createLogger('image-service:scheduler');

let nodeManagerInstance: NodeManager | null = null;
let schedulerInterval: NodeJS.Timeout | null = null;

async function main() {
  // Initialize config with remote poll support
  await initConfig();
  const cfg = getConfig();

  const scheduler = new GpuScheduler();
  nodeManagerInstance = new NodeManager(scheduler);
  nodeManagerInstance.start(cfg.scheduler.pollMs);

  logger.info('Scheduler started', { pollMs: cfg.scheduler.pollMs });

  // Log AppConfig tunable parameters if available
  const tunableParams = getTunableParams();
  if (tunableParams) {
    logger.info('AppConfig tunable parameters applied', { tunableParams });
  } else {
    logger.info('Using default tunable parameters (AppConfig not loaded)');
  }

  schedulerInterval = setInterval(() => {
    const assignment = scheduler.scheduleNext();
    if (assignment) logger.info('Assigned task', assignment);
  }, cfg.scheduler.pollMs);

  // Setup hot-reload handler for scheduler parameters
  const configUpdateHandler = (updatedCfg: any) => {
    const changes: string[] = [];
    
    // Only hot-reload scheduler poll interval
    if (updatedCfg.scheduler?.pollMs !== undefined && nodeManagerInstance) {
      const changed = nodeManagerInstance.updatePollMs(updatedCfg.scheduler.pollMs);
      if (changed) {
        changes.push(changed);
        
        // Restart scheduler interval with new timing
        if (schedulerInterval) {
          clearInterval(schedulerInterval);
        }
        schedulerInterval = setInterval(() => {
          const assignment = scheduler.scheduleNext();
          if (assignment) logger.info('Assigned task', assignment);
        }, updatedCfg.scheduler.pollMs);
      }
    }
    
    if (changes.length > 0) {
      logger.info('Scheduler hot-reload applied', { changes });
    }
  };

  // Register for remote config updates
  subscribeToConfigUpdates(configUpdateHandler);

  process.on('SIGINT', async () => {
    logger.info('Scheduler shutting down');
    if (schedulerInterval) clearInterval(schedulerInterval);
    nodeManagerInstance?.stop();
    process.exit(0);
  });
}

main().catch((err) => {
  createLogger('image-service:scheduler').error('Scheduler failed', err as any);
  process.exit(1);
});
