import { GpuScheduler } from '@coreflow/gpu-sdk';
import { createLogger } from '@coreflow/common-utils';

const logger = createLogger('image-service:node-manager');

export class NodeManager {
  private nextId = 1;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private pollMs: number = 5000;

  constructor(private scheduler: GpuScheduler) {}

  start(pollMs?: number) {
    if (pollMs !== undefined) {
      this.pollMs = pollMs;
    }
    // 示例：定期注册/心跳模拟节点
    this.heartbeatInterval = setInterval(() => this.simulateHeartbeat(), this.pollMs);
  }

  /**
   * Hot-update heartbeat polling interval
   * Restarts the heartbeat loop with new interval
   */
  updatePollMs(pollMs: number) {
    if (pollMs === this.pollMs) return null;
    this.pollMs = pollMs;
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.heartbeatInterval = setInterval(() => this.simulateHeartbeat(), this.pollMs);
    return `pollMs=${pollMs}`;
  }

  stop() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }

  private simulateHeartbeat() {
    const id = `node-${this.nextId}`;
    this.nextId += 1;
    const node = { id, gpuCount: 1, lastHeartbeat: Date.now(), available: true } as any;
    this.scheduler.registerNode(node);
    logger.info('Registered node', { id });
  }
}

export default NodeManager;
