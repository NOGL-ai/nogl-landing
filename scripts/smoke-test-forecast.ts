/* eslint-disable no-console */
/**
 * Calumet Forecast Pipeline — One-Shot Smoke Test
 *
 * Validates every server action path in src/actions/forecast.ts via direct
 * Prisma queries (bypasses "use server" auth). Runs in < 60 s after seed.
 *
 * Usage:  npx tsx scripts/smoke-test-forecast.ts
 * Exit:   0 = all pass, 1 = any failure
 * Output: /tmp/forecast-smoke-results.json
 */

import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { addDays, startOfDay, format } from "date-fns";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// ─── Config ───────────────────────────────────────────────────────────────────

const COMPANY_ID = "cmnw4qqo10000ltccgauemneu";
const ALL_CHANNELS = ["web", "marketplace", "b2b", "shopify", "amazon", "offline"] as const;
const QUANTILE = 4;
const HISTORY_DAYS = 730;
const HORIZON_DAYS = 180;

const THRESHOLDS = {
  products: 100,
  variants: 100,
  historicalSales: 100_000,
  quantiles: 100_000,
  annotations: 5,
  perChannelSales: 1_000,
};

const prisma = new PrismaClient({ log: [] });

// ─── Tiny harness ─────────────────────────────────────────────────────────────

type Check = { name: string; passed: boolean; detail: string };
const results: Check[] = [];
const timings: { name: string; ms: number }[] = [];

const ok = (name: string, detail: string) => results.push({ name, passed: true, detail });
const ko = (name: string, detail: string) => results.push({ name, passed: false, detail });
const chk = (name: string, cond: boolean, pass: string, fail: string) =>
  cond ? ok(name, pass) : ko(name, fail);

async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const t0 = Date.now();
  const r = await fn();
  timings.push({ name: label, ms: Date.now() - t0 });
  return r;
}

// ─── Suite helpers ────────────────────────────────────────────────────────────

async function getTenantId(): Promise<string | null> {
  const row = await prisma.forecastTenant.findUnique({
    where: { companyId: COMPANY_ID },
    select: { id: true },
  });
  return row?.id ?? null;
}

async function suiteRowCounts(tid: string) {
  const [products, variants, channels, historical, quantiles, annotations] = await Promise.all([
    prisma.forecastProduct.count({ where: { tenantId: tid } }),
    prisma.forecastVariant.count({ where: { product: { tenantId: tid } } }),
    prisma.forecastSaleChannel.count({ where: { tenantId: tid } }),
    prisma.forecastHistoricalSale.count({ where: { variant: { product: { tenantId: tid } } } }),
    prisma.forecastQuantile.count({ where: { variant: { product: { tenantId: tid } } } }),
    prisma.forecastAnnotation.count({ where: { tenantId: tid } }),
  ]);

  chk("products_count", products >= THRESHOLDS.products, `${products}`, `only ${products} (need ${THRESHOLDS.products})`);
  chk("variants_count", variants >= THRESHOLDS.variants, `${variants}`, `only ${variants} (need ${THRESHOLDS.variants})`);
  chk("channels_count", channels === ALL_CHANNELS.length, `${channels}`, `${channels} ≠ ${ALL_CHANNELS.length}`);
  chk("historical_sales_count", historical >= THRESHOLDS.historicalSales, `${historical.toLocaleString()}`, `${historical.toLocaleString()} < ${THRESHOLDS.historicalSales.toLocaleString()}`);
  chk("quantiles_count", quantiles >= THRESHOLDS.quantiles, `${quantiles.toLocaleString()}`, `${quantiles.toLocaleString()} < ${THRESHOLDS.quantiles.toLocaleString()}`);
  chk("annotations_count", annotations >= THRESHOLDS.annotations, `${annotations}`, `${annotations} < ${THRESHOLDS.annotations}`);
}

async function suiteChannelDistribution(tid: string) {
  const rows = await prisma.forecastSaleChannel.findMany({
    where: { tenantId: tid },
    select: { name: true, _count: { select: { historicalSales: true } } },
  });
  const present = new Set(rows.map((r) => r.name));
  for (const ch of ALL_CHANNELS) {
    chk(`channel_exists_${ch}`, present.has(ch), `present`, `missing from ForecastSaleChannel`);
    const cnt = rows.find((r) => r.name === ch)?._count.historicalSales ?? 0;
    chk(`channel_sales_${ch}`, cnt >= THRESHOLDS.perChannelSales, `${cnt.toLocaleString()} rows`, `only ${cnt.toLocaleString()} (need ${THRESHOLDS.perChannelSales.toLocaleString()})`);
  }
}

