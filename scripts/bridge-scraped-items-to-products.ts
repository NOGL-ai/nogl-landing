const { createHash } = require("node:crypto");
const { resolve } = require("node:path");
const { config: loadEnv } = require("dotenv");
const { Client } = require("pg");

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

type CompanyRow = {
  domain: string;
};

type PgClient = import("pg").Client;

type ScrapedItemRow = {
  url: string;
  payload: Record<string, unknown> | null;
  created_at: Date | string | null;
};

type NormalizedProduct = {
  sourceUrl: string;
  productName: string;
  productOriginalPrice: number | null;
  productDiscountPrice: number | null;
  productDiscountPercentage: number | null;
  productImageUrl: string | null;
  productBrand: string | null;
  productCategory: string | null;
  productVariantsCount: number;
  extractionTimestamp: Date;
};

type UpsertResultRow = {
  inserted: boolean;
};

type ProductInsertRow = {
  productId: string;
  productUrl: string;
  productTitle: string;
  productBrand: string | null;
  productCategory: string | null;
  productOriginalPrice: number | null;
  productDiscountPrice: number | null;
  productDiscountPercentage: number | null;
  productHasPromotion: boolean;
  productPageImageUrl: string | null;
  productVariantsCount: number;
  sourceUrl: string;
  extractionTimestamp: Date;
  trackingKey: string;
  cacheKeyHash: string;
};

function getDomainFilter(): string | null {
  const domainIndex = process.argv.indexOf("--domain");

  if (domainIndex === -1) {
    return null;
  }

  const value = process.argv[domainIndex + 1];
  return value ? value.trim().toLowerCase() : null;
}

function getScraperDatabaseUrl(): string {
  const scraperDatabaseUrl =
    process.env.SCRAPER_DATABASE_URL ?? process.env.SCRAPY_DATABASE_URL ?? null;

  if (!scraperDatabaseUrl) {
    throw new Error("SCRAPER_DATABASE_URL is required.");
  }

  return scraperDatabaseUrl;
}

function getLandingDatabaseUrl(): string {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  return process.env.DATABASE_URL;
}

function getStringValue(
  record: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string") {
      const normalized = value.trim();

      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
}

