// 示例 Temporal 工作流（骨架）
import { WorkflowBase } from '@coreflow/temporal-common';

export async function imageGenWorkflow(input: any) {
  // 真实实现应使用 Temporal 的 workflow/activities 调用语法。
  // 这里返回一个占位对象，便于在 worker/测试中引用。
  return {
    taskId: `img-${Date.now()}`,
    status: 'queued',
    input,
  };
}

export default imageGenWorkflow;
