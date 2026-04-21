# ============================================================
# Worker Image: nogl-worker-browser
# Playwright-capable workers.
# Hosts: meta-ads, homepage-capture (future: newsletter-signup)
# ============================================================

# Stage 1: install node deps
FROM node:22-bookworm AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Stage 2: generate Prisma client
FROM node:22-bookworm AS prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
RUN npx prisma generate

# Stage 3: install Playwright Chromium + runtime
# Use full bookworm (not slim) — Playwright needs many system libs
FROM node:22-bookworm AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
    # Chromium system deps (Playwright --with-deps covers most but listing key ones)
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libdbus-1-3 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 \
    libgbm1 libpango-1.0-0 libcairo2 libasound2 libatspi2.0-0 \
    fonts-liberation fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma

# Install Chromium binary into the image layer
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.playwright
RUN node_modules/.bin/playwright install chromium

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src/lib ./src/lib
COPY src/workers ./src/workers
COPY scripts/start-workers-browser.ts ./scripts/

ENV NODE_ENV=production
# IPC host mode is set in docker-compose (required for Chromium shared memory)

CMD ["node_modules/.bin/tsx", "--tsconfig", "tsconfig.json", "scripts/start-workers-browser.ts"]
