/* eslint-disable no-console */
/**
 * Seed the Calumet demo tenant with realistic forecast demand data
 * sourced from the public Fujifilm Instax transaction CSV.
 *
 * Usage:
 *   npm run seed:forecast-demo              # idempotent upsert-based seed
 *   npm run seed:forecast-demo:wipe         # wipe Forecast* data for this tenant, then seed
 *
 * Dataset:
 *   Place the Instax CSV at scripts/data/fujifilm-instax.csv
 *   (See scripts/data/README.md for download instructions.)
 *
 * Safety:
 *   - The script never drops tables or touches other tenants' data.
 *   - `--wipe` only deletes Forecast* rows owned by the Calumet tenant.
 *   - All writes are batched and use upsert / createMany with skipDuplicates.
 */

import { PrismaClient, type Prisma } from "@prisma/client";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { parse } from "csv-parse/sync";
import groupBy from "lodash/groupBy";

import {
  CALUMET_COMPANY,
  FORECAST_CHANNELS,
  FORECAST_HORIZON_DAYS,
  SEED_IDR_TO_EUR,
  type ForecastChannelName,
} from "../src/config/forecast";
import {
  discountFactor,
  idrToEur,
  mapInstaxCategoryToNogl,
  mapInstaxMethodToChannel,
  parseInstaxDate,
  seasonalFactor,
  slugify,
  weekdayFactor,
} from "../src/lib/forecast/seed-helpers";

const CSV_PATH = path.join(process.cwd(), "scripts", "data", "fujifilm-instax.csv");
const BATCH_SIZE = 500;
const STOCKOUT_VARIANT_PERCENT = 0.05; // 5% of variants get injected stockouts
const STOCKOUT_DAYS_PER_VARIANT = 7;

interface InstaxRow {
  Tanggal: string;
  Kategori: string;
  Nama_Produk: string;
  Harga_Satuan: string;
  Qty: string;
  Diskon_IDR?: string;
  Method: string;
  Store?: string;
}

const prisma = new PrismaClient();

// ─── CLI flags ────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const FLAG_WIPE = argv.includes("--wipe");

// ─── Step 1: Upsert Calumet Company + ForecastTenant + Channels ──────────

async function ensureCalumetCompany(): Promise<string> {
  const existing = await prisma.company.findUnique({ where: { id: CALUMET_COMPANY.id } });
  if (existing) {
    console.log(`  company: using existing ${existing.name} (${existing.id})`);
    return existing.id;
  }
  const created = await prisma.company.create({
    data: {
      id: CALUMET_COMPANY.id,
      slug: CALUMET_COMPANY.slug,
      name: CALUMET_COMPANY.name,
      domain: CALUMET_COMPANY.domain,
      country_code: CALUMET_COMPANY.country_code,
      industry: "retail-photo",
    },
  });
  console.log(`  company: created ${created.name} (${created.id})`);
  return created.id;
}

async function ensureTenantAndChannels(companyId: string) {
  const tenant = await prisma.forecastTenant.upsert({
    where: { companyId },
    create: {
      companyId,
      magicNumber: 1.0,
      hasBundle: true,
      isDemoTenant: true,
    },
    update: { isDemoTenant: true, hasBundle: true },
  });
  console.log(`  tenant: ${tenant.id} (isDemoTenant=${tenant.isDemoTenant})`);

  for (const c of FORECAST_CHANNELS) {
    await prisma.forecastSaleChannel.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: c.name } },
      create: {
        tenantId: tenant.id,
        name: c.name,
        label: c.label,
        colorFg: c.colorFg,
        colorBg: c.colorBg,
        weight: c.weight,
      },
      update: { label: c.label, colorFg: c.colorFg, colorBg: c.colorBg, weight: c.weight },
    });
  }
  console.log(`  channels: ${FORECAST_CHANNELS.map((c) => c.name).join(", ")}`);
  return tenant;
}

// ─── Step 2: Wipe (optional) ──────────────────────────────────────────────

