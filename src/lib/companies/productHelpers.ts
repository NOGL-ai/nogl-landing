// @ts-nocheck
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  buildProductsCompanyConditionSql,
  resolveCompanyBySlug,
} from "@/lib/companies/helpers";
import type {
  CompanyProductsListResponse,
  ProductDetailResponse,
  ProductListItem,
  ProductDetail,
  PriceHistoryPoint,
  ProductVariant,
} from "@/types/companyProducts";
import type { PageMeta } from "@/types/product";

// ── helpers ──────────────────────────────────────────────────────────────────

function toFloat(val: unknown): number | null {
  if (val == null) return null;
  const n =
    typeof val === "object" && val !== null && "toNumber" in val
      ? (val as { toNumber: () => number }).toNumber()
      : Number(val);
  return Number.isFinite(n) ? n : null;
}

function toInt(val: unknown): number {
  const n = Number(val);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function toIso(val: unknown): string {
  if (!val) return new Date(0).toISOString();
  const d = val instanceof Date ? val : new Date(val as string);
  return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}

function createPagination(page: number, limit: number, total: number): PageMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

// ── Product list ──────────────────────────────────────────────────────────────

type ProductListRow = {
  product_id: string | null;
  product_title: string | null;
  product_brand: string | null;
  product_category: string | null;
  current_price: unknown;
  discount_pct: unknown;
  image_url: string | null;
  first_seen: Date | string | null;
  last_seen: Date | string | null;
};

type CountRow = { count: bigint | number };

export async function getCompanyProductsList(params: {
  slug: string;
  page: number;
  limit: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<CompanyProductsListResponse | null> {
  const company = await resolveCompanyBySlug(params.slug);
  if (!company) return null;

  const companyCondition = await buildProductsCompanyConditionSql({
    companyId: company.id,
    companyName: company.name,
    companyDomain: company.domain,
  });

  const conditions: Prisma.Sql[] = [companyCondition];

  if (params.search) {
    conditions.push(
      Prisma.sql`product_title ILIKE ${`%${params.search}%`}`
    );
  }
  if (params.category) {
    conditions.push(Prisma.sql`product_category = ${params.category}`);
  }
  if (typeof params.minPrice === "number" && Number.isFinite(params.minPrice)) {
    conditions.push(
      Prisma.sql`product_original_price >= ${params.minPrice}`
    );
  }
  if (typeof params.maxPrice === "number" && Number.isFinite(params.maxPrice)) {
    conditions.push(
      Prisma.sql`product_original_price <= ${params.maxPrice}`
    );
  }

  const whereExpr = Prisma.join(conditions, " AND ");
  const offset = (params.page - 1) * params.limit;

  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw<ProductListRow[]>(Prisma.sql`
      WITH ranked AS (
        SELECT
          product_id,
          product_title,
          product_brand,
          product_category,
          product_original_price,
          product_discount_percentage,
          product_page_image_url,
          extraction_timestamp,
          ROW_NUMBER() OVER (
            PARTITION BY product_id ORDER BY extraction_timestamp DESC
          ) AS rn,
          MIN(extraction_timestamp) OVER (
            PARTITION BY product_id
          ) AS first_seen_ts
        FROM public.products
        WHERE ${whereExpr}
          AND product_id IS NOT NULL
      )
      SELECT
        product_id,
        product_title,
        product_brand,
        product_category,
        CAST(product_original_price AS float8) AS current_price,
        CAST(product_discount_percentage AS float8) AS discount_pct,
        product_page_image_url AS image_url,
        first_seen_ts AS first_seen,
        extraction_timestamp AS last_seen
      FROM ranked
      WHERE rn = 1
      ORDER BY product_original_price DESC NULLS LAST, product_title ASC NULLS LAST
      LIMIT ${params.limit}
      OFFSET ${offset}
    `),
    prisma.$queryRaw<CountRow[]>(Prisma.sql`
      SELECT COUNT(DISTINCT product_id) AS count
      FROM public.products
      WHERE ${whereExpr}
        AND product_id IS NOT NULL
    `),
  ]);

  const total =
    typeof countRows[0]?.count === "bigint"
      ? Number(countRows[0].count)
      : Number(countRows[0]?.count ?? 0);

  const products: ProductListItem[] = rows
    .filter((r) => r.product_id)
    .map((r) => ({
      id: r.product_id as string,
      title: r.product_title ?? "Unknown Product",
      brand: r.product_brand ?? null,
      category: r.product_category ?? null,
      current_price: toFloat(r.current_price),
      image_url: r.image_url ?? null,
      first_seen: toIso(r.first_seen),
      last_seen: toIso(r.last_seen),
      discount_pct: toFloat(r.discount_pct),
    }));

  return {
    products,
    pagination: createPagination(params.page, params.limit, total),
  };
}

// ── Product categories (for filter chips) ────────────────────────────────────

export async function getCompanyProductCategories(
  slug: string
): Promise<string[]> {
  const company = await resolveCompanyBySlug(slug);
  if (!company) return [];

  const companyCondition = await buildProductsCompanyConditionSql({
    companyId: company.id,
    companyName: company.name,
    companyDomain: company.domain,
  });

  type CatRow = { category: string | null };
  const rows = await prisma.$queryRaw<CatRow[]>(Prisma.sql`
    SELECT DISTINCT product_category AS category
    FROM public.products
    WHERE ${companyCondition}
      AND product_category IS NOT NULL
    ORDER BY product_category ASC
    LIMIT 50
  `);

  return rows.map((r) => r.category).filter((c): c is string => Boolean(c));
}

// ── Product detail ────────────────────────────────────────────────────────────

type ProductDetailRow = {
  product_id: string | null;
  product_title: string | null;
  product_brand: string | null;
  product_category: string | null;
  current_price: unknown;
  discount_price: unknown;
  discount_pct: unknown;
  image_url: string | null;
  product_url: string | null;
  source_url: string | null;
  variants_count: unknown;
  last_seen: Date | string | null;
};

type PriceHistoryRow = {
  date: Date | string | null;
  price: unknown;
};

type PriceRangeRow = {
  min_price: unknown;
  max_price: unknown;
};

export async function getProductDetail(params: {
  slug: string;
  productId: string;
}): Promise<ProductDetailResponse | null> {
  const company = await resolveCompanyBySlug(params.slug);
  if (!company) return null;

  const companyCondition = await buildProductsCompanyConditionSql({
    companyId: company.id,
    companyName: company.name,
    companyDomain: company.domain,
  });

  const productIdParam = decodeURIComponent(params.productId);

  // Latest row for this product
  const detailRows = await prisma.$queryRaw<ProductDetailRow[]>(Prisma.sql`
    SELECT
      product_id,
      product_title,
      product_brand,
      product_category,
      CAST(product_original_price AS float8) AS current_price,
      CAST(product_discount_price AS float8) AS discount_price,
      CAST(product_discount_percentage AS float8) AS discount_pct,
      product_page_image_url AS image_url,
      product_url,
      source_url,
      COALESCE(product_variants_count, 1)::int AS variants_count,
      extraction_timestamp AS last_seen
    FROM public.products
    WHERE product_id = ${productIdParam}
      AND (${companyCondition})
    ORDER BY extraction_timestamp DESC
    LIMIT 1
  `);

  const detailRow = detailRows[0];
  if (!detailRow) return null;

  const resolvedProductId = detailRow.product_id ?? productIdParam;

  // First seen + price history + min/max price in parallel
  const [firstSeenRows, historyRows, priceRangeRows] = await Promise.all([
    prisma.$queryRaw<{ first_seen: Date | string | null }[]>(Prisma.sql`
      SELECT MIN(extraction_timestamp) AS first_seen
      FROM public.products
      WHERE product_id = ${resolvedProductId}
    `),
    prisma.$queryRaw<PriceHistoryRow[]>(Prisma.sql`
      SELECT
        extraction_timestamp AS date,
        CAST(product_original_price AS float8) AS price
      FROM public.products
      WHERE product_id = ${resolvedProductId}
        AND product_original_price IS NOT NULL
        AND product_original_price > 0
      ORDER BY extraction_timestamp ASC
    `),
    prisma.$queryRaw<PriceRangeRow[]>(Prisma.sql`
      SELECT
        CAST(MIN(product_original_price) AS float8) AS min_price,
        CAST(MAX(product_original_price) AS float8) AS max_price
      FROM public.products
      WHERE product_id = ${resolvedProductId}
        AND product_original_price IS NOT NULL
        AND product_original_price > 0
    `),
  ]);

  const firstSeen = toIso(firstSeenRows[0]?.first_seen);

  const price_history: PriceHistoryPoint[] = historyRows
    .filter((r) => toFloat(r.price) !== null)
    .map((r) => ({
      date: toIso(r.date),
      price: toFloat(r.price) as number,
    }));

  const minPrice = toFloat(priceRangeRows[0]?.min_price);
  const maxPrice = toFloat(priceRangeRows[0]?.max_price);

  // Extract dataset_quality_score from company (available as CompanyDTO field)
  const datasetQualityScore =
    typeof (company as { dataset_quality_score?: unknown }).dataset_quality_score === "number"
      ? (company as { dataset_quality_score: number }).dataset_quality_score
      : null;

  const product: ProductDetail = {
    id: resolvedProductId,
    title: detailRow.product_title ?? "Unknown Product",
    brand: detailRow.product_brand ?? null,
    category: detailRow.product_category ?? null,
    current_price: toFloat(detailRow.current_price),
    original_price: toFloat(detailRow.current_price),
    discount_price: toFloat(detailRow.discount_price),
    discount_pct: toFloat(detailRow.discount_pct),
    min_price: minPrice,
    max_price: maxPrice,
    dataset_quality_score: datasetQualityScore,
    image_url: detailRow.image_url ?? null,
    source_url: detailRow.product_url ?? detailRow.source_url ?? null,
    first_seen: firstSeen,
    last_seen: toIso(detailRow.last_seen),
    variants_count: toInt(detailRow.variants_count),
  };

  // Single variant built from the product row
  const variants: ProductVariant[] = [
    {
      id: `${resolvedProductId}-default`,
      title: detailRow.product_title ?? "Default",
      price: toFloat(detailRow.current_price),
      discount_price: toFloat(detailRow.discount_price),
      in_stock: null,
    },
  ];

  return { product, price_history, variants };
}
