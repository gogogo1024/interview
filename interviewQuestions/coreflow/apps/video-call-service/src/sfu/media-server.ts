import { createLogger } from '@coreflow/common-utils';

export class MediaServer {
  private logger = createLogger('video-call:media-server');
  private running = false;

  constructor(private port = Number(process.env.SFU_PORT ?? 5004)) {}

  async start() {
    if (this.running) return;
    this.logger.info('SFU starting', { port: this.port });
    // 占位：初始化 WebRTC 传输、转发、编解码器等
    this.running = true;
  }

  async stop() {
    if (!this.running) return;
    this.logger.info('SFU stopping');
    this.running = false;
  }

  async addPeer(peerId: string) {
    this.logger.debug('Adding peer', { peerId });
  }

  async removePeer(peerId: string) {
    this.logger.debug('Removing peer', { peerId });
  }
}

export default MediaServer;
