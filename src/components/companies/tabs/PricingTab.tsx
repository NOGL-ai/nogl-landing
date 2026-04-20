"use client";

import { LinkExternal01 as ExternalLink, LayoutGrid01 as LayoutGrid, List } from '@untitledui/icons';

import { useEffect, useMemo, useState } from "react";


import { FilterBar } from "@/components/companies/FilterBar";
import { Card } from "@/components/ui/card";
import { DiscountMetricsCard } from "@/components/companies/pricing/DiscountMetricsCard";
import { PriceDistributionChart } from "@/components/companies/pricing/PriceDistributionChart";
import { PricingOverTimeChart } from "@/components/companies/pricing/PricingOverTimeChart";
import { ProductTypesTable } from "@/components/companies/pricing/ProductTypesTable";
import { TopProductCard } from "@/components/companies/pricing/TopProductCard";
import { fmtPrice } from "@/components/companies/pricing/utils";
import { usePricingTimeseries } from "@/hooks/usePricingTimeseries";
import type { CompanyPricingProductTypeRow, CompanyPricingResponse, PriceDistributionBucket } from "@/types/company";
import { fetchJson, formatNumber, InlineError } from "./shared";

// ── Types ─────────────────────────────────────────────────────────────────────
type PricingTabProps = { slug: string; active?: boolean };

type SortOption = "price_asc" | "price_desc" | "discount_desc" | "last_seen_desc";

type PricingState = {
  data: CompanyPricingResponse | null;
  error: string | null;
  loading: boolean;
};

type PricingFilters = {
  productType: string | null;
  minPrice: string | null;
  maxPrice: string | null;
};

