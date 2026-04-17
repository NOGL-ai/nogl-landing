/* eslint-disable no-console */
/**
 * Seed script: Calumet Photographic forecast data.
 *
 * Pulls real Calumet products from the live `nogl_landing` DB, classifies them
 * into categories, synthesizes 24 months of daily historical sales and 60 days
 * of forward forecast quantiles across 3 sales channels (web, marketplace, b2b),
 * and loads everything into the `forecast` schema via Prisma.
 *
 * Usage:
 *   npm run seed:calumet-forecast
 */

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

// ─── Configuration ───────────────────────────────────────────────────────────

const CALUMET_COMPANY_ID = "cmnw4qqo10000ltccgauemneu";
const PRODUCT_LIMIT = 500;
const HISTORICAL_DAYS = 730; // 24 months
const FORECAST_DAYS = 60;
const BATCH_SIZE = 1000;

const SCRAPING_DB_URL =
  "postgresql://rag_user:KRpTNHqSR18hsBbE9jsLsXBAzdKN@10.10.10.213:5432/fashion_rag";

const CHANNELS = [
  {
    name: "web",
    label: "Web",
    colorFg: "#2970FF",
    colorBg: "#EFF4FF",
    weight: 0.6,
  },
  {
    name: "marketplace",
    label: "Marketplace",
    colorFg: "#F79009",
    colorBg: "#FFFAEB",
    weight: 0.3,
  },
  {
    name: "b2b",
    label: "B2B",
    colorFg: "#12B76A",
    colorBg: "#ECFDF3",
    weight: 0.1,
  },
] as const;

type ChannelName = (typeof CHANNELS)[number]["name"];

const CATEGORY_FACTOR: Record<string, number> = {
  cameras: 2.0,
  lenses: 1.5,
  lighting: 1.2,
  studio: 1.0,
  tripods: 0.9,
  accessories: 0.8,
  sets: 0.6,
};

const CHANNEL_WEIGHT: Record<ChannelName, number> = {
  web: 0.6,
  marketplace: 0.3,
  b2b: 0.1,
};

