import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  CompanyAssetDTO,
  CompanyAssetsResponse,
  CompanyCompetitorPreviewDTO,
  CompanyDatasetQualityUiStatus,
  CompanyDTO,
  CompanyEventDTO,
  CompanyEventsResponse,
  CompanyListItem,
  CompanyOverviewResponse,
  CompanyPricingProduct,
  CompanyPricingProductTypeRow,
  CompanyPricingResponse,
  CompanySnapshotDTO,
  CompanySocialLinksDTO,
  GetCompaniesResponse,
  PriceDistributionBucket,
} from "@/types/company";
import { PageMeta } from "@/types/product";
import { isFeatureEnabled } from "@/lib/featureFlags";

type NumericValue = Prisma.Decimal | number | string | null;

type CompanyRow = {
  id: string;
  slug: string;
  name: string;
  domain: string;
  country_code: string;
  locale: string | null;
  website: string | null;
  source_key: string | null;
  industry: string | null;
  product_types: string[] | null;
  dataset_quality_score: NumericValue;
  tracking_status: "UNTRACKED" | "TRACKED" | "PAUSED";
  tracked_competitor_id: string | null;
  wm_key: string | null;
  arango_id: string | null;
  created_at: Date;
  updated_at: Date;
};

type CompanyListRow = CompanyRow & {
  total_products: number | null;
  last_scraped_at: Date | null;
};

type CompanySnapshotRow = {
  id: string;
  company_id: string;
  rank: number | null;
  percentile: NumericValue;
  total_products: number;
  total_variants: number;
  total_datapoints: number;
  total_discounted: number;
  avg_discount_pct: NumericValue;
  avg_price: NumericValue;
  min_price: NumericValue;
  max_price: NumericValue;
  price_distribution: Prisma.JsonValue | null;
  top_product_id: string | null;
  top_product_title: string | null;
  top_product_image_url: string | null;
  data_since: Date | null;
  last_scraped_at: Date | null;
  ig_followers: number | null;
  ig_avg_likes: number | null;
  ig_most_liked_url: string | null;
  ig_asset_count: number | null;
  computed_at: Date;
};

type CompetitorRow = {
  id: string;
  name: string;
  domain: string;
  website: string | null;
  product_count: number;
  last_scraped_at: Date | null;
  created_at: Date;
  updated_at: Date;
  slug: string | null;
  country_code: string | null;
  locale: string | null;
};

type ProductAggregateRow = {
  total_products: number;
  total_variants: number;
  total_discounted: number;
  avg_discount_pct: NumericValue;
  avg_price: NumericValue;
  min_price: NumericValue;
  max_price: NumericValue;
  data_since: Date | null;
  last_scraped_at: Date | null;
};

type TopProductRow = {
  product_id: string | null;
  product_title: string | null;
  product_page_image_url: string | null;
};

type ProductTypeAggregateRow = {
  type: string | null;
  count: number;
  avg_price: NumericValue;
  min_price: NumericValue;
  max_price: NumericValue;
  avg_discount_pct: NumericValue;
};

type CompanyEventRow = {
  id: string;
  company_id: string;
  event_type: string;
  platform: string | null;
  title: string | null;
  summary: string | null;
  asset_url: string | null;
  asset_preview_url: string | null;
  event_date: Date;
  duration_days: number | null;
  confidence: NumericValue;
  score: NumericValue;
  source_url: string | null;
  raw_payload: Prisma.JsonValue | null;
  created_at: Date;
};

type CompanyAssetRow = {
  id: string;
  company_id: string;
  channel: string;
  asset_type: string;
  url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  likes: number | null;
  comments: number | null;
  published_at: Date | null;
  raw_payload: Prisma.JsonValue | null;
  created_at: Date;
};

type ExistsRow = {
  exists: boolean;
};

type CountRow = {
  count: bigint | number;
};

const schemaCapabilities = new Map<string, boolean>();

function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

function displayName(name: string, domain: string): string {
  if (/^[a-z0-9_-]+$/.test(name) && !name.includes(" ")) {
    return domain
      .replace(/\.[a-z]{2,}$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return name;
}

function deduplicateByName(companies: CompanyListItem[]): CompanyListItem[] {
  const seen = new Map<string, CompanyListItem>();
  for (const company of companies) {
    const key = company.name.trim().toLowerCase();
    const existing = seen.get(key);
    if (!existing || company.total_products > existing.total_products) {
      seen.set(key, company);
    }
  }
  return Array.from(seen.values());
}

function deduplicateByDomain(companies: CompanyListItem[]): CompanyListItem[] {
  const seen = new Map<string, CompanyListItem>();
  for (const company of companies) {
    const key = normalizeDomain(company.domain);
    const existing = seen.get(key);
    if (!existing || company.total_products > existing.total_products) {
      seen.set(key, company);
    }
  }
  return Array.from(seen.values());
}

function toNullableNumber(value: NumericValue): number | null {
  if (value === null) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (value instanceof Prisma.Decimal) {
    return value.toNumber();
  }

  return null;
}

function toNumberOrZero(value: NumericValue): number {
  return toNullableNumber(value) ?? 0;
}

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function createPagination(page: number, limit: number, total: number): PageMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

function parseCount(value: bigint | number): number {
  return typeof value === "bigint" ? Number(value) : value;
}

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i);
  }
  return Math.abs(h);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMissingRelationError(error: unknown): boolean {
  if (!isRecord(error)) {
    return false;
  }

  const code = typeof error.code === "string" ? error.code : undefined;
  const meta = isRecord(error.meta) ? error.meta : undefined;
  const metaCode = meta && typeof meta.code === "string" ? meta.code : undefined;
  const message = typeof error.message === "string" ? error.message : "";

  return (code === "P2010" && metaCode === "42P01") || message.includes("does not exist");
}

