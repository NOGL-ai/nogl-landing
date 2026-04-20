import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type EventsPerDayRow = {
  day: string;
  META_ADS_LIBRARY: number;
  INSTAGRAM: number;
  TIKTOK: number;
  FACEBOOK: number;
  total: number;
};

export type RecentCreative = {
  id: string;
  platform: string;
  media_url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  first_seen_at: string;
  hook_score: string | null;
  handle: string | null;
};

export type OverviewResponse = {
  eventsPerDay: EventsPerDayRow[];
  recentCreatives: RecentCreative[];
  totals: { events_7d: number; creatives_total: number; accounts_unmapped: number };
};

type RawEventDay = { day: string; platform: string; cnt: bigint };
type RawCreative = {
  id: string; platform: string; media_url: string | null;
  thumbnail_url: string | null; caption: string | null;
  first_seen_at: Date; hook_score: unknown; handle: string | null;
};
type RawCount = { n: bigint };

export async function GET() {
  try {
    const [eventsPerDay, recentCreatives, totals] = await Promise.all([
      getEventsPerDay(),
      getRecentCreatives(),
      getTotals(),
    ]);
    const resp: OverviewResponse = { eventsPerDay, recentCreatives, totals };
    return NextResponse.json(resp);
  } catch {
    const empty: OverviewResponse = {
      eventsPerDay: [], recentCreatives: [],
      totals: { events_7d: 0, creatives_total: 0, accounts_unmapped: 0 },
    };
    return NextResponse.json(empty);
  }
}

async function getEventsPerDay(): Promise<EventsPerDayRow[]> {
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT date_trunc('day', ts) AS day, platform, COUNT(*) AS cnt
     FROM ads_events."AdEvent"
     WHERE ts >= NOW() - INTERVAL '30 days'
     GROUP BY 1, 2 ORDER BY 1 ASC`,
  )) as RawEventDay[];

  const byDay = new Map<string, EventsPerDayRow>();
  for (const r of rows) {
    const key = new Date(r.day).toISOString().slice(0, 10);
    if (!byDay.has(key)) {
      byDay.set(key, { day: key, META_ADS_LIBRARY: 0, INSTAGRAM: 0, TIKTOK: 0, FACEBOOK: 0, total: 0 });
    }
    const entry = byDay.get(key)!;
    const n = Number(r.cnt);
    const platform = r.platform as keyof Omit<EventsPerDayRow, "day" | "total">;
    if (platform in entry) (entry[platform] as number) += n;
    entry.total += n;
  }
  return Array.from(byDay.values());
}

async function getRecentCreatives(): Promise<RecentCreative[]> {
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT c.id, c.platform, c.media_url, c.thumbnail_url, c.caption,
            c.first_seen_at, m.hook_score, a.handle
     FROM ads_events."AdCreative" c
     JOIN ads_events."AdAccount" a ON a.id = c.account_id
     LEFT JOIN LATERAL (
       SELECT hook_score FROM ads_events."AdMetricDaily"
       WHERE creative_id = c.id ORDER BY day DESC LIMIT 1
     ) m ON true
     ORDER BY c.first_seen_at DESC LIMIT 12`,
  )) as RawCreative[];
  return rows.map((r) => ({
    id: r.id, platform: r.platform,
    media_url: r.media_url, thumbnail_url: r.thumbnail_url, caption: r.caption,
    first_seen_at: new Date(r.first_seen_at).toISOString(),
    hook_score: r.hook_score != null ? String(r.hook_score) : null,
    handle: r.handle,
  }));
}

async function getTotals() {
  const [evts, creatives, unmapped] = (await Promise.all([
    prisma.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM ads_events."AdEvent" WHERE ts >= NOW() - INTERVAL '7 days'`),
    prisma.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM ads_events."AdCreative"`),
    prisma.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM ads_events."AdAccount" WHERE status = 'UNMAPPED'`),
  ])) as [RawCount[], RawCount[], RawCount[]];
  return {
    events_7d: Number(evts[0].n),
    creatives_total: Number(creatives[0].n),
    accounts_unmapped: Number(unmapped[0].n),
  };
}
