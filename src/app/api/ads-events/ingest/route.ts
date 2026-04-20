/**
 * POST /api/ads-events/ingest
 *
 * Accepts an ads-events envelope from authenticated producers and enqueues
 * it for async worker processing. Returns 202 on success, 503 when BullMQ
 * is unreachable (producers must retry on 5xx with backoff).
 *
 * Auth: Bearer API key against nogl.ApiKey + ads_events.ApiKeyScope (scope=INGEST).
 * Rate limit: per-key, value from ApiKeyScope.rate_limit_per_min.
 * Dry-run: ?dry=true validates but never enqueues — for producer integration tests.
 */
import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { LRUCache } from "lru-cache";
import { prisma } from "@/lib/prismaDb";
import { adsEventEnvelopeSchema, AdsEventsErrorCodes } from "@/lib/events";
import { getIngestQueue } from "@/lib/queues";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB

type KeyCacheEntry = {
  apiKeyId: string;
  userId: string;
  rateLimitPerMin: number;
  hits: number[];
};
// Combined API-key validation + ApiKeyScope + rate-limit bucket cache.
// One structure, one LRU, 60s TTL. Avoids per-request bcrypt (100ms)
// and per-request Prisma lookup (~1k qps → 1k db queries otherwise).
const keyCache = new LRUCache<string, KeyCacheEntry>({ max: 500, ttl: 60_000 });

type ErrorBody = { error: { code: string; message: string; details?: unknown } };

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown,
): NextResponse<ErrorBody> {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

async function resolveAuth(
  bearer: string,
): Promise<KeyCacheEntry | { error: ErrorBody; status: number }> {
  const cached = keyCache.get(bearer);
  if (cached) return cached;

  // Lookup: we store bcrypt hashes in ApiKey.key. Scan the caller user set.
  // In practice API-key validation is by the plaintext bearer; ApiKey.key is
  // the hash. We cannot query by bearer directly — fetch candidates and
  // bcrypt-compare. For performance at scale, introduce a prefix/fingerprint
  // column later; for P1, small user set and 60s cache make this acceptable.
  const candidates = await prisma.apiKey.findMany({
    select: { id: true, key: true, userId: true, scopes: true },
  });
  for (const cand of candidates) {
    const ok = await bcrypt.compare(bearer, cand.key).catch(() => false);
    if (!ok) continue;
    const ingestScope = cand.scopes.find((sc: { scope: string }) => sc.scope === "INGEST");
    if (!ingestScope) {
      return {
        status: 403,
        error: {
          error: {
            code: AdsEventsErrorCodes.FORBIDDEN,
            message: "API key lacks INGEST scope for ads-events",
          },
        },
      };
    }
    const entry: KeyCacheEntry = {
      apiKeyId: cand.id,
      userId: cand.userId,
      rateLimitPerMin: ingestScope.rate_limit_per_min,
      hits: [],
    };
    keyCache.set(bearer, entry);
    return entry;
  }
  return {
    status: 401,
    error: {
      error: {
        code: AdsEventsErrorCodes.UNAUTHORIZED,
        message: "API key not recognized",
      },
    },
  };
}

function checkRateLimit(entry: KeyCacheEntry): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowStart = now - 60_000;
  entry.hits = entry.hits.filter((t) => t > windowStart);
  if (entry.hits.length >= entry.rateLimitPerMin) {
    const oldest = entry.hits[0] ?? now;
    return { ok: false, retryAfter: Math.max(1, Math.ceil((oldest + 60_000 - now) / 1000)) };
  }
  entry.hits.push(now);
  return { ok: true };
}

export async function POST(req: NextRequest) {
  // Body size guard (App Router has no built-in per-route size limit).
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return errorResponse(
      413,
      AdsEventsErrorCodes.PAYLOAD_TOO_LARGE,
      "Envelope exceeds 2MB limit",
    );
  }

  // Auth
  const auth = req.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return errorResponse(
      401,
      AdsEventsErrorCodes.UNAUTHORIZED,
      "Missing Bearer token",
    );
  }
  const bearer = match[1].trim();

  const authResult = await resolveAuth(bearer);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  const rl = checkRateLimit(authResult);
  if (!rl.ok) {
    return new NextResponse(
      JSON.stringify({
        error: {
          code: AdsEventsErrorCodes.RATE_LIMITED,
          message: "Rate limit exceeded for this API key",
        },
      }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          "retry-after": String(rl.retryAfter ?? 30),
        },
      },
    );
  }

  // Parse + validate envelope
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return errorResponse(
      400,
      AdsEventsErrorCodes.SCHEMA_INVALID,
      "Body is not valid JSON",
    );
  }
  const parsed = adsEventEnvelopeSchema.safeParse(json);
  if (!parsed.success) {
    return errorResponse(
      400,
      AdsEventsErrorCodes.SCHEMA_INVALID,
      "Envelope failed validation",
      parsed.error.issues,
    );
  }
  const envelope = parsed.data;

  // Dry-run: validate only, never enqueue. Producers use this to integrate.
  const url = new URL(req.url);
  if (url.searchParams.get("dry") === "true") {
    return NextResponse.json(
      {
        dry_run: true,
        input: envelope.events.length,
        schema_version: envelope.schema_version,
      },
      { status: 200 },
    );
  }

  // Ingestion run id + deterministic BullMQ jobId for dedupe.
  const ingestionRunId =
    envelope.run_id ??
    crypto.createHash("sha256").update(JSON.stringify(envelope)).digest("hex").slice(0, 32);
  const jobId =
    "ads-ingest-" +
    crypto
      .createHash("sha256")
      .update(envelope.events.map((e) => e.idempotency_key).sort().join(","))
      .digest("hex")
      .slice(0, 48);

  try {
    const queue = getIngestQueue();
    const job = await queue.add(
      "AdEventBatchJob",
      {
        envelope,
        ingestion_run_id: ingestionRunId,
        received_at: new Date().toISOString(),
      },
      { jobId },
    );
    return NextResponse.json(
      {
        run_id: ingestionRunId,
        input: envelope.events.length,
        accepted_for_processing: envelope.events.length,
        job_id: job.id,
      },
      {
        status: 202,
        headers: { "x-ingestion-run-id": ingestionRunId },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Redis / BullMQ unreachable -> tell producer to retry.
    return new NextResponse(
      JSON.stringify({
        error: {
          code: AdsEventsErrorCodes.QUEUE_UNAVAILABLE,
          message:
            "Ads-events queue is unavailable; retry with backoff. Detail: " +
            message.slice(0, 200),
        },
      }),
      {
        status: 503,
        headers: {
          "content-type": "application/json",
          "retry-after": "30",
        },
      },
    );
  }
}
