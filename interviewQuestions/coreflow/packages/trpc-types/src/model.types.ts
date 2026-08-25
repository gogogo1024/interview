import { z } from 'zod';

// 模型类型与信息
export const ModelTypeSchema = z.enum(["base", "lora", "adapter", "custom"]);
export type ModelType = z.infer<typeof ModelTypeSchema>;

export const ModelInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ModelTypeSchema,
  version: z.string().optional(),
  quantized: z.boolean().optional(),
  sizeBytes: z.number().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  description: z.string().optional(),
});
export type ModelInfo = z.infer<typeof ModelInfoSchema>;
export type ModelListResponse = ModelInfo[];

// 模型加载请求/响应（保持简单 TS 类型）
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

// 模型版本 schema
export const ModelVersionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ModelTypeSchema,
  base_model: z.string().optional(),
  status: z.enum(['draft', 'testing', 'canary', 'production', 'deprecated']),
  created_at: z.string().datetime(),
});
export type ModelVersion = z.infer<typeof ModelVersionSchema>;

export interface ModelRouter {
  list: {
    input: { type?: ModelType; status?: string };
    output: ModelVersion[];
  };
  get: {
    input: { model_id: string };
    output: ModelVersion;
  };
}

// Router schemas
export const ModelListInputSchema = z.object({
  type: ModelTypeSchema.optional(),
  status: z.string().optional(),
});
export type ModelListInput = z.infer<typeof ModelListInputSchema>;

export const ModelGetInputSchema = z.object({ model_id: z.string() });
export type ModelGetInput = z.infer<typeof ModelGetInputSchema>;