function getTimestampValue(
  record: Record<string, unknown>,
  fallback: Date | string | null
): Date {
  const rawValue = getStringValue(record, ["scraped_at", "created_at"]);
  const candidate = rawValue ?? fallback;

  if (candidate instanceof Date && !Number.isNaN(candidate.getTime())) {
    return candidate;
  }

  if (typeof candidate === "string") {
    const parsed = new Date(candidate);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

function getNumberValue(
  record: Record<string, unknown>,
  keys: string[]
): number | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value
        .replace(/[^0-9,.-]/g, "")
        .replace(/\.(?=.*\.)/g, "")
        .replace(",", ".");
      const parsed = Number(normalized);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function getIntegerValue(
  record: Record<string, unknown>,
  keys: string[]
): number {
  const value = getNumberValue(record, keys);

  if (value === null) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}

function getImageValue(record: Record<string, unknown>): string | null {
  const directValue = getStringValue(record, [
    "image",
    "image_url",
    "product_image_url",
  ]);

  if (directValue) {
    return directValue;
  }

  const imageUrls = record.image_urls;

  if (Array.isArray(imageUrls)) {
    for (const value of imageUrls) {
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }

  return null;
}

function toTitleCase(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function parseCategoryPath(value: string): string | null {
  const normalized = value
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .trim();

  if (!normalized) {
    return null;
  }

  const segments = normalized
    .split(/\/|>/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  return segments[segments.length - 1];
}

function deriveCategoryFromUrl(sourceUrl: string): string | null {
  try {
    const url = new URL(sourceUrl);
    const segments = url.pathname
      .split("/")
      .map((segment) => decodeURIComponent(segment).trim())
      .filter(Boolean);

    if (segments.length < 2) {
      return null;
    }

    const categorySegment = segments[1].replace(/[-_]+/g, " ").trim();

    if (!categorySegment) {
      return null;
    }

    return toTitleCase(categorySegment);
  } catch {
    return null;
  }
}

function getCategoryValue(
  record: Record<string, unknown>,
  sourceUrl: string
): string | null {
  const pathValue = getStringValue(record, ["category_path", "category_breadcrumb"]);
  const parsedPathValue = pathValue ? parseCategoryPath(pathValue) : null;

  if (parsedPathValue) {
    return parsedPathValue;
  }

  const directValue = getStringValue(record, [
    "category",
    "product_category",
    "item_type",
  ]);

  if (directValue) {
    return directValue;
  }

  return deriveCategoryFromUrl(sourceUrl);
}

function buildCacheKeyHash(sourceUrl: string): string {
  return createHash("md5").update(sourceUrl).digest("hex").slice(0, 50);
}

function buildProductId(sourceUrl: string): string {
  return `bridge:${buildCacheKeyHash(sourceUrl)}`;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function normalizeScrapedItem(row: ScrapedItemRow): NormalizedProduct | null {
  if (!row.payload || typeof row.payload !== "object") {
    return null;
  }

  const payload = row.payload;
  const sourceUrl = getStringValue(payload, ["url"]) ?? row.url.trim();
  const productName = getStringValue(payload, ["title", "name", "product_name"]);

  if (!sourceUrl || !productName) {
    return null;
  }

  return {
    sourceUrl,
    productName,
    productOriginalPrice: getNumberValue(payload, [
      "price",
      "original_price",
      "product_original_price",
    ]),
    productDiscountPrice: getNumberValue(payload, [
      "sale_price",
      "discount_price",
      "product_discount_price",
    ]),
    productDiscountPercentage: getNumberValue(payload, [
      "discount_percentage",
      "product_discount_percentage",
    ]),
    productImageUrl: getImageValue(payload),
    productBrand: getStringValue(payload, ["brand", "product_brand"]),
    productCategory: getCategoryValue(payload, sourceUrl),
    productVariantsCount: getIntegerValue(payload, [
      "variants_count",
      "product_variants_count",
    ]),
    extractionTimestamp: getTimestampValue(payload, row.created_at),
  };
}

async function ensureCacheKeyConstraint(landingClient: PgClient): Promise<void> {
  await landingClient.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS products_cache_key_hash_key
    ON public.products (cache_key_hash)
  `);
}

async function getDomainsToProcess(
  landingClient: PgClient,
  domainFilter: string | null
): Promise<string[]> {
  if (domainFilter) {
    return [domainFilter];
  }

  const result = await landingClient.query<CompanyRow>(`
    SELECT domain
    FROM nogl."Company"
    ORDER BY domain ASC
  `);

  return result.rows.map((row) => row.domain);
}

async function bridgeDomain(
  scraperClient: PgClient,
  landingClient: PgClient,
  domain: string
): Promise<number> {
  const scraperResult = await scraperClient.query<ScrapedItemRow>(
    `
      SELECT DISTINCT ON (url) url, payload, created_at
      FROM scraping.scraped_items
      WHERE url ILIKE $1
        AND payload IS NOT NULL
      ORDER BY url ASC, created_at DESC
    `,
    [`%${domain}%`]
  );

  let insertedCount = 0;
  let updatedCount = 0;
  const rowsToWrite: ProductInsertRow[] = [];

  for (const row of scraperResult.rows) {
    const normalized = normalizeScrapedItem(row);

    if (!normalized) {
      continue;
    }

    rowsToWrite.push({
      productId: buildProductId(normalized.sourceUrl),
      productUrl: normalized.sourceUrl,
      productTitle: normalized.productName,
      productBrand: normalized.productBrand,
      productCategory: normalized.productCategory,
      productOriginalPrice: normalized.productOriginalPrice,
      productDiscountPrice: normalized.productDiscountPrice,
      productDiscountPercentage: normalized.productDiscountPercentage,
      productHasPromotion: normalized.productDiscountPrice !== null,
      productPageImageUrl: normalized.productImageUrl,
      productVariantsCount: normalized.productVariantsCount,
      sourceUrl: normalized.sourceUrl,
      extractionTimestamp: normalized.extractionTimestamp,
      trackingKey: domain,
      cacheKeyHash: buildCacheKeyHash(normalized.sourceUrl),
    });
  }

  for (const batch of chunkArray(rowsToWrite, 250)) {
    const upsertResult = await landingClient.query<UpsertResultRow>(
      `
        INSERT INTO public.products (
          product_id,
          product_url,
          product_title,
          product_brand,
          product_category,
          product_original_price,
          product_discount_price,
          product_discount_percentage,
          product_has_promotion,
          product_page_image_url,
          product_variants_count,
          source_url,
          extraction_timestamp,
          tracking_key,
          cache_key_hash,
          created_at,
          updated_at
        )
        SELECT
          input.product_id,
          input.product_url,
          input.product_title,
          input.product_brand,
          input.product_category,
          input.product_original_price,
          input.product_discount_price,
          input.product_discount_percentage,
          input.product_has_promotion,
          input.product_page_image_url,
          input.product_variants_count,
          input.source_url,
          input.extraction_timestamp,
          input.tracking_key,
          input.cache_key_hash,
          NOW(),
          NOW()
        FROM UNNEST(
          $1::text[],
          $2::text[],
          $3::text[],
          $4::text[],
          $5::text[],
          $6::numeric[],
          $7::numeric[],
          $8::numeric[],
          $9::boolean[],
          $10::text[],
          $11::integer[],
          $12::text[],
          $13::timestamptz[],
          $14::text[],
          $15::varchar[]
        ) AS input(
          product_id,
          product_url,
          product_title,
          product_brand,
          product_category,
          product_original_price,
          product_discount_price,
          product_discount_percentage,
          product_has_promotion,
          product_page_image_url,
          product_variants_count,
          source_url,
          extraction_timestamp,
          tracking_key,
          cache_key_hash
        )
        ON CONFLICT (cache_key_hash) DO UPDATE SET
          product_id = EXCLUDED.product_id,
          product_url = EXCLUDED.product_url,
          product_title = EXCLUDED.product_title,
          product_brand = EXCLUDED.product_brand,
          product_category = EXCLUDED.product_category,
          product_original_price = EXCLUDED.product_original_price,
          product_discount_price = EXCLUDED.product_discount_price,
          product_discount_percentage = EXCLUDED.product_discount_percentage,
          product_has_promotion = EXCLUDED.product_has_promotion,
          product_page_image_url = EXCLUDED.product_page_image_url,
          product_variants_count = EXCLUDED.product_variants_count,
          source_url = EXCLUDED.source_url,
          extraction_timestamp = EXCLUDED.extraction_timestamp,
          tracking_key = EXCLUDED.tracking_key,
          updated_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `,
      [
        batch.map((item) => item.productId),
        batch.map((item) => item.productUrl),
        batch.map((item) => item.productTitle),
        batch.map((item) => item.productBrand),
        batch.map((item) => item.productCategory),
        batch.map((item) => item.productOriginalPrice),
        batch.map((item) => item.productDiscountPrice),
        batch.map((item) => item.productDiscountPercentage),
        batch.map((item) => item.productHasPromotion),
        batch.map((item) => item.productPageImageUrl),
        batch.map((item) => item.productVariantsCount),
        batch.map((item) => item.sourceUrl),
        batch.map((item) => item.extractionTimestamp),
        batch.map((item) => item.trackingKey),
        batch.map((item) => item.cacheKeyHash),
      ]
    );

    for (const resultRow of upsertResult.rows) {
      if (resultRow.inserted) {
        insertedCount += 1;
      } else {
        updatedCount += 1;
      }
    }
  }

  console.log(`${domain}: inserted ${insertedCount} new, updated ${updatedCount} existing rows`);

  return insertedCount + updatedCount;
}

async function main() {
  const scraperClient = new Client({ connectionString: getScraperDatabaseUrl() });
  const landingClient = new Client({ connectionString: getLandingDatabaseUrl() });
  const domainFilter = getDomainFilter();

  await scraperClient.connect();
  await landingClient.connect();

  try {
    await ensureCacheKeyConstraint(landingClient);

    const domains = await getDomainsToProcess(landingClient, domainFilter);
    let totalWritten = 0;

    for (const domain of domains) {
      totalWritten += await bridgeDomain(scraperClient, landingClient, domain);
    }

    console.log(`Bridge done: ${totalWritten} rows written`);
  } finally {
    await Promise.all([scraperClient.end(), landingClient.end()]);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
