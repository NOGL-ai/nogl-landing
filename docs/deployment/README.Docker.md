# Docker Deployment Guide

This guide covers how to build and run the application using Docker with optimized caching and multi-stage builds.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Docker Files Overview](#docker-files-overview)
- [Environment Setup](#environment-setup)
- [Building the Image](#building-the-image)
- [Running the Application](#running-the-application)
- [Development Mode](#development-mode)
- [Production Deployment](#production-deployment)
- [Caching Strategy](#caching-strategy)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### 1. Setup Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
# At minimum, set these required variables:
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET
# - DATABASE_URL
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
```

### 2. Build and Run with Docker Compose

```bash
# Production mode
docker-compose up -d

# Development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up
```

### 3. Access the Application

- Application: http://localhost:3000
- Database: localhost:5432

## 📁 Docker Files Overview

### `Dockerfile` - Production (Multi-Stage)

4-stage optimized build:
1. **deps** - Install Node dependencies (cached when package.json unchanged)
2. **prisma** - Generate Prisma client (cached when schema.prisma unchanged)
3. **builder** - Build Next.js application (cached when source code unchanged)
4. **runner** - Minimal production image (~200MB)

### `Dockerfile.dev` - Development

Single-stage build with:
- Hot reload support
- All dev dependencies
- Volume mounting for instant code changes

### `.dockerignore`

Excludes unnecessary files from Docker context:
- node_modules (installed in container)
- Tests and coverage
- Documentation
- IDE configurations
- Git files

## 🔧 Environment Setup

### Required Environment Variables

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
DATABASE_URL=postgresql://postgres:postgres@db:5432/nogl_db
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
NEXT_PUBLIC_DOMAIN=localhost:3000
```

### Generate Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use online generator
# https://generate-secret.vercel.app/32
```

## 🏗️ Building the Image

### Build Production Image

```bash
# Basic build
docker build -t nogl-landing:latest .

# Build with BuildKit for better caching
DOCKER_BUILDKIT=1 docker build -t nogl-landing:latest .

# Build specific stage (for debugging)
docker build --target builder -t nogl-landing:builder .
```

### Build Development Image

```bash
docker build -f Dockerfile.dev -t nogl-landing:dev .
```

## 🏃 Running the Application

### Option 1: Docker Compose (Recommended)

```bash
# Start all services (app + database)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### Option 2: Docker Run (Manual)

```bash
# Run PostgreSQL database
docker run -d \
  --name nogl-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nogl_db \
  -p 5432:5432 \
  postgres:16-alpine

# Run application
docker run -d \
  --name nogl-app \
  -p 3000:3000 \
  --link nogl-db:db \
  --env-file .env \
  nogl-landing:latest
```

## 💻 Development Mode

### Start Development Environment

```bash
# Start dev server with hot reload
docker-compose -f docker-compose.dev.yml up

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build
```

### Features in Development Mode:

- ✅ Hot reload on code changes
- ✅ Source maps enabled
- ✅ All dev dependencies available
- ✅ Volume mounting for instant updates
- ✅ Debug-friendly

### Run Database Migrations

```bash
# Generate Prisma client
docker-compose exec app-dev npx prisma generate

# Push schema changes
docker-compose exec app-dev npx prisma db push

# Run migrations
docker-compose exec app-dev npx prisma migrate deploy
```

## 🚀 Production Deployment

### Deploy to Cloud Providers

#### AWS ECR + ECS

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL

# Tag and push
docker tag nogl-landing:latest YOUR_ECR_URL/nogl-landing:latest
docker push YOUR_ECR_URL/nogl-landing:latest
```

#### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT/nogl-landing

# Deploy
gcloud run deploy nogl-landing \
  --image gcr.io/YOUR_PROJECT/nogl-landing \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure Container Instances

```bash
# Login to Azure
az acr login --name YOUR_REGISTRY

# Tag and push
docker tag nogl-landing:latest YOUR_REGISTRY.azurecr.io/nogl-landing:latest
docker push YOUR_REGISTRY.azurecr.io/nogl-landing:latest
```

### Environment Variables for Production

Update your `.env` file:

```env
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
DATABASE_URL=postgresql://user:password@production-host:5432/nogl_prod
```

## 🎯 Caching Strategy

### How Caching Works

The Dockerfile is optimized to maximize Docker layer caching:

1. **Package Dependencies** (Layer 1)
   - Changes only when `package.json` or `package-lock.json` changes
   - Most stable layer - rarely changes

2. **Prisma Generation** (Layer 2)
   - Changes only when `prisma/schema.prisma` changes
   - Cached separately from source code

3. **Source Code** (Layer 3)
   - Changes when any `.ts`, `.tsx`, `.js`, `.jsx` files change
   - Most frequently changing layer

4. **Build Output** (Layer 4)
   - Only rebuild when source code changes
   - Next.js uses incremental builds when possible

### Optimizing Build Times

```bash
# Use BuildKit for parallel builds
export DOCKER_BUILDKIT=1

# Use build cache from previous builds
docker build --cache-from nogl-landing:latest -t nogl-landing:latest .

# Multi-platform builds
docker buildx build --platform linux/amd64,linux/arm64 -t nogl-landing:latest .
```

### What Triggers Rebuilds?

| Change | Layers Rebuilt | Time Impact |
|--------|----------------|-------------|
| Code only | Build layer only | ~30-60s |
| package.json | Dependencies + Build | ~2-3 min |
| Prisma schema | Prisma + Build | ~1-2 min |
| Dockerfile | All layers | ~3-5 min |

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Use different port
docker-compose up -p 3001:3000
```

#### 2. Database Connection Failed

```bash
# Check if database is running
docker-compose ps

# View database logs
docker-compose logs db

# Test connection
docker-compose exec db psql -U postgres -d nogl_db -c "SELECT 1"
```

#### 3. Build Fails - Out of Memory

```bash
# Increase Docker memory limit (Docker Desktop)
# Settings > Resources > Memory > 4GB+

# Or use swap
docker build --memory 4g --memory-swap 8g -t nogl-landing:latest .
```

#### 4. Prisma Client Not Generated

```bash
# Rebuild from scratch
docker-compose build --no-cache app

# Or generate manually
docker-compose exec app npx prisma generate
```

#### 5. Environment Variables Not Loading

```bash
# Verify .env file exists
ls -la .env

# Check variables are loaded
docker-compose config

# Restart with new env vars
docker-compose down
docker-compose up -d
```

### Health Checks

```bash
# Check application health
curl http://localhost:3000/api/health

# View container health status
docker-compose ps

# View detailed health logs
docker inspect nogl-landing-app | jq '.[0].State.Health'
```

### Performance Monitoring

```bash
# View resource usage
docker stats

# View container logs
docker-compose logs -f --tail=100

# Access container shell
docker-compose exec app sh
```

### Clean Up

```bash
# Remove stopped containers
docker-compose down

# Remove volumes (CAUTION: deletes data)
docker-compose down -v

# Remove images
docker rmi nogl-landing:latest

# Prune everything (free up space)
docker system prune -a --volumes
```

## 📊 Image Size Optimization

The production image is optimized for minimal size:

- Base: `node:18-alpine` (~120MB)
- Dependencies: Only production deps
- Multi-stage: Removes build artifacts
- Final image: ~200-300MB

Compare to non-optimized builds (~1-2GB).

## 🔒 Security Best Practices

1. ✅ Non-root user in production
2. ✅ Minimal base image (Alpine)
3. ✅ No development dependencies in production
4. ✅ Health checks enabled
5. ✅ Environment variables not baked into image
6. ✅ .dockerignore prevents leaking sensitive files

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Prisma in Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Rebuild from scratch: `docker-compose build --no-cache`
4. Check the main README.md for application-specific setup

---

**Happy Dockerizing! 🐳**

