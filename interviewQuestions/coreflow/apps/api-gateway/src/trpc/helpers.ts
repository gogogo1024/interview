import { TRPCError } from '@trpc/server';

function mapStatusToCode(status?: number) {
  if (!status) return 'INTERNAL_SERVER_ERROR';
  if (status >= 500) return 'INTERNAL_SERVER_ERROR';
  if (status === 404) return 'NOT_FOUND';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status >= 400) return 'BAD_REQUEST';
  return 'INTERNAL_SERVER_ERROR';
}

export function parseUpstreamOrThrow<T = any>(res: any, schema?: { parse: (v: any) => T }): T {
  if (!res) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'no upstream response' });

  if (!res.ok) {
    const code = mapStatusToCode(res.status) as any;
    const message = res.error || (res.body ? JSON.stringify(res.body) : `status ${res.status}`);
    throw new TRPCError({ code: code as any, message });
  }

  if (schema) {
    try {
      return schema.parse(res.body);
    } catch (err) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'upstream response validation failed', cause: err });
    }
  }

  return res.body as T;
}

export default parseUpstreamOrThrow;
