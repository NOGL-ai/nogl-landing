import { prisma } from "@/lib/prismaDb";
import type {
  WidgetConfig,
  GlobalFilters,
  WidgetQueryResult,
  TableRow,
} from "./widgetSchemas";

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

export async function resolveWidget(
  config: WidgetConfig,
  globalFilters: GlobalFilters
): Promise<WidgetQueryResult> {
  try {
    switch (config.type) {
      case "top_table":
        return await resolveTopTable(config, globalFilters);
      case "stat":
        return await resolveStat(config, globalFilters);
      case "line_chart":
        return await resolveLineChart(config, globalFilters);
      case "bar_chart":
        return await resolveBarChart(config, globalFilters);
      case "pie":
        return await resolvePie(config, globalFilters);
      case "heatmap":
        return await resolveHeatmap(config, globalFilters);
      case "sparkline":
        return await resolveSparkline(config, globalFilters);
      case "markdown":
        return { type: "markdown", rows: [] };
    }
  } catch (err: unknown) {
    return {
      type: config.type,
      error: err instanceof Error ? err.message : "Query failed",
    };
  }
}

// ---------------------------------------------------------------------------
// Date filter helper
// ---------------------------------------------------------------------------

function mergeDateFilter(globalFilters: GlobalFilters) {
  if (!globalFilters.dateRange?.from) return null;
  return {
    gte: new Date(globalFilters.dateRange.from),
    ...(globalFilters.dateRange.to
      ? { lte: new Date(globalFilters.dateRange.to) }
      : {}),
  };
}

/** Build a `priceDate` where clause for CompetitorPriceComparison / CompetitorPriceHistory */
function priceDateWhere(globalFilters: GlobalFilters) {
  const range = mergeDateFilter(globalFilters);
  return range ? { priceDate: range } : {};
}

function recordDateWhere(globalFilters: GlobalFilters) {
  const range = mergeDateFilter(globalFilters);
  return range ? { recordDate: range } : {};
}

function toNum(d: unknown): number {
  if (d === null || d === undefined) return 0;
  if (typeof d === "number") return d;
  // Prisma Decimal → number
  return parseFloat(String(d));
}

// ---------------------------------------------------------------------------
// Top table
// ---------------------------------------------------------------------------

