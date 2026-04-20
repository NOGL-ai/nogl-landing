import { NextResponse } from "next/server";
import { Client } from "pg";
import { createHash } from "node:crypto";

/**
 * Scheduled sync from scraping.scraped_items -> public.products.
 *
 * Previously `scripts/bridge-scraped-items-to-products.ts` was only run
 * manually. This route wraps the same logic so Vercel Cron (or any external
 * scheduler) can trigger it on a timer.
 *
 * Filter upgrades vs. the original manual script:
 *   - Matches BOTH url ILIKE '%<domain>%' AND source = '<short-key>'
 *     (catches ~3k legacy calumet rows with non-matching URL domains)
 *   - Skips payload rows whose title starts with an HTTP status code
 *     (excludes scraper error pages like "403 Forbidden")
 *
 * Auth: header `x-cron-secret` must match env CRON_SECRET, otherwise 401.
 * Vercel Cron sends the `x-vercel-cron` header — we also honor that.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300; // allow 5 min for large backfills

type PgClient = Client;

type ScrapedItemRow = {
  url: string;
  payload: Record<string, unknown> | null;
  created_at: Date | string | null;
};

type CompanyRow = { domain: string };

function domainToSourceKey(domain: string): string {
  return domain.toLowerCase().replace(/^www\./, "").split(".")[0];
}

function getStringValue(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const v = record[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function getNumberValue(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const v = record[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number(v.replace(/[^0-9,.-]/g, "").replace(",", "."));
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function getImageValue(record: Record<string, unknown>): string | null {
  const direct = getStringValue(record, ["image", "image_url", "product_image_url"]);
  if (direct) return direct;
  const arr = record.image_urls;
  if (Array.isArray(arr)) {
    for (const v of arr) if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function buildCacheKeyHash(url: string): string {
  return createHash("md5").update(url).digest("hex").slice(0, 50);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function syncDomain(
  scraper: PgClient,
  landing: PgClient,
  domain: string
): Promise<{ inserted: number; updated: number }> {
  const sourceKey = domainToSourceKey(domain);
  const { rows } = await scraper.query<ScrapedItemRow>(
    `
      SELECT DISTINCT ON (url) url, payload, created_at
      FROM scraping.scraped_items
      WHERE (url ILIKE $1 OR source = $2)
        AND payload IS NOT NULL
        AND (payload->>'title') IS NOT NULL
        AND (payload->>'title') !~ '^[0-9]{3}'
      ORDER BY url ASC, created_at DESC
    `,
    [`%${domain}%`, sourceKey]
  );

  const normalized = rows.flatMap((r) => {
    if (!r.payload || typeof r.payload !== "object") return [];
    const p = r.payload;
    const sourceUrl = getStringValue(p, ["url"]) ?? r.url.trim();
    const title = getStringValue(p, ["title", "name", "product_name"]);
    if (!sourceUrl || !title) return [];
    return [
      {
        sourceUrl,
        title,
        brand: getStringValue(p, ["brand", "product_brand"]),
        category: getStringValue(p, ["category", "product_category", "item_type"]),
        originalPrice: getNumberValue(p, ["price", "original_price", "product_original_price"]),
        discountPrice: getNumberValue(p, ["sale_price", "discount_price", "product_discount_price"]),
        imageUrl: getImageValue(p),
        hash: buildCacheKeyHash(sourceUrl),
      },
    ];
  });

  let inserted = 0;
  let updated = 0;

  for (const batch of chunk(normalized, 250)) {
    const result = await landing.query<{ inserted: boolean }>(
      `
        INSERT INTO public.products (
          product_id, product_url, product_title, product_brand, product_category,
          product_original_price, product_discount_price, product_page_image_url,
          source_url, tracking_key, cache_key_hash, created_at, updated_at
        )
        SELECT
          'bridge:' || i.hash, i.url, i.title, i.brand, i.category,
          i.orig, i.disc, i.image, i.url, $1, i.hash, NOW(), NOW()
        FROM UNNEST(
          $2::text[], $3::text[], $4::text[], $5::text[],
          $6::numeric[], $7::numeric[], $8::text[], $9::varchar[]
        ) AS i(url, title, brand, category, orig, disc, image, hash)
        ON CONFLICT (cache_key_hash) DO UPDATE SET
          product_title = EXCLUDED.product_title,
          product_brand = EXCLUDED.product_brand,
          product_category = EXCLUDED.product_category,
          product_original_price = EXCLUDED.product_original_price,
          product_discount_price = EXCLUDED.product_discount_price,
          product_page_image_url = EXCLUDED.product_page_image_url,
          updated_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `,
      [
        domain,
        batch.map((b) => b.sourceUrl),
        batch.map((b) => b.title),
        batch.map((b) => b.brand),
        batch.map((b) => b.category),
        batch.map((b) => b.originalPrice),
        batch.map((b) => b.discountPrice),
        batch.map((b) => b.imageUrl),
        batch.map((b) => b.hash),
      ]
    );

    for (const r of result.rows) {
      if (r.inserted) inserted += 1;
      else updated += 1;
    }
  }

  return { inserted, updated };
}

export async function GET(request: Request) {
  // Auth guard — accept either CRON_SECRET header OR Vercel's signed cron header.
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("x-cron-secret");
  const isVercelCron = request.headers.get("x-vercel-cron") !== null;

  if (!isVercelCron && (!secret || provided !== secret)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const scraperUrl = process.env.SCRAPER_DATABASE_URL ?? process.env.SCRAPY_DATABASE_URL;
  const landingUrl = process.env.DATABASE_URL;
  if (!scraperUrl || !landingUrl) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL or SCRAPER_DATABASE_URL missing" },
      { status: 500 }
    );
  }

  const scraper = new Client({ connectionString: scraperUrl });
  const landing = new Client({ connectionString: landingUrl });
  const startedAt = Date.now();
  const perDomain: Record<string, { inserted: number; updated: number }> = {};
  let totalInserted = 0;
  let totalUpdated = 0;

  try {
    await scraper.connect();
    await landing.connect();

    await landing.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS products_cache_key_hash_key
       ON public.products (cache_key_hash)`
    );

    const { rows: companies } = await landing.query<CompanyRow>(
      `SELECT domain FROM nogl."Company" WHERE domain IS NOT NULL ORDER BY domain ASC`
    );

    for (const { domain } of companies) {
      const stats = await syncDomain(scraper, landing, domain);
      perDomain[domain] = stats;
      totalInserted += stats.inserted;
      totalUpdated += stats.updated;
    }

    return NextResponse.json({
      ok: true,
      elapsedMs: Date.now() - startedAt,
      totalInserted,
      totalUpdated,
      domains: perDomain,
    });
  } catch (err) {
    console.error("[cron/bridge-scraped-items] failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        elapsedMs: Date.now() - startedAt,
        totalInserted,
        totalUpdated,
      },
      { status: 500 }
    );
  } finally {
    await Promise.allSettled([scraper.end(), landing.end()]);
  }
}
