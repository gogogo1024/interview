import { PrismaClient } from '@prisma/client';

// Re-export generated Prisma types so downstream packages can import model types.
export type {
  PrismaClient,
  Prisma,
  User,
  ModelInfo,
  ImageTask,
  VideoCallSession,
  Participant,
  Idempotency,
} from '@prisma/client';

// 扩展全局类型，开发环境缓存单例避免热重载重复创建
declare global {
  // eslint-disable-next-line no-var
  var __prismaClientSingleton: PrismaClient | undefined;
}

/**
 * PrismaClient 单例工厂
 * 开发环境：globalThis 缓存，Next.js 热重载不会重复创建连接
 * 生产环境：模块级单例，复用连接池
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

// 模块级单例（生产环境直接使用）
const prisma = globalThis.__prismaClientSingleton ?? createPrismaClient();

// 开发环境挂载到全局，热重载复用实例
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaClientSingleton = prisma;
}

// 导出单例客户端
export { prisma };

// 按需导出业务模型类型，所有 apps 统一从这里引入
// export type { User, ImageTask, ModelVersion, VideoSession } from '@prisma/client';
