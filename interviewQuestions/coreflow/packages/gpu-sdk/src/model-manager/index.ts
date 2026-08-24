export type LoadedModel = {
  modelId: string;
  path?: string;
  loadedAt: string;
};

// # 模型/LoRA 注册、版本管理、元数据
export class ModelManager {
  private loaded = new Map<string, LoadedModel>();

  async loadModel(modelId: string, path?: string) {
    const entry: LoadedModel = { modelId, path, loadedAt: new Date().toISOString() };
    this.loaded.set(modelId, entry);
    return entry;
  }

  async unloadModel(modelId: string) {
    return this.loaded.delete(modelId);
  }

  async mountLoRA(modelId: string, loraPath: string) {
    // 占位：将 LoRA 挂载到已加载模型上
    return { success: true };
  }

  listLoaded() {
    return Array.from(this.loaded.values());
  }
}
