import { createLogger } from '@coreflow/common-utils';

const logger = createLogger('video-call:signaling');

export class SignalingServer {
  private running = false;

  constructor(private port: number = Number(process.env.SIGNALING_PORT ?? 4000)) {}

  async start() {
    if (this.running) return;
    this.running = true;
    logger.info('Signaling server starting', { port: this.port });

    if (process.env.SIGNALING_ENABLE_API === 'true') {
      try {
        const { startSignalingServer } = await import('./server.js');
        startSignalingServer(this.port);
        logger.info('Signaling HTTP API enabled (SIGNALING_ENABLE_API=true)');
      } catch (err) {
        logger.warn('failed to start signaling http api', err as any);
      }
    } else {
      logger.info('SIGNALING_ENABLE_API is not true; HTTP API not started');
    }
  }

  async stop() {
    if (!this.running) return;
    logger.info('Signaling server stopping');
    this.running = false;
    // server cleanup handled by node process exit in this simple implementation
  }
}

export default SignalingServer;
