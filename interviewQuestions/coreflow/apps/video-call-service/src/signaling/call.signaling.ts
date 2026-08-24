import { createLogger } from '@coreflow/common-utils';

export class SignalingServer {
  private logger = createLogger('video-call:signaling');
  private running = false;

  constructor(private port: number = Number(process.env.SIGNALING_PORT ?? 4000)) {}

  async start() {
    if (this.running) return;
    this.logger.info('Signaling server starting', { port: this.port });
    // 占位：在实际实现中，这里会启动 WebSocket / tRPC 或其他信令通道
    this.running = true;
  }

  async stop() {
    if (!this.running) return;
    this.logger.info('Signaling server stopping');
    this.running = false;
  }
}

export default SignalingServer;
