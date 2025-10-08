# ============================================
# Multi-Stage Dockerfile for Next.js Application
# Optimized for caching and minimal rebuilds
# ============================================

# ============================================
# Stage 1: Base Dependencies
# This stage is cached unless package files change
# ============================================
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy only package files first for better caching
# If these don't change, this layer is reused
COPY package.json package-lock.json* ./

# Install dependencies
# This layer is cached unless package files change
RUN npm ci --legacy-peer-deps

# ============================================
# Stage 2: Prisma Setup
# Separate stage for Prisma generation
# ============================================
FROM node:18-alpine AS prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy only Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# ============================================
# Stage 3: Builder
# This stage builds the application
# Only rebuilds when source code changes
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy Prisma generated client
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma

# Copy application source
# These are copied last so changes here don't invalidate previous layers
COPY . .

# Set environment to production for optimal build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Public environment variables needed at build time (embedded in client bundle)
# These are build args that get passed in and become ENV vars
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_DOMAIN
ARG NEXT_PUBLIC_APP_SUBDOMAIN
ARG NEXT_PUBLIC_AUTH_SUBDOMAIN
ARG NEXT_PUBLIC_GHOST_URL
ARG NEXT_PUBLIC_GHOST_CONTENT_API_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_BUILDER_API_KEY
ARG NEXT_PUBLIC_GOOGLE_TAG_ID

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_DOMAIN=$NEXT_PUBLIC_DOMAIN
ENV NEXT_PUBLIC_APP_SUBDOMAIN=$NEXT_PUBLIC_APP_SUBDOMAIN
ENV NEXT_PUBLIC_AUTH_SUBDOMAIN=$NEXT_PUBLIC_AUTH_SUBDOMAIN
ENV NEXT_PUBLIC_GHOST_URL=$NEXT_PUBLIC_GHOST_URL
ENV NEXT_PUBLIC_GHOST_CONTENT_API_KEY=$NEXT_PUBLIC_GHOST_CONTENT_API_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_BUILDER_API_KEY=$NEXT_PUBLIC_BUILDER_API_KEY
ENV NEXT_PUBLIC_GOOGLE_TAG_ID=$NEXT_PUBLIC_GOOGLE_TAG_ID

# Build the application
# Next.js will output to .next directory with standalone mode
RUN npm run build

# ============================================
# Stage 4: Runner (Production)
# Minimal production image with only necessary files
# ============================================
FROM node:18-alpine AS runner

WORKDIR /app

# Install only necessary system dependencies
RUN apk add --no-cache openssl

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Runtime environment variables will be provided at container runtime
# These are NOT baked into the image - they come from docker-compose.yml or --env-file

# Copy necessary files from builder
# Copy public assets
COPY --from=builder /app/public ./public

# Copy Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files for runtime
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set the PORT environment variable
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check - Temporarily disabled to speed up container startup
# Uncomment when health endpoint is verified working
# HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the application
CMD ["node", "server.js"]
