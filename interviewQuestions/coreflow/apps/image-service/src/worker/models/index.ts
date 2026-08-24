import { ModelManager } from '@coreflow/gpu-sdk';

export function createModelRegistry() {
  const mgr = new ModelManager();
  // 可在此预加载常用模型：mgr.loadModel('stable-diffusion-v1')
  return mgr;
}

export default createModelRegistry;
