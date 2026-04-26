/* Validation queries for Calumet full seed */
import { Client } from "pg";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const CALUMET_COMPANY_ID = "cmnw4qqo10000ltccgauemneu";
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();
  console.log("Connected. Running validation queries…\n");

  // ── 1. Row counts ────────────────────────────────────────────────────────────
  const counts = await client.query(`
    WITH tid AS (SELECT id FROM forecast."ForecastTenant" WHERE "companyId" = $1)
    SELECT
      (SELECT COUNT(*) FROM forecast."ForecastProduct" WHERE "tenantId" = (SELECT id FROM tid)) AS products,
      (SELECT COUNT(*) FROM forecast."ForecastVariant" WHERE "productId" IN (
        SELECT id FROM forecast."ForecastProduct" WHERE "tenantId" = (SELECT id FROM tid)
      )) AS variants,
      (SELECT COUNT(*)
        FROM forecast."ForecastHistoricalSale" h
        JOIN forecast."ForecastVariant" v ON h."variantId" = v.id
        JOIN forecast."ForecastProduct" p ON v."productId" = p.id
        WHERE p."tenantId" = (SELECT id FROM tid)
      ) AS historical_sales,
      (SELECT COUNT(*)
        FROM forecast."ForecastQuantile" q
        JOIN forecast."ForecastVariant" v ON q."variantId" = v.id
        JOIN forecast."ForecastProduct" p ON v."productId" = p.id
        WHERE p."tenantId" = (SELECT id FROM tid)
      ) AS quantiles,
      (SELECT COUNT(*) FROM forecast."ForecastAnnotation" WHERE "tenantId" = (SELECT id FROM tid)) AS annotations
  `, [CALUMET_COMPANY_ID]);

  console.log("=== 1. Row Counts ===");
  console.log(counts.rows[0]);
  console.log();

  // ── 2. Per-channel distribution ──────────────────────────────────────────────
  const channels = await client.query(`
    SELECT c.name, COUNT(*) AS row_count, ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 1) AS pct
    FROM forecast."ForecastHistoricalSale" h
    JOIN forecast."ForecastSaleChannel" c ON h."channelId" = c.id
    WHERE c."tenantId" = (SELECT id FROM forecast."ForecastTenant" WHERE "companyId" = $1)
    GROUP BY c.name ORDER BY row_count DESC
  `, [CALUMET_COMPANY_ID]);

  console.log("=== 2. Channel Distribution ===");
  console.log(channels.rows);
  console.log();

  // ── 3. Top 10 brands ─────────────────────────────────────────────────────────
  const brands = await client.query(`
    SELECT brand, COUNT(*) AS products
    FROM forecast."ForecastProduct"
    WHERE "tenantId" = (SELECT id FROM forecast."ForecastTenant" WHERE "companyId" = $1)
    GROUP BY brand ORDER BY products DESC LIMIT 10
  `, [CALUMET_COMPANY_ID]);

  console.log("=== 3. Top 10 Brands ===");
  console.log(brands.rows);
  console.log();

  // ── 4. Stockout percentage ────────────────────────────────────────────────────
  const stockout = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE "isStockout" = true) AS stockout_rows,
      COUNT(*) AS total_rows,
      ROUND(COUNT(*) FILTER (WHERE "isStockout" = true)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS stockout_pct
    FROM forecast."ForecastHistoricalSale" h
    JOIN forecast."ForecastVariant" v ON h."variantId" = v.id
    JOIN forecast."ForecastProduct" p ON v."productId" = p.id
    WHERE p."tenantId" = (SELECT id FROM forecast."ForecastTenant" WHERE "companyId" = $1)
  `, [CALUMET_COMPANY_ID]);

  console.log("=== 4. Stockout % ===");
  console.log(stockout.rows[0]);
  console.log();

  // ── 5. Hero SKU X100VI last 90 days ──────────────────────────────────────────
  const hero = await client.query(`
    SELECT DATE_TRUNC('week', "saleDate")::date AS week_start, SUM(quantity) AS qty, BOOL_OR("isStockout") AS had_stockout
    FROM forecast."ForecastHistoricalSale" h
    JOIN forecast."ForecastVariant" v ON h."variantId" = v.id
    JOIN forecast."ForecastProduct" p ON v."productId" = p.id
    WHERE p."productTitle" ILIKE '%X100VI%'
      AND p."tenantId" = (SELECT id FROM forecast."ForecastTenant" WHERE "companyId" = $1)
      AND "saleDate" >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY week_start ORDER BY week_start
  `, [CALUMET_COMPANY_ID]);

  console.log("=== 5. Fujifilm X100VI — Last 90 days (weekly) ===");
  if (hero.rows.length === 0) {
    console.log("  No rows found (historical sales may not be seeded yet)");
  } else {
    console.log(hero.rows);
  }
  console.log();

  await client.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
