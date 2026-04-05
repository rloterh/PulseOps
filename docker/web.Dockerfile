FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/config-eslint/package.json packages/config-eslint/package.json
COPY packages/config-prettier/package.json packages/config-prettier/package.json
COPY packages/config-typescript/package.json packages/config-typescript/package.json
COPY packages/env/package.json packages/env/package.json
COPY packages/supabase/package.json packages/supabase/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/utils/package.json packages/utils/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app ./
USER nextjs
EXPOSE 3000
CMD ["pnpm", "--filter", "@pulseops/web", "start"]
