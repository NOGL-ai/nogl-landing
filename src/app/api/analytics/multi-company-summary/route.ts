import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Constants ─────────────────────────────────────────────────────────────────

export const TRACKED_COMPANIES = [
  { slug: "calumet", name: "Calumet Photographic", domain: "calumet.de", isPrimary: true },
  { slug: "teltec", name: "Teltec", domain: "teltec.de", isPrimary: false },
  { slug: "foto-erhardt", name: "Foto Erhardt", domain: "foto-erhardt.de", isPrimary: false },
  { slug: "foto-leistenschneider", name: "Foto Leistenschneider", domain: "foto-leistenschneider.de", isPrimary: false },
  { slug: "fotokoch", name: "Fotokoch", domain: "fotokoch.de", isPrimary: false },
  { slug: "kamera-express", name: "Kamera Express", domain: "kamera-express.de", isPrimary: false },
] as const;

// Effective price = discount price if set, otherwise original price
const EFFECTIVE_PRICE = Prisma.sql`COALESCE(product_discount_price, product_original_price)`;

// All 6 domains combined filter
const ALL_DOMAINS_FILTER = Prisma.sql`(
  source_url ILIKE '%calumet.de%' OR
  source_url ILIKE '%teltec.de%' OR
  source_url ILIKE '%foto-erhardt.de%' OR
  source_url ILIKE '%foto-leistenschneider.de%' OR
  source_url ILIKE '%fotokoch.de%' OR
  source_url ILIKE '%kamera-express.de%'
)`;

const HAS_PRICE = Prisma.sql`COALESCE(product_discount_price, product_original_price) IS NOT NULL
    AND COALESCE(product_discount_price, product_original_price) > 0`;

// ── Types ─────────────────────────────────────────────────────────────────────

type CompanyStatsRow = {
  domain: string;
  total_products: bigint;
  avg_price: Prisma.Decimal | null;
  min_price: Prisma.Decimal | null;
  max_price: Prisma.Decimal | null;
  last_scraped_at: Date | null;
};

type CategoryRow = {
  category: string | null;
  total_products: bigint;
  min_price: Prisma.Decimal | null;
  max_price: Prisma.Decimal | null;
  avg_price: Prisma.Decimal | null;
  calumet_count: bigint;
  teltec_count: bigint;
  foto_erhardt_count: bigint;
  foto_leistenschneider_count: bigint;
  fotokoch_count: bigint;
  kamera_express_count: bigint;
};

type TopProductRow = {
  product_id: string;
  product_title: string | null;
  product_brand: string | null;
  product_sku: string | null;
  ean: string | null;
  price: Prisma.Decimal | null;
  list_price: Prisma.Decimal | null;
  image_url: string | null;
  product_url: string | null;
};

