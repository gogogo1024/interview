/**
 * 简单的 router 注册点：占位，方便后续把具体业务 router 挂载进来
 */
import { t } from './trpc';
import { imageRouter } from './routers/image.router';
import { modelRouter } from './routers/model.router';
import { videoRouter } from './routers/video.router';

export const appRouter = t.router({
  image: imageRouter,
  model: modelRouter,
  video: videoRouter,
});

export type AppRouter = typeof appRouter;

export default appRouter;
