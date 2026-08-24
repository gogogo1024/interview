FROM node:20-alpine
WORKDIR /app

# Enable corepack + pnpm when building inside container
RUN corepack enable && corepack prepare pnpm@latest --activate || true

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod || pnpm install --prod || true

# Copy source and build
COPY . .
RUN pnpm --filter @coreflow/api-gateway run build || true

CMD ["node", "dist/index.js"]
