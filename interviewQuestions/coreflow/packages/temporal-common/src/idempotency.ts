import { createHash } from 'crypto';

function sortObject(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortObject);
  const out: any = {};
  for (const k of Object.keys(obj).sort()) {
    out[k] = sortObject(obj[k]);
  }
  return out;
}

export function generateIdempotencyKey(payload: any): string {
  const normalized = typeof payload === 'string' ? payload : JSON.stringify(sortObject(payload));
  return createHash('sha256').update(normalized).digest('hex');
}

export interface IdempotencyStore<T = any> {
  set(key: string, value: T, ttlMs?: number): Promise<void>;
  get(key: string): Promise<T | undefined>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
}

/**
 * In-memory store (only for testing / single-process non-production use).
 */
export class InMemoryIdempotencyStore<T = any> implements IdempotencyStore<T> {
  private store = new Map<string, { value: T; expiresAt?: number }>();
  constructor(private defaultTtlMs = 5 * 60 * 1000) {}

  async set(key: string, value: T, ttlMs?: number) {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.store.set(key, { value, expiresAt });
  }

  async get(key: string) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  async has(key: string) {
    return (await this.get(key)) !== undefined;
  }

  async delete(key: string) {
    this.store.delete(key);
  }
}

/**
 * Redis-backed idempotency store. Requires `ioredis` to be installed.
 */
export class RedisIdempotencyStore<T = any> implements IdempotencyStore<T> {
  private client: any;
  constructor(private redisUrl?: string) {}

  private async ensureClient() {
    if (this.client) return;
    try {
      const mod = await import('ioredis');
      const Redis: any = (mod.default ?? mod);
      this.client = new Redis(this.redisUrl);
    } catch (err) {
      throw new Error('ioredis is not installed; install with `pnpm add ioredis`');
    }
  }

  async set(key: string, value: T, ttlMs?: number) {
    await this.ensureClient();
    const str = JSON.stringify(value);
    if (ttlMs) {
      await this.client.set(key, str, 'PX', ttlMs);
    } else {
      await this.client.set(key, str);
    }
  }

  async get(key: string) {
    await this.ensureClient();
    const v = await this.client.get(key);
    if (v == null) return undefined;
    try {
      return JSON.parse(v) as T;
    } catch {
      return v as unknown as T;
    }
  }

  async has(key: string) {
    return (await this.get(key)) !== undefined;
  }

  async delete(key: string) {
    await this.ensureClient();
    await this.client.del(key);
  }
}

/**
 * Prisma-backed idempotency store. Requires `@coreflow/prisma-models` to have the
 * `Idempotency` model (see packages/prisma-models/prisma/schema.prisma) and the
 * Prisma Client to be generated.
 */
export class PrismaIdempotencyStore<T = any> implements IdempotencyStore<T> {
  private prismaClient: any | undefined;
  constructor(prismaClient?: any) {
    this.prismaClient = prismaClient;
  }

  private async prisma() {
    if (this.prismaClient) return this.prismaClient;
    try {
      const mod = await import('@coreflow/prisma-models');
      // Prefer explicit async initializer if available (strict API)
      const anyMod: any = mod;
      if (typeof anyMod.initPrismaClient === 'function') {
        this.prismaClient = await anyMod.initPrismaClient();
      } else {
        // Backwards-compatible fallback: default export / named `prisma` / module itself
        const p = anyMod.default ?? anyMod.prisma ?? anyMod;
        this.prismaClient = p;
      }
      return this.prismaClient;
    } catch (err) {
      throw new Error('Prisma client not available. Run prisma generate in packages/prisma-models');
    }
  }

  async set(key: string, value: T, ttlMs?: number) {
    const prisma = await this.prisma();
    const expiresAt = ttlMs ? new Date(Date.now() + ttlMs) : null;
    await prisma.idempotency.upsert({
      where: { key },
      update: { value: value as any, expiresAt },
      create: { key, value: value as any, expiresAt },
    });
  }

  async get(key: string) {
    const prisma = await this.prisma();
    const row = await prisma.idempotency.findUnique({ where: { key } });
    if (!row) return undefined;
    if (row.expiresAt && row.expiresAt < new Date()) {
      await prisma.idempotency.delete({ where: { key } });
      return undefined;
    }
    return row.value as T;
  }

  async has(key: string) {
    return (await this.get(key)) !== undefined;
  }

  async delete(key: string) {
    const prisma = await this.prisma();
    await prisma.idempotency.deleteMany({ where: { key } });
  }
}
