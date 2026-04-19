-- Materialized views for Internal Trends page (Phase 1)
-- These are refreshed nightly via /api/cron/refresh-trends

-- Company velocity: new products 4w vs prior 4w + avg price diff
CREATE MATERIALIZED VIEW IF NOT EXISTS nogl."CompanyTrend4w" AS
SELECT
  c.id                                                               AS company_id,
  c.name,
  c.slug,
  c.domain,
  NULL::text                                                         AS logo_url,
  COUNT(DISTINCT p.id) FILTER (
    WHERE p.created_at > NOW() - INTERVAL '4 weeks'
  )::int                                                             AS new_products_4w,
  COUNT(DISTINCT p.id) FILTER (
    WHERE p.created_at > NOW() - INTERVAL '8 weeks'
      AND p.created_at <= NOW() - INTERVAL '4 weeks'
  )::int                                                             AS new_products_prev_4w,
  AVG(cpc."priceDiffPct") FILTER (
    WHERE cpc."priceDate" > NOW() - INTERVAL '4 weeks'
  )                                                                  AS avg_price_change_4w,
  COUNT(DISTINCT p.id)::int                                          AS total_products,
  NOW()                                                              AS refreshed_at
FROM nogl."Company" c
LEFT JOIN public.products p
       ON p.company_id = c.id
LEFT JOIN nogl."CompetitorPriceComparison" cpc
       ON cpc."competitorId" = c.tracked_competitor_id
      AND cpc."deletedAt" IS NULL
GROUP BY c.id, c.name, c.slug, c.domain;

CREATE UNIQUE INDEX IF NOT EXISTS "CompanyTrend4w_company_id_idx"
  ON nogl."CompanyTrend4w" (company_id);

CREATE INDEX IF NOT EXISTS "CompanyTrend4w_new_products_4w_idx"
  ON nogl."CompanyTrend4w" (new_products_4w DESC);

-- Category velocity: new products 4w vs prior 4w keyed by product_category string
CREATE MATERIALIZED VIEW IF NOT EXISTS nogl."CategoryTrend4w" AS
SELECT
  p.product_category                                                 AS category,
  COUNT(*) FILTER (
    WHERE p.created_at > NOW() - INTERVAL '4 weeks'
  )::int                                                             AS new_products_4w,
  COUNT(*) FILTER (
    WHERE p.created_at > NOW() - INTERVAL '8 weeks'
      AND p.created_at <= NOW() - INTERVAL '4 weeks'
  )::int                                                             AS new_products_prev_4w,
  COUNT(DISTINCT p.company_id)::int                                  AS company_count,
  COUNT(*)::int                                                      AS total_products,
  NOW()                                                              AS refreshed_at
FROM public.products p
WHERE p.product_category IS NOT NULL
GROUP BY p.product_category;

CREATE UNIQUE INDEX IF NOT EXISTS "CategoryTrend4w_category_idx"
  ON nogl."CategoryTrend4w" (category);

-- Weekly per-company product counts (12 weeks) used for sparklines
CREATE MATERIALIZED VIEW IF NOT EXISTS nogl."CompanyTrendWeekly12" AS
SELECT
  p.company_id,
  date_trunc('week', p.created_at)                                   AS week_start,
  COUNT(*)::int                                                      AS new_products
FROM public.products p
WHERE p.created_at > NOW() - INTERVAL '12 weeks'
  AND p.company_id IS NOT NULL
GROUP BY p.company_id, date_trunc('week', p.created_at);

CREATE UNIQUE INDEX IF NOT EXISTS "CompanyTrendWeekly12_key_idx"
  ON nogl."CompanyTrendWeekly12" (company_id, week_start);
