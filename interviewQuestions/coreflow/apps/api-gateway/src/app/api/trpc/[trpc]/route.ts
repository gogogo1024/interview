import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../../../trpc/root';
import { createContext as createTrpcContext } from '../../../../trpc/context';

function headersFromReq(req: Request) {
  try {
    // @ts-ignore
    if (req?.headers?.entries) return Object.fromEntries((req as any).headers.entries());
    // @ts-ignore
    if (req?.headers) return (req as any).headers;
  } catch (_) {}
  return {} as Record<string, any>;
}

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter as any,
    createContext: async ({ req: incoming }: { req: Request }) => {
      const headers = headersFromReq(incoming ?? req);
      return createTrpcContext({ headers });
    },
    onError({ error }) {
      console.error('[tRPC]', (error as any)?.code, error.message);
    },
  });

export { handler as GET, handler as POST };

