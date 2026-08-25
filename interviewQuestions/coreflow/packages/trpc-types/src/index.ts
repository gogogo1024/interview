import type { ImageRouter } from './image.types.js';
import type { ModelRouter } from './model.types.js';
import type { VideoRouter } from './video.types.js';

// 全局 AppRouter 类型定义
export interface AppRouter {
  image: ImageRouter;
  model: ModelRouter;
  video: VideoRouter;
}

// 统一导出所有类型与Schema
export * from './image.types.js';
export * from './model.types.js';
export * from './video.types.js';
