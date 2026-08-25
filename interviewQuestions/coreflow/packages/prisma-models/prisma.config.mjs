import { defineConfig } from 'prisma/config';

// Prisma 7 config: keep URL in the runtime config, not in the schema.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasources: {
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
});
