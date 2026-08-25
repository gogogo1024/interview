import SignalingServer from './call.signaling.js';
import { createLogger } from '@coreflow/common-utils';

const logger = createLogger('video-call:signaling:main');

async function main() {
  const server = new SignalingServer(Number(process.env.SIGNALING_PORT || 4000));
  await server.start();

  process.on('SIGINT', async () => {
    logger.info('shutting down signaling server');
    await server.stop();
    process.exit(0);
  });
}

main().catch((err) => {
  createLogger('video-call:signaling:main').error('signaling main failed', err as any);
  process.exit(1);
});
