import { Queue, type JobsOptions } from "bullmq";
import { getBullMQConnection } from "./connection";
import type { AdsEventEnvelope } from "@/lib/events";

export const INGEST_QUEUE_NAME = "ads-events:ingest";

export type AdEventBatchJobData = {
  envelope: AdsEventEnvelope;
  ingestion_run_id: string;
  received_at: string;
};

const globalForQueue = globalThis as typeof globalThis & {
  __ingestQueue?: Queue<AdEventBatchJobData>;
};

const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 2000 },
  removeOnComplete: { count: 1000, age: 7 * 24 * 3600 },
  removeOnFail: { count: 5000, age: 30 * 24 * 3600 },
};

export function getIngestQueue(): Queue<AdEventBatchJobData> {
  if (globalForQueue.__ingestQueue) return globalForQueue.__ingestQueue;
  const q = new Queue<AdEventBatchJobData>(INGEST_QUEUE_NAME, {
    connection: getBullMQConnection(),
    defaultJobOptions,
  });
  if (process.env.NODE_ENV !== "production") {
    globalForQueue.__ingestQueue = q;
  }
  return q;
}
