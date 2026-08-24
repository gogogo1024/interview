export type TemporalOptions = {
  namespace?: string;
  address?: string;
  [key: string]: any;
};

export class TemporalClient {
  private _client: any | null = null;
  constructor(private options: TemporalOptions = {}) {}

  // 延迟初始化客户端（尝试动态导入 @temporalio/client）
  async connect(): Promise<any> {
    if (this._client) return this._client;
    try {
      const mod = await import('@temporalio/client');
      // 支持不同版本的导出形态：Client 或 Connection + WorkflowClient
      if (mod.Client) {
        this._client = new mod.Client(this.options);
      } else if (mod.Connection && mod.WorkflowClient) {
        const conn = await mod.Connection.connect(this.options);
        this._client = new mod.WorkflowClient({ connection: conn, namespace: this.options.namespace });
      } else {
        // fallback：直接返回模块（供测试或 mock 使用）
        this._client = mod;
      }
    } catch (err) {
      // 如果动态导入失败，保留 null，并在调用处提示
      this._client = null;
    }
    return this._client;
  }

  async startWorkflow(workflow: string | any, args: any[] = [], opts: any = {}) {
    const c = await this.connect();
    if (!c) throw new Error('Temporal client not available — please install @temporalio/client');
    // 尝试常见 API 形态
    if (c.workflow && typeof c.workflow.start === 'function') {
      return c.workflow.start(workflow, { args, ...opts });
    }
    if (typeof c.start === 'function') {
      return c.start(workflow, ...args);
    }
    throw new Error('Unsupported Temporal client API shape');
  }

  async getHandle() {
    const c = await this.connect();
    if (!c) throw new Error('Temporal client not available');
    return c;
  }

  async close() {
    if (!this._client) return;
    if (typeof this._client.close === 'function') await this._client.close();
    this._client = null;
  }
}
