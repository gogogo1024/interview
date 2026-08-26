import { t } from '../trpc';
import {
  ImageGenerateInputSchema,
  ImageGenerateOutputSchema,
  TaskIdInputSchema,
  ImageTaskSchema,
} from '@coreflow/trpc-types';
import { forwardToImageService } from '../../adapters/imageService';
import { parseUpstreamOrThrow } from '../helpers';

export const imageRouter = t.router({
  generate: t.procedure.input(ImageGenerateInputSchema).mutation(async ({ input, ctx }) => {
    const res = await forwardToImageService('generate', input);
    return parseUpstreamOrThrow(res, ImageGenerateOutputSchema);
  }),

  getStatus: t.procedure.input(TaskIdInputSchema).query(async ({ input, ctx }) => {
    const res = await forwardToImageService('status', input);
    return parseUpstreamOrThrow(res, ImageTaskSchema);
  }),

  subscribe: t.procedure.input(TaskIdInputSchema).query(async ({ input, ctx }) => {
    const res = await forwardToImageService('status', input);
    return parseUpstreamOrThrow(res, ImageTaskSchema);
  }),
});

export default imageRouter;