const DISCOUNT_FACTOR: Record<ChannelName, number> = {
  web: 0.85,
  marketplace: 0.88,
  b2b: 1.0,
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface RawProductRow {
  product_id: string;
  product_title: string;
  product_url: string | null;
  product_brand: string | null;
  product_category: string | null;
  product_original_price: string | number | null;
  product_sku: string | null;
}

interface ChannelRecord {
  id: string;
  name: ChannelName;
}

interface VariantContext {
  variantId: string;
  productId: string;
  rrp: number;
  category: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function classifyCategory(
  title: string,
  rawCategory: string | null,
): string {
  const cat = (rawCategory ?? "").toLowerCase();
  const t = title.toLowerCase();

  if (cat.includes("camera") || cat.includes("kamera")) return "cameras";
  if (cat.includes("lens") || cat.includes("objektiv")) return "lenses";
  if (/softbox|strobe|flash|blitz|licht|godox|profoto|bowens/i.test(t))
    return "lighting";
  if (/tripod|stativ/i.test(t)) return "tripods";
  if (/bag|rucksack|case|tasche/i.test(t)) return "accessories";
  if (/studio|backdrop|hintergrund/i.test(t)) return "studio";
  if (/set|kit|bundle/i.test(t)) return "sets";
  return "accessories";
}

function isSetProduct(title: string): boolean {
  return /set|kit|bundle/i.test(title);
}

function seasonalMultiplier(monthIndex: number): number {
  // monthIndex: 0-11 (Jan..Dec)
  if (monthIndex >= 9 && monthIndex <= 11) return 1.5; // Q4
  if (monthIndex >= 5 && monthIndex <= 7) return 1.1; // summer
  return 1.0;
}

function dayStart(d: Date): Date {
  const out = new Date(d);
  out.setUTCHours(0, 0, 0, 0);
  return out;
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() + days);
  return out;
}

function toNumber(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

async function chunkedCreateMany<T>(
  items: T[],
  insert: (chunk: T[]) => Promise<unknown>,
): Promise<number> {
  let inserted = 0;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE);
    await insert(chunk);
    inserted += chunk.length;
  }
  return inserted;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Ensure .env is loaded before running this script.",
    );
  }

  const prisma = new PrismaClient();
  const scrapingPool = new Pool({
    connectionString: SCRAPING_DB_URL,
    max: 4,
  });

  // We query the main nogl_landing DB (public.products) for Calumet products
  // via a dedicated pg Pool, since Prisma's schema only exposes the `nogl`,
  // `public`, and `forecast` schemas of the main DB. We use the DATABASE_URL
  // for the same DB, but also accept a fallback to Prisma if needed.
  const mainPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 4,
  });

  try {
    console.log("[seed] Connecting to databases…");

    // ── 1. Tenant ──────────────────────────────────────────────────────────
    console.log("[seed] Upserting tenant…");
    const tenant = await prisma.forecastTenant.upsert({
      where: { companyId: CALUMET_COMPANY_ID },
      update: {
        magicNumber: 1.0,
        hasBundle: true,
        isDemoTenant: false,
      },
      create: {
        companyId: CALUMET_COMPANY_ID,
        magicNumber: 1.0,
        hasBundle: true,
        isDemoTenant: false,
      },
    });
    console.log(`[seed]   tenant.id = ${tenant.id}`);

    // ── 2. Sale channels ───────────────────────────────────────────────────
    console.log("[seed] Upserting sale channels…");
    const channels: ChannelRecord[] = [];
    for (const ch of CHANNELS) {
      const row = await prisma.forecastSaleChannel.upsert({
        where: {
          tenantId_name: { tenantId: tenant.id, name: ch.name },
        },
        update: {
          label: ch.label,
          colorFg: ch.colorFg,
          colorBg: ch.colorBg,
          weight: ch.weight,
        },
        create: {
          tenantId: tenant.id,
          name: ch.name,
          label: ch.label,
          colorFg: ch.colorFg,
          colorBg: ch.colorBg,
          weight: ch.weight,
        },
      });
      channels.push({ id: row.id, name: ch.name });
    }
    console.log(`[seed]   channels: ${channels.map((c) => c.name).join(", ")}`);

    // ── 3. Pull Calumet products from main DB ──────────────────────────────
    console.log("[seed] Fetching Calumet products from public.products…");
    const productQuery = `
      SELECT DISTINCT ON (product_title)
        product_id,
        product_title,
        product_url,
        product_brand,
        product_category,
        product_original_price,
        product_sku
      FROM public.products
      WHERE company_id = $1
      ORDER BY product_title, product_original_price ASC NULLS LAST
      LIMIT $2
    `;
    const productsResult = await mainPool.query<RawProductRow>(productQuery, [
      CALUMET_COMPANY_ID,
      PRODUCT_LIMIT,
    ]);
    const rawProducts = productsResult.rows;
    console.log(`[seed]   fetched ${rawProducts.length} products`);

    if (rawProducts.length === 0) {
      console.warn(
        "[seed] No Calumet products found in public.products — aborting.",
      );
      return;
    }

    // ── 4. Upsert products + variants ──────────────────────────────────────
    console.log("[seed] Upserting products and variants…");
    const variantContexts: VariantContext[] = [];
    const setProducts: { productId: string; variantId: string; title: string; url: string | null }[] =
      [];
    let productsCreated = 0;
    let variantsCreated = 0;

    for (const raw of rawProducts) {
      const title = raw.product_title?.trim();
      if (!title) continue;

      const category = classifyCategory(title, raw.product_category);
      const isSet = isSetProduct(title);

      // ForecastProduct has no unique on (tenantId, externalId), so use
      // findFirst + create/update manually.
      let product = await prisma.forecastProduct.findFirst({
        where: { tenantId: tenant.id, externalId: raw.product_id },
      });

      if (product) {
        product = await prisma.forecastProduct.update({
          where: { id: product.id },
          data: {
            productTitle: title,
            brand: raw.product_brand ?? null,
            category,
            isSet,
          },
        });
      } else {
        product = await prisma.forecastProduct.create({
          data: {
            tenantId: tenant.id,
            externalId: raw.product_id,
            productTitle: title,
            brand: raw.product_brand ?? null,
            category,
            isSet,
          },
        });
        productsCreated += 1;
      }

      const rrp = toNumber(raw.product_original_price) ?? 100;

      let variant = await prisma.forecastVariant.findFirst({
        where: {
          productId: product.id,
          variantTitle: title,
        },
      });

      if (variant) {
        variant = await prisma.forecastVariant.update({
          where: { id: variant.id },
          data: {
            sku: raw.product_sku ?? null,
            rrp,
            currency: "EUR",
            isActive: true,
          },
        });
      } else {
        variant = await prisma.forecastVariant.create({
          data: {
            productId: product.id,
            variantTitle: title,
            sku: raw.product_sku ?? null,
            rrp,
            currency: "EUR",
          },
        });
        variantsCreated += 1;
      }

      variantContexts.push({
        variantId: variant.id,
        productId: product.id,
        rrp,
        category,
      });

      if (isSet) {
        setProducts.push({
          productId: product.id,
          variantId: variant.id,
          title,
          url: raw.product_url ?? null,
        });
      }
    }

    console.log(
      `[seed]   products created: ${productsCreated}, variants created: ${variantsCreated}, total variants: ${variantContexts.length}`,
    );

    // ── 5. Synthesize historical sales ─────────────────────────────────────
    console.log(
      `[seed] Synthesizing ${HISTORICAL_DAYS} days of historical sales for ${variantContexts.length * channels.length} variant/channel combos…`,
    );

    const today = dayStart(new Date());
    let totalHistoricalInserted = 0;

    // Map of variantId+channelId -> daily quantities (used for avg30 in step 6).
    type DailyTrail = { date: Date; qty: number }[];
    const trailByKey = new Map<string, DailyTrail>();

    for (const vc of variantContexts) {
      const catFactor = CATEGORY_FACTOR[vc.category] ?? 0.8;

      for (const ch of channels) {
        const chWeight = CHANNEL_WEIGHT[ch.name];
        const discount = DISCOUNT_FACTOR[ch.name];
        const key = `${vc.variantId}::${ch.id}`;
        const trail: DailyTrail = [];

        const rowsForVariantChannel: {
          variantId: string;
          channelId: string;
          saleDate: Date;
          quantity: number;
          revenue: number;
        }[] = [];

        for (let offset = HISTORICAL_DAYS; offset >= 1; offset--) {
          const date = addDays(today, -offset);
          let base = Math.random() * 30 * catFactor * chWeight;

          base *= seasonalMultiplier(date.getUTCMonth());

          const dow = date.getUTCDay();
          if (ch.name === "b2b" && (dow === 0 || dow === 6)) base *= 0.2;
          if (ch.name === "web" && (dow === 0 || dow === 6)) base *= 0.8;

          const quantity = Math.round(base);
          trail.push({ date, qty: quantity });

          if (quantity > 0) {
            const revenue = quantity * vc.rrp * discount;
            rowsForVariantChannel.push({
              variantId: vc.variantId,
              channelId: ch.id,
              saleDate: date,
              quantity,
              revenue,
            });
          }
        }

        trailByKey.set(key, trail);

        if (rowsForVariantChannel.length > 0) {
          const inserted = await chunkedCreateMany(
            rowsForVariantChannel,
            async (chunk) => {
              await prisma.forecastHistoricalSale.createMany({
                data: chunk,
                skipDuplicates: true,
              });
            },
          );
          totalHistoricalInserted += inserted;
        }
      }
    }

    console.log(
      `[seed]   inserted ${totalHistoricalInserted} historical sale rows`,
    );

    // ── 6. Synthesize forecast quantiles ───────────────────────────────────
    console.log(
      `[seed] Synthesizing ${FORECAST_DAYS} days of forecast quantiles (q3,q4,q5)…`,
    );

    const quantiles = [3, 4, 5] as const;
    let totalQuantileRows = 0;

    for (const vc of variantContexts) {
      for (const ch of channels) {
        const key = `${vc.variantId}::${ch.id}`;
        const trail = trailByKey.get(key) ?? [];
        // avg30 = average quantity over the most recent 30 historical days.
        const last30 = trail.slice(-30);
        const sum30 = last30.reduce((acc, row) => acc + row.qty, 0);
        let avg30 = last30.length > 0 ? sum30 / last30.length : 0;
        if (avg30 === 0) avg30 = 0.5;

        const discount = DISCOUNT_FACTOR[ch.name];

        const rows: {
          variantId: string;
          channelId: string;
          forecastDate: Date;
          quantile: number;
          forecastValue: number;
          revenueValue: number;
        }[] = [];

        for (let d = 0; d < FORECAST_DAYS; d++) {
          const forecastDate = addDays(today, d);
          const seasonal = seasonalMultiplier(forecastDate.getUTCMonth());

          for (const q of quantiles) {
            const multiplier = q === 3 ? 0.7 : q === 5 ? 1.4 : 1.0;
            const forecastValue =
              Math.round(avg30 * multiplier * seasonal * 10) / 10;
            const revenueValue = forecastValue * vc.rrp * discount;
            rows.push({
              variantId: vc.variantId,
              channelId: ch.id,
              forecastDate,
              quantile: q,
              forecastValue,
              revenueValue,
            });
          }
        }

        if (rows.length > 0) {
          const inserted = await chunkedCreateMany(rows, async (chunk) => {
            await prisma.forecastQuantile.createMany({
              data: chunk,
              skipDuplicates: true,
            });
          });
          totalQuantileRows += inserted;
        }
      }
    }

    console.log(`[seed]   inserted ${totalQuantileRows} forecast quantile rows`);

    // ── 7. Forecast sets for bundle/kit products ───────────────────────────
    console.log(
      `[seed] Inserting ${setProducts.length} ForecastSet rows for bundle/kit products…`,
    );
    let setsCreated = 0;
    for (const s of setProducts) {
      // There is no unique constraint; avoid duplicates with a findFirst.
      const existing = await prisma.forecastSet.findFirst({
        where: { tenantId: tenant.id, name: s.title },
      });
      if (existing) {
        await prisma.forecastSet.update({
          where: { id: existing.id },
          data: {
            description: `Auto-generated set for ${s.title}`,
            sourceUrl: s.url,
            variantIds: [s.variantId],
          },
        });
      } else {
        await prisma.forecastSet.create({
          data: {
            tenantId: tenant.id,
            name: s.title,
            description: `Auto-generated set for ${s.title}`,
            sourceUrl: s.url,
            variantIds: [s.variantId],
          },
        });
        setsCreated += 1;
      }
    }
    console.log(`[seed]   forecast sets created: ${setsCreated}`);

    // ── 8. Summary ─────────────────────────────────────────────────────────
    const [tenantCount, productCount, variantCount, histCount, quantCount] =
      await Promise.all([
        prisma.forecastTenant.count(),
        prisma.forecastProduct.count({ where: { tenantId: tenant.id } }),
        prisma.forecastVariant.count({
          where: { product: { tenantId: tenant.id } },
        }),
        prisma.forecastHistoricalSale.count({
          where: { variant: { product: { tenantId: tenant.id } } },
        }),
        prisma.forecastQuantile.count({
          where: { variant: { product: { tenantId: tenant.id } } },
        }),
      ]);

    console.log("\n[seed] ──────────── Summary ────────────");
    console.log(`[seed] tenants (total):   ${tenantCount}`);
    console.log(`[seed] products (Calumet): ${productCount}`);
    console.log(`[seed] variants (Calumet): ${variantCount}`);
    console.log(`[seed] historical sales:   ${histCount}`);
    console.log(`[seed] forecast quantiles: ${quantCount}`);
    console.log("[seed] ──────────────────────────────────\n");
    console.log("[seed] Done.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[seed] FAILED: ${message}`);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    process.exitCode = 1;
    throw err;
  } finally {
    await Promise.allSettled([
      prisma.$disconnect(),
      scrapingPool.end(),
      mainPool.end(),
    ]);
  }
}

main().catch(() => {
  // Error already logged; ensure non-zero exit.
  process.exitCode = 1;
});
