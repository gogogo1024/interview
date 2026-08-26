import { createLogger } from '@coreflow/common-utils';

const logger = createLogger('image-service:activities');

export async function generateImage(payload: any): Promise<{ taskId: string }> {
  logger.info('generateImage called', payload);
  const taskId = `task_${Date.now()}`;
  // TODO: 调用推理/调度逻辑，持久化任务等
  return { taskId };
}

export const activities = { generateImage };
