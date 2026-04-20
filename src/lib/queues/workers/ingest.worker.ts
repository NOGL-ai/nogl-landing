/**
 * Ingest worker — BullMQ consumer for the ads-events:ingest queue.
 *
 * Runs as its own PM2 process on CT 504. One process, concurrency 4.
 *
 * Idempotency: layered defense.
 *   1. BullMQ jobId (= envelope.idempotency_key for first event) — skips
 *      re-enqueue while the job is still in retention (7d for completed).
 *   2. DB unique on (AdEvent.ts, AdEvent.idempotency_key) — forever backstop.
 *   3. createMany({ skipDuplicates: true }) treats DB P2002 as success.
 *
 * We deliberately do NOT expose a per-request duplicate count to the API:
 * Prismas createMany only returns the inserted count (skipped rows are not
 * distinguished from other rejects). Source of truth is ScraperRun.
 */
import { Worker, type Job } from "bullmq";
import type { Prisma } from "@prisma/client";
import pino from "pino";
import { getBullMQConnection } from "../connection";
import { INGEST_QUEUE_NAME, type AdEventBatchJobData } from "../ingest";
import { prisma } from "@/lib/prismaDb";
import { uploadCreativeToS3 } from "@/lib/s3-creatives";
import {
  adsEventEnvelopeSchema,
  isSupportedSchemaVersion,
  AdsEventsErrorCodes,
  mappers,
} from "@/lib/events";

const log = pino({ name: "ads-events.ingest-worker" });

async function processBatch(job: Job<AdEventBatchJobData>) {
  const t0 = Date.now();
  const logger = log.child({ jobId: job.id, attempt: job.attemptsMade + 1 });

  // Re-validate on worker entry — producers cannot forge shape through the queue.
  const parsed = adsEventEnvelopeSchema.safeParse(job.data.envelope);
  if (!parsed.success) {
    logger.warn({ zodIssues: parsed.error.issues }, "envelope invalid at worker");
    await prisma.deadLetterEvent.create({
      data: {
        source: job.data.envelope?.source ?? "MANUAL",
        reason_code: AdsEventsErrorCodes.SCHEMA_INVALID,
        zod_issues: parsed.error.issues as unknown as object,
        raw: job.data.envelope as object,
        bullmq_job_id: String(job.id ?? ""),
      },
    });
    return { accepted: 0, rejected: job.data.envelope?.events?.length ?? 0, dead_lettered: true };
  }
  const envelope = parsed.data;

  if (!isSupportedSchemaVersion(envelope.schema_version)) {
    logger.warn({ schema_version: envelope.schema_version }, "schema version unsupported");
    await prisma.deadLetterEvent.create({
      data: {
        source: envelope.source,
        reason_code: AdsEventsErrorCodes.SCHEMA_UNSUPPORTED,
        raw: envelope as object,
        bullmq_job_id: String(job.id ?? ""),
      },
    });
    return { accepted: 0, rejected: envelope.events.length, dead_lettered: true };
  }

  const runId = job.data.ingestion_run_id;
  const run = await prisma.scraperRun.create({
    data: {
      source: envelope.source,
      status: "RUNNING",
      bullmq_job_id: String(job.id ?? ""),
      events_in: envelope.events.length,
    },
  });

  let accepted = 0;
  let rejected = 0;

  try {
    // Resolve (or create) AdAccount per event, then write AdEvent batch.
    const accountCache = new Map<string, string>(); // platform:external_id -> id
    const rows: Prisma.AdEventCreateManyInput[] = [];

    const s3Uploads: Promise<void>[] = [];

    for (const evt of envelope.events) {
      const key = evt.platform + ":" + evt.external_account_id;
      let accountId = accountCache.get(key);
      if (!accountId) {
        const acc = await prisma.adAccount.upsert(mappers.toAdAccountUpsert(evt));
        accountId = acc.id;
        accountCache.set(key, acc.id);
      }

      // Upsert AdCreative for CREATIVE_SEEN events and link creative_id.
      let creativeId: string | null = null;
      const creativeArgs = mappers.toAdCreativeUpsert(evt, accountId!);
      if (creativeArgs) {
        const creative = await prisma.adCreative.upsert(creativeArgs);
        creativeId = creative.id;

        // Fire-and-forget S3 upload — never blocks ingest.
        const originalUrl = creative.media_url;
        if (originalUrl && !originalUrl.includes("10.10.10.180")) {
          s3Uploads.push(
            uploadCreativeToS3(originalUrl, evt.platform, creativeArgs.where.creative_hash)
              .then(async (s3Url) => {
                if (s3Url) {
                  await prisma.adCreative.update({
                    where: { id: creative.id },
                    data: { media_url: s3Url },
                  });
                }
              })
              .catch(() => { /* silent — S3 is optional */ }),
          );
        }
      }

      rows.push(mappers.toAdEventRow(evt, envelope, accountId!, runId, creativeId));
    }

    const result = await prisma.adEvent.createMany({
      data: rows,
      skipDuplicates: true,
    });

    // Await S3 uploads in background (don't let them fail the job).
    if (s3Uploads.length) void Promise.allSettled(s3Uploads);
    accepted = result.count;
    rejected = envelope.events.length - accepted;

    await prisma.scraperRun.update({
      where: { id: run.id },
      data: {
        status: "OK",
        finished_at: new Date(),
        events_accepted: accepted,
        events_rejected: rejected,
      },
    });
    logger.info(
      { accepted, rejected, durationMs: Date.now() - t0 },
      "batch ingested",
    );
    return { accepted, rejected, run_id: run.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.scraperRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finished_at: new Date(),
        error_code: "WORKER_EXCEPTION",
        error_message: message.slice(0, 500),
      },
    });
    logger.error({ err: message }, "batch failed; will retry per BullMQ attempts");
    throw err;
  }
}

export function startIngestWorker() {
  const worker = new Worker<AdEventBatchJobData>(INGEST_QUEUE_NAME, processBatch, {
    connection: getBullMQConnection(),
    concurrency: 4,
    stalledInterval: 30_000,
    maxStalledCount: 1,
  });

  worker.on("completed", (job, result) => {
    log.info({ jobId: job.id, result }, "completed");
  });
  worker.on("failed", (job, err) => {
    log.error({ jobId: job?.id, err: err.message }, "failed");
  });

  const shutdown = async (signal: string) => {
    log.info({ signal }, "shutdown requested; draining worker");
    try {
      await worker.close();
      log.info("worker closed cleanly");
    } catch (err) {
      log.error({ err: (err as Error).message }, "worker close errored");
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  return worker;
}

// Auto-start when run as a PM2 process (not when imported for tests).
if (require.main === module) {
  log.info({ pid: process.pid }, "ingest worker booting");
  startIngestWorker();
}
