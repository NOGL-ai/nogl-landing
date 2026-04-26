/* eslint-disable no-console */
/**
 * Orchestrator: Calumet Wave 2 realistic seed.
 *
 * Usage:
 *   npx tsx scripts/seed-calumet-realistic.ts [--wipe] [--smoke] [--horizon-days=<N>]
 *
 * Options:
 *   --wipe            Delete all Calumet forecast rows before reseeding
 *   --smoke           Limit to 50 SKUs for fast smoke test
 *   --horizon-days N  Override default 180-day forecast horizon
 */

import { PrismaClient } from "@prisma/client";
import path from "path";
import { loadInstax } from "./seed-calumet/load-instax";
import { loadAmazon } from "./seed-calumet/load-amazon";
import { buildCatalog } from "./seed-calumet/build-catalog";
import { generateHistory } from "./seed-calumet/generate-history";
import { injectStockouts } from "./seed-calumet/inject-stockouts";
import { generateQuantiles } from "./seed-calumet/generate-quantiles";
import { seedAnnotations } from "./seed-calumet/seed-annotations";
import { HERO_SKUS } from "./seed-calumet/hero-skus";
import {
  CALUMET_COMPANY_ID,
  CALUMET_CHANNEL_WEIGHTS,
  FORECAST_CHANNELS,
  FORECAST_HISTORY_DAYS,
  FORECAST_HORIZON_DAYS,
} from "../src/config/forecast";

// ─── CLI argument parsing ─────────────────────────────────────────────────────

function parseArgs(): {
  wipe: boolean;
  smoke: boolean;
  horizonDays: number;
} {
  const args = process.argv.slice(2);
  const wipe = args.includes("--wipe");
  const smoke = args.includes("--smoke");

  let horizonDays = FORECAST_HORIZON_DAYS; // default from config (180)
  const horizonArg = args.find(
    (a) => a.startsWith("--horizon-days=") || a === "--horizon-days",
  );
  if (horizonArg) {
    const raw = horizonArg.includes("=")
      ? horizonArg.split("=")[1]
      : args[args.indexOf("--horizon-days") + 1];
    const parsed = parseInt(raw ?? "", 10);
    if (Number.isFinite(parsed) && parsed > 0) horizonDays = parsed;
  }

  return { wipe, smoke, horizonDays };
}

// ─── Channel colors (from forecast.ts) ───────────────────────────────────────

