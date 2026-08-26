import SignalingServer from './call.signaling.js';
import { createLogger } from '@coreflow/common-utils';
import { getConfig } from '../config';

const logger = createLogger('video-call:signaling:main');

let signalingInstance: SignalingServer | undefined;

export async function start() {
  if (signalingInstance) return;
  signalingInstance = new SignalingServer(Number(getConfig().SIGNALING_PORT || 4000));
  await signalingInstance.start();
}

export async function stop() {
  if (!signalingInstance) return;
  await signalingInstance.stop();
  signalingInstance = undefined;
}

// Auto-run when executed directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start().catch((err) => {
    createLogger('video-call:signaling:main').error('signaling main failed', err as any);
    process.exit(1);
  });

  process.on('SIGINT', async () => {
    logger.info('shutting down signaling server');
    await stop();
    process.exit(0);
  });
}
