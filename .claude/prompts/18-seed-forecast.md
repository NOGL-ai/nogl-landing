# Seed realistic forecast demo data from public datasets

## Goal

The `/en/demand` forecast page renders charts but has **no seed data** — it shows the empty state. Populate it with realistic camera-retail demand data sourced from 4 public datasets so anyone opening the page understands what the feature does **without waiting for live Calumet data**.

Reference: the founder's research doc outlines the 4 best public datasets for this use case. Use them verbatim.

## Datasets to ingest (in priority order)

### 1. Fujifilm Instax Sales Transaction Data (Synthetic) — PRIMARY
- **URL**: https://www.kaggle.com/datasets/bertnardomariouskono/fujifilm-instax-sales-transaction-data-synthetic
- **Why**: 10/10 camera relevance, 10k+ rows, 3 years (May 2022 - May 2025), captures seasonality + promotional elasticity + multi-channel (physical store + Tokopedia + Shopee).
- **License**: CC0 Public Domain.
- **Schema**: `Tanggal (Date)`, `Kategori`, `Nama_Produk`, `Harga_Satuan (IDR)`, `Qty`, `Diskon_IDR`, `Method`, `Store`.
- **Use**: map each row directly to a `ForecastHistoricalSale` entry. Categories `Kamera` / `Film` / `Aksesoris` map to Calumet's `cameras` / `accessories` / `accessories`.

### 2. Amazon Electronics Products Sales Dataset 42K+ (2025) — CATALOG PRIOR
- **URL**: https://www.kaggle.com/datasets/ikramshah512/amazon-products-sales-dataset-42k-items-2025
- **Why**: 8/10 camera relevance, 42k SKUs, dedicated "Camera & Photo" sub-category. Use to enrich our Calumet product catalog with realistic price distributions + ratings + best-seller flags.
- **License**: CC0.
- **Schema**: `Product_Title`, `Category`, `Price`, `Ratings_Count`, `Is_Best_Seller`.
- **Use**: filter to "Camera & Photo" (~3-5k rows), map to `ForecastProduct` + `ForecastVariant` when we need to invent additional SKUs to fill out the Calumet catalog.

