import { createLogger } from '@coreflow/common-utils';

const logger = createLogger('image-service:workflow');

/**
 * 生成任务的工作流占位实现。
 * 实际工作流应在 Temporal 环境中注册并调用 activities。
 */
export async function imageGenWorkflow(taskId: string, params?: any) {
  logger.info('imageGenWorkflow start', { taskId });
  // TODO: 调用 activities 来完成任务生命周期（enqueue -> process -> persist）
  return { taskId } as const;
}

export default imageGenWorkflow;
