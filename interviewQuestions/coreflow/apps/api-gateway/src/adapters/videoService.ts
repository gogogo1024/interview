/**
 * Adapters 层负责把 API 请求转发到后端服务（tRPC / HTTP / gRPC / MQ）
 * 这里为 video-call-service 的占位转发逻辑。
 */
export async function forwardToVideoService(path: string, payload?: any) {
  // 占位：可替换为 HTTP 请求或内部 tRPC 客户端调用
  return { ok: true, path, payload };
}

export default forwardToVideoService;