// ── Loading skeleton ──────────────────────────────────────────────────────────
function PricingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6">
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-muted lg:col-span-2" />
      </div>
      <div className="h-96 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function PricingTab({ slug }: PricingTabProps) {
  const [state, setState] = useState<PricingState>({ data: null, error: null, loading: true });
  const [allProductTypes, setAllProductTypes] = useState<string[]>([]);
  // Keep full unfiltered product-type rows so the table never collapses when a filter is active
  const [allProductTypesRows, setAllProductTypesRows] = useState<CompanyPricingProductTypeRow[]>([]);
  const [filters, setFilters] = useState<PricingFilters>({
    productType: null,
    minPrice: null,
    maxPrice: null,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<SortOption>("price_asc");

  const timeseries = usePricingTimeseries({ slug });

  // Build query URL from current filters
  const filterUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.productType) params.set("product_type", filters.productType);
    if (filters.minPrice && !isNaN(Number(filters.minPrice)))
      params.set("min_price", filters.minPrice);
    if (filters.maxPrice && !isNaN(Number(filters.maxPrice)))
      params.set("max_price", filters.maxPrice);
    const qs = params.toString();
    return `/api/companies/${slug}/pricing${qs ? `?${qs}` : ""}`;
  }, [slug, filters]);

  // Single effect — fetches on mount and whenever filterUrl changes
  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchJson<CompanyPricingResponse>(filterUrl)
      .then((data) => {
        if (cancelled) return;
        setState({ data, error: null, loading: false });
        // Only populate type list + full rows from the unfiltered response
        if (!filters.productType && !filters.minPrice && !filters.maxPrice) {
          setAllProductTypes(data.product_types.map((r) => r.type).filter(Boolean));
          setAllProductTypesRows(data.product_types);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          error: err instanceof Error ? err.message : "Could not load pricing data.",
          loading: false,
        }));
      });

    return () => { cancelled = true; };
  }, [filterUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  function setFilter(key: string, value: string | null) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  function handleBucketClick(bucket: PriceDistributionBucket) {
    const [rawMin, rawMax] = bucket.range.split("-");
    setFilters((prev) => ({
      ...prev,
      minPrice: rawMin ?? null,
      maxPrice: rawMax ?? null,
    }));
  }

  // useMemo must be unconditional — derive from state.data which may be null before load
  const topProducts = state.data?.top_products ?? [];
  const sortedTopProducts = useMemo(() => {
    const arr = [...topProducts];
    if (sort === "price_asc")  arr.sort((a, b) => (a.original_price ?? 0) - (b.original_price ?? 0));
    if (sort === "price_desc") arr.sort((a, b) => (b.original_price ?? 0) - (a.original_price ?? 0));
    if (sort === "discount_desc") {
      arr.sort((a, b) => {
        const da = a.discount_price != null && a.original_price ? 1 - a.discount_price / a.original_price : 0;
        const db = b.discount_price != null && b.original_price ? 1 - b.discount_price / b.original_price : 0;
        return db - da;
      });
    }
    return arr;
  }, [topProducts, sort]);

  if (state.loading && !state.data) return <PricingSkeleton />;
  if (state.error && !state.data) return <InlineError message={state.error} />;
  if (!state.data) return null;

  const { data } = state;
  const priceDist: PriceDistributionBucket[] = data.price_distribution ?? [];

  // Use unfiltered rows for the table and price range bars so they stay stable
  const tableRows = allProductTypesRows.length > 0 ? allProductTypesRows : data.product_types;
  const validPrices = tableRows.filter((r) => r.min_price > 0 || r.max_price > 0);
  const globalMin = validPrices.length > 0 ? Math.min(...validPrices.map((r) => r.min_price)) : 0;
  const globalMax = validPrices.length > 0 ? Math.max(...validPrices.map((r) => r.max_price)) : 1;

  return (
    <div className="space-y-6">
      {/* ── Filter error banner (shown when a filter-request fails but data still exists) ── */}
      {state.error && state.data && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-xs text-destructive">
          <span className="font-medium">Filter error:</span> {state.error}
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <FilterBar
            filters={[
              {
                key: "productType",
                label: "Product Type",
                options: allProductTypes.map((t) => ({
                  label: t.replace(/\b\w/g, (c) => c.toUpperCase()),
                  value: t,
                })),
              },
              {
                key: "minPrice",
                label: "Min Price",
                options: [],
                inputMode: true,
                inputPlaceholder: "e.g. 50",
                inputValueLabel: filters.minPrice ? `≥ €${filters.minPrice}` : undefined,
              },
              {
                key: "maxPrice",
                label: "Max Price",
                options: [],
                inputMode: true,
                inputPlaceholder: "e.g. 500",
                inputValueLabel: filters.maxPrice ? `≤ €${filters.maxPrice}` : undefined,
              },
            ]}
            values={filters}
            onChange={setFilter}
          />
          {state.loading && (
            <span className="animate-pulse text-xs text-muted-foreground">Filtering…</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Found:{" "}
          <span className="font-medium text-foreground">{formatNumber(data.total_products)}</span>{" "}
          products ·{" "}
          <span className="font-medium text-foreground">{formatNumber(data.total_variants)}</span>{" "}
          variants ·{" "}
          <span className="font-medium text-foreground">{formatNumber(data.total_datapoints)}</span>{" "}
          total datapoints
        </p>
      </div>

      {/* ── Top Products ── */}
      {topProducts.length > 0 && (
        <Card className="p-5">
          {/* Header — one line on all viewports */}
          <div className="mb-4 flex min-w-0 items-center gap-3">
            <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
              Top Products by Price
            </h2>
            <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{sortedTopProducts.length} products</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
              >
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
                <option value="discount_desc">Discount ↓</option>
              </select>
              <div className="inline-flex overflow-hidden rounded border border-border">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-2 py-1 transition-colors ${viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-2 py-1 transition-colors ${viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}
                  aria-label="List view"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid view */}
          {viewMode === "grid" && (
            <div className="relative" style={{ height: 340 }}>
              <div className="h-full overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {sortedTopProducts.map((product, i) => (
                    <TopProductCard key={product.product_id} rank={i + 1} product={product} />
                  ))}
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
            </div>
          )}

          {/* List view — horizontal scroll table */}
          {viewMode === "list" && (
            <div className="relative" style={{ height: 420 }}>
              <div className="h-full overflow-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="sticky top-0 bg-card pb-2 pl-1 pr-3 text-left font-medium">#</th>
                      <th className="sticky top-0 bg-card pb-2 pr-3 text-left font-medium">Image</th>
                      <th className="sticky top-0 bg-card pb-2 pr-3 text-left font-medium">Product</th>
                      <th className="sticky top-0 bg-card pb-2 pr-3 text-right font-medium">Full Price</th>
                      <th className="sticky top-0 bg-card pb-2 pr-3 text-right font-medium">Sale Price</th>
                      <th className="sticky top-0 bg-card pb-2 pr-3 text-right font-medium">Discount</th>
                      <th className="sticky top-0 bg-card pb-2 text-right font-medium">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTopProducts.map((product, i) => {
                      const discountPct =
                        product.discount_price != null && product.original_price
                          ? Math.round((1 - product.discount_price / product.original_price) * 100)
                          : null;
                      return (
                        <tr key={product.product_id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 pl-1 pr-3 text-xs font-bold text-muted-foreground">#{i + 1}</td>
                          <td className="py-2 pr-3">
                            <div className="h-10 w-10 overflow-hidden rounded bg-muted/30">
                              {product.product_image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.product_image_url} alt={product.product_title} className="h-full w-full object-contain p-1" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[8px] text-muted-foreground">N/A</div>
                              )}
                            </div>
                          </td>
                          <td className="max-w-[220px] py-2 pr-3">
                            <p className="line-clamp-2 text-xs font-medium text-foreground">{product.product_title}</p>
                          </td>
                          <td className="py-2 pr-3 text-right text-xs text-muted-foreground line-through">
                            {product.original_price != null ? fmtPrice(product.original_price) : "—"}
                          </td>
                          <td className="py-2 pr-3 text-right text-xs font-semibold text-emerald-500">
                            {product.discount_price != null ? fmtPrice(product.discount_price) : fmtPrice(product.original_price)}
                          </td>
                          <td className="py-2 pr-3 text-right text-xs">
                            {discountPct != null ? (
                              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                -{discountPct}%
                              </span>
                            ) : "—"}
                          </td>
                          <td className="py-2 text-right">
                            {product.product_url && (
                              <a href={product.product_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted">
                                View <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
            </div>
          )}
        </Card>
      )}

      {/* ── Discount Metrics + Price Distribution | Product Types table ── */}
      <div className="grid items-stretch gap-6 lg:grid-cols-3">

        {/* Left column */}
        <div className="flex flex-col gap-6">
          <DiscountMetricsCard
            totalDiscounted={data.total_discounted}
            totalProducts={data.total_products}
            loading={state.loading}
          />
          {priceDist.length > 0 && (
            <PriceDistributionChart
              buckets={priceDist}
              onBucketClick={handleBucketClick}
              slug={slug}
              loading={state.loading}
            />
          )}
        </div>

        {/* Right column — TanStack Table */}
        <div className="lg:col-span-2">
          <ProductTypesTable
            rows={tableRows}
            activeType={filters.productType}
            onTypeSelect={(type) => setFilter("productType", type)}
            globalMin={globalMin}
            globalMax={globalMax}
            totalProducts={data.total_products}
            loading={allProductTypesRows.length === 0 && state.loading}
          />
        </div>
      </div>

      {/* ── Pricing Over Time ── */}
      <PricingOverTimeChart
        slug={slug}
        data={timeseries.data ?? undefined}
        loading={timeseries.loading}
        error={timeseries.error}
      />
    </div>
  );
}