async function wipeTenantData(tenantId: string): Promise<void> {
  console.log("→ Wiping existing forecast data for this tenant...");
  // Deletes cascade via FK:
  //   ForecastTenant -> ForecastProduct -> ForecastVariant -> {HistoricalSale, Quantile}
  //   ForecastTenant -> ForecastSaleChannel -> {HistoricalSale, Quantile}
  // We delete at the leaf first for clarity, then the parents, to keep logs readable.
  const variants = await prisma.forecastVariant.findMany({
    where: { product: { tenantId } },
    select: { id: true },
  });
  const variantIds = variants.map((v) => v.id);
  if (variantIds.length) {
    const delHist = await prisma.forecastHistoricalSale.deleteMany({
      where: { variantId: { in: variantIds } },
    });
    const delQuant = await prisma.forecastQuantile.deleteMany({
      where: { variantId: { in: variantIds } },
    });
    console.log(`  deleted ${delHist.count} historical + ${delQuant.count} quantile rows`);
  }
  const delProducts = await prisma.forecastProduct.deleteMany({ where: { tenantId } });
  console.log(`  deleted ${delProducts.count} products (cascades to variants)`);
}

// ─── Step 3: Load Instax CSV ──────────────────────────────────────────────

async function loadInstax(): Promise<InstaxRow[]> {
  try {
    await fs.access(CSV_PATH);
  } catch {
    throw new Error(
      `Missing dataset at ${CSV_PATH}. See scripts/data/README.md for download instructions.`,
    );
  }
  const raw = await fs.readFile(CSV_PATH, "utf-8");
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as InstaxRow[];
  console.log(`  loaded ${rows.length} rows from ${path.basename(CSV_PATH)}`);
  return rows;
}

// ─── Step 4: Seed Catalog (Products + Variants) ───────────────────────────

interface SeededCatalog {
  variantByProductTitle: Map<string, { variantId: string; rrp: number }>;
}

async function seedCatalog(tenantId: string, rows: InstaxRow[]): Promise<SeededCatalog> {
  const grouped = groupBy(rows, (r) => r.Nama_Produk);
  const variantByProductTitle = new Map<string, { variantId: string; rrp: number }>();

  let productCount = 0;
  for (const [title, sales] of Object.entries(grouped)) {
    if (!title?.trim() || !sales.length) continue;

    const first = sales[0];
    const category = mapInstaxCategoryToNogl(first.Kategori);
    const priceIdr = Number(first.Harga_Satuan);
    const priceEur = idrToEur(priceIdr, SEED_IDR_TO_EUR);
    // RRP = 15% markup over average transacted price
    const rrp = Math.max(priceEur * 1.15, 0.5);
    const isSet = /kit|set|bundle/i.test(title);
    const sku = `INSTAX-${slugify(title) || "unknown"}`.slice(0, 64);

    const product = await prisma.forecastProduct.upsert({
      where: { tenantId_productTitle: { tenantId, productTitle: title } },
      create: {
        tenantId,
        productTitle: title,
        category,
        brand: "Fujifilm",
        isSet,
      },
      update: { category, isSet },
    });

    const variant = await prisma.forecastVariant.upsert({
      where: { productId_sku: { productId: product.id, sku } },
      create: {
        productId: product.id,
        variantTitle: "Default",
        sku,
        rrp,
        currency: "EUR",
        isActive: true,
      },
      update: { rrp, isActive: true },
    });

    variantByProductTitle.set(title, { variantId: variant.id, rrp });
    productCount++;
  }
  console.log(`  upserted ${productCount} products + variants`);
  return { variantByProductTitle };
}

// ─── Step 5: Seed Historical Sales ────────────────────────────────────────

