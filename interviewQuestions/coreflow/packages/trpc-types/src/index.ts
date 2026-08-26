import type { ImageRouter } from './image.types';
import type { ModelRouter } from './model.types';
import type { VideoRouter } from './video.types';

// 全局 AppRouter 类型定义
export interface AppRouter {
  image: ImageRouter;
  model: ModelRouter;
  video: VideoRouter;
}

// 统一导出所有类型与Schema
export * from './image.types';
export * from './model.types';
export * from './video.types';
