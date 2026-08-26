import { z } from 'zod';

export function validateWithZod<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}
