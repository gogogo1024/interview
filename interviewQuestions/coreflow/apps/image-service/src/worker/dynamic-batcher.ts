export class DynamicBatcher<T> {
  private buffer: T[] = [];
  private timer?: NodeJS.Timeout;

  constructor(private maxBatch = 8, private flushMs = 50, private flushFn: (batch: T[]) => Promise<void> | void = async () => {}) {
    this.timer = setInterval(() => this.flush().catch(() => {}), this.flushMs);
  }

  add(item: T) {
    this.buffer.push(item);
    if (this.buffer.length >= this.maxBatch) this.flush().catch(() => {});
  }

  async flush() {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0);
    await this.flushFn(batch);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }
}

export default DynamicBatcher;
