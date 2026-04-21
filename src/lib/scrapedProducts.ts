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

function escapeIlikePattern(raw: string): string {
  return `%${raw.trim().replace(/[%_]/g, "\\$&")}%`;
}

function normalizeSearchTerms(searchQuery?: string | string[]): string[] {
  if (searchQuery == null) return [];
  if (Array.isArray(searchQuery)) {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of searchQuery) {
      const s = typeof t === "string" ? t.trim() : "";
      if (!s || seen.has(s.toLowerCase())) continue;
      seen.add(s.toLowerCase());
      out.push(s);
      if (out.length >= 12) break;
    }
    return out;
  }
  const one = typeof searchQuery === "string" ? searchQuery.trim() : "";
  return one ? [one] : [];
}

export async function getScrapedProducts(
  limit = 20,
  searchQuery?: string | string[],
): Promise<ScrapedProduct[]> {
  const db = getPool();
  if (!db) {
    return [];
  }

  const safeLimit = Math.max(1, Math.min(limit, 100));
  let queryText: string;
  let params: unknown[];

  const terms = normalizeSearchTerms(searchQuery);

  if (terms.length > 0) {
    const patterns = terms.map(escapeIlikePattern);
    const orBlocks = patterns.map((_, i) => {
      const n = i + 1;
      return `(payload->>'title' ILIKE $${n} OR payload->>'name' ILIKE $${n} OR url ILIKE $${n})`;
    });
    const limitParam = patterns.length + 1;
    queryText = `
      SELECT url, source, item_type, updated_at, payload
      FROM scraping.scraped_items
      WHERE item_type = 'product'
        AND (${orBlocks.join(" OR ")})
      ORDER BY updated_at DESC
      LIMIT $${limitParam}
    `;
    params = [...patterns, safeLimit];
  } else {
    queryText = `
      SELECT url, source, item_type, updated_at, payload
      FROM scraping.scraped_items
      WHERE item_type = 'product'
      ORDER BY updated_at DESC
      LIMIT $1
    `;
    params = [safeLimit];
  }

  const result = await db.query<ScrapedItemRow>(queryText, params);
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