### 3. Global Electronics Retailers — CHANNEL & GEO
- **URL**: https://www.kaggle.com/datasets/bhavikjikadara/global-electronics-retailers
- **Why**: 7/10, 62,884 rows, multi-year, relational tables (transactions + products + stores + customers + currency). Use to model multi-store / multi-channel demand (mirrors Calumet's web + marketplace + B2B split).
- **License**: CC BY 4.0.
- **Schema**: `Order_Date`, `Order_Number`, `Product_Key`, `Store_Key`, `Quantity`, `Currency_Code`.
- **Use**: 1-to-many mapping of store → channel for the demand-shaping driver that splits by channel. Useful for realistic assortment cannibalization patterns.

### 4. FreshRetailNet-50K — CENSORED-DEMAND METHODOLOGY ONLY
- **URL**: https://huggingface.co/datasets/Dingdong-Inc/FreshRetailNet-50K
- **Why**: 2/10 camera relevance, but the only public dataset with explicit **stockout labels** (`stock_hour6_22_cnt`). Copy its MNAR latent-demand recovery approach — do NOT ingest the grocery data itself.
- **License**: CC BY 4.0.
- **Use**: **methodology reference only.** Implement the two-stage latent-demand recovery pipeline: (1) detect synthetic stockouts in our seeded data → (2) mask those periods when fitting the forecast so the model doesn't under-predict.

## Ingestion pipeline

Create `scripts/seed-forecast-demo.ts` with this structure:

```typescript
/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

const CALUMET_COMPANY_ID = "cmnw4qqo10000ltccgauemneu";

// ─── Step 1: Load Fujifilm Instax CSV ────────────────────────────────────
async function loadInstax(): Promise<FujifilmRow[]> {
  const path = "scripts/data/fujifilm-instax.csv";
  const raw = await fs.readFile(path, "utf-8");
  return parse(raw, { columns: true, skip_empty_lines: true });
}

// ─── Step 2: Map Instax categories to NOGL categories ────────────────────
const CATEGORY_MAP: Record<string, string> = {
  "Kamera":       "cameras",
  "Film":         "accessories",
  "Aksesoris":    "accessories",
  "Lens":         "lenses",
  "Lighting":     "lighting",
  "Tripod":       "tripods",
};

// ─── Step 3: Convert IDR to EUR (fixed rate for demo) ────────────────────
const IDR_TO_EUR = 0.000058;  // ~1 EUR = 17,241 IDR

// ─── Step 4: Upsert ForecastTenant + SaleChannels ─────────────────────────
async function ensureTenantAndChannels() {
  const tenant = await prisma.forecastTenant.upsert({
    where: { companyId: CALUMET_COMPANY_ID },
    create: {
      companyId: CALUMET_COMPANY_ID,
      magicNumber: 1.0,
      hasBundle: true,
      isDemoTenant: true,
    },
    update: {},
  });

  // 3 channels mirroring Calumet's real distribution
  const channels = [
    { name: "web",         label: "Web",         colorFg: "#2970FF", colorBg: "#EFF4FF", weight: 0.6 },
    { name: "marketplace", label: "Marketplace", colorFg: "#F79009", colorBg: "#FFFAEB", weight: 0.3 },
    { name: "b2b",         label: "B2B",         colorFg: "#12B76A", colorBg: "#ECFDF3", weight: 0.1 },
  ];
  for (const c of channels) {
    await prisma.forecastSaleChannel.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: c.name } },
      create: { tenantId: tenant.id, ...c },
      update: c,
    });
  }
  return tenant;
}

// ─── Step 5: Seed ForecastProduct + ForecastVariant from Instax rows ─────
async function seedCatalogFromInstax(tenant) {
  const rows = await loadInstax();
  const grouped = groupBy(rows, "Nama_Produk");

  for (const [title, sales] of Object.entries(grouped)) {
    const firstRow = sales[0];
    const category = CATEGORY_MAP[firstRow.Kategori] ?? "accessories";
    const price = Number(firstRow.Harga_Satuan) * IDR_TO_EUR;

    const product = await prisma.forecastProduct.upsert({
      where: { /* tenant + title unique composite */ },
      create: {
        tenantId: tenant.id,
        productTitle: title,
        category,
        brand: "Fujifilm",  // all Instax
        isSet: title.toLowerCase().includes("kit") || title.toLowerCase().includes("set"),
      },
      update: {},
    });

    await prisma.forecastVariant.upsert({
      where: { /* product + sku unique */ },
      create: {
        productId: product.id,
        variantTitle: "Default",
        sku: `INSTAX-${slugify(title)}`,
        rrp: price * 1.15,  // 15% margin back-calculated
        currency: "EUR",
      },
      update: {},
    });
  }
}

// ─── Step 6: Seed ForecastHistoricalSale from Instax rows ─────────────────
async function seedHistoricalSales(tenant) {
  const rows = await loadInstax();
  const channels = await prisma.forecastSaleChannel.findMany({ where: { tenantId: tenant.id } });

  for (const row of rows) {
    const variant = await prisma.forecastVariant.findFirst({
      where: { product: { productTitle: row.Nama_Produk } },
    });
    if (!variant) continue;

    // Map Instax Method → channel
    const channelName =
      row.Method === "Online Store" || row.Method === "Website" ? "web"
      : row.Method === "Tokopedia" || row.Method === "Shopee" ? "marketplace"
      : "web";
    const channel = channels.find((c) => c.name === channelName);

    await prisma.forecastHistoricalSale.create({
      data: {
        variantId: variant.id,
        channelId: channel.id,
        saleDate: new Date(row.Tanggal),
        quantity: Number(row.Qty),
        revenue: Number(row.Qty) * Number(row.Harga_Satuan) * IDR_TO_EUR,
      },
    });
  }
}

// ─── Step 7: Synthesize ForecastQuantile (60 days forward) ────────────────
async function synthesizeForecastQuantiles(tenant) {
  const variants = await prisma.forecastVariant.findMany({
    where: { product: { tenantId: tenant.id } },
  });
  const channels = await prisma.forecastSaleChannel.findMany({ where: { tenantId: tenant.id } });
  const today = new Date();

  for (const variant of variants) {
    for (const channel of channels) {
      // Get last 30 days of sales for this variant×channel
      const recent = await prisma.forecastHistoricalSale.findMany({
        where: {
          variantId: variant.id,
          channelId: channel.id,
          saleDate: { gte: new Date(today.getTime() - 30 * 24 * 3600 * 1000) },
        },
      });
      const avgDaily = recent.reduce((s, r) => s + r.quantity, 0) / 30;
      if (avgDaily === 0) continue;

      for (let day = 0; day < 60; day++) {
        const forecastDate = new Date(today.getTime() + day * 24 * 3600 * 1000);
        const seasonal = seasonalFactor(forecastDate);  // Q4 × 1.5, summer × 1.1
        const weekday = channel.name === "b2b" && isWeekend(forecastDate) ? 0.2 : 1.0;

        for (const [quantile, multiplier] of [[3, 0.7], [4, 1.0], [5, 1.4]]) {
          const forecastValue = avgDaily * multiplier * seasonal * weekday;
          const revenueValue = forecastValue * Number(variant.rrp) * discountFactor(channel.name);

          await prisma.forecastQuantile.create({
            data: {
              variantId: variant.id,
              channelId: channel.id,
              forecastDate,
              quantile,
              forecastValue,
              revenueValue,
              isBundleTotal: false,
            },
          });
        }
      }
    }
  }
}

// ─── Step 8: Apply censored-demand methodology (from FreshRetailNet) ──────
// Inject synthetic stockouts in 5% of variants to demonstrate latent demand
async function applyCensoredDemandMethodology(tenant) {
  // Pick 5% of variants, mark days with quantity=0 as "stockout periods"
  // When forecast runs later, these days are masked out of the baseline calc
  // This demonstrates why the feature surfaces "lost demand" as a separate line.
  // See: https://arxiv.org/html/2505.16319v2
  // ... implementation
}

async function main() {
  console.log("Seeding forecast demo data for Calumet tenant...");
  const tenant = await ensureTenantAndChannels();
  await seedCatalogFromInstax(tenant);
  await seedHistoricalSales(tenant);
  await synthesizeForecastQuantiles(tenant);
  await applyCensoredDemandMethodology(tenant);
  console.log("Done. View at /en/demand");
}

main().finally(() => prisma.$disconnect());
```

Add to `package.json`:
```json
"seed:forecast-demo": "node --env-file=.env --import tsx scripts/seed-forecast-demo.ts",
"seed:forecast-demo:real-only": "npm run seed:forecast-demo -- --real-only",
"seed:forecast-demo:wipe": "npm run seed:forecast-demo -- --wipe"
```

## Download the datasets

Don't commit the raw CSVs (too big). Instead, the prompt's first task is to download:

```bash
mkdir -p scripts/data
cd scripts/data

# Dataset 1 — Fujifilm Instax (primary)
kaggle datasets download -d bertnardomariouskono/fujifilm-instax-sales-transaction-data-synthetic
unzip fujifilm-instax-sales-transaction-data-synthetic.zip
mv *.csv fujifilm-instax.csv

# Dataset 2 — Amazon Electronics (catalog priors)
kaggle datasets download -d ikramshah512/amazon-products-sales-dataset-42k-items-2025
unzip amazon-products-sales-dataset-42k-items-2025.zip
mv *Electronics*.csv amazon-electronics-42k.csv

# Dataset 3 — Global Electronics Retailers (channel/store breakdown)
kaggle datasets download -d bhavikjikadara/global-electronics-retailers
unzip global-electronics-retailers.zip
```

Requires `kaggle` CLI configured (`pip install kaggle`, place `kaggle.json` at `~/.kaggle/`). Alternative: manual download via browser + place in `scripts/data/`.

Add `scripts/data/*.csv` + `scripts/data/*.zip` to `.gitignore`.

## Expected result

After running the seed:

- **~60 ForecastProduct rows** (Instax cameras, films, accessories; optional Canon/Sony added from Amazon dataset)
- **~60 ForecastVariant rows** (one per product)
- **~10,000 ForecastHistoricalSale rows** (3 years × ~10 transactions/day)
- **~10,800 ForecastQuantile rows** (60 variants × 3 channels × 60 days × 3 quantiles)
- **~5% of variants with injected stockouts** (for censored-demand demo)

`/en/demand` should now show:
- Populated line chart with real Instax history + 60-day forecast ribbon
- "Total Products" / "Avg Price" / "Channels" KPI cards with values
- Category chips (cameras, accessories) — click to filter
- Channel toggles (web / marketplace / B2B)
- Compare mode: show 2024 vs. 2025 period side-by-side

## Validation

Check after seeding:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
Promise.all([
  p.forecastProduct.count(),
  p.forecastVariant.count(),
  p.forecastHistoricalSale.count(),
  p.forecastQuantile.count(),
]).then(([prod, v, h, q]) => {
  console.log({ products: prod, variants: v, historical: h, quantiles: q });
});
"
```

Expected output:
```
{ products: 60+, variants: 60+, historical: 10000+, quantiles: 10000+ }
```

## Testing requirements

See `_TESTING_AND_DATA_APPROACH.md` for the general approach. Specific to this prompt:

- [ ] **Unit test** `mapInstaxCategoryToNogl` — every Instax category maps to exactly one Nogl category, and the 5 most common Instax products in the real dataset map to `cameras` or `accessories`.
- [ ] **Unit test** `seasonalFactor` returns >1.4 for December dates, >1.05 for July dates, ≈1.0 for March dates.
- [ ] **Integration test** — running `seed:forecast-demo` twice is idempotent (uses upsert, not create).
- [ ] **E2E** — after seeding, `/en/demand` loads in <3s, chart has >0 data points, Q4 visible as visibly higher than Q1/Q2.
- [ ] **Manual check** — open `/en/demand`, toggle channels, switch daily → weekly → monthly — all render without empty states.

## Why synthetic + proxy data is OK

The research doc makes this explicit:

> "unanonymized Point-of-Sale data from leading European electronics conglomerates (MediaMarkt, Saturn, Expert) remains heavily guarded by corporate secrecy and strict adherence to GDPR... a robust ecosystem of proxy datasets, synthetic transaction logs, and aggregated e-commerce exports is readily accessible."

We'll replace the Instax-based demo with real Calumet sales data as soon as the founder provides it. The seeded data matches the SHAPE a real export would have — so the migration path is a 1-table swap, not a re-architecture.

## Out of scope

- **Training an actual LSTM/XGBoost model** — the demo uses simple quantile synthesis (avg × seasonal × weekday × discount). ML model training is a separate prompt.
- **Connecting to a real Shopify / Shopware feed** — that's `10-cfo-import.md`.
- **Live Calumet sales data ingestion** — when founder provides CSVs, use the Import wizard from prompt 10.
- **Full MNAR latent-demand recovery** — we inject stockouts for demo visibility but don't implement the full Temporal Fusion Transformer pipeline. That's v2.

## Branch + commits

```bash
git checkout -b feature/seed-forecast-demo
```

1. `chore(seed): add scripts/data/.gitignore + download instructions`
2. `feat(seed): add seed-forecast-demo.ts with Instax ingestion`
3. `feat(seed): add category mapping + IDR→EUR conversion`
4. `feat(seed): add 60-day quantile forecast synthesis`
5. `feat(seed): apply censored-demand methodology (5% stockout injection)`
6. `test(seed): unit + integration + E2E tests`

## Reference files

- Research doc: the full research the founder produced (pasted into chat) summarizing Fujifilm Instax + Amazon Electronics + Global Electronics Retailers + FreshRetailNet + synthetic generators
- Existing forecast Prisma models: `prisma/schema.prisma` → `ForecastTenant`, `ForecastProduct`, `ForecastVariant`, `ForecastHistoricalSale`, `ForecastQuantile`
- Forecast page: `src/app/(site)/[lang]/(app)/demand/page.tsx` + `DemandClient.tsx`
- Existing bridge script (pattern): `scripts/bridge-scraped-items-to-products.ts`
- Testing guidance: `.claude/prompts/_TESTING_AND_DATA_APPROACH.md`
