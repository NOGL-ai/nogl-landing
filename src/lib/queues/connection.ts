import IORedis, { type RedisOptions } from "ioredis";

/**
 * Dedicated IORedis connection for BullMQ.
 *
 * Do NOT reuse a general-purpose redis client here. BullMQ requires
 * maxRetriesPerRequest: null — other callers typically set it to 1 or 3 for
 * fail-fast semantics. Sharing the client across the two causes silent job
 * loss when Redis reconnects.
 *
 * BullMQ is isolated on REDIS_DB_BULLMQ (default: 5) so other services
 * sharing the Redis host (db 0..4) cannot collide with queue keys.
 */

function bullmqOptions(): RedisOptions {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error(
      "REDIS_URL is not set — BullMQ cannot start. Format: redis://:password@host:port",
    );
  }
  return {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    db: Number(process.env.REDIS_DB_BULLMQ ?? 5),
    lazyConnect: false,
  };
}

const globalForBullMQ = globalThis as typeof globalThis & {
  __bullmqConnection?: IORedis;
};

export function getBullMQConnection(): IORedis {
  if (globalForBullMQ.__bullmqConnection) return globalForBullMQ.__bullmqConnection;
  const opts = bullmqOptions();
  const conn = new IORedis(process.env.REDIS_URL!, opts);
  if (opts.maxRetriesPerRequest !== null) {
    throw new Error(
      "BullMQ connection MUST use maxRetriesPerRequest: null — configuration drift detected.",
    );
  }
  if (process.env.NODE_ENV !== "production") {
    globalForBullMQ.__bullmqConnection = conn;
  }
  return conn;
}
