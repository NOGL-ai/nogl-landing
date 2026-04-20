/**
 * Seed 4 persona-tagged demo dashboards for the Calumet tenant.
 * Run with:  npx ts-node --esm scripts/seed-dashboards-demo.ts
 * Or via:    npm run seed:dashboards-demo
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEV_USER_ID = "dev-user-id"; // matches auth bypass in src/lib/auth.ts

async function main() {
  console.log("🌱 Seeding demo dashboards…");

  // ── 1. Finance Pulse (CFO) ─────────────────────────────────────────────

  const finance = await upsertDashboard({
    name: "Finance Pulse (4w)",
    persona: "CFO",
    description: "Revenue, margin, price-gap, and inventory risk at a glance.",
  });

  await upsertWidgets(finance.id, [
    {
      title: "Total Revenue (28d)",
      type: "stat",
      layout: { i: "", x: 0, y: 0, w: 3, h: 2 },
      config: {
        type: "stat",
        metric: "totalRevenue",
        filters: [],
        format: "currency",
        label: "SUM Sales Revenue",
        comparison: { period: "28d", showDelta: true },
      },
    },
    {
      title: "Avg Price vs Competitor",
      type: "stat",
      layout: { i: "", x: 3, y: 0, w: 3, h: 2 },
      config: {
        type: "stat",
        metric: "avgPrice",
        filters: [],
        format: "currency",
        label: "Avg Competitor Price",
        comparison: { period: "28d", showDelta: true },
      },
    },
    {
      title: "Price Gap",
      type: "stat",
      layout: { i: "", x: 6, y: 0, w: 3, h: 2 },
      config: {
        type: "stat",
        metric: "priceGap",
        filters: [],
        format: "currency",
        label: "Avg Price Gap $",
        comparison: { period: "28d", showDelta: true },
      },
    },
    {
      title: "Win Rate",
      type: "stat",
      layout: { i: "", x: 9, y: 0, w: 3, h: 2 },
      config: {
        type: "stat",
        metric: "winRate",
        filters: [],
        format: "percent",
        label: "Price Win Rate",
        comparison: { period: "28d", showDelta: true },
      },
    },
    {
      title: "Revenue Trend (28d)",
      type: "line_chart",
      layout: { i: "", x: 0, y: 2, w: 7, h: 4 },
      config: {
        type: "line_chart",
        xField: "date",
        yFields: ["averagePrice"],
        filters: [],
        smooth: true,
      },
    },
    {
      title: "Top 10 SKUs by Revenue Risk",
      type: "top_table",
      layout: { i: "", x: 7, y: 2, w: 5, h: 6 },
      config: {
        type: "top_table",
        entity: "competitor",
        entityKind: "product",
        filters: [],
        rankBy: { field: "priceDiffPct", direction: "desc" },
        columns: [
          { field: "price", label: "Price", format: "currency" },
          { field: "priceChangePct", label: "Gap %", format: "percent" },
        ],
        rowDensity: "compact",
        limit: 10,
      },
    },
    {
      title: "Avg Price by Competitor",
      type: "bar_chart",
      layout: { i: "", x: 0, y: 6, w: 7, h: 4 },
      config: {
        type: "bar_chart",
        xField: "competitor",
        yFields: ["competitorPrice"],
        filters: [],
        orientation: "vertical",
        stacked: false,
      },
    },
  ]);

  // ── 2. Marketing Signals (CMO) ─────────────────────────────────────────

  const marketing = await upsertDashboard({
    name: "Marketing Signals",
    persona: "CMO",
    description: "Share of voice, promo intensity, and social signals.",
  });

  await upsertWidgets(marketing.id, [
    {
      title: "Tracked Companies",
      type: "stat",
      layout: { i: "", x: 0, y: 0, w: 3, h: 2 },
      config: {
        type: "stat",
        metric: "trackedCompanies",
        filters: [],
        format: "number",
        label: "Competitors Tracked",
      },
    },
    {
      title: "IG Followers Total",
      type: "stat",
      layout: { i: "", x: 3, y: 0, w: 3, h: 2 },
      config: {
        type: "stat",
        metric: "igFollowers",
        filters: [],
        format: "number",
        label: "IG Followers (all brands)",
      },
    },
    {
      title: "Market Share by Company",
      type: "pie",
      layout: { i: "", x: 6, y: 0, w: 6, h: 5 },
      config: {
        type: "pie",
        field: "companyName",
        valueField: "total_products",
        filters: [],
        limit: 8,
        donut: true,
      },
    },
    {
      title: "Top Competitors by SKU Count",
      type: "top_table",
      layout: { i: "", x: 0, y: 2, w: 6, h: 5 },
      config: {
        type: "top_table",
        entity: "competitor",
        entityKind: "company",
        filters: [],
        rankBy: { field: "competitorPrice", direction: "desc" },
        columns: [
          { field: "totalProducts", label: "SKUs", format: "number" },
          { field: "igFollowers", label: "IG Followers", format: "number" },
          { field: "avgDiscountPct", label: "Avg Discount", format: "percent" },
        ],
        rowDensity: "compact",
        limit: 10,
      },
    },
    {
      title: "Promo Intensity Heatmap",
      type: "heatmap",
      layout: { i: "", x: 0, y: 7, w: 12, h: 5 },
      config: {
        type: "heatmap",
        rowField: "competitor",
        colField: "category",
        valueField: "priceDiffPct",
        filters: [],
        colorScheme: "purple",
      },
    },
  ]);

  // ── 3. Pricing War Room (OPS) ──────────────────────────────────────────

  const pricing = await upsertDashboard({
    name: "Pricing War Room",
    persona: "OPS",
    description: "Per-SKU price gap, stockout risk, and win/loss overview.",
  });

  await upsertWidgets(pricing.id, [
    {
      title: "SKUs Tracked",
      type: "stat",
      layout: { i: "", x: 0, y: 0, w: 3, h: 2 },
      config: {
        type: "stat",
        metric: "skuCount",
        filters: [],
        format: "number",
        label: "Total SKUs",
      },
    },
    {
      title: "Avg Price Gap",
      type: "sparkline",
      layout: { i: "", x: 3, y: 0, w: 3, h: 2 },
      config: {
        type: "sparkline",
        metric: "priceGap",
        period: "28d",
        filters: [],
        format: "currency",
      },
    },
    {
      title: "Win Rate",
      type: "sparkline",
      layout: { i: "", x: 6, y: 0, w: 3, h: 2 },
      config: {
        type: "sparkline",
        metric: "winRate",
        period: "28d",
        filters: [],
        format: "percent",
      },
    },
    {
      title: "Avg Competitor Price",
      type: "sparkline",
      layout: { i: "", x: 9, y: 0, w: 3, h: 2 },
      config: {
        type: "sparkline",
        metric: "avgPrice",
        period: "28d",
        filters: [],
        format: "currency",
      },
    },
    {
      title: "Top 10 Underpriced vs Competitor",
      type: "top_table",
      layout: { i: "", x: 0, y: 2, w: 6, h: 6 },
      config: {
        type: "top_table",
        entity: "competitor",
        entityKind: "product",
        filters: [],
        rankBy: { field: "priceDiff", direction: "asc" },
        columns: [
          { field: "price", label: "Our Price", format: "currency" },
          { field: "myPrice", label: "Comp. Price", format: "currency" },
          { field: "priceChangePct", label: "Gap %", format: "percent" },
        ],
        rowDensity: "compact",
        limit: 10,
      },
    },
    {
      title: "Top 10 Overpriced vs Competitor",
      type: "top_table",
      layout: { i: "", x: 6, y: 2, w: 6, h: 6 },
      config: {
        type: "top_table",
        entity: "competitor",
        entityKind: "product",
        filters: [],
        rankBy: { field: "priceDiff", direction: "desc" },
        columns: [
          { field: "price", label: "Our Price", format: "currency" },
          { field: "myPrice", label: "Comp. Price", format: "currency" },
          { field: "priceChangePct", label: "Gap %", format: "percent" },
        ],
        rowDensity: "compact",
        limit: 10,
      },
    },
    {
      title: "Price History Trend",
      type: "line_chart",
      layout: { i: "", x: 0, y: 8, w: 12, h: 4 },
      config: {
        type: "line_chart",
        xField: "date",
        yFields: ["averagePrice", "minPrice", "maxPrice"],
        filters: [],
        smooth: false,
      },
    },
  ]);

  // ── 4. Competitor Overview (GENERIC) ───────────────────────────────────

  const overview = await upsertDashboard({
    name: "Competitor Overview (4w)",
    persona: "GENERIC",
    description: "Executive-level summary across all tracked competitors.",
  });

  await upsertWidgets(overview.id, [
    {
      title: "Total SKUs Monitored",
      type: "stat",
      layout: { i: "", x: 0, y: 0, w: 3, h: 2 },
      config: {
        type: "stat",
        metric: "skuCount",
        filters: [],
        format: "number",
        label: "SKUs",
        comparison: { period: "28d", showDelta: true },
      },
    },
    {
      title: "Companies Tracked",
      type: "stat",
      layout: { i: "", x: 3, y: 0, w: 3, h: 2 },
      config: {
        type: "stat",
        metric: "companyCount",
        filters: [],
        format: "number",
        label: "Competitors",
      },
    },
    {
      title: "Avg Competitor Price",
      type: "stat",
      layout: { i: "", x: 6, y: 0, w: 3, h: 2 },
      config: {
        type: "stat",
        metric: "avgPrice",
        filters: [],
        format: "currency",
        label: "Avg Market Price",
        comparison: { period: "28d", showDelta: true },
      },
    },
    {
      title: "Win Rate",
      type: "stat",
      layout: { i: "", x: 9, y: 0, w: 3, h: 2 },
      config: {
        type: "stat",
        metric: "winRate",
        filters: [],
        format: "percent",
        label: "Price Win Rate",
      },
    },
    {
      title: "Top Products by Price Volume",
      type: "top_table",
      layout: { i: "", x: 0, y: 2, w: 7, h: 6 },
      config: {
        type: "top_table",
        entity: "competitor",
        entityKind: "product",
        filters: [],
        rankBy: { field: "competitorPrice", direction: "desc" },
        columns: [
          { field: "price", label: "Price", format: "currency" },
          { field: "priceChangePct", label: "Gap %", format: "percent" },
          { field: "isWinning", label: "Winning" },
        ],
        rowDensity: "compact",
        limit: 10,
      },
    },
    {
      title: "Market Share by Company",
      type: "pie",
      layout: { i: "", x: 7, y: 2, w: 5, h: 5 },
      config: {
        type: "pie",
        field: "companyName",
        valueField: "total_products",
        filters: [],
        limit: 8,
        donut: false,
      },
    },
    {
      title: "Price Trend (28d)",
      type: "line_chart",
      layout: { i: "", x: 0, y: 8, w: 12, h: 4 },
      config: {
        type: "line_chart",
        xField: "date",
        yFields: ["averagePrice"],
        filters: [],
        smooth: true,
      },
    },
  ]);

  console.log("✅ Demo dashboards seeded successfully.");
  console.log("   Finance Pulse     →", finance.id);
  console.log("   Marketing Signals →", marketing.id);
  console.log("   Pricing War Room  →", pricing.id);
  console.log("   Competitor Overview →", overview.id);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function upsertDashboard({
  name,
  persona,
  description,
}: {
  name: string;
  persona: "CFO" | "CMO" | "OPS" | "GENERIC";
  description?: string;
}) {
  const existing = await (prisma as any).dashboard.findFirst({
    where: { name, ownerId: DEV_USER_ID },
  });
  if (existing) {
    console.log(`  ↪ Skip (exists): ${name}`);
    return existing;
  }
  const d = await (prisma as any).dashboard.create({
    data: {
      name,
      persona,
      description: description ?? null,
      tenantId: DEV_USER_ID,
      ownerId: DEV_USER_ID,
      isShared: false,
      globalFilters: {},
    },
  });
  console.log(`  ✓ Created: ${name}`);
  return d;
}

async function upsertWidgets(
  dashboardId: string,
  widgets: Array<{
    title: string;
    type: string;
    layout: Omit<{ i: string; x: number; y: number; w: number; h: number }, never>;
    config: unknown;
  }>
) {
  const existing = await (prisma as any).dashboardWidget.count({
    where: { dashboardId },
  });
  if (existing > 0) {
    console.log(`    ↪ Skip widgets (already seeded)`);
    return;
  }

  for (const w of widgets) {
    const widget = await (prisma as any).dashboardWidget.create({
      data: {
        dashboardId,
        title: w.title,
        type: w.type,
        config: w.config as never,
        layout: { ...w.layout, i: "placeholder" } as never,
      },
    });
    // Set layout.i = widget id
    await (prisma as any).dashboardWidget.update({
      where: { id: widget.id },
      data: { layout: { ...w.layout, i: widget.id } as never },
    });
  }
  console.log(`    ✓ ${widgets.length} widgets created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
