export type NodeInfo = {
  id: string;
  gpuCount: number;
  lastHeartbeat: number;
  available: boolean;
  tags?: string[];
};

export type ScheduledTask = {
  id: string;
  requiredGpus?: number;
  priority?: number;
  payload?: unknown;
};

export class GpuScheduler {
  private nodes = new Map<string, NodeInfo>();
  private queue: ScheduledTask[] = [];

  registerNode(node: NodeInfo) {
    this.nodes.set(node.id, node);
  }

  unregisterNode(nodeId: string) {
    this.nodes.delete(nodeId);
  }

  heartbeat(nodeId: string) {
    const n = this.nodes.get(nodeId);
    if (n) n.lastHeartbeat = Date.now();
  }

  enqueue(task: ScheduledTask) {
    this.queue.push(task);
    this.queue.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  scheduleNext(): { nodeId: string; task: ScheduledTask } | null {
    if (this.queue.length === 0) return null;
    const task = this.queue.shift()!;
    for (const node of this.nodes.values()) {
      if (node.available) {
        node.available = false; // 简化的分配示例
        return { nodeId: node.id, task };
      }
    }
    // 没有可用节点，重新入队并返回 null
    this.enqueue(task);
    return null;
  }
}
