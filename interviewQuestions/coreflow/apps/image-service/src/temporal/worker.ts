import { createLogger } from '@coreflow/common-utils';

const logger = createLogger('image-service:temporal');

/**
 * 启动 Temporal Worker 的占位实现。
 * 请在需要时替换为真实的 @temporalio/worker 实例启动代码。
 */
export async function startTemporalWorker() {
  logger.info('startTemporalWorker (stub)');
  // TODO: 启动 Temporal Worker
}

export default startTemporalWorker;