async function suiteX100viOos(tid: string) {
  const variants = await prisma.forecastVariant.findMany({
    where: { product: { tenantId: tid, productTitle: { contains: "X100VI", mode: "insensitive" } } },
    select: { id: true },
  });
  if (!variants.length) { ko("x100vi_oos", "no X100VI variants found — check seed product titles"); return; }
  const oos = await prisma.forecastHistoricalSale.count({
    where: {
      variantId: { in: variants.map((v) => v.id) },
      isStockout: true,
      saleDate: { gte: new Date("2025-08-01"), lte: new Date("2025-09-30") },
    },
  });
  chk("x100vi_oos", oos > 0, `${oos} OOS rows in 2025-08/09`, `0 OOS rows in 2025-08 to 2025-09`);
}

async function suiteForecastSales(tid: string) {
  const today = startOfDay(new Date());
  const cids = (await prisma.forecastSaleChannel.findMany({ where: { tenantId: tid }, select: { id: true } })).map((c) => c.id);
  const [hist, fcast, earliest, latestQ] = await Promise.all([
    prisma.forecastHistoricalSale.count({ where: { channelId: { in: cids }, saleDate: { gte: addDays(today, -HISTORY_DAYS), lte: today }, isStockout: false } }),
    prisma.forecastQuantile.count({ where: { channelId: { in: cids }, forecastDate: { gte: today, lte: addDays(today, HORIZON_DAYS) }, quantile: QUANTILE } }),
    prisma.forecastHistoricalSale.findFirst({ where: { channelId: { in: cids }, isStockout: false }, orderBy: { saleDate: "asc" }, select: { saleDate: true } }),
    prisma.forecastQuantile.findFirst({ where: { channelId: { in: cids }, quantile: QUANTILE }, orderBy: { forecastDate: "desc" }, select: { forecastDate: true } }),
  ]);
  chk("sales_historical_rows", hist > 0, `${hist.toLocaleString()} non-stockout rows`, `0 historical rows — chart history blank`);
  chk("sales_forecast_rows", fcast > 0, `${fcast.toLocaleString()} Q${QUANTILE} rows`, `0 Q${QUANTILE} rows — chart forecast blank`);
  if (earliest) {
    const days = Math.round((today.getTime() - earliest.saleDate.getTime()) / 86400000);
    chk("sales_history_depth", days >= 365, `${days}d ago (${format(earliest.saleDate, "yyyy-MM-dd")})`, `only ${days}d history (need >= 365)`);
  }
  if (latestQ) {
    const days = Math.round((latestQ.forecastDate.getTime() - today.getTime()) / 86400000);
    chk("sales_horizon_depth", days >= 30, `+${days}d ahead (${format(latestQ.forecastDate, "yyyy-MM-dd")})`, `only +${days}d forecast (need >= 30)`);
  }
}

async function suiteForecastRevenue(tid: string) {
  const cids = (await prisma.forecastSaleChannel.findMany({ where: { tenantId: tid }, select: { id: true } })).map((c) => c.id);
  const nonZero = await prisma.forecastHistoricalSale.count({ where: { channelId: { in: cids }, revenue: { gt: 0 }, isStockout: false } });
  chk("revenue_non_zero", nonZero > 0, `${nonZero.toLocaleString()} rows with revenue > 0`, `all revenue = 0 — revenue chart blank`);
}

async function suiteForecastSummary(tid: string) {
  const [products, variants, channels, hist, fcast] = await Promise.all([
    prisma.forecastProduct.count({ where: { tenantId: tid } }),
    prisma.forecastVariant.findMany({ where: { product: { tenantId: tid }, isActive: true }, select: { rrp: true } }),
    prisma.forecastSaleChannel.count({ where: { tenantId: tid } }),
    prisma.forecastHistoricalSale.count({ where: { variant: { product: { tenantId: tid } } } }),
    prisma.forecastQuantile.count({ where: { variant: { product: { tenantId: tid } } } }),
  ]);
  const avgRrp = variants.length ? variants.reduce((s, v) => s + Number(v.rrp), 0) / variants.length : 0;
  chk("summary_total_products", products > 0, `totalProducts=${products}`, `totalProducts=0`);
  chk("summary_avg_rrp", avgRrp > 0, `avgRrp=${avgRrp.toFixed(2)}`, `avgRrp=0 — RRP not seeded`);
  chk("summary_channels", channels === ALL_CHANNELS.length, `channels=${channels}`, `channels=${channels} ≠ ${ALL_CHANNELS.length}`);
  chk("summary_history_points", hist > 0, `historyPoints=${hist.toLocaleString()}`, `historyPoints=0`);
  chk("summary_forecast_points", fcast > 0, `forecastPoints=${fcast.toLocaleString()}`, `forecastPoints=0`);
}

