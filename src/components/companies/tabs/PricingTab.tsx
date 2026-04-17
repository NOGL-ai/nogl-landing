"use client";

import { useEffect, useMemo, useState } from "react";

import { FilterBar } from "@/components/companies/FilterBar";
import { Card } from "@/components/ui/card";
import { DiscountMetricsCard } from "@/components/companies/pricing/DiscountMetricsCard";
import { PriceDistributionChart } from "@/components/companies/pricing/PriceDistributionChart";
import { PricingOverTimeChart } from "@/components/companies/pricing/PricingOverTimeChart";
import { ProductTypesTable } from "@/components/companies/pricing/ProductTypesTable";
import { TopProductCard } from "@/components/companies/pricing/TopProductCard";
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

  if (state.loading && !state.data) return <PricingSkeleton />;
  if (state.error && !state.data) return <InlineError message={state.error} />;
  if (!state.data) return null;

  const { data } = state;
  const priceDist: PriceDistributionBucket[] = data.price_distribution ?? [];
  const topProducts = data.top_products ?? [];

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

      {/* ── Best Selling Products ── */}
      {topProducts.length > 0 && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Best Selling Products</h2>
            <span className="text-xs text-muted-foreground">
              {topProducts.length} products · Sort by: Price
            </span>
          </div>
          <div
            className="relative overflow-hidden"
            style={{
              maxHeight: 340,
              maskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
            }}
          >
            <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {topProducts.map((product, i) => (
                  <TopProductCard key={product.product_id} rank={i + 1} product={product} />
                ))}
              </div>
            </div>
          </div>
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
