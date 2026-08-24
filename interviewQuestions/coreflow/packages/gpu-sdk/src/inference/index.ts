export interface InferenceRequest {
  input: unknown;
  options?: Record<string, unknown>;
}

export interface InferenceResult {
  outputs: unknown[];
  metadata?: Record<string, unknown>;
}

export interface InferenceEngine {
  warmup?(opts?: unknown): Promise<void>;
  infer(req: InferenceRequest): Promise<InferenceResult>;
  shutdown?(): Promise<void>;
}

export class TensorRTInference implements InferenceEngine {
  constructor(private opts?: unknown) {}
  async warmup() {
    // noop
  }
  async infer(_req: InferenceRequest) {
    return { outputs: [], metadata: { note: 'stub' } };
  }
  async shutdown() {
    // noop
  }
}