async function seedHistoricalSales(
  tenantId: string,
  rows: InstaxRow[],
  catalog: SeededCatalog,
): Promise<void> {
  const channels = await prisma.forecastSaleChannel.findMany({ where: { tenantId } });
  const channelIdByName = new Map<ForecastChannelName, string>(
    channels.map((c) => [c.name as ForecastChannelName, c.id]),
  );

  // Aggregate same (variant, channel, date) into a single row
  // (the Instax CSV has multiple transactions per day).
  const aggregator = new Map<
    string,
    { variantId: string; channelId: string; saleDate: Date; quantity: number; revenue: number }
  >();

  let skippedNoVariant = 0;
  let skippedBadDate = 0;
  for (const row of rows) {
    const title = row.Nama_Produk?.trim();
    if (!title) continue;
    const variantInfo = catalog.variantByProductTitle.get(title);
    if (!variantInfo) {
      skippedNoVariant++;
      continue;
    }
    const saleDate = parseInstaxDate(row.Tanggal);
    if (!saleDate) {
      skippedBadDate++;
      continue;
    }
    const channelName = mapInstaxMethodToChannel(row.Method);
    const channelId = channelIdByName.get(channelName);
    if (!channelId) continue; // should not happen

    const qty = Number(row.Qty) || 0;
    if (qty <= 0) continue;
    const gross = qty * Number(row.Harga_Satuan) - Number(row.Diskon_IDR ?? 0);
    const revenueEur = idrToEur(gross, SEED_IDR_TO_EUR);

    const key = `${variantInfo.variantId}|${channelId}|${saleDate.toISOString().slice(0, 10)}`;
    const prev = aggregator.get(key);
    if (prev) {
      prev.quantity += qty;
      prev.revenue += revenueEur;
    } else {
      aggregator.set(key, {
        variantId: variantInfo.variantId,
        channelId,
        saleDate,
        quantity: qty,
        revenue: revenueEur,
      });
    }
  }

  const payload: Prisma.ForecastHistoricalSaleCreateManyInput[] = Array.from(
    aggregator.values(),
  ).map((r) => ({
    variantId: r.variantId,
    channelId: r.channelId,
    saleDate: r.saleDate,
    quantity: r.quantity,
    revenue: new Prisma.Decimal(r.revenue.toFixed(2)),
  }));

  let inserted = 0;
  for (let i = 0; i < payload.length; i += BATCH_SIZE) {
    const batch = payload.slice(i, i + BATCH_SIZE);
    const res = await prisma.forecastHistoricalSale.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += res.count;
  }
  console.log(
    `  inserted ${inserted} historical rows (aggregated from ${rows.length - skippedNoVariant - skippedBadDate} usable transactions, skipped ${skippedNoVariant} unmatched, ${skippedBadDate} bad dates)`,
  );
}

// ─── Step 6: Synthesize 60-day quantile forecast ──────────────────────────

async function synthesizeForecastQuantiles(tenantId: string): Promise<void> {
  const channels = await prisma.forecastSaleChannel.findMany({ where: { tenantId } });
  const variants = await prisma.forecastVariant.findMany({
    where: { product: { tenantId } },
    select: { id: true, rrp: true, product: { select: { isSet: true } } },
  });

  // Horizon: today (UTC midnight) ... today + FORECAST_HORIZON_DAYS
  const today = startOfUtcDay(new Date());
  const cutoff = addDays(today, -30);

  // Fetch 30-day trailing historicals in one query, then aggregate in memory.
  const recent = await prisma.forecastHistoricalSale.findMany({
    where: {
      variantId: { in: variants.map((v) => v.id) },
      saleDate: { gte: cutoff, lt: today },
      isStockout: false,
    },
    select: { variantId: true, channelId: true, quantity: true },
  });
  const avgByKey = new Map<string, number>();
  for (const r of recent) {
    const k = `${r.variantId}|${r.channelId}`;
    avgByKey.set(k, (avgByKey.get(k) ?? 0) + r.quantity);
  }
  for (const [k, sum] of avgByKey) avgByKey.set(k, sum / 30);

  const payload: Prisma.ForecastQuantileCreateManyInput[] = [];
  const QUANTILES: Array<{ q: 3 | 4 | 5; mult: number }> = [
    { q: 3, mult: 0.7 },
    { q: 4, mult: 1.0 },
    { q: 5, mult: 1.4 },
  ];

  for (const variant of variants) {
    for (const channel of channels) {
      const channelName = channel.name as ForecastChannelName;
      const avgDaily = avgByKey.get(`${variant.id}|${channel.id}`) ?? 0;
      if (avgDaily <= 0) continue;

      for (let day = 0; day < FORECAST_HORIZON_DAYS; day++) {
        const forecastDate = addDays(today, day);
        const season = seasonalFactor(forecastDate);
        const weekday = weekdayFactor(channelName, forecastDate);
        const channelDiscount = discountFactor(channelName);
        const rrpEur = Number(variant.rrp);
        const isBundleTotal = variant.product.isSet;

        for (const { q, mult } of QUANTILES) {
          const forecastValue = avgDaily * mult * season * weekday;
          const revenueValue = forecastValue * rrpEur * channelDiscount;
          payload.push({
            variantId: variant.id,
            channelId: channel.id,
            forecastDate,
            quantile: q,
            forecastValue,
            revenueValue: new Prisma.Decimal(revenueValue.toFixed(2)),
            isBundleTotal,
          });
        }
      }
    }
  }

  // Upsert-style: delete tenant's existing quantile rows in the forward window, then insert.
  // Safer + faster than N upserts.
  await prisma.forecastQuantile.deleteMany({
    where: {
      variant: { product: { tenantId } },
      forecastDate: { gte: today, lt: addDays(today, FORECAST_HORIZON_DAYS) },
    },
  });
  let inserted = 0;
  for (let i = 0; i < payload.length; i += BATCH_SIZE) {
    const batch = payload.slice(i, i + BATCH_SIZE);
    const res = await prisma.forecastQuantile.createMany({ data: batch, skipDuplicates: true });
    inserted += res.count;
  }
  console.log(`  inserted ${inserted} quantile rows (${FORECAST_HORIZON_DAYS}-day horizon)`);
}

