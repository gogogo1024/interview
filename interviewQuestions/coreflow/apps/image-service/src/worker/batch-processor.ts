export type WorkUnit = { id: string; payload?: unknown };

export type BatchOptions = { maxBatchSize?: number; maxWaitMs?: number };

export class BatchProcessor {
  private queue: WorkUnit[] = [];
  private timer: NodeJS.Timeout | null = null;
  constructor(private handler: (units: WorkUnit[]) => Promise<void>, private opts: BatchOptions = {}) {}

  async add(unit: WorkUnit) {
    this.queue.push(unit);
    if (this.queue.length >= (this.opts.maxBatchSize ?? 4)) {
      await this.flush();
      return;
    }
    if (!this.timer) {
      this.timer = setTimeout(() => void this.flush(), this.opts.maxWaitMs ?? 50);
    }
  }

  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, this.queue.length);
    try {
      await this.handler(batch);
    } catch (err) {
      // 简单重试或记录，真实场景可做更多处理
      console.error('Batch handler error', err);
    }
  }
}
