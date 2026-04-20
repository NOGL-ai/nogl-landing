import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveCompanyBySlug } from "@/lib/companies/helpers";

// SSE stream for new CompanyEvent rows. Since this repo has no Redis, we hold
// the connection open and poll Postgres every POLL_MS on (company_id, createdAt).
// Upgrade path: replace the poll with a Redis pub/sub subscriber on the
// channel `events:${company_id}` once an ingest service publishes there.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const POLL_MS = 2000;
const HEARTBEAT_MS = 15000;

type StreamRow = {
  id: string;
  company_id: string;
  event_type: string;
  platform: string | null;
  title: string | null;
  summary: string | null;
  asset_url: string | null;
  asset_preview_url: string | null;
  event_date: Date;
  duration_days: number | null;
  confidence: Prisma.Decimal | null;
  score: Prisma.Decimal | null;
  source_url: string | null;
  raw_payload: Prisma.JsonValue | null;
  created_at: Date;
};

function toDto(row: StreamRow) {
  return {
    id: row.id,
    company_id: row.company_id,
    event_type: row.event_type,
    platform: row.platform,
    title: row.title,
    summary: row.summary,
    asset_url: row.asset_url,
    asset_preview_url: row.asset_preview_url,
    event_date: row.event_date.toISOString(),
    duration_days: row.duration_days,
    confidence: row.confidence ? Number(row.confidence) : null,
    score: row.score ? Number(row.score) : null,
    source_url: row.source_url,
    raw_payload: row.raw_payload,
    createdAt: row.created_at.toISOString(),
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const company = await resolveCompanyBySlug(slug);
  if (!company) {
    return new Response("Company not found", { status: 404 });
  }

  let cursor = new Date();
  let closed = false;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (payload: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          closed = true;
        }
      };

      send(`: connected ${new Date().toISOString()}\n\n`);

      const poll = async () => {
        if (closed) return;
        try {
          const rows = (await prisma.$queryRaw(Prisma.sql`
            SELECT
              id,
              company_id,
              event_type,
              platform,
              title,
              summary,
              asset_url,
              asset_preview_url,
              event_date,
              duration_days,
              confidence,
              score,
              source_url,
              raw_payload,
              "createdAt" AS created_at
            FROM nogl."CompanyEvent"
            WHERE company_id = ${company.id} AND "createdAt" > ${cursor}
            ORDER BY "createdAt" ASC
            LIMIT 20
          `)) as StreamRow[];
          for (const row of rows) {
            cursor = row.created_at > cursor ? row.created_at : cursor;
            send(`event: event\ndata: ${JSON.stringify(toDto(row))}\n\n`);
          }
        } catch {
          // Silently ignore — relation may not exist in dev; connection stays alive.
        }
      };

      const pollTimer = setInterval(() => {
        void poll();
      }, POLL_MS);
      const heartbeatTimer = setInterval(() => {
        send(`: keepalive\n\n`);
      }, HEARTBEAT_MS);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(pollTimer);
        clearInterval(heartbeatTimer);
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      };

      request.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
