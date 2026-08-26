
import { createLogger } from '@coreflow/common-utils';
import { getConfig } from '../config';

const logger = createLogger('video-call:signaling');

export class SignalingServer {
  private running = false;
  private moduleRef: any | undefined;

  constructor(private port: number = Number(getConfig().SIGNALING_PORT ?? 4000)) {}

  async start() {
    if (this.running) return;
    this.running = true;
    logger.info('Signaling server starting', { port: this.port });

    if (getConfig().SIGNALING_ENABLE_API === true) {
      try {
        const mod = await import('./server.js');
        // default export is startSignalingServer
        const startFn = mod.default ?? mod.startSignalingServer;
        if (typeof startFn === 'function') startFn(this.port);
        this.moduleRef = mod;
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
    // attempt graceful shutdown of the http API if available
    try {
      await this.moduleRef?.stopSignalingServer?.();
    } catch (err) {
      logger.warn('error while stopping signaling http api', err as any);
    }
  }
}

export default SignalingServer;
