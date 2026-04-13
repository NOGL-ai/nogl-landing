import { Pool } from "pg";

export type ScrapedProduct = {
  url: string;
  source: string;
  itemType: string;
  title: string;
  price: string;
  currency: string;
  updatedAt: string;
};

type ScrapedItemRow = {
  url: string;
  source: string | null;
  item_type: string | null;
  updated_at: Date | string | null;
  payload: Record<string, unknown> | null;
};

function asText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (value == null) {
    return "";
  }
  return String(value).trim();
}

let pool: Pool | null = null;

function getConnectionString(): string {
  return process.env.SCRAPY_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
}

function getPool(): Pool | null {
  const connectionString = getConnectionString();
  if (!connectionString) {
    return null;
  }
  if (pool) {
    return pool;
  }
  pool = new Pool({
    connectionString,
    ssl:
      process.env.SCRAPY_DB_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  });
  return pool;
}

export async function getScrapedProducts(limit = 20): Promise<ScrapedProduct[]> {
  const db = getPool();
  if (!db) {
    return [];
  }

  const safeLimit = Math.max(1, Math.min(limit, 100));
  const query = `
      SELECT url, source, item_type, updated_at, payload
      FROM scraping.scraped_items
      WHERE item_type = 'product'
      ORDER BY updated_at DESC
      LIMIT $1
    `;
  const result = await db.query<ScrapedItemRow>(query, [safeLimit]);
  const rows = result.rows;

  return rows.map((row) => {
    const payload = row.payload ?? {};
    const title =
      asText(payload.title) || asText(payload.name) || row.url || "Untitled";
    const price = asText(payload.price);
    const currency = asText(payload.currency);
    const updatedAt =
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : asText(row.updated_at);

    return {
      url: row.url,
      source: asText(row.source) || "unknown",
      itemType: asText(row.item_type) || "product",
      title,
      price,
      currency,
      updatedAt,
    };
  });
}
