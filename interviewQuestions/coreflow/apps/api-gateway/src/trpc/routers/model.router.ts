import { t } from '../trpc';
import { ModelListInputSchema, ModelGetInputSchema, ModelVersionSchema } from '@coreflow/trpc-types';
import { forwardToModelService } from '../../adapters/modelService';
import { parseUpstreamOrThrow } from '../helpers';

export const modelRouter = t.router({
  list: t.procedure.input(ModelListInputSchema).query(async ({ input, ctx }) => {
    const res = await forwardToModelService('models/list', input);
    return parseUpstreamOrThrow(res, ModelVersionSchema.array());
  }),

  get: t.procedure.input(ModelGetInputSchema).query(async ({ input, ctx }) => {
    const res = await forwardToModelService('models/get', input);
    return parseUpstreamOrThrow(res, ModelVersionSchema);
  }),
});

export default modelRouter;