async function resolveTopTable(
  config: Extract<WidgetConfig, { type: "top_table" }>,
  globalFilters: GlobalFilters
): Promise<WidgetQueryResult> {
  const companyWhere =
    globalFilters.companyIds?.length
      ? { id: { in: globalFilters.companyIds } }
      : {};

  if (config.entityKind === "product" || config.entityKind === "brand") {
    const orderField =
      config.rankBy.field === "priceChange" ||
      config.rankBy.field === "priceDiff"
        ? "priceDiff"
        : config.rankBy.field === "priceDiffPct"
        ? "priceDiffPct"
        : "competitorPrice";

    const rows = await prisma.competitorPriceComparison.findMany({
      where: {
        deletedAt: null,
        ...priceDateWhere(globalFilters),
        ...(Object.keys(companyWhere).length
          ? { competitor: companyWhere as never }
          : {}),
      },
      include: {
        competitor: { select: { name: true, domain: true } },
      },
      orderBy: { [orderField]: config.rankBy.direction } as never,
      take: config.limit,
    });

    const mapped: TableRow[] = rows.map((r: (typeof rows)[number], idx: number) => ({
      rank: idx + 1,
      name: r.productName ?? "—",
      brand: r.competitor?.name ?? "—",
      price: toNum(r.competitorPrice),
      myPrice: toNum(r.myPrice),
      priceChange: toNum(r.priceDiff),
      priceChangePct: toNum(r.priceDiffPct),
      isWinning: r.isWinning,
      sku: r.productSku ?? "—",
      currency: r.currency,
    }));

    return { type: "top_table", rows: mapped };
  }

  if (config.entityKind === "company") {
    const companies = await prisma.company.findMany({
      where: Object.keys(companyWhere).length ? (companyWhere as never) : undefined,
      include: { snapshot: true },
      take: config.limit,
      orderBy: { createdAt: "desc" },
    });

    const mapped: TableRow[] = companies.map((c: (typeof companies)[number], idx: number) => ({
      rank: c.snapshot?.rank ?? idx + 1,
      companyName: c.name,
      domain: c.domain ?? "—",
      totalProducts: c.snapshot?.total_products ?? 0,
      avgPrice: toNum(c.snapshot?.avg_price ?? 0),
      avgDiscountPct: toNum(c.snapshot?.avg_discount_pct ?? 0),
      igFollowers: c.snapshot?.ig_followers ?? null,
      trackingStatus: c.tracking_status,
    }));

    return { type: "top_table", rows: mapped };
  }

  if (config.entityKind === "category") {
    // Aggregate by product_types (stored as String[] on Company)
    const companies = await prisma.company.findMany({
      include: { snapshot: true },
      take: 50,
    });

    const catMap: Record<string, { count: number; totalProducts: number }> = {};
    for (const c of companies) {
      for (const cat of c.product_types ?? []) {
        if (!catMap[cat]) catMap[cat] = { count: 0, totalProducts: 0 };
        catMap[cat].count++;
        catMap[cat].totalProducts += c.snapshot?.total_products ?? 0;
      }
    }

    const sorted = Object.entries(catMap)
      .sort((a, b) => b[1].totalProducts - a[1].totalProducts)
      .slice(0, config.limit);

    const mapped: TableRow[] = sorted.map(([cat, stats], idx) => ({
      rank: idx + 1,
      categoryName: cat,
      companyCount: stats.count,
      totalProducts: stats.totalProducts,
    }));

    return { type: "top_table", rows: mapped };
  }

  return { type: "top_table", rows: [] };
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

async function resolveStat(
  config: Extract<WidgetConfig, { type: "stat" }>,
  globalFilters: GlobalFilters
): Promise<WidgetQueryResult> {
  const dw = priceDateWhere(globalFilters);

  switch (config.metric) {
    case "totalRevenue":
    case "avgPrice": {
      const agg = await prisma.competitorPriceComparison.aggregate({
        _avg: { competitorPrice: true },
        _sum: { competitorPrice: true },
        where: { deletedAt: null, ...dw },
      });
      const value =
        config.metric === "avgPrice"
          ? toNum(agg._avg.competitorPrice ?? 0)
          : toNum(agg._sum.competitorPrice ?? 0);
      return { type: "stat", value };
    }
    case "skuCount": {
      const count = await prisma.competitorPriceComparison.count({
        where: { deletedAt: null, ...dw },
      });
      return { type: "stat", value: count };
    }
    case "companyCount": {
      const count = await prisma.company.count();
      return { type: "stat", value: count };
    }
    case "priceGap": {
      const agg = await prisma.competitorPriceComparison.aggregate({
        _avg: { priceDiff: true },
        where: { deletedAt: null, ...dw },
      });
      return { type: "stat", value: toNum(agg._avg.priceDiff ?? 0) };
    }
    case "winRate": {
      const total = await prisma.competitorPriceComparison.count({
        where: { deletedAt: null, ...dw },
      });
      const winning = await prisma.competitorPriceComparison.count({
        where: { deletedAt: null, isWinning: true, ...dw },
      });
      const value = total > 0 ? (winning / total) * 100 : 0;
      return { type: "stat", value };
    }
    case "igFollowers": {
      const agg = await prisma.companySnapshot.aggregate({
        _sum: { ig_followers: true },
      });
      return { type: "stat", value: agg._sum.ig_followers ?? 0 };
    }
    case "trackedCompanies": {
      const count = await prisma.company.count({
        where: { tracking_status: "TRACKED" },
      });
      return { type: "stat", value: count };
    }
    default:
      return { type: "stat", value: 0 };
  }
}

// ---------------------------------------------------------------------------
// Line chart
// ---------------------------------------------------------------------------

async function resolveLineChart(
  config: Extract<WidgetConfig, { type: "line_chart" }>,
  globalFilters: GlobalFilters
): Promise<WidgetQueryResult> {
  const rows = await prisma.competitorPriceHistory.findMany({
    where: recordDateWhere(globalFilters),
    orderBy: { recordDate: "asc" },
    include: { Competitor: { select: { name: true } } },
    take: 300,
  });

  const series = config.yFields.map((yField) => ({
    name: yField,
    data: rows.map((r: (typeof rows)[number]) => ({
      x: r.recordDate.toISOString().split("T")[0],
      y:
        yField === "averagePrice"
          ? toNum(r.averagePrice)
          : yField === "minPrice"
          ? toNum(r.minPrice ?? 0)
          : yField === "maxPrice"
          ? toNum(r.maxPrice ?? 0)
          : toNum(r.averagePrice),
    })),
  }));

  return { type: "line_chart", series };
}

// ---------------------------------------------------------------------------
// Bar chart
// ---------------------------------------------------------------------------

async function resolveBarChart(
  config: Extract<WidgetConfig, { type: "bar_chart" }>,
  globalFilters: GlobalFilters
): Promise<WidgetQueryResult> {
  const competitors = await prisma.competitor.findMany({
    include: {
      priceComparisons: {
        where: { deletedAt: null, ...priceDateWhere(globalFilters) },
        take: 5,
        orderBy: { priceDate: "desc" },
      },
    },
    take: 15,
  });

  const series = config.yFields.map((yField) => ({
    name: yField,
    data: competitors.map((comp: (typeof competitors)[number]) => {
      const comps = comp.priceComparisons;
      const avg =
        comps.length > 0
          ? comps.reduce(
              (sum: number, c: (typeof comps)[number]) =>
                sum + toNum(c.competitorPrice),
              0
            ) / comps.length
          : 0;
      return { x: comp.name, y: avg };
    }),
  }));

  return { type: "bar_chart", series };
}

// ---------------------------------------------------------------------------
// Pie chart
// ---------------------------------------------------------------------------

async function resolvePie(
  config: Extract<WidgetConfig, { type: "pie" }>,
  _globalFilters: GlobalFilters
): Promise<WidgetQueryResult> {
  const companies = await prisma.company.findMany({
    include: { snapshot: true },
    take: config.limit,
    orderBy: { createdAt: "desc" },
  });

  const slices = companies
    .map((c: (typeof companies)[number]) => ({
      label: c.name,
      value:
        config.valueField === "total_products"
          ? c.snapshot?.total_products ?? 1
          : c.snapshot?.ig_followers ?? 1,
    }))
    .filter((s: { label: string; value: number }) => s.value > 0);

  return { type: "pie", slices };
}

// ---------------------------------------------------------------------------
// Heatmap — promo intensity by brand × category
// ---------------------------------------------------------------------------

async function resolveHeatmap(
  _config: Extract<WidgetConfig, { type: "heatmap" }>,
  _globalFilters: GlobalFilters
): Promise<WidgetQueryResult> {
  const comps = await prisma.competitorPriceComparison.findMany({
    where: { deletedAt: null },
    include: { competitor: { select: { name: true } } },
    take: 100,
    orderBy: { priceDate: "desc" },
  });

  const cells = comps.slice(0, 40).map((r: (typeof comps)[number]) => ({
    row: r.competitor?.name ?? "Unknown",
    col: r.productSku?.split("-")[0] ?? "General",
    value: Math.abs(toNum(r.priceDiffPct ?? 0)),
  }));

  return { type: "heatmap", cells };
}

// ---------------------------------------------------------------------------
// Sparkline
// ---------------------------------------------------------------------------

async function resolveSparkline(
  config: Extract<WidgetConfig, { type: "sparkline" }>,
  globalFilters: GlobalFilters
): Promise<WidgetQueryResult> {
  const rows = await prisma.competitorPriceHistory.findMany({
    where: recordDateWhere(globalFilters),
    orderBy: { recordDate: "asc" },
    select: { recordDate: true, averagePrice: true },
    take: 28,
  });

  const series = [
    {
      name: config.metric,
      data: rows.map((r: (typeof rows)[number]) => ({
        x: r.recordDate.toISOString().split("T")[0],
        y: toNum(r.averagePrice),
      })),
    },
  ];

  const last = toNum(rows[rows.length - 1]?.averagePrice ?? 0);
  const first = toNum(rows[0]?.averagePrice ?? 0);
  const delta = first > 0 ? ((last - first) / first) * 100 : 0;

  return { type: "sparkline", value: last, previousValue: first, delta, series };
}
