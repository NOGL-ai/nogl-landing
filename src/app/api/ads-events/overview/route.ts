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

// Map MarketingAsset.assetType → EventsPerDayRow column
const ASSET_TYPE_TO_COL: Record<string, keyof Omit<EventsPerDayRow, "day" | "total">> = {
  META_AD: "META_ADS_LIBRARY",
  INSTAGRAM: "INSTAGRAM",
  TIKTOK_AD: "TIKTOK",
  FACEBOOK: "FACEBOOK",
};

type RawDayRow = { day: Date; asset_type: string; cnt: bigint };

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
      eventsPerDay: [],
      recentCreatives: [],
      totals: { events_7d: 0, creatives_total: 0, accounts_unmapped: 0 },
    };
    return NextResponse.json(empty);
  }
}

async function getEventsPerDay(): Promise<EventsPerDayRow[]> {
  const rows = (await prisma.$queryRaw`
    SELECT date_trunc('day', "capturedAt") AS day,
           "assetType" AS asset_type,
           COUNT(*) AS cnt
    FROM "MarketingAsset"
    WHERE "capturedAt" >= NOW() - INTERVAL '30 days'
    GROUP BY 1, 2
    ORDER BY 1 ASC
  `) as RawDayRow[];

  const byDay = new Map<string, EventsPerDayRow>();
  for (const r of rows) {
    const key = new Date(r.day).toISOString().slice(0, 10);
    if (!byDay.has(key)) {
      byDay.set(key, { day: key, META_ADS_LIBRARY: 0, INSTAGRAM: 0, TIKTOK: 0, FACEBOOK: 0, total: 0 });
    }
    const entry = byDay.get(key)!;
    const n = Number(r.cnt);
    const col = ASSET_TYPE_TO_COL[r.asset_type];
    if (col) entry[col] += n;
    entry.total += n;
  }
  return Array.from(byDay.values());
}

async function getRecentCreatives(): Promise<RecentCreative[]> {
  const assets = await prisma.marketingAsset.findMany({
    take: 12,
    orderBy: { capturedAt: "desc" },
    select: {
      id: true,
      assetType: true,
      mediaUrls: true,
      title: true,
      capturedAt: true,
      brandId: true,
    },
  });
  return assets.map((a) => ({
    id: a.id,
    platform: a.assetType,
    media_url: a.mediaUrls[0] ?? null,
    thumbnail_url: a.mediaUrls[0] ?? null,
    caption: a.title,
    first_seen_at: a.capturedAt.toISOString(),
    hook_score: null,
    handle: a.brandId,
  }));
}

async function getTotals() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [creatives_total, events_7d] = await Promise.all([
    prisma.marketingAsset.count(),
    prisma.marketingAsset.count({ where: { capturedAt: { gte: sevenDaysAgo } } }),
  ]);
  return {
    events_7d,
    creatives_total,
    accounts_unmapped: 0,
  };
}
