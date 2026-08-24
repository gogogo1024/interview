// Next App Router route for tRPC entrypoint (placeholder implementation)
import { createTRPCHandler } from '../init';

const handler = createTRPCHandler();

export async function POST(req: any): Promise<Response> {
  const r = await handler.handle(req);
  return new Response(typeof r.body === 'string' ? r.body : JSON.stringify(r.body), {
    status: r.status ?? 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export async function GET(): Promise<Response> {
  return new Response('Method Not Allowed', { status: 405 });
}
