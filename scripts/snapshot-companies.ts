const { Prisma, PrismaClient } = require("@prisma/client");

type NumericValue = { toNumber?: () => number } | number | string | null;

type CompanyRow = {
  id: string;
  name: string;
  domain: string;
};

type SnapshotAggregateRow = {
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
  top_product_id: string | null;
  top_product_title: string | null;
  top_product_image_url: string | null;
};

type BucketRow = {
  bucket: string;
  cnt: bigint;
};

const BUCKET_ORDER = ["0-50", "50-100", "100-250", "250-500", "500-1000", "1000+"];

function getDomainFilter(): string | null {
  const domainIndex = process.argv.indexOf("--domain");

  if (domainIndex === -1) {
    return null;
  }

  const value = process.argv[domainIndex + 1];
  return value ? value.trim().toLowerCase() : null;
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

  if (typeof value === "object" && typeof value.toNumber === "function") {
    return value.toNumber();
  }

  return null;
}

function formatAveragePrice(value: NumericValue): string {
  const number = toNullableNumber(value);
  return number === null ? "0.00" : number.toFixed(2);
}

async function main() {
  const prisma: InstanceType<typeof PrismaClient> = new PrismaClient();
  const domainFilter = getDomainFilter();

  try {
    const companies = (domainFilter
      ? await prisma.$queryRaw(
          Prisma.sql`
            SELECT id, name, domain
            FROM nogl."Company"
            WHERE LOWER(domain) = ${domainFilter}
            ORDER BY name ASC
          `
        )
      : await prisma.$queryRaw(
          Prisma.sql`
            SELECT id, name, domain
            FROM nogl."Company"
            ORDER BY name ASC
          `
        )) as CompanyRow[];

    for (const company of companies) {
      const domainPattern = `%${company.domain}%`;

      const [aggregateRows, topProductRows, bucketRows] = await Promise.all([
        prisma.$queryRaw(
          Prisma.sql`
            SELECT
              COUNT(*)::int AS total_products,
              COALESCE(SUM(COALESCE(product_variants_count, 0)), 0)::int AS total_variants,
              COUNT(*) FILTER (WHERE product_discount_price IS NOT NULL)::int AS total_discounted,
              AVG(product_discount_percentage) AS avg_discount_pct,
              AVG(product_original_price) AS avg_price,
              MIN(product_original_price) AS min_price,
              MAX(product_original_price) AS max_price,
              MIN(extraction_timestamp) AS data_since,
              MAX(extraction_timestamp) AS last_scraped_at
            FROM public.products
            WHERE source_url ILIKE ${domainPattern}
          `
        ),
        prisma.$queryRaw(
          Prisma.sql`
            SELECT
              product_id AS top_product_id,
              product_title AS top_product_title,
              product_page_image_url AS top_product_image_url
            FROM public.products
            WHERE source_url ILIKE ${domainPattern}
              AND product_page_image_url IS NOT NULL
            ORDER BY extraction_timestamp DESC NULLS LAST
            LIMIT 1
          `
        ),
        prisma.$queryRaw(
          Prisma.sql`
            SELECT
              CASE
                WHEN product_original_price < 50 THEN '0-50'
                WHEN product_original_price < 100 THEN '50-100'
                WHEN product_original_price < 250 THEN '100-250'
                WHEN product_original_price < 500 THEN '250-500'
                WHEN product_original_price < 1000 THEN '500-1000'
                ELSE '1000+'
              END AS bucket,
              COUNT(*) AS cnt
            FROM public.products
            WHERE source_url ILIKE ${domainPattern}
              AND product_original_price IS NOT NULL
            GROUP BY 1
          `
        ) as Promise<BucketRow[]>,
      ]);

      const aggregate = (aggregateRows[0] ?? {
        total_products: 0,
        total_variants: 0,
        total_discounted: 0,
        avg_discount_pct: null,
        avg_price: null,
        min_price: null,
        max_price: null,
        data_since: null,
        last_scraped_at: null,
      }) as SnapshotAggregateRow;

      const topProduct = (topProductRows[0] ?? {
        top_product_id: null,
        top_product_title: null,
        top_product_image_url: null,
      }) as TopProductRow;
      const totalForDist = bucketRows.reduce(
        (sum: number, row: BucketRow) => sum + Number(row.cnt),
        0
      );
      const priceDistribution = BUCKET_ORDER.map((range) => {
        const row = bucketRows.find((bucketRow: BucketRow) => bucketRow.bucket === range);
        const count = row ? Number(row.cnt) : 0;

        return {
          range,
          count,
          percentage:
            totalForDist > 0 ? Math.round((count / totalForDist) * 1000) / 10 : 0,
        };
      });

      await prisma.$executeRaw(
        Prisma.sql`
          INSERT INTO nogl."CompanySnapshot" (
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
          )
          VALUES (
            ${company.id},
            ${company.id},
            NULL,
            NULL,
            ${aggregate.total_products},
            ${aggregate.total_variants},
            ${aggregate.total_products},
            ${aggregate.total_discounted},
            ${toNullableNumber(aggregate.avg_discount_pct)},
            ${toNullableNumber(aggregate.avg_price)},
            ${toNullableNumber(aggregate.min_price)},
            ${toNullableNumber(aggregate.max_price)},
            ${JSON.stringify(priceDistribution)}::jsonb,
            ${topProduct.top_product_id},
            ${topProduct.top_product_title},
            ${topProduct.top_product_image_url},
            ${aggregate.data_since},
            ${aggregate.last_scraped_at},
            NULL,
            NULL,
            NULL,
            NULL,
            NOW()
          )
          ON CONFLICT (company_id) DO UPDATE SET
            rank = EXCLUDED.rank,
            percentile = EXCLUDED.percentile,
            total_products = EXCLUDED.total_products,
            total_variants = EXCLUDED.total_variants,
            total_datapoints = EXCLUDED.total_datapoints,
            total_discounted = EXCLUDED.total_discounted,
            avg_discount_pct = EXCLUDED.avg_discount_pct,
            avg_price = EXCLUDED.avg_price,
            min_price = EXCLUDED.min_price,
            max_price = EXCLUDED.max_price,
            price_distribution = EXCLUDED.price_distribution,
            top_product_id = EXCLUDED.top_product_id,
            top_product_title = EXCLUDED.top_product_title,
            top_product_image_url = EXCLUDED.top_product_image_url,
            data_since = EXCLUDED.data_since,
            last_scraped_at = EXCLUDED.last_scraped_at,
            ig_followers = EXCLUDED.ig_followers,
            ig_avg_likes = EXCLUDED.ig_avg_likes,
            ig_most_liked_url = EXCLUDED.ig_most_liked_url,
            ig_asset_count = EXCLUDED.ig_asset_count,
            computed_at = EXCLUDED.computed_at
        `
      );

      console.log(
        `${company.name}: ${aggregate.total_products} products, avg €${formatAveragePrice(
          aggregate.avg_price
        )}`
      );
    }

    console.log(`Snapshot done: ${companies.length} companies`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(async (error: unknown) => {
  console.error(error);
  process.exit(1);
});
