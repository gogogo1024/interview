import { t } from '../trpc';
import {
  CreateCallInputSchema,
  CreateCallOutputSchema,
  CallIdInputSchema,
  SubscribeOutputSchema,
  HangupOutputSchema,
} from '@coreflow/trpc-types';
import { forwardToVideoService } from '../../adapters/videoService';
import { parseUpstreamOrThrow } from '../helpers';

export const videoRouter = t.router({
  createCall: t.procedure.input(CreateCallInputSchema).mutation(async ({ input, ctx }) => {
    const res = await forwardToVideoService('createCall', input);
    return parseUpstreamOrThrow(res, CreateCallOutputSchema);
  }),

  hangup: t.procedure.input(CallIdInputSchema).mutation(async ({ input, ctx }) => {
    const res = await forwardToVideoService('hangup', input);
    return parseUpstreamOrThrow(res, HangupOutputSchema);
  }),

  subscribe: t.procedure.input(CallIdInputSchema).query(async ({ input, ctx }) => {
    const res = await forwardToVideoService('subscribe', input);
    return parseUpstreamOrThrow(res, SubscribeOutputSchema);
  }),
});

export default videoRouter;
