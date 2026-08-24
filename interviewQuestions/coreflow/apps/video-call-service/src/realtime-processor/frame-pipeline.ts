import { createLogger } from '@coreflow/common-utils';

export type Frame = {
  timestamp: number;
  data: Uint8Array;
  metadata?: Record<string, any>;
};

export class FramePipeline {
  private logger = createLogger('video-call:frame-pipeline');

  constructor(private options = { maxConcurrent: 2 }) {}

  /**
   * 轻量级占位处理：代表低延迟帧推理/预处理流水线
   */
  async process(frame: Frame): Promise<Frame> {
    this.logger.debug('Processing frame', { timestamp: frame.timestamp });
    // 模拟极短延迟的处理（例如：帧缩放 / 轻量化模型推理）
    await new Promise((r) => setTimeout(r, 2));
    return frame;
  }

  async shutdown() {
    this.logger.info('Frame pipeline shutdown');
  }
}

export default FramePipeline;
