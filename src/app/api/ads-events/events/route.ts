import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prismaDb";
import type { AdEventRow } from "@/components/application/marketing-assets/AdEventSheet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RawRow = AdEventRow & { ts: Date };

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const platform = sp.get("platform") || null;
  const source = sp.get("source") || null;
  const eventType = sp.get("event_type") || null;
  const search = sp.get("search")?.trim() || null;
  const limit = Math.min(Number(sp.get("limit") ?? "100"), 500);

  try {
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT e.id, e.event_type, e.ts, e.source,
              e.ingestion_run_id, e.idempotency_key,
              e.payload, e.metrics, e.account_id,
              a.platform, a.handle
       FROM ads_events."AdEvent" e
       JOIN ads_events."AdAccount" a ON a.id = e.account_id
       WHERE ($1::text IS NULL OR a.platform = $1)
         AND ($2::text IS NULL OR e.source = $2)
         AND ($3::text IS NULL OR e.event_type = $3)
         AND ($4::text IS NULL OR a.handle ILIKE '%' || $4 || '%'
              OR e.ingestion_run_id ILIKE $4 || '%')
       ORDER BY e.ts DESC LIMIT $5`,
      platform, source, eventType, search, limit,
    )) as RawRow[];
    return NextResponse.json(
      rows.map((r) => ({ ...r, ts: new Date(r.ts).toISOString() })),
    );
  } catch {
    return NextResponse.json([]);
  }
}
