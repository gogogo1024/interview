export type WorkUnit = { id: string; payload?: unknown };

export abstract class GpuWorker {
  protected id: string;
  constructor(id: string) {
    this.id = id;
  }
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract handleBatch(units: WorkUnit[]): Promise<void>;
}

export class SimpleGpuWorker extends GpuWorker {
  private running = false;
  constructor(id: string) {
    super(id);
  }
  async start() {
    this.running = true;
  }
  async stop() {
    this.running = false;
  }
  async handleBatch(units: WorkUnit[]) {
    // 占位逻辑：逐个处理或聚合
    await Promise.resolve();
  }
}
