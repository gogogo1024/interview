export async function submitImageTask(payload: any) {
  // 将任务写入 DB / 任务队列
  return { taskId: `task-${Date.now()}` };
}

export async function checkTaskStatus(taskId: string) {
  // 查询任务状态
  return { taskId, status: 'succeeded' };
}

export async function storeResult(taskId: string, result: any) {
  // 持久化输出
  return true;
}

export default { submitImageTask, checkTaskStatus, storeResult };
