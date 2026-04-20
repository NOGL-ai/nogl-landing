"use server";

import { prisma } from "@/lib/prismaDb";
import { getAuthSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export type TrendBadge = "extreme" | "fast" | "steady";

export interface TrendCard {
  id: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  /** Fractional growth (0.5 = +50%). Can be negative. */
  growthMetric: number;
  growthLabel: string;
  sparkline: number[];
  badge: TrendBadge;
  totalProducts: number;
}

// Raw row shapes returned by $queryRaw (Postgres bigint → bigint in JS)
interface CompanyTrendRow {
  company_id: string;
  name: string;
  slug: string;
  domain: string | null;
  new_products_4w: bigint;
  new_products_prev_4w: bigint;
  total_products: bigint;
}

interface CategoryTrendRow {
  category: string;
  new_products_4w: bigint;
  new_products_prev_4w: bigint;
  total_products: bigint;
}

interface WeeklyRow {
  company_id: string;
  week_start: Date;
  new_products: bigint;
}

function growthBadge(pct: number): TrendBadge {
  if (pct >= 0.5) return "extreme";
  if (pct >= 0.15) return "fast";
  return "steady";
}

function growthMetric(current: number, prev: number): number {
  if (prev > 0) return (current - prev) / prev;
  if (current > 0) return 1;
  return 0;
}

function logoUrl(domain: string | null | undefined): string | undefined {
  if (!domain) return undefined;
  return `https://logo.clearbit.com/${domain}`;
}

function buildGrowthLabel(current: number, metric: number): string {
  if (current <= 0) return "No new products";
  return `+${current} new${metric > 0 ? ` (${Math.round(metric * 100)}%)` : ""}`;
}

export async function getTrendingCompanies({
  limit = 12,
}: {
  limit?: number;
} = {}): Promise<TrendCard[]> {
  await getAuthSession();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw(
    Prisma.sql`
      SELECT company_id, name, slug, domain,
             new_products_4w, new_products_prev_4w, total_products
      FROM nogl."CompanyTrend4w"
      ORDER BY new_products_4w DESC
      LIMIT ${limit}
    `
  );

  if (rows.length === 0) return [];

  const companyIds: string[] = rows.map((r: CompanyTrendRow) => r.company_id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const weekly: any[] = await prisma.$queryRaw(
    Prisma.sql`
      SELECT company_id, week_start, new_products
      FROM nogl."CompanyTrendWeekly12"
      WHERE company_id = ANY(${companyIds}::text[])
      ORDER BY week_start ASC
    `
  );

  // Map company_id → week_key → count
  const weeklyMap = new Map<string, Map<string, number>>();
  for (const w of weekly as WeeklyRow[]) {
    const key = (w.week_start as Date).toISOString();
    if (!weeklyMap.has(w.company_id)) weeklyMap.set(w.company_id, new Map());
    weeklyMap.get(w.company_id)!.set(key, Number(w.new_products));
  }

  const allWeeks: string[] = Array.from(
    new Set((weekly as WeeklyRow[]).map((w: WeeklyRow) => (w.week_start as Date).toISOString()))
  ).sort();

  return (rows as CompanyTrendRow[]).map((r: CompanyTrendRow) => {
    const current = Number(r.new_products_4w);
    const prev = Number(r.new_products_prev_4w);
    const metric = growthMetric(current, prev);
    const byWeek = weeklyMap.get(r.company_id);
    const sparkline = allWeeks.map((wk: string) => byWeek?.get(wk) ?? 0);

    return {
      id: r.company_id,
      name: r.name,
      slug: r.slug,
      logoUrl: logoUrl(r.domain),
      growthMetric: metric,
      growthLabel: buildGrowthLabel(current, metric),
      sparkline,
      badge: growthBadge(metric),
      totalProducts: Number(r.total_products),
    };
  });
}

export async function getTrendingCategories({
  limit = 12,
}: {
  limit?: number;
} = {}): Promise<TrendCard[]> {
  await getAuthSession();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await prisma.$queryRaw(
    Prisma.sql`
      SELECT category, new_products_4w, new_products_prev_4w, total_products
      FROM nogl."CategoryTrend4w"
      ORDER BY new_products_4w DESC
      LIMIT ${limit}
    `
  );

  return (rows as CategoryTrendRow[]).map((r: CategoryTrendRow) => {
    const current = Number(r.new_products_4w);
    const prev = Number(r.new_products_prev_4w);
    const metric = growthMetric(current, prev);

    return {
      id: r.category,
      name: r.category,
      growthMetric: metric,
      growthLabel: buildGrowthLabel(current, metric),
      sparkline: [],
      badge: growthBadge(metric),
      totalProducts: Number(r.total_products),
    };
  });
}

/** Admin-only: refresh all three materialized views concurrently. */
export async function refreshTrends(): Promise<void> {
  const session = await getAuthSession();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.$executeRawUnsafe(
    `REFRESH MATERIALIZED VIEW CONCURRENTLY nogl."CompanyTrend4w"`
  );
  await prisma.$executeRawUnsafe(
    `REFRESH MATERIALIZED VIEW CONCURRENTLY nogl."CategoryTrend4w"`
  );
  await prisma.$executeRawUnsafe(
    `REFRESH MATERIALIZED VIEW CONCURRENTLY nogl."CompanyTrendWeekly12"`
  );
}