async function suiteForecastAnnotations(tid: string) {
  const rows = await prisma.forecastAnnotation.findMany({
    where: { tenantId: tid },
    select: { id: true, kind: true, title: true },
  });
  chk("annotations_count_min", rows.length >= THRESHOLDS.annotations, `${rows.length} annotations`, `${rows.length} < ${THRESHOLDS.annotations}`);
  const kinds = new Set(rows.map((r) => r.kind));
  for (const k of ["event_spike", "out_of_stock", "promotion", "launch"]) {
    chk(`annotation_kind_${k}`, kinds.has(k), `kind "${k}" present`, `kind "${k}" missing — UI toggle would show empty`);
  }
  const blank = rows.filter((r) => !r.title?.trim()).length;
  chk("annotations_titles_non_blank", blank === 0, "all titles non-blank", `${blank} annotations have blank titles`);
}

async function suiteExportData(tid: string) {
  const today = startOfDay(new Date());
  const [hist, fcast] = await Promise.all([
    prisma.forecastHistoricalSale.count({ where: { variant: { product: { tenantId: tid } }, saleDate: { gte: addDays(today, -HISTORY_DAYS), lte: today }, isStockout: false } }),
    prisma.forecastQuantile.count({ where: { variant: { product: { tenantId: tid } }, forecastDate: { gte: today, lte: addDays(today, HORIZON_DAYS) }, quantile: QUANTILE } }),
  ]);
  chk("export_historical_rows", hist > 0, `${hist.toLocaleString()} historical export rows`, `0 historical rows — CSV export empty`);
  chk("export_forecast_rows", fcast > 0, `${fcast.toLocaleString()} forecast export rows`, `0 forecast rows — CSV export lacks projections`);
}

async function suiteCategories(tid: string) {
  const cats = await prisma.forecastProduct.findMany({ where: { tenantId: tid }, select: { category: true }, distinct: ["category"] });
  chk("categories_non_empty", cats.length > 0, `${cats.length} distinct categories`, `0 categories — filter panel empty`);
  chk("categories_non_blank", cats.every((c) => c.category?.trim()), "all category strings non-blank", `${cats.filter((c) => !c.category?.trim()).length} blank category strings`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`=== Calumet Forecast Smoke Test  companyId=${COMPANY_ID} ===\n`);

  const tid = await timed("tenant", getTenantId);
  chk("tenant_resolved", tid !== null, `tenantId=${tid}`, `ForecastTenant missing for companyId=${COMPANY_ID}`);
  if (!tid) { console.error("ABORT: tenant not found"); await prisma.$disconnect(); return print(1); }

  await timed("row_counts",           () => suiteRowCounts(tid));
  await timed("channel_distribution", () => suiteChannelDistribution(tid));
  await timed("x100vi_oos",           () => suiteX100viOos(tid));
  await timed("forecast_sales",       () => suiteForecastSales(tid));
  await timed("forecast_revenue",     () => suiteForecastRevenue(tid));
  await timed("forecast_summary",     () => suiteForecastSummary(tid));
  await timed("annotations",          () => suiteForecastAnnotations(tid));
  await timed("export_data",          () => suiteExportData(tid));
  await timed("categories",           () => suiteCategories(tid));

  await prisma.$disconnect();
  print(0);
}

function print(abortCode: number) {
  const failed = results.filter((r) => !r.passed);
  const passed = results.filter((r) => r.passed);

  if (failed.length) { console.log(`\nFAILED (${failed.length}):`); failed.forEach((r) => console.log(`  FAIL  ${r.name}: ${r.detail}`)); }
  console.log(`\nPASSED (${passed.length}):`);
  passed.forEach((r) => console.log(`  pass  ${r.name}: ${r.detail}`));

  const ms = timings.map((t) => t.ms).sort((a, b) => a - b);
  const pct = (p: number) => ms[Math.max(0, Math.ceil((p / 100) * ms.length) - 1)] ?? 0;
  console.log("\nTiming:");
  timings.forEach((t) => console.log(`  ${t.name.padEnd(26)} ${t.ms} ms`));
  console.log(`  ${"p50".padEnd(26)} ${pct(50)} ms`);
  console.log(`  ${"p95".padEnd(26)} ${pct(95)} ms`);
  console.log(`  ${"total".padEnd(26)} ${ms.reduce((s, v) => s + v, 0)} ms`);

  const summary = {
    runAt: new Date().toISOString(), companyId: COMPANY_ID,
    passed: passed.length, failed: failed.length, allPassed: failed.length === 0,
    results, timings, p50Ms: pct(50), p95Ms: pct(95), totalMs: ms.reduce((s, v) => s + v, 0),
  };
  const out = "/tmp/forecast-smoke-results.json";
  try { fs.writeFileSync(out, JSON.stringify(summary, null, 2)); console.log(`\nJSON → ${out}`); }
  catch (e) { console.warn(`Could not write ${out}: ${(e as Error).message}`); }

  const label = (failed.length === 0 && abortCode === 0) ? "PASS" : "FAIL";
  console.log(`\n=== ${label}: ${passed.length}/${results.length} checks ===\n`);
  process.exit(failed.length > 0 || abortCode ? 1 : 0);
}

main().catch((e) => { console.error(e); prisma.$disconnect().catch(() => {}); process.exit(1); });
