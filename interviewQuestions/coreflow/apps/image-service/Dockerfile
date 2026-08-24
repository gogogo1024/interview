# Simple Dockerfile for image-service (monorepo-aware)
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm for workspace installs
RUN npm install -g pnpm@8

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY ./*.md ./

# Copy only workspace files needed by builder step
COPY apps/image-service ./apps/image-service
COPY packages ./packages

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @coreflow/image-service build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/dist ./dist
CMD ["node", "dist/scheduler/main.js"]
