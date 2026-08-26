export class InferenceEngine {
  /**
   * 占位的推理引擎实现：将输入批次回显为结果数组。
   */
  async runInference(batch: any[]): Promise<any[]> {
    return batch.map((it, i) => ({ index: i, ok: true }));
  }
}

export default InferenceEngine;