async function relationExists(schemaName: string, tableName: string): Promise<boolean> {
  const cacheKey = `table:${schemaName}.${tableName}`;
  const cached = schemaCapabilities.get(cacheKey);
  if (typeof cached === "boolean") {
    return cached;
  }

  const rows = await prisma.$queryRaw<ExistsRow[]>(Prisma.sql`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = ${schemaName}
        AND table_name = ${tableName}
    ) AS exists
  `);

  const exists = rows[0]?.exists ?? false;
  schemaCapabilities.set(cacheKey, exists);
  return exists;
}

async function columnExists(
  schemaName: string,
  tableName: string,
  columnName: string
): Promise<boolean> {
  const cacheKey = `column:${schemaName}.${tableName}.${columnName}`;
  const cached = schemaCapabilities.get(cacheKey);
  if (typeof cached === "boolean") {
    return cached;
  }

  const rows = await prisma.$queryRaw<ExistsRow[]>(Prisma.sql`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = ${schemaName}
        AND table_name = ${tableName}
        AND column_name = ${columnName}
    ) AS exists
  `);

  const exists = rows[0]?.exists ?? false;
  schemaCapabilities.set(cacheKey, exists);
  return exists;
}

function mapCompanyRowToDTO(row: CompanyRow): CompanyDTO {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    domain: row.domain,
    country_code: row.country_code,
    locale: row.locale,
    website: row.website,
    source_key: row.source_key,
    industry: row.industry,
    product_types: row.product_types ?? [],
    dataset_quality_score: toNullableNumber(row.dataset_quality_score),
    tracking_status: row.tracking_status,
    tracked_competitor_id: row.tracked_competitor_id,
    wm_key: row.wm_key,
    arango_id: row.arango_id,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function mapCompetitorRowToCompanyDTO(row: CompetitorRow): CompanyDTO {
  return {
    id: row.id,
    slug: row.slug ?? slugify(row.domain),
    name: row.name,
    domain: normalizeDomain(row.domain),
    country_code: row.country_code ?? deriveCountryFromDomain(row.domain),
    locale: row.locale,
    website: row.website,
    source_key: null,
    industry: null,
    product_types: [],
    dataset_quality_score: null,
    tracking_status: "TRACKED",
    tracked_competitor_id: row.id,
    wm_key: null,
    arango_id: null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function mapSnapshotRowToDTO(row: CompanySnapshotRow): CompanySnapshotDTO {
  return {
    id: row.id,
    company_id: row.company_id,
    rank: row.rank,
    percentile: toNullableNumber(row.percentile),
    total_products: row.total_products,
    total_variants: row.total_variants,
    total_datapoints: row.total_datapoints,
    total_discounted: row.total_discounted,
    avg_discount_pct: toNullableNumber(row.avg_discount_pct),
    avg_price: toNullableNumber(row.avg_price),
    min_price: toNullableNumber(row.min_price),
    max_price: toNullableNumber(row.max_price),
    price_distribution: row.price_distribution as CompanySnapshotDTO["price_distribution"],
    top_product_id: row.top_product_id,
    top_product_title: row.top_product_title,
    top_product_image_url: row.top_product_image_url,
    data_since: toIsoString(row.data_since),
    last_scraped_at: toIsoString(row.last_scraped_at),
    ig_followers: row.ig_followers,
    ig_avg_likes: row.ig_avg_likes,
    ig_most_liked_url: row.ig_most_liked_url,
    ig_asset_count: row.ig_asset_count,
    computed_at: row.computed_at.toISOString(),
  };
}

function mapEventRowToDTO(row: CompanyEventRow): CompanyEventDTO {
  return {
    id: row.id,
    company_id: row.company_id,
    event_type: row.event_type,
    platform: row.platform,
    title: row.title,
    summary: row.summary,
    asset_url: row.asset_url,
    asset_preview_url: row.asset_preview_url,
    event_date: row.event_date.toISOString(),
    duration_days: row.duration_days,
    confidence: toNullableNumber(row.confidence),
    score: toNullableNumber(row.score),
    source_url: row.source_url,
    raw_payload: row.raw_payload,
    createdAt: row.created_at.toISOString(),
  };
}

function mapAssetRowToDTO(row: CompanyAssetRow): CompanyAssetDTO {
  return {
    id: row.id,
    company_id: row.company_id,
    channel: row.channel,
    asset_type: row.asset_type,
    url: row.url,
    thumbnail_url: row.thumbnail_url,
    caption: row.caption,
    likes: row.likes,
    comments: row.comments,
    published_at: toIsoString(row.published_at),
    raw_payload: row.raw_payload,
    createdAt: row.created_at.toISOString(),
  };
}

async function findCompanyBySlug(slug: string): Promise<CompanyDTO | null> {
  if (!(await relationExists("nogl", "Company"))) {
    return null;
  }

  try {
    const rows = await prisma.$queryRaw<CompanyRow[]>(Prisma.sql`
      SELECT
        id,
        slug,
        name,
        domain,
        country_code,
        locale,
        website,
        source_key,
        industry,
        product_types,
        dataset_quality_score,
        tracking_status,
        tracked_competitor_id,
        wm_key,
        arango_id,
        "createdAt" AS created_at,
        "updatedAt" AS updated_at
      FROM nogl."Company"
      WHERE slug = ${slug}
      LIMIT 1
    `);

    const row = rows[0];
    return row ? mapCompanyRowToDTO(row) : null;
  } catch (error) {
    if (isMissingRelationError(error)) {
      return null;
    }
    throw error;
  }
}

async function listCompetitorsRaw(params: {
  search?: string;
  page: number;
  limit: number;
  countryCode?: string;
  slug?: string;
}): Promise<{ rows: CompetitorRow[]; total: number }> {
  const [hasSlugColumn, hasCountryCodeColumn, hasLocaleColumn] = await Promise.all([
    columnExists("nogl", "Competitor", "slug"),
    columnExists("nogl", "Competitor", "country_code"),
    columnExists("nogl", "Competitor", "locale"),
  ]);

  const conditions: Prisma.Sql[] = [Prisma.sql`c."deletedAt" IS NULL`];

  if (params.search) {
    const pattern = `%${params.search}%`;
    conditions.push(
      Prisma.sql`(
        c.name ILIKE ${pattern}
        OR c.domain ILIKE ${pattern}
        OR COALESCE(c.website, '') ILIKE ${pattern}
      )`
    );
  }

  if (params.countryCode && hasCountryCodeColumn) {
    conditions.push(Prisma.sql`c.country_code = ${params.countryCode}`);
  }

  if (params.slug && hasSlugColumn) {
    conditions.push(Prisma.sql`c.slug = ${params.slug}`);
  }

  const whereSql =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
      : Prisma.empty;

  const rows = await prisma.$queryRaw<CompetitorRow[]>(Prisma.sql`
    SELECT
      c.id,
      c.name,
      c.domain,
      c.website,
      c."productCount" AS product_count,
      c."lastScrapedAt" AS last_scraped_at,
      c."createdAt" AS created_at,
      c."updatedAt" AS updated_at,
      ${hasSlugColumn ? Prisma.sql`c.slug` : Prisma.sql`NULL::text`} AS slug,
      ${hasCountryCodeColumn ? Prisma.sql`c.country_code` : Prisma.sql`NULL::text`} AS country_code,
      ${hasLocaleColumn ? Prisma.sql`c.locale` : Prisma.sql`NULL::text`} AS locale
    FROM nogl."Competitor" c
    ${whereSql}
    ORDER BY c."productCount" DESC, c.name ASC
    LIMIT ${params.limit}
    OFFSET ${(params.page - 1) * params.limit}
  `);

  const countRows = await prisma.$queryRaw<CountRow[]>(Prisma.sql`
    SELECT COUNT(*) AS count
    FROM nogl."Competitor" c
    ${whereSql}
  `);

  return {
    rows,
    total: parseCount(countRows[0]?.count ?? 0),
  };
}

async function findCompetitorBySlug(slug: string): Promise<CompanyDTO | null> {
  const { rows } = await listCompetitorsRaw({
    slug,
    page: 1,
    limit: 200,
  });

  const directMatch = rows.find((row) => row.slug === slug);
  if (directMatch) {
    return mapCompetitorRowToCompanyDTO(directMatch);
  }

  const normalizedMatch = rows.find((row) => slugify(row.domain) === slug);
  if (normalizedMatch) {
    return mapCompetitorRowToCompanyDTO(normalizedMatch);
  }

  if (rows.length > 0) {
    return null;
  }

  const fallback = await listCompetitorsRaw({
    page: 1,
    limit: 500,
  });

  const found = fallback.rows.find((row) => {
    const candidateSlug = row.slug ?? slugify(row.domain);
    return candidateSlug === slug || slugify(row.domain) === slug;
  });

  return found ? mapCompetitorRowToCompanyDTO(found) : null;
}

async function findSnapshotByCompanyId(companyId: string): Promise<CompanySnapshotDTO | null> {
  if (!(await relationExists("nogl", "CompanySnapshot"))) {
    return null;
  }

  try {
    const rows = await prisma.$queryRaw<CompanySnapshotRow[]>(Prisma.sql`
      SELECT
        id,
        company_id,
        rank,
        percentile,
        total_products,
        total_variants,
        total_datapoints,
        total_discounted,
        avg_discount_pct,
        avg_price,
        min_price,
        max_price,
        price_distribution,
        top_product_id,
        top_product_title,
        top_product_image_url,
        data_since,
        last_scraped_at,
        ig_followers,
        ig_avg_likes,
        ig_most_liked_url,
        ig_asset_count,
        computed_at
      FROM nogl."CompanySnapshot"
      WHERE company_id = ${companyId}
      LIMIT 1
    `);

    const row = rows[0];
    return row ? mapSnapshotRowToDTO(row) : null;
  } catch (error) {
    if (isMissingRelationError(error)) {
      return null;
    }
    throw error;
  }
}

export async function buildProductsCompanyConditionSql(params: {
  companyId: string;
  companyName: string;
  companyDomain: string;
}): Promise<Prisma.Sql> {
  const hasCompanyIdColumn = await columnExists("public", "products", "company_id");

  if (hasCompanyIdColumn) {
    return Prisma.sql`company_id = ${params.companyId}`;
  }

  return Prisma.sql`(
    product_brand ILIKE ${`%${params.companyName}%`}
    OR source_url ILIKE ${`%${normalizeDomain(params.companyDomain)}%`}
  )`;
}

async function buildProductsWhereSql(
  companyId: string,
  name: string,
  domain: string,
  filters?: {
    productType?: string;
    minPrice?: number;
    maxPrice?: number;
  }
): Promise<Prisma.Sql> {
  const companyCondition = await buildProductsCompanyConditionSql({
    companyId,
    companyName: name,
    companyDomain: domain,
  });

  const conditions: Prisma.Sql[] = [
    companyCondition,
  ];

  if (filters?.productType) {
    if (filters.productType === "Uncategorized") {
      conditions.push(Prisma.sql`product_category IS NULL`);
    } else {
      conditions.push(Prisma.sql`product_category = ${filters.productType}`);
    }
  }

  if (typeof filters?.minPrice === "number" && Number.isFinite(filters.minPrice)) {
    conditions.push(Prisma.sql`product_original_price >= ${filters.minPrice}`);
  }

  if (typeof filters?.maxPrice === "number" && Number.isFinite(filters.maxPrice)) {
    conditions.push(Prisma.sql`product_original_price <= ${filters.maxPrice}`);
  }

  return Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;
}

export function slugify(domain: string): string {
  return normalizeDomain(domain)
    .replace(/\./g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function deriveCountryFromDomain(domain: string): string {
  const normalized = normalizeDomain(domain);

  if (normalized.endsWith(".co.uk")) return "GB";
  if (normalized.endsWith(".de")) return "DE";
  if (normalized.endsWith(".fr")) return "FR";
  if (normalized.endsWith(".at")) return "AT";
  if (normalized.endsWith(".ch")) return "CH";
  if (normalized.endsWith(".nl")) return "NL";
  if (normalized.endsWith(".pl")) return "PL";
  if (normalized.endsWith(".it")) return "IT";
  if (normalized.endsWith(".es")) return "ES";
  if (normalized.endsWith(".com")) return "US";

  return "US";
}

export async function resolveCompanyBySlug(slug: string): Promise<CompanyDTO | null> {
  const company = await findCompanyBySlug(slug);
  if (company) {
    return company;
  }

  return findCompetitorBySlug(slug);
}

export async function buildPlaceholderSnapshot(
  companyId: string,
  domain: string,
  name: string
): Promise<CompanySnapshotDTO> {
  const whereSql = await buildProductsWhereSql(companyId, name, domain);

  const [aggregateRows, topProductRows] = await Promise.all([
    prisma.$queryRaw<ProductAggregateRow[]>(Prisma.sql`
      SELECT
        COUNT(*)::int AS total_products,
        COALESCE(SUM(COALESCE(product_variants_count, 0)), 0)::int AS total_variants,
        COUNT(*) FILTER (
          WHERE product_discount_price IS NOT NULL
             OR (product_discount_percentage IS NOT NULL
                 AND product_discount_percentage > 0)
        )::int AS total_discounted,
        AVG(product_discount_percentage) AS avg_discount_pct,
        AVG(product_original_price) FILTER (WHERE product_original_price > 0) AS avg_price,
        MIN(product_original_price) FILTER (WHERE product_original_price > 0) AS min_price,
        MAX(product_original_price) FILTER (WHERE product_original_price > 0) AS max_price,
        MIN(extraction_timestamp) AS data_since,
        MAX(extraction_timestamp) AS last_scraped_at
      FROM public.products
      ${whereSql}
    `),
    prisma.$queryRaw<TopProductRow[]>(Prisma.sql`
      SELECT
        product_id,
        product_title,
        product_page_image_url
      FROM public.products
      ${whereSql}
        AND product_page_image_url IS NOT NULL
      ORDER BY extraction_timestamp DESC NULLS LAST
      LIMIT 1
    `),
  ]);

  const aggregate = aggregateRows[0] ?? {
    total_products: 0,
    total_variants: 0,
    total_discounted: 0,
    avg_discount_pct: null,
    avg_price: null,
    min_price: null,
    max_price: null,
    data_since: null,
    last_scraped_at: null,
  };
  const topProduct = topProductRows[0];

  return {
    id: `placeholder-snapshot-${companyId}`,
    company_id: companyId,
    rank: null,
    percentile: null,
    total_products: aggregate.total_products,
    total_variants: aggregate.total_variants,
    total_datapoints: aggregate.total_products,
    total_discounted: aggregate.total_discounted,
    avg_discount_pct: toNullableNumber(aggregate.avg_discount_pct),
    avg_price: toNullableNumber(aggregate.avg_price),
    min_price: toNullableNumber(aggregate.min_price),
    max_price: toNullableNumber(aggregate.max_price),
    // PLACEHOLDER: histogram buckets will come from the company snapshot pipeline.
    price_distribution: null,
    top_product_id: topProduct?.product_id ?? null,
    top_product_title: topProduct?.product_title ?? null,
    top_product_image_url: topProduct?.product_page_image_url ?? null,
    data_since: toIsoString(aggregate.data_since),
    last_scraped_at: toIsoString(aggregate.last_scraped_at),
    // PLACEHOLDER: social metrics will be populated from marketing asset ingestion.
    ig_followers: null,
    ig_avg_likes: null,
    ig_most_liked_url: null,
    ig_asset_count: null,
    computed_at: new Date().toISOString(),
  };
}

export async function getCompaniesResponse(params: {
  search?: string;
  page: number;
  limit: number;
  countryCode?: string;
  trackingStatus?: string;
  sortBy?: "name" | "total_products" | "last_scraped_at";
  sortDir?: "asc" | "desc";
}): Promise<GetCompaniesResponse> {
  const hasCompanyTable = await relationExists("nogl", "Company");
  const hasCompanySnapshotTable = await relationExists("nogl", "CompanySnapshot");

  if (hasCompanyTable) {
    try {
      const filters: Prisma.Sql[] = [];

      if (params.search) {
        const pattern = `%${params.search}%`;
        filters.push(
          Prisma.sql`(
            c.name ILIKE ${pattern}
            OR c.domain ILIKE ${pattern}
            OR c.slug ILIKE ${pattern}
          )`
        );
      }

      if (params.countryCode) {
        filters.push(Prisma.sql`c.country_code = ${params.countryCode}`);
      }

      if (params.trackingStatus) {
        filters.push(Prisma.sql`c.tracking_status = ${params.trackingStatus}`);
      }

      const whereSql =
        filters.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}`
          : Prisma.empty;

      const sortColSql =
        params.sortBy === "total_products"
          ? hasCompanySnapshotTable
            ? Prisma.sql`COALESCE(cs.total_products, 0)`
            : Prisma.sql`0`
          : params.sortBy === "last_scraped_at"
          ? hasCompanySnapshotTable
            ? Prisma.sql`cs.last_scraped_at`
            : Prisma.sql`c."createdAt"`
          : Prisma.sql`c.name`;
      const sortDirSql =
        params.sortDir === "desc" ? Prisma.sql`DESC NULLS LAST` : Prisma.sql`ASC NULLS LAST`;

      const [rows, countRows] = await Promise.all([
        prisma.$queryRaw<CompanyListRow[]>(Prisma.sql`
          SELECT
            c.id,
            c.slug,
            c.name,
            c.domain,
            c.country_code,
            c.locale,
            c.website,
            c.source_key,
            c.industry,
            c.product_types,
            c.dataset_quality_score,
            c.tracking_status,
            c.tracked_competitor_id,
            c.wm_key,
            c.arango_id,
            c."createdAt" AS created_at,
            c."updatedAt" AS updated_at,
            ${hasCompanySnapshotTable ? Prisma.sql`cs.total_products` : Prisma.sql`0::int`} AS total_products,
            ${hasCompanySnapshotTable ? Prisma.sql`cs.last_scraped_at` : Prisma.sql`NULL::timestamp`} AS last_scraped_at
          FROM nogl."Company" c
          ${hasCompanySnapshotTable
            ? Prisma.sql`LEFT JOIN nogl."CompanySnapshot" cs ON cs.company_id = c.id`
            : Prisma.empty}
          ${whereSql}
          ORDER BY ${sortColSql} ${sortDirSql}
          LIMIT ${params.limit}
          OFFSET ${(params.page - 1) * params.limit}
        `),
        prisma.$queryRaw<CountRow[]>(Prisma.sql`
          SELECT COUNT(*) AS count
          FROM nogl."Company" c
          ${whereSql}
        `),
      ]);

      const total = parseCount(countRows[0]?.count ?? 0);

      if (total > 0) {
        const rawCompanies: CompanyListItem[] = rows.map((row) => ({
          id: row.id,
          slug: row.slug,
          name: displayName(row.name, row.domain),
          domain: row.domain,
          country_code: row.country_code,
          industry: row.industry,
          tracking_status: row.tracking_status,
          dataset_quality_score: toNullableNumber(row.dataset_quality_score),
          total_products: row.total_products ?? 0,
          last_scraped_at: toIsoString(row.last_scraped_at),
        }));

        const companies = deduplicateByDomain(deduplicateByName(rawCompanies));

        return {
          companies,
          pagination: createPagination(params.page, params.limit, total),
        };
      }
    } catch (error) {
      if (!isMissingRelationError(error)) {
        throw error;
      }
    }
  }

  if (params.trackingStatus && params.trackingStatus !== "TRACKED") {
    return {
      companies: [],
      pagination: createPagination(params.page, params.limit, 0),
    };
  }

  const fallback = await listCompetitorsRaw({
    search: params.search,
    page: params.page,
    limit: params.limit,
    countryCode: params.countryCode,
  });

  return {
    companies: fallback.rows.map((row) => ({
      id: row.id,
      slug: row.slug ?? slugify(row.domain),
      name: row.name,
      domain: normalizeDomain(row.domain),
      country_code: row.country_code ?? deriveCountryFromDomain(row.domain),
      industry: null,
      tracking_status: "TRACKED",
      dataset_quality_score: null,
      total_products: row.product_count,
      last_scraped_at: row.last_scraped_at?.toISOString() ?? null,
    })),
    pagination: createPagination(params.page, params.limit, fallback.total),
  };
}

function buildCompanyOverviewExtensions(company: CompanyDTO): {
  socials: CompanySocialLinksDTO;
  competitors: CompanyCompetitorPreviewDTO[];
  datasetQualityUiStatus: CompanyDatasetQualityUiStatus;
} {
  if (!isFeatureEnabled("COMPANIES_OVERVIEW_EXTENSIONS")) {
    return {
      socials: { facebook: null, instagram: null, tiktok: null },
      competitors: [],
      datasetQualityUiStatus: "ok",
    };
  }

  const score = company.dataset_quality_score;
  const datasetQualityUiStatus: CompanyDatasetQualityUiStatus =
    typeof score === "number" && score < 60 ? "warning" : "ok";

  return {
    socials: { facebook: null, instagram: null, tiktok: null },
    competitors: [],
    datasetQualityUiStatus,
  };
}

export async function getCompanyOverviewResponse(slug: string): Promise<CompanyOverviewResponse | null> {
  const company = await resolveCompanyBySlug(slug);
  if (!company) {
    return null;
  }

  const snapshot = await findSnapshotByCompanyId(company.id);
  const placeholder = await buildPlaceholderSnapshot(company.id, company.domain, company.name);
  const extensions = buildCompanyOverviewExtensions(company);

  // Use snapshot for everything except total_products — prefer the live count when it's higher
  const resolvedSnapshot = snapshot
    ? {
        ...snapshot,
        total_products: Math.max(snapshot.total_products, placeholder.total_products),
        last_scraped_at: placeholder.last_scraped_at ?? snapshot.last_scraped_at,
      }
    : placeholder;

  return {
    company,
    snapshot: resolvedSnapshot,
    ...extensions,
  };
}

export async function getCompanyEventsResponse(params: {
  slug: string;
  page: number;
  limit: number;
  eventTypes?: string[];
  fromDate?: string;
  toDate?: string;
}): Promise<CompanyEventsResponse | null> {
  const company = await resolveCompanyBySlug(params.slug);
  if (!company) {
    return null;
  }

  const hasFilters =
    params.eventTypes != null && params.eventTypes.length > 0;

  let events: CompanyEventDTO[] = [];
  let total = 0;

  if (await relationExists("nogl", "CompanyEvent")) {
    try {
      const typeFilterSql =
        params.eventTypes && params.eventTypes.length > 0
          ? Prisma.sql` AND event_type = ANY(${params.eventTypes})`
          : Prisma.empty;
      const fromFilterSql = params.fromDate
        ? Prisma.sql` AND event_date >= ${new Date(params.fromDate)}`
        : Prisma.empty;
      const toFilterSql = params.toDate
        ? Prisma.sql` AND event_date <= ${new Date(params.toDate)}`
        : Prisma.empty;

      const [rows, countRows] = await Promise.all([
        prisma.$queryRaw<CompanyEventRow[]>(Prisma.sql`
          SELECT
            id,
            company_id,
            event_type,
            platform,
            title,
            summary,
            asset_url,
            asset_preview_url,
            event_date,
            duration_days,
            confidence,
            score,
            source_url,
            raw_payload,
            "createdAt" AS created_at
          FROM nogl."CompanyEvent"
          WHERE company_id = ${company.id}${typeFilterSql}${fromFilterSql}${toFilterSql}
          ORDER BY event_date DESC
          LIMIT ${params.limit}
          OFFSET ${(params.page - 1) * params.limit}
        `),
        prisma.$queryRaw<CountRow[]>(Prisma.sql`
          SELECT COUNT(*) AS count
          FROM nogl."CompanyEvent"
          WHERE company_id = ${company.id}${typeFilterSql}${fromFilterSql}${toFilterSql}
        `),
      ]);

      events = rows.map(mapEventRowToDTO);
      total = parseCount(countRows[0]?.count ?? 0);
      if (events.length === 0 && !hasFilters && process.env.NODE_ENV !== 'production') {
        console.log(`[events] No events found for company ${company.id} (${company.name}). Table exists but may be empty.`);
      }
    } catch (error) {
      if (!isMissingRelationError(error)) {
        throw error;
      }
    }
  }

  if (events.length === 0 && !hasFilters) {
    const now = Date.now();

    events = [
      {
        id: "placeholder-1",
        company_id: company.id,
        event_type: "INSTAGRAM_POST",
        platform: "instagram",
        title: "Sample Instagram Campaign",
        summary: "Placeholder event - real events populated from scraper.",
        asset_url: null,
        asset_preview_url: null,
        event_date: new Date(now - 7 * 24 * 3600 * 1000).toISOString(),
        duration_days: 1,
        confidence: 0.9,
        score: null,
        source_url: null,
        raw_payload: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "placeholder-2",
        company_id: company.id,
        event_type: "NEWSLETTER",
        platform: "email",
        title: "Weekly Newsletter",
        summary: "Placeholder event - real events populated from scraper.",
        asset_url: null,
        asset_preview_url: null,
        event_date: new Date(now - 14 * 24 * 3600 * 1000).toISOString(),
        duration_days: 1,
        confidence: 0.9,
        score: null,
        source_url: null,
        raw_payload: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "placeholder-3",
        company_id: company.id,
        event_type: "PRICE_DROP",
        platform: "web",
        title: "Price Drop Event",
        summary: "Placeholder event - real events populated from scraper.",
        asset_url: null,
        asset_preview_url: null,
        event_date: new Date(now - 21 * 24 * 3600 * 1000).toISOString(),
        duration_days: 1,
        confidence: 0.9,
        score: null,
        source_url: null,
        raw_payload: null,
        createdAt: new Date().toISOString(),
      },
    ];
    // PLACEHOLDER: swap these timeline items for real inferred events once ingestion lands.
    total = events.length;
  }

  return {
    company: {
      id: company.id,
      slug: company.slug,
      name: company.name,
      country_code: company.country_code,
    },
    events,
    pagination: createPagination(params.page, params.limit, total),
  };
}

export async function getCompanyPricingResponse(params: {
  slug: string;
  page: number;
  limit: number;
  productType?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "discount_desc" | "last_seen_desc";
  productPage?: number;
  productLimit?: number;
}): Promise<CompanyPricingResponse | null> {
  const company = await resolveCompanyBySlug(params.slug);
  if (!company) {
    return null;
  }

  const productPage = params.productPage ?? 1;
  const productLimit = params.productLimit ?? 20;

  const whereSql = await buildProductsWhereSql(company.id, company.name, company.domain, {
    productType: params.productType,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
  });

  // Sort clause for the product table
  const sortClause =
    params.sort === "price_asc"
      ? Prisma.sql`product_original_price ASC NULLS LAST`
      : params.sort === "price_desc"
      ? Prisma.sql`product_original_price DESC NULLS LAST`
      : params.sort === "discount_desc"
      ? Prisma.sql`product_discount_percentage DESC NULLS LAST`
      : Prisma.sql`extraction_timestamp DESC NULLS LAST`;

  type TopProductForPricingRow = {
    product_id: string | null;
    product_title: string | null;
    product_page_image_url: string | null;
    product_url: string | null;
    product_original_price: number | null;
    product_discount_price: number | null;
    product_category: string | null;
  };

  type ProductForTableRow = {
    product_id: string;
    product_title: string | null;
    product_image_url: string | null;
    product_url: string | null;
    category: string | null;
    original_price: number | null;
    discount_price: number | null;
    discount_pct: number | null;
    last_seen: Date | null;
  };

  // Also fetch the snapshot for price_distribution (fire in parallel)
  const snapshotPromise = prisma.companySnapshot
    .findFirst({ where: { company_id: company.id }, select: { price_distribution: true } })
    .catch(() => null);

  const [aggregateRows, groupedRows, groupCountRows, productCountRows, topProductRows, productsRows] =
    await Promise.all([
      // BUG 1+2: fixed discount count (either column) + price aggregates exclude 0-price rows
      prisma.$queryRaw<ProductAggregateRow[]>(Prisma.sql`
        SELECT
          COUNT(*)::int AS total_products,
          COALESCE(SUM(COALESCE(product_variants_count, 0)), 0)::int AS total_variants,
          COUNT(*) FILTER (
            WHERE product_discount_price IS NOT NULL
               OR (product_discount_percentage IS NOT NULL
                   AND product_discount_percentage > 0)
          )::int AS total_discounted,
          AVG(product_discount_percentage) AS avg_discount_pct,
          AVG(product_original_price) FILTER (WHERE product_original_price > 0) AS avg_price,
          MIN(product_original_price) FILTER (WHERE product_original_price > 0) AS min_price,
          MAX(product_original_price) FILTER (WHERE product_original_price > 0) AS max_price
        FROM public.products
        ${whereSql}
      `),
      // Product types grouped (for product_types_pagination)
      prisma.$queryRaw<ProductTypeAggregateRow[]>(Prisma.sql`
        SELECT
          COALESCE(product_category, 'Uncategorized') AS type,
          COUNT(*)::int AS count,
          AVG(product_original_price) AS avg_price,
          MIN(product_original_price) FILTER (WHERE product_original_price > 0) AS min_price,
          MAX(product_original_price) FILTER (WHERE product_original_price > 0) AS max_price,
          AVG(product_discount_percentage) AS avg_discount_pct
        FROM public.products
        ${whereSql}
        GROUP BY COALESCE(product_category, 'Uncategorized')
        ORDER BY COUNT(*) DESC, COALESCE(product_category, 'Uncategorized') ASC
        LIMIT ${params.limit}
        OFFSET ${(params.page - 1) * params.limit}
      `),
      // BUG 3: count product TYPE groups (for product_types_pagination)
      prisma.$queryRaw<CountRow[]>(Prisma.sql`
        SELECT COUNT(*) AS count
        FROM (
          SELECT COALESCE(product_category, 'Uncategorized')
          FROM public.products
          ${whereSql}
          GROUP BY COALESCE(product_category, 'Uncategorized')
        ) grouped
      `),
      // BUG 3: separate individual product count (for product-level pagination)
      prisma.$queryRaw<CountRow[]>(Prisma.sql`
        SELECT COUNT(*) AS count
        FROM public.products
        ${whereSql}
      `),
      // BUG 4: COALESCE both image columns for top products
      prisma.$queryRaw<TopProductForPricingRow[]>(Prisma.sql`
        SELECT
          product_id,
          product_title,
          COALESCE(product_page_image_url, product_image_url) AS product_page_image_url,
          product_url,
          CAST(product_original_price AS float8) AS product_original_price,
          CAST(product_discount_price AS float8) AS product_discount_price,
          product_category
        FROM public.products
        ${whereSql}
          AND product_title IS NOT NULL
        ORDER BY product_original_price DESC NULLS LAST
        LIMIT 8
      `),
      // NEW: paginated product table with sort
      prisma.$queryRaw<ProductForTableRow[]>(Prisma.sql`
        SELECT
          product_id,
          product_title,
          COALESCE(product_page_image_url, product_image_url) AS product_image_url,
          product_url,
          product_category AS category,
          CAST(product_original_price AS float8) AS original_price,
          CAST(product_discount_price AS float8) AS discount_price,
          CAST(product_discount_percentage AS float8) AS discount_pct,
          extraction_timestamp AS last_seen
        FROM public.products
        ${whereSql}
        ORDER BY ${sortClause}
        LIMIT ${productLimit}
        OFFSET ${(productPage - 1) * productLimit}
      `),
    ]);

  const aggregate = aggregateRows[0] ?? {
    total_products: 0,
    total_variants: 0,
    total_discounted: 0,
    avg_discount_pct: null,
    avg_price: null,
    min_price: null,
    max_price: null,
    data_since: null,
    last_scraped_at: null,
  };

  const totalProductCount = parseCount(productCountRows[0]?.count ?? 0);

  const productTypes: CompanyPricingProductTypeRow[] = groupedRows.map((row) => ({
    type: row.type ?? "Uncategorized",
    count: row.count,
    avg_price: toNumberOrZero(row.avg_price),
    min_price: toNumberOrZero(row.min_price),
    max_price: toNumberOrZero(row.max_price),
    avg_discount_pct: toNumberOrZero(row.avg_discount_pct),
  }));

  const snapshotRow = await snapshotPromise;
  const priceDist = snapshotRow?.price_distribution
    ? (snapshotRow.price_distribution as unknown as PriceDistributionBucket[])
    : null;

  const products: CompanyPricingProduct[] = productsRows.map((r) => ({
    product_id: r.product_id,
    product_title: r.product_title ?? 'Unknown',
    product_image_url: r.product_image_url ?? null,
    product_url: r.product_url ?? null,
    category: r.category ?? null,
    original_price: r.original_price != null ? Number(r.original_price) : null,
    discount_price: r.discount_price != null ? Number(r.discount_price) : null,
    discount_pct: r.discount_pct != null ? Number(r.discount_pct) : null,
    last_seen: r.last_seen ? r.last_seen.toISOString() : null,
  }));

  return {
    company: {
      id: company.id,
      slug: company.slug,
      name: company.name,
      country_code: company.country_code,
    },
    total_products: aggregate.total_products,
    total_variants: aggregate.total_variants,
    total_datapoints: aggregate.total_products,
    total_discounted: aggregate.total_discounted,
    avg_discount_pct: toNullableNumber(aggregate.avg_discount_pct),
    avg_price: toNullableNumber(aggregate.avg_price),
    min_price: toNullableNumber(aggregate.min_price),
    max_price: toNullableNumber(aggregate.max_price),
    product_types: productTypes,
    price_distribution: priceDist,
    top_products: topProductRows.map((r, idx) => ({
      product_id: r.product_id ?? `tp-${company.slug}-${idx}`,
      product_title: r.product_title ?? "Unknown Product",
      product_image_url: r.product_page_image_url,
      product_url: r.product_url,
      original_price: typeof r.product_original_price === "number" ? r.product_original_price : null,
      discount_price: typeof r.product_discount_price === "number" ? r.product_discount_price : null,
      category: r.product_category,
    })),
    products: productsRows.map((r) => ({
      product_id: r.product_id,
      product_title: r.product_title ?? "Unknown",
      product_image_url: r.product_image_url ?? null,
      product_url: r.product_url ?? null,
      category: r.category ?? null,
      original_price: r.original_price ?? null,
      discount_price: r.discount_price ?? null,
      discount_pct: r.discount_pct ?? null,
      last_seen: r.last_seen ? r.last_seen.toISOString() : null,
    })),
    // BUG 3: pagination = product-level; product_types_pagination = type-group level
    pagination: createPagination(productPage, productLimit, totalProductCount),
    product_types_pagination: createPagination(
      params.page,
      params.limit,
      parseCount(groupCountRows[0]?.count ?? 0)
    ),
  };
}

export async function getCompanyAssetsResponse(params: {
  slug: string;
  page: number;
  limit: number;
  channel?: string;
}): Promise<CompanyAssetsResponse | null> {
  const company = await resolveCompanyBySlug(params.slug);
  if (!company) {
    return null;
  }

  let items: CompanyAssetDTO[] = [];
  let total = 0;

  const tableExists = await relationExists("nogl", "CompanyAsset");
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[assets] CompanyAsset table exists: ${tableExists}, company: ${company.name} (${company.id})`);
  }

  if (tableExists) {
    try {
      const filters: Prisma.Sql[] = [Prisma.sql`company_id = ${company.id}`];
      if (params.channel) {
        filters.push(Prisma.sql`channel = ${params.channel}`);
      }
      const whereSql = Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}`;

      const [rows, countRows] = await Promise.all([
        prisma.$queryRaw<CompanyAssetRow[]>(Prisma.sql`
          SELECT
            id,
            company_id,
            channel,
            asset_type,
            url,
            thumbnail_url,
            caption,
            likes,
            comments,
            published_at,
            raw_payload,
            "createdAt" AS created_at
          FROM nogl."CompanyAsset"
          ${whereSql}
          ORDER BY published_at DESC NULLS LAST, "createdAt" DESC
          LIMIT ${params.limit}
          OFFSET ${(params.page - 1) * params.limit}
        `),
        prisma.$queryRaw<CountRow[]>(Prisma.sql`
          SELECT COUNT(*) AS count
          FROM nogl."CompanyAsset"
          ${whereSql}
        `),
      ]);

      items = rows.map(mapAssetRowToDTO);
      total = parseCount(countRows[0]?.count ?? 0);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[assets] Found ${items.length} assets for ${company.name} (total: ${total})`);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[assets] Query failed for ${company.name}:`, error);
      }
      if (!isMissingRelationError(error)) {
        throw error;
      }
    }
  }

  if (items.length === 0 && !params.channel) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[assets] No real assets for ${company.name} — returning placeholder set`);
    }
    const placeholderChannels = ['instagram', 'meta_ads', 'email'];
    items = placeholderChannels.flatMap((channel, ci) =>
      Array.from({ length: 4 }, (_, i) => ({
        id: `placeholder-${channel}-${i}`,
        company_id: company.id,
        channel,
        asset_type: channel === 'email' ? 'email' : 'image',
        url: null,
        thumbnail_url: null,
        caption: channel === 'instagram'
          ? `Sample Instagram post ${i + 1} — real assets will appear once the scraper ingests ${company.name}'s social feeds.`
          : channel === 'meta_ads'
          ? `Meta Ad creative ${i + 1} — placeholder until ad library scraping runs.`
          : `Email campaign ${i + 1} — placeholder until email ingestion pipeline runs.`,
        likes: channel === 'instagram' ? (simpleHash(`${company.slug}-${channel}-${i}-l`) % 500) + 50 : null,
        comments: channel === 'instagram' ? (simpleHash(`${company.slug}-${channel}-${i}-c`) % 50) + 5 : null,
        published_at: new Date(Date.now() - (ci * 4 + i) * 86400000).toISOString(),
        raw_payload: null,
        createdAt: new Date().toISOString(),
      } satisfies CompanyAssetDTO))
    );
    total = items.length;
  }

  const overview = await getCompanyOverviewResponse(params.slug);
  const snapshot = overview?.snapshot;

  return {
    company: {
      id: company.id,
      slug: company.slug,
      name: company.name,
      country_code: company.country_code,
    },
    ig_followers: snapshot?.ig_followers ?? null,
    ig_avg_likes: snapshot?.ig_avg_likes ?? null,
    ig_asset_count: items.length > 0 ? snapshot?.ig_asset_count ?? total : 0,
    ig_most_liked_url: snapshot?.ig_most_liked_url ?? null,
    items,
    pagination: createPagination(params.page, params.limit, total),
  };
}

