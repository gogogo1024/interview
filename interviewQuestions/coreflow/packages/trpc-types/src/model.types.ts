export type ModelInfo = {
  id: string;
  name: string;
  type: 'base' | 'lora' | 'adapter' | 'custom';
  version?: string;
  quantized?: boolean;
  sizeBytes?: number;
  tags?: string[];
  createdAt?: string; // ISO
  description?: string;
};

export type ModelListResponse = ModelInfo[];

export type ModelLoadRequest = {
  modelId: string;
  device?: 'cpu' | 'gpu';
  gpuDeviceId?: number;
  options?: Record<string, unknown>;
};

export type ModelLoadResponse = {
  success: boolean;
  message?: string;
  loadedOn?: string;
};
