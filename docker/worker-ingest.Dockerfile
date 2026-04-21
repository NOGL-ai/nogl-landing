# ============================================================
# Worker Image: nogl-worker-ingest
# Data-only workers — no browser deps.
# Two containers use this image with different commands:
#   worker-ingest: tsx src/lib/queues/workers/ingest.worker.ts
#   worker-data:   tsx scripts/start-workers-data.ts
# ============================================================

# Stage 1: install deps
FROM node:22-bookworm-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Stage 2: generate Prisma client
FROM node:22-bookworm-slim AS prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
RUN npx prisma generate

# Stage 3: runtime
FROM node:22-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src/lib ./src/lib
COPY src/workers ./src/workers
# Both entry scripts — each container picks one via compose `command:`
COPY scripts/start-workers-data.ts ./scripts/

ENV NODE_ENV=production

# Default CMD (overridden per-container in docker-compose.workers.yml)
CMD ["node_modules/.bin/tsx", "--tsconfig", "tsconfig.json", "src/lib/queues/workers/ingest.worker.ts"]
