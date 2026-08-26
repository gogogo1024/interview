import { initTRPC } from '@trpc/server';
import type { RequestContext } from './context';

// tRPC 初始化器，所有 router 都应从这里的 `t` 创建
export const t = initTRPC.context<RequestContext>().create();

export type TRPCContext = RequestContext;

export default t;