// ─── Step 7: Censored-demand injection (lightweight) ──────────────────────

async function applyCensoredDemandMethodology(tenantId: string): Promise<void> {
  const variants = await prisma.forecastVariant.findMany({
    where: { product: { tenantId } },
    select: { id: true },
  });
  const pickCount = Math.max(1, Math.ceil(variants.length * STOCKOUT_VARIANT_PERCENT));
  const picked = shuffle(variants).slice(0, pickCount);

  const today = startOfUtcDay(new Date());
  const rangeStart = addDays(today, -90);

  let marked = 0;
  for (const v of picked) {
    const sales = await prisma.forecastHistoricalSale.findMany({
      where: { variantId: v.id, saleDate: { gte: rangeStart, lt: today } },
      select: { id: true },
      take: 200,
    });
    if (!sales.length) continue;
    const sampled = shuffle(sales).slice(0, STOCKOUT_DAYS_PER_VARIANT);
    if (!sampled.length) continue;
    const res = await prisma.forecastHistoricalSale.updateMany({
      where: { id: { in: sampled.map((s) => s.id) } },
      data: { isStockout: true, quantity: 0 },
    });
    marked += res.count;
  }
  console.log(
    `  marked ${marked} historical rows as stockouts (${pickCount}/${variants.length} variants affected)`,
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("→ Seeding forecast demo data for Calumet tenant");
  console.log("→ Step 1: Company + tenant + channels");
  const companyId = await ensureCalumetCompany();
  const tenant = await ensureTenantAndChannels(companyId);

  if (FLAG_WIPE) {
    await wipeTenantData(tenant.id);
  }

  console.log("→ Step 2: Load Instax CSV");
  const rows = await loadInstax();

  console.log("→ Step 3: Seed catalog (products + variants)");
  const catalog = await seedCatalog(tenant.id, rows);

  console.log("→ Step 4: Seed historical sales");
  await seedHistoricalSales(tenant.id, rows, catalog);

  console.log("→ Step 5: Synthesize 60-day quantile forecast");
  await synthesizeForecastQuantiles(tenant.id);

  console.log("→ Step 6: Inject censored-demand stockout markers");
  await applyCensoredDemandMethodology(tenant.id);

  const [products, variants, historical, quantiles] = await Promise.all([
    prisma.forecastProduct.count({ where: { tenantId: tenant.id } }),
    prisma.forecastVariant.count({ where: { product: { tenantId: tenant.id } } }),
    prisma.forecastHistoricalSale.count({
      where: { variant: { product: { tenantId: tenant.id } } },
    }),
    prisma.forecastQuantile.count({ where: { variant: { product: { tenantId: tenant.id } } } }),
  ]);

  console.log("\n✓ Done.");
  console.log(`  products:   ${products}`);
  console.log(`  variants:   ${variants}`);
  console.log(`  historical: ${historical}`);
  console.log(`  quantiles:  ${quantiles}`);
  console.log("  Open /en/demand to view the chart.");
}

// ─── Utils ────────────────────────────────────────────────────────────────

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}
function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

main()
  .catch((err) => {
    console.error("✗ Seeding failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
