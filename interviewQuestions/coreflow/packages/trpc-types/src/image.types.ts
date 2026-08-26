import { z } from "zod";

// 状态枚举（用于内部任务表示）
export const ImageTaskStatusSchema = z.enum([
  "pending",
  "queued",
  "processing",
  "succeeded",
  "failed",
]);
export type ImageTaskStatus = z.infer<typeof ImageTaskStatusSchema>;

// 提交任务入参（Zod schema + TS 类型）
export const ImageGenerateInputSchema = z.object({
  prompt: z.string().min(1).max(2000),
  negative_prompt: z.string().optional(),
  width: z.number().int().min(256).max(2048).default(1024),
  height: z.number().int().min(256).max(2048).default(1024),
  steps: z.number().int().min(10).max(50).default(30),
  model: z.enum(["base-xl", "base-v2"]).default("base-xl"),
  lora_id: z.string().optional(),
  priority: z.enum(["high", "normal", "low"]).default("normal"),
  client_request_id: z.string().optional(),
});
export type ImageGenerateInput = z.infer<typeof ImageGenerateInputSchema>;
// 输出项与任务返回（普通 TS 类型，保持对外契约稳定）
export type ImageOutput = {
  url: string;
  width: number;
  height: number;
  sizeBytes?: number;
  metadata?: Record<string, unknown>;
};

export type ImageGenerationResponse = {
  taskId: string;
  status: "queued" | "running" | "succeeded" | "failed";
  outputs?: ImageOutput[];
  error?: string;
};

export type ImageGenerationProgress = {
  taskId: string;
  progress: number; // 0-100
  etaSeconds?: number;
};

// 任务返回结构（内部 DB / worker 使用的 schema）
export const ImageTaskSchema = z.object({
  task_id: z.string(),
  status: ImageTaskStatusSchema,
  image_url: z.string().optional(),
  error: z.string().optional(),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
});
export type ImageTask = z.infer<typeof ImageTaskSchema>;

// Router 输入/输出 schema
export const ImageGenerateOutputSchema = z.object({
  task_id: z.string(),
  status: ImageTaskStatusSchema,
});
export type ImageGenerateOutput = z.infer<typeof ImageGenerateOutputSchema>;

export const TaskIdInputSchema = z.object({ task_id: z.string() });
export type TaskIdInput = z.infer<typeof TaskIdInputSchema>;

// 图像模块路由类型定义（基于 Zod schema）
export interface ImageRouter {
  generate: {
    input: ImageGenerateInput;
    output: ImageGenerateOutput;
  };
  getStatus: {
    input: TaskIdInput;
    output: ImageTask;
  };
  subscribe: {
    input: TaskIdInput;
    output: ImageTask;
  };
}
