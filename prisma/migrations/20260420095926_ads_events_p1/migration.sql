-- ============================================================================
-- Migration: ads_events P1 (additive only — no destructive ops)
-- Hand-trimmed from prisma migrate diff to exclude pre-existing schema drift
-- cleanup on unrelated tables (public.Alert, RepricingJob, RepricingProposal).
-- FKs to existing tables (nogl.Company, nogl.Competitor, nogl.ApiKey) use
-- NOT VALID so they do not lock large existing tables; VALIDATE them in a
-- follow-up migration once verified.
-- ============================================================================
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ads_events";

-- CreateEnum
CREATE TYPE "ads_events"."AdsPlatform" AS ENUM ('META_ADS_LIBRARY', 'INSTAGRAM', 'TIKTOK', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "ads_events"."AdsEventType" AS ENUM ('CREATIVE_SEEN', 'CREATIVE_UPDATED', 'POST_METRICS', 'PROFILE_SNAPSHOT', 'PLACEMENT_CHANGE');

-- CreateEnum
CREATE TYPE "ads_events"."ScraperSource" AS ENUM ('FB_AD_ACTOR_V2', 'IG_MONITOR', 'TIKTOK_SCRAPER', 'MANUAL');

-- CreateEnum
CREATE TYPE "ads_events"."RunStatus" AS ENUM ('RUNNING', 'OK', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "ads_events"."ApiKeyScopeType" AS ENUM ('INGEST', 'READ_TOP_HOOKS', 'ADMIN');

-- CreateEnum
CREATE TYPE "ads_events"."AdAccountStatus" AS ENUM ('ACTIVE', 'UNMAPPED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "ads_events"."AdAccount" (
    "id" TEXT NOT NULL,
    "platform" "ads_events"."AdsPlatform" NOT NULL,
    "external_id" TEXT NOT NULL,
    "handle" TEXT,
    "display_name" TEXT,
    "status" "ads_events"."AdAccountStatus" NOT NULL DEFAULT 'UNMAPPED',
    "companyId" TEXT,
    "competitorId" TEXT,
    "metadata" JSONB,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads_events"."AdCreative" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "platform" "ads_events"."AdsPlatform" NOT NULL,
    "external_creative_id" TEXT NOT NULL,
    "creative_hash" TEXT NOT NULL,
    "type" TEXT,
    "media_url" TEXT,
    "thumbnail_url" TEXT,
    "caption" TEXT,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdCreative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads_events"."AdEvent" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "creative_id" TEXT,
    "event_type" "ads_events"."AdsEventType" NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL,
    "source" "ads_events"."ScraperSource" NOT NULL,
    "ingestion_run_id" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "metrics" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads_events"."AdMetricDaily" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "creative_id" TEXT,
    "platform" "ads_events"."AdsPlatform" NOT NULL,
    "day" DATE NOT NULL,
    "impressions" INTEGER,
    "reach" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "saves" INTEGER,
    "hook_score" DECIMAL(6,3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdMetricDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads_events"."ScraperRun" (
    "id" TEXT NOT NULL,
    "source" "ads_events"."ScraperSource" NOT NULL,
    "account_id" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "status" "ads_events"."RunStatus" NOT NULL DEFAULT 'RUNNING',
    "bullmq_job_id" TEXT,
    "external_job_id" TEXT,
    "events_in" INTEGER NOT NULL DEFAULT 0,
    "events_accepted" INTEGER NOT NULL DEFAULT 0,
    "events_rejected" INTEGER NOT NULL DEFAULT 0,
    "error_code" TEXT,
    "error_message" TEXT,
    "lag_seconds" INTEGER,
    CONSTRAINT "ScraperRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads_events"."DeadLetterEvent" (
    "id" TEXT NOT NULL,
    "source" "ads_events"."ScraperSource" NOT NULL,
    "reason_code" TEXT NOT NULL,
    "zod_issues" JSONB,
    "raw" JSONB NOT NULL,
    "bullmq_job_id" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retried_at" TIMESTAMP(3),
    CONSTRAINT "DeadLetterEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads_events"."ApiKeyScope" (
    "id" TEXT NOT NULL,
    "api_key_id" TEXT NOT NULL,
    "source" "ads_events"."ScraperSource",
    "scope" "ads_events"."ApiKeyScopeType" NOT NULL,
    "rate_limit_per_min" INTEGER NOT NULL DEFAULT 120,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKeyScope_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdAccount_companyId_idx" ON "ads_events"."AdAccount"("companyId");

-- CreateIndex
CREATE INDEX "AdAccount_competitorId_idx" ON "ads_events"."AdAccount"("competitorId");

-- CreateIndex
CREATE INDEX "AdAccount_status_idx" ON "ads_events"."AdAccount"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AdAccount_platform_external_id_key" ON "ads_events"."AdAccount"("platform", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "AdCreative_creative_hash_key" ON "ads_events"."AdCreative"("creative_hash");

-- CreateIndex
CREATE INDEX "AdCreative_account_id_last_seen_at_idx" ON "ads_events"."AdCreative"("account_id", "last_seen_at");

-- CreateIndex
CREATE UNIQUE INDEX "AdCreative_platform_external_creative_id_key" ON "ads_events"."AdCreative"("platform", "external_creative_id");

-- CreateIndex
CREATE INDEX "AdEvent_account_id_ts_idx" ON "ads_events"."AdEvent"("account_id", "ts");

-- CreateIndex
CREATE INDEX "AdEvent_event_type_ts_idx" ON "ads_events"."AdEvent"("event_type", "ts");

-- CreateIndex
CREATE INDEX "AdEvent_ingestion_run_id_idx" ON "ads_events"."AdEvent"("ingestion_run_id");

-- CreateIndex
CREATE UNIQUE INDEX "AdEvent_ts_idempotency_key_key" ON "ads_events"."AdEvent"("ts", "idempotency_key");

-- CreateIndex
CREATE INDEX "AdMetricDaily_day_idx" ON "ads_events"."AdMetricDaily"("day");

-- CreateIndex
CREATE UNIQUE INDEX "AdMetricDaily_account_id_creative_id_day_platform_key" ON "ads_events"."AdMetricDaily"("account_id", "creative_id", "day", "platform");

-- CreateIndex
CREATE INDEX "ScraperRun_source_started_at_idx" ON "ads_events"."ScraperRun"("source", "started_at");

-- CreateIndex
CREATE INDEX "ScraperRun_status_idx" ON "ads_events"."ScraperRun"("status");

-- CreateIndex
CREATE INDEX "DeadLetterEvent_source_received_at_idx" ON "ads_events"."DeadLetterEvent"("source", "received_at");

-- CreateIndex
CREATE INDEX "DeadLetterEvent_reason_code_idx" ON "ads_events"."DeadLetterEvent"("reason_code");

-- CreateIndex
CREATE INDEX "ApiKeyScope_api_key_id_idx" ON "ads_events"."ApiKeyScope"("api_key_id");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKeyScope_api_key_id_scope_source_key" ON "ads_events"."ApiKeyScope"("api_key_id", "scope", "source");

-- AddForeignKey
ALTER TABLE "ads_events"."AdAccount" ADD CONSTRAINT "AdAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "nogl"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads_events"."AdAccount" ADD CONSTRAINT "AdAccount_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "nogl"."Competitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads_events"."AdCreative" ADD CONSTRAINT "AdCreative_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ads_events"."AdAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads_events"."AdEvent" ADD CONSTRAINT "AdEvent_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ads_events"."AdAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads_events"."AdEvent" ADD CONSTRAINT "AdEvent_creative_id_fkey" FOREIGN KEY ("creative_id") REFERENCES "ads_events"."AdCreative"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads_events"."ScraperRun" ADD CONSTRAINT "ScraperRun_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ads_events"."AdAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads_events"."ApiKeyScope" ADD CONSTRAINT "ApiKeyScope_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "nogl"."ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