const CHANNEL_COLOR_MAP: Record<string, { colorFg: string; colorBg: string; label: string }> = {};
for (const ch of FORECAST_CHANNELS) {
  CHANNEL_COLOR_MAP[ch.name] = { colorFg: ch.colorFg, colorBg: ch.colorBg, label: ch.label };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env to worktree and run `npx prisma generate` first.",
    );
  }

  const { wipe, smoke, horizonDays } = parseArgs();
  const historyDays = FORECAST_HISTORY_DAYS; // 365

  console.log("[seed] ══════════ Calumet Wave 2 Realistic Seed ══════════");
  console.log(`[seed] wipe=${wipe}  smoke=${smoke}  horizonDays=${horizonDays}  historyDays=${historyDays}`);

  // Build a keepalive-aware datasource URL for long-running seed connections.
  // Appends pool_timeout=120 (seconds to wait for a connection from the pool)
  // and connection_limit=5 to avoid exhausting the DB.
  // The underlying libpq socket keepalive is enabled via PGTCPKEEPALIVES env vars
  // which libpq picks up automatically — no Prisma-level knob needed.
  const rawUrl = process.env.DATABASE_URL ?? "";
  const separator = rawUrl.includes("?") ? "&" : "?";
  const datasourceUrl =
    rawUrl +
    separator +
    "connection_limit=5&pool_timeout=120&connect_timeout=30&statement_timeout=600000";

  process.env.PGTCPKEEPALIVES = "1";
  process.env.PGTCPKEEPALIVESIDLE = "10";
  process.env.PGTCPKEEPALIVESINTERVAL = "10";
  process.env.PGTCPKEEPALIVESCOUNT = "5";

  const prisma = new PrismaClient({
    datasourceUrl,
    log: [],
  });
  const startTime = Date.now();

  // Data file paths
  const DATA_DIR = path.join(__dirname, "data");
  const INSTAX_PATH = path.join(DATA_DIR, "fujifilm-instax.csv");
  const AMAZON_PATH = path.join(DATA_DIR, "amazon-electronics-2025.csv");

  try {
    // ── Step 1: Load CSVs ────────────────────────────────────────────────────
    console.log("\n[seed] Step 1 — Loading CSVs…");
    let instaxRows = loadInstax(INSTAX_PATH);
    let amazonRows = loadAmazon(AMAZON_PATH);

    if (smoke) {
      instaxRows = instaxRows.slice(0, 200); // enough unique products
      amazonRows = amazonRows.slice(0, 200);
      console.log(`[seed]   SMOKE MODE: instax=${instaxRows.length}, amazon=${amazonRows.length}`);
    }

    // ── Step 2: Ensure tenant ────────────────────────────────────────────────
    console.log("\n[seed] Step 2 — Upserting tenant…");
    const tenant = await prisma.forecastTenant.upsert({
      where: { companyId: CALUMET_COMPANY_ID },
      update: { magicNumber: 1.0, hasBundle: true, isDemoTenant: false },
      create: {
        companyId: CALUMET_COMPANY_ID,
        magicNumber: 1.0,
        hasBundle: true,
        isDemoTenant: false,
      },
    });
    console.log(`[seed]   tenantId = ${tenant.id}`);

    // ── Step 3: Ensure channels ──────────────────────────────────────────────
    console.log("\n[seed] Step 3 — Upserting channels…");
    const channels: Array<{ id: string; name: string; weight: number }> = [];

    for (const chName of Object.keys(CALUMET_CHANNEL_WEIGHTS) as Array<keyof typeof CALUMET_CHANNEL_WEIGHTS>) {
      const weight = CALUMET_CHANNEL_WEIGHTS[chName];
      const colors = CHANNEL_COLOR_MAP[chName] ?? {
        colorFg: "#888888",
        colorBg: "#F0F0F0",
        label: chName,
      };

      const ch = await prisma.forecastSaleChannel.upsert({
        where: { tenantId_name: { tenantId: tenant.id, name: chName } },
        update: {
          label: colors.label,
          colorFg: colors.colorFg,
          colorBg: colors.colorBg,
          weight,
        },
        create: {
          tenantId: tenant.id,
          name: chName,
          label: colors.label,
          colorFg: colors.colorFg,
          colorBg: colors.colorBg,
          weight,
        },
      });

      channels.push({ id: ch.id, name: chName, weight });
    }

    console.log(`[seed]   channels: ${channels.map((c) => `${c.name}(${c.weight})`).join(", ")}`);

    // ── Step 4: Wipe (optional) ──────────────────────────────────────────────
    if (wipe) {
      console.log("\n[seed] Step 4 — Wiping existing Calumet forecast data…");

      // Must delete in FK dependency order
      const variantIds = (
        await prisma.forecastVariant.findMany({
          where: { product: { tenantId: tenant.id } },
          select: { id: true },
        })
      ).map((v) => v.id);

      if (variantIds.length > 0) {
        // Delete in chunks to avoid "too many parameters" errors
        const CHUNK = 500;
        for (let i = 0; i < variantIds.length; i += CHUNK) {
          const chunk = variantIds.slice(i, i + CHUNK);
          await prisma.forecastQuantile.deleteMany({
            where: { variantId: { in: chunk } },
          });
          await prisma.forecastHistoricalSale.deleteMany({
            where: { variantId: { in: chunk } },
          });
        }
        console.log(
          `[seed]   Deleted quantiles + historical sales for ${variantIds.length} variants`,
        );
      }

      await prisma.forecastVariant.deleteMany({
        where: { product: { tenantId: tenant.id } },
      });
      await prisma.forecastProduct.deleteMany({
        where: { tenantId: tenant.id },
      });
      await prisma.forecastAnnotation.deleteMany({
        where: { tenantId: tenant.id },
      });

      console.log("[seed]   Wipe complete");
    }

    // ── Step 5: Build catalog ────────────────────────────────────────────────
    console.log("\n[seed] Step 5 — Building catalog…");
    let variantContexts = await buildCatalog(
      prisma,
      tenant.id,
      instaxRows,
      amazonRows,
      HERO_SKUS,
    );

    if (smoke) {
      // Keep all 7 hero SKUs + up to 43 others = 50 total
      const heroVariants = variantContexts.filter((v) => v.isHero);
      const nonHero = variantContexts.filter((v) => !v.isHero);
      variantContexts = [...heroVariants, ...nonHero.slice(0, 50 - heroVariants.length)];
      console.log(`[seed]   SMOKE MODE: using ${variantContexts.length} variants`);
    }

    console.log(`[seed]   Catalog: ${variantContexts.length} variants`);

    // ── Step 6: Generate history ─────────────────────────────────────────────
    console.log("\n[seed] Step 6 — Generating historical sales…");
    const trail30Map = await generateHistory(prisma, variantContexts, channels, {
      historyDays,
    });

    // ── Step 7: Inject stockouts ─────────────────────────────────────────────
    console.log("\n[seed] Step 7 — Injecting stockout windows…");
    const stockoutResult = await injectStockouts(prisma, variantContexts, channels);
    console.log(
      `[seed]   Stockout rows: ${stockoutResult.stockoutRowCount}, restock spikes: ${stockoutResult.restockSpikeCount}`,
    );

    // ── Step 8: Generate quantiles ───────────────────────────────────────────
    console.log("\n[seed] Step 8 — Generating forecast quantiles…");
    await generateQuantiles(prisma, variantContexts, channels, trail30Map, {
      horizonDays,
    });

    // ── Step 9: Seed annotations ─────────────────────────────────────────────
    console.log("\n[seed] Step 9 — Seeding annotations…");
    await seedAnnotations(prisma, tenant.id);

    // ── Final summary ─────────────────────────────────────────────────────────
    const [productCount, variantCount, histCount, quantCount, annotCount] =
      await Promise.all([
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
        prisma.forecastAnnotation.count({ where: { tenantId: tenant.id } }),
      ]);

    const elapsed = Math.round((Date.now() - startTime) / 1000);

    console.log("\n[seed] ══════════ Summary ══════════");
    console.log(`[seed]   products:           ${productCount}`);
    console.log(`[seed]   variants:           ${variantCount}`);
    console.log(`[seed]   historical sales:   ${histCount.toLocaleString()}`);
    console.log(`[seed]   forecast quantiles: ${quantCount.toLocaleString()}`);
    console.log(`[seed]   annotations:        ${annotCount}`);
    console.log(`[seed]   elapsed:            ${elapsed}s`);
    console.log("[seed] ════════════════════════════");
    console.log("[seed] Done.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n[seed] FAILED: ${message}`);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => {
  process.exitCode = 1;
});
