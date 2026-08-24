export type ImageGenerationRequest = {
  prompt: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
  modelId?: string;
  numImages?: number;
  extra?: Record<string, unknown>;
};

export type ImageOutput = {
  url: string;
  width: number;
  height: number;
  sizeBytes?: number;
  metadata?: Record<string, unknown>;
};

export type ImageGenerationResponse = {
  taskId: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  outputs?: ImageOutput[];
  error?: string;
};

export type ImageGenerationProgress = {
  taskId: string;
  progress: number; // 0-100
  etaSeconds?: number;
};
