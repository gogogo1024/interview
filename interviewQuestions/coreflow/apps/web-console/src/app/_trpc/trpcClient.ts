/**
 * 简单占位 tRPC 客户端 util，用于前端调用 `api/trpc` 路由。
 * 若要使用真正的 @trpc/client，请替换为相应实现。
 */
export async function trpcFetch(path: string, input?: any) {
  const url = `/api/trpc/${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input ?? {}),
  });
  if (!res.ok) throw new Error(`trpc request failed: ${res.status}`);
  return res.json();
}

export default trpcFetch;
