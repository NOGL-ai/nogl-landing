import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { getIngestQueue } from "@/lib/queues";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RunRow = {
  id: string; source: string; status: string;
  started_at: Date; finished_at: Date | null;
  events_in: number; events_accepted: number; events_rejected: number;
};

export async function GET() {
  const [queueStats, lastRun] = await Promise.all([getQueueStats(), getLastRun()]);
  return NextResponse.json({ queue: queueStats, lastRun });
}

async function getQueueStats() {
  try {
    const q = getIngestQueue();
    const counts = await q.getJobCounts("waiting", "active", "completed", "failed", "delayed");
    return { name: q.name, ...counts, healthy: true };
  } catch {
    return { name: "ads-events:ingest", healthy: false };
  }
}

async function getLastRun() {
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT id, source, status, started_at, finished_at,
              events_in, events_accepted, events_rejected
       FROM ads_events."ScraperRun"
       ORDER BY started_at DESC LIMIT 1`,
    ) as RunRow[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
