export abstract class WorkflowBase<Input = unknown, Output = unknown> {
  protected client: any;
  constructor(client: any) {
    this.client = client;
  }

  // 子类必须实现 run
  abstract run(input: Input): Promise<Output>;

  // 简单的子任务执行助手（可被重写）
  protected async executeActivity<T = any>(fn: () => Promise<T>, retries = 3): Promise<T> {
    let lastErr: any;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        // 这里不做复杂退避，子类或外部可结合 retry.ts 使用
        await new Promise((r) => setTimeout(r, 100 * (i + 1)));
      }
    }
    throw lastErr;
  }
}