type BucketCountRow = {
  range_label: string;
  count: bigint;
};

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  try {
    // ─ 1. Per-company stats — single CASE WHEN query ──────────────────────────
    const statsRows = (await prisma.$queryRaw(Prisma.sql`
      SELECT
        CASE
          WHEN source_url ILIKE '%calumet.de%' THEN 'calumet.de'
          WHEN source_url ILIKE '%teltec.de%' THEN 'teltec.de'
          WHEN source_url ILIKE '%foto-erhardt.de%' THEN 'foto-erhardt.de'
          WHEN source_url ILIKE '%foto-leistenschneider.de%' THEN 'foto-leistenschneider.de'
          WHEN source_url ILIKE '%fotokoch.de%' THEN 'fotokoch.de'
          WHEN source_url ILIKE '%kamera-express.de%' THEN 'kamera-express.de'
        END AS domain,
        COUNT(*) AS total_products,
        AVG(${EFFECTIVE_PRICE}) AS avg_price,
        MIN(${EFFECTIVE_PRICE}) AS min_price,
        MAX(${EFFECTIVE_PRICE}) AS max_price,
        MAX(extraction_timestamp) AS last_scraped_at
      FROM public.products
      WHERE ${ALL_DOMAINS_FILTER}
        AND ${HAS_PRICE}
      GROUP BY 1
    `)) as CompanyStatsRow[];

    // Fallback: count all products per domain even without prices
    const allStatsRows = (await prisma.$queryRaw(Prisma.sql`
      SELECT
        CASE
          WHEN source_url ILIKE '%calumet.de%' THEN 'calumet.de'
          WHEN source_url ILIKE '%teltec.de%' THEN 'teltec.de'
          WHEN source_url ILIKE '%foto-erhardt.de%' THEN 'foto-erhardt.de'
          WHEN source_url ILIKE '%foto-leistenschneider.de%' THEN 'foto-leistenschneider.de'
          WHEN source_url ILIKE '%fotokoch.de%' THEN 'fotokoch.de'
          WHEN source_url ILIKE '%kamera-express.de%' THEN 'kamera-express.de'
        END AS domain,
        COUNT(*) AS n
      FROM public.products
      WHERE ${ALL_DOMAINS_FILTER}
      GROUP BY 1
    `)) as { domain: string; n: bigint }[];

    const statsByDomain = Object.fromEntries(statsRows.map((r: CompanyStatsRow) => [r.domain, r]));
    const totalByDomain = Object.fromEntries(
      allStatsRows.map((r: { domain: string; n: bigint }) => [r.domain, Number(r.n)])
    );
    const totalAcrossAll = allStatsRows.reduce((s: number, r: { domain: string; n: bigint }) => s + Number(r.n), 0);

    const companies = TRACKED_COMPANIES.map((company) => {
      const row = statsByDomain[company.domain];
      const total = totalByDomain[company.domain] ?? 0;
      return {
        slug: company.slug,
        name: company.name,
        domain: company.domain,
        isPrimary: company.isPrimary,
        total_products: total,
        avg_price: row?.avg_price ? Number(row.avg_price) : null,
        min_price: row?.min_price ? Number(row.min_price) : null,
        max_price: row?.max_price ? Number(row.max_price) : null,
        last_scraped_at: row?.last_scraped_at?.toISOString() ?? null,
        market_share_pct:
          totalAcrossAll > 0
            ? Math.round((total / totalAcrossAll) * 1000) / 10
            : 0,
      };
    });

    // ─ 2. Top products from primary company (Calumet) ─────────────────────────
    const topProductRows = (await prisma.$queryRaw(Prisma.sql`
      SELECT
        product_id,
        product_title,
        product_brand,
        product_sku,
        ean,
        ${EFFECTIVE_PRICE} AS price,
        product_original_price AS list_price,
        product_page_image_url AS image_url,
        product_url
      FROM public.products
      WHERE source_url ILIKE '%calumet.de%'
        AND ${HAS_PRICE}
        AND product_title IS NOT NULL
      ORDER BY ${EFFECTIVE_PRICE} DESC
      LIMIT 50
    `)) as TopProductRow[];

    const top_products = topProductRows.map((row: TopProductRow, idx: number) => ({
      rank: idx + 1,
      company_slug: "calumet",
      company_name: "Calumet Photographic",
      product_title: row.product_title ?? "",
      product_brand: row.product_brand ?? "",
      product_sku: row.product_sku ?? "",
      ean: row.ean ?? null,
      price: Number(row.price ?? 0),
      list_price: row.list_price ? Number(row.list_price) : null,
      image_url: row.image_url ?? null,
      product_url: row.product_url ?? null,
    }));

    // ─ 3. Product categories — single query with per-domain FILTER counts ─────
    const categoryRows = (await prisma.$queryRaw(Prisma.sql`
      SELECT
        product_category AS category,
        COUNT(*) AS total_products,
        MIN(${EFFECTIVE_PRICE}) AS min_price,
        MAX(${EFFECTIVE_PRICE}) AS max_price,
        AVG(${EFFECTIVE_PRICE}) AS avg_price,
        COUNT(*) FILTER (WHERE source_url ILIKE '%calumet.de%') AS calumet_count,
        COUNT(*) FILTER (WHERE source_url ILIKE '%teltec.de%') AS teltec_count,
        COUNT(*) FILTER (WHERE source_url ILIKE '%foto-erhardt.de%') AS foto_erhardt_count,
        COUNT(*) FILTER (WHERE source_url ILIKE '%foto-leistenschneider.de%') AS foto_leistenschneider_count,
        COUNT(*) FILTER (WHERE source_url ILIKE '%fotokoch.de%') AS fotokoch_count,
        COUNT(*) FILTER (WHERE source_url ILIKE '%kamera-express.de%') AS kamera_express_count
      FROM public.products
      WHERE ${ALL_DOMAINS_FILTER}
        AND product_category IS NOT NULL
      GROUP BY product_category
      ORDER BY COUNT(*) DESC
      LIMIT 20
    `)) as CategoryRow[];

    const product_categories = categoryRows.map((row: CategoryRow) => {
      const perSite = [
        Number(row.calumet_count ?? 0),
        Number(row.teltec_count ?? 0),
        Number(row.foto_erhardt_count ?? 0),
        Number(row.foto_leistenschneider_count ?? 0),
        Number(row.fotokoch_count ?? 0),
        Number(row.kamera_express_count ?? 0),
      ];
      return {
        category: row.category ?? "Unknown",
        total_products: Number(row.total_products ?? 0),
        companies_count: perSite.filter((n) => n > 0).length,
        min_price: row.min_price ? Number(row.min_price) : null,
        max_price: row.max_price ? Number(row.max_price) : null,
        avg_price: row.avg_price ? Number(row.avg_price) : null,
      };
    });

    // ─ 4. Price distribution — single CASE bucket query ───────────────────────
    const bucketRows = (await prisma.$queryRaw(Prisma.sql`
      SELECT
        CASE
          WHEN ${EFFECTIVE_PRICE} < 100 THEN '€0–100'
          WHEN ${EFFECTIVE_PRICE} < 250 THEN '€100–250'
          WHEN ${EFFECTIVE_PRICE} < 500 THEN '€250–500'
          WHEN ${EFFECTIVE_PRICE} < 1000 THEN '€500–1000'
          WHEN ${EFFECTIVE_PRICE} < 2000 THEN '€1000–2000'
          ELSE '€2000+'
        END AS range_label,
        COUNT(*) AS count
      FROM public.products
      WHERE ${ALL_DOMAINS_FILTER}
        AND ${HAS_PRICE}
      GROUP BY 1
    `)) as BucketCountRow[];

    const BUCKET_ORDER = ["€0–100", "€100–250", "€250–500", "€500–1000", "€1000–2000", "€2000+"];
    const bucketMap = Object.fromEntries(bucketRows.map((r: BucketCountRow) => [r.range_label, Number(r.count)]));
    const totalForDist = Object.values(bucketMap).reduce((s, n) => s + n, 0);

    const price_distribution = BUCKET_ORDER.map((range) => ({
      range,
      count: bucketMap[range] ?? 0,
      percentage:
        totalForDist > 0
          ? Math.round(((bucketMap[range] ?? 0) / totalForDist) * 1000) / 10
          : 0,
    }));

    // ─ 5. Catalog products (primary company) ──────────────────────────────────
    const catalogRows = (await prisma.$queryRaw(Prisma.sql`
      SELECT
        product_id,
        product_title,
        product_brand,
        product_sku,
        ean,
        ${EFFECTIVE_PRICE} AS price,
        product_original_price AS list_price,
        product_page_image_url AS image_url,
        product_url
      FROM public.products
      WHERE source_url ILIKE '%calumet.de%'
        AND ${HAS_PRICE}
        AND product_title IS NOT NULL
      ORDER BY ${EFFECTIVE_PRICE} DESC
      LIMIT 30
    `)) as TopProductRow[];

    const catalog_products = catalogRows.map((row: TopProductRow) => ({
      product_id: row.product_id,
      product_title: row.product_title ?? "",
      product_brand: row.product_brand ?? "",
      product_sku: row.product_sku ?? "",
      ean: row.ean ?? null,
      price: Number(row.price ?? 0),
      list_price: row.list_price ? Number(row.list_price) : null,
      image_url: row.image_url ?? null,
      product_url: row.product_url ?? null,
    }));

    return NextResponse.json(
      { companies, top_products, product_categories, price_distribution, catalog_products },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("[multi-company-summary]", error);
    return NextResponse.json(
      { error: "Failed to load multi-company summary" },
      { status: 500 }
    );
  }
}
