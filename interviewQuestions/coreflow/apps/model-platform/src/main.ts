import { start, stop } from './index.js';
import { createLogger } from '@coreflow/common-utils';

const logger = createLogger('model-platform:main');

async function main() {
  await start();

  process.on('SIGINT', async () => {
    logger.info('shutting down model-platform');
    await stop();
    process.exit(0);
  });
}

main().catch((err) => {
  createLogger('model-platform:main').error('main failed', err as any);
  process.exit(1);
});
