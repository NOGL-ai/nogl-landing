
content = '''"use client";

import { Download, ExternalLink, LayoutGrid, List, Maximize2, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { FilterBar } from "@/components/companies/FilterBar";
import { Card } from "@/components/ui/card";
import { DiscountMetricsCard } from "@/components/companies/pricing/DiscountMetricsCard";
import { PriceDistributionChart } from "@/components/companies/pricing/PriceDistributionChart";
import { PricingOverTimeChart } from "@/components/companies/pricing/PricingOverTimeChart";
import { ProductTypesTable } from "@/components/companies/pricing/ProductTypesTable";
import { TopProductCard } from "@/components/companies/pricing/TopProductCard";
import { usePricingTimeseries } from "@/hooks/usePricingTimeseries";
import type {
  CompanyPricingProductTypeRow,
  CompanyPricingResponse,
  CompanyPricingProduct,
  PriceDistributionBucket,
} from "@/types/company";
import { fetchJson, formatNumber, InlineError } from "./shared";

type PricingTabProps = { slug: string; active?: boolean };
type SortOption = "price_asc" | "price_desc" | "discount_desc" | "last_seen_desc";
type ViewMode = "grid" | "list";

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

function fmtPrice(n: number | null | undefined): string {
  if (n == null) return "\\u2014";
  if (n === 0) return "\\u20ac0";
  if (n >= 1) return "\\u20ac" + Math.round(n).toLocaleString("en-US");
  return "\\u20ac" + n.toFixed(2);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return days + "d ago";
  const months = Math.floor(days / 30);
  if (months < 12) return months + "mo ago";
  return Math.floor(months / 12) + "y ago";
}

function PricingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
      <div className="h-72 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6">
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-muted lg:col-span-2" />
      </div>
    </div>
  );
}

export function PricingTab({ slug }: PricingTabProps) {
  const routeParams = useParams<{ lang: string; slug: string }>();
  const lang = routeParams.lang ?? "en";

  const [state, setState] = useState<PricingState>({ data: null, error: null, loading: true });
  const [allProductTypes, setAllProductTypes] = useState<string[]>([]);
  const [allProductTypesRows, setAllProductTypesRows] = useState<CompanyPricingProductTypeRow[]>([]);
  const [filters, setFilters] = useState<PricingFilters>({ productType: null, minPrice: null, maxPrice: null });
  const [sort, setSort] = useState<SortOption>("last_seen_desc");
  const [pricingPage, setPricingPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const timeseries = usePricingTimeseries({ slug });

  const filterUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.productType) params.set("product_type", filters.productType);
    if (filters.minPrice && !isNaN(Number(filters.minPrice))) params.set("min_price", filters.minPrice);
    if (filters.maxPrice && !isNaN(Number(filters.maxPrice))) params.set("max_price", filters.maxPrice);
    params.set("sort", sort);
    params.set("page", String(pricingPage));
    const qs = params.toString();
    return "/api/companies/" + slug + "/pricing" + (qs ? "?" + qs : "");
  }, [slug, filters, sort, pricingPage]);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchJson<CompanyPricingResponse>(filterUrl)
      .then((data) => {
        if (cancelled) return;
        setState({ data, error: null, loading: false });
        if (!filters.productType && !filters.minPrice && !filters.maxPrice && pricingPage === 1) {
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
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPricingPage(1);
  }

  function handleBucketClick(bucket: PriceDistributionBucket) {
    const [rawMin, rawMax] = bucket.range.split("-");
    setFilters((prev) => ({ ...prev, minPrice: rawMin ?? null, maxPrice: rawMax ?? null }));
    setPricingPage(1);
  }

  if (state.loading && !state.data) return <PricingSkeleton />;
  if (state.error && !state.data) return <InlineError message={state.error} />;
  if (!state.data) return null;

  const { data } = state;
  const priceDist: PriceDistributionBucket[] = data.price_distribution ?? [];
  const allProducts: CompanyPricingProduct[] = data.products ?? [];

  const filteredProducts = search.trim()
    ? allProducts.filter((p) =>
        p.product_title.toLowerCase().includes(search.toLowerCase()) ||
        (p.category ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : allProducts;

  const tableRows = allProductTypesRows.length > 0 ? allProductTypesRows : data.product_types;
  const validPrices = tableRows.filter((r) => r.min_price > 0 || r.max_price > 0);
  const globalMin = validPrices.length > 0 ? Math.min(...validPrices.map((r) => r.min_price)) : 0;
  const globalMax = validPrices.length > 0 ? Math.max(...validPrices.map((r) => r.max_price)) : 1;

  const rankOffset = (pricingPage - 1) * (data.pagination?.pageSize ?? 25);

  return (
    <div className="space-y-6">
      {state.error && state.data && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-xs text-destructive">
          <span className="font-medium">Filter error:</span> {state.error}
        </div>
      )}

      {/* Filter bar */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <FilterBar
            filters={[
              {
                key: "productType",
                label: "Product Type",
                options: (data.product_types.length > 0
                  ? data.product_types.map((r) => r.type).filter(Boolean)
                  : allProductTypes
                ).map((t) => ({ label: t.replace(/\\b\\w/g, (c) => c.toUpperCase()), value: t })),
              },
              {
                key: "minPrice", label: "Min Price", options: [], inputMode: true,
                inputPlaceholder: "e.g. 50",
                inputValueLabel: filters.minPrice ? ">= \\u20ac" + filters.minPrice : undefined,
              },
              {
                key: "maxPrice", label: "Max Price", options: [], inputMode: true,
                inputPlaceholder: "e.g. 500",
                inputValueLabel: filters.maxPrice ? "<= \\u20ac" + filters.maxPrice : undefined,
              },
            ]}
            values={filters}
            onChange={setFilter}
          />
          {state.loading && <span className="animate-pulse text-xs text-muted-foreground">Filtering\\u2026</span>}
        </div>
        <p className="text-xs text-muted-foreground">
          Found:{" "}
          <span className="font-medium text-foreground">{formatNumber(data.total_products)}</span> products{" "}
          \\u00b7{" "}
          <span className="font-medium text-foreground">{formatNumber(data.total_variants)}</span> variants{" "}
          \\u00b7{" "}
          <span className="font-medium text-foreground">{formatNumber(data.total_datapoints)}</span> datapoints
        </p>
      </div>

      {/* ── Best Selling Products — unified grid/list section ── */}
      <Card className="overflow-hidden p-0">
        {/* Header — matches reference UI exactly */}
        <div className="flex items-center justify-between px-5 py-3">
          {/* Left: title + utility icons */}
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">Best Selling Products</h3>
            <div className="flex items-center gap-0.5">
              <button type="button" title="Expand"
                className="rounded p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground">
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button type="button" title="Download CSV"
                className="rounded p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground">
                <Download className="h-3.5 w-3.5" />
              </button>
              <button type="button" title="Search"
                onClick={() => { setShowSearch((v) => !v); setTimeout(() => searchRef.current?.focus(), 50); }}
                className={"rounded p-1 transition-colors hover:bg-muted " + (showSearch ? "text-primary" : "text-muted-foreground/60 hover:text-foreground")}>
                <Search className="h-3.5 w-3.5" />
              </button>
              {showSearch && (
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search\\u2026"
                  className="ml-1 h-7 w-36 rounded border border-border bg-background px-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              )}
            </div>
          </div>

          {/* Right: sort + view toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded border border-border bg-background px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">Sort by</span>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value as SortOption); setPricingPage(1); }}
                className="bg-transparent font-medium text-primary focus:outline-none"
              >
                <option value="last_seen_desc">Sales Revenue</option>
                <option value="price_asc">Price \\u2191</option>
                <option value="price_desc">Price \\u2193</option>
                <option value="discount_desc">Discount</option>
              </select>
            </div>
            <div className="flex items-center divide-x divide-border overflow-hidden rounded border border-border">
              <button type="button" title="List view" onClick={() => setViewMode("list")}
                className={"px-2.5 py-1.5 transition-colors " + (viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                <List className="h-3.5 w-3.5" />
              </button>
              <button type="button" title="Grid view" onClick={() => setViewMode("grid")}
                className={"px-2.5 py-1.5 transition-colors " + (viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
            {(filters.productType || filters.minPrice || filters.maxPrice) && (
              <button onClick={() => { setFilters({ productType: null, minPrice: null, maxPrice: null }); setPricingPage(1); }}
                className="text-xs underline text-muted-foreground hover:text-foreground">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Grid view ── */}
        {viewMode === "grid" && (
          <>
            <div className="border-t border-border px-4 pt-4">
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No products match the current filters.</div>
              ) : (
                <div
                  className="relative overflow-hidden"
                  style={
                    data.pagination && data.pagination.totalPages > 1
                      ? { maxHeight: 420, maskImage: "linear-gradient(to bottom, black 0%, black 65%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 65%, transparent 100%)" }
                      : { maxHeight: 420 }
                  }
                >
                  <div className="overflow-y-auto pb-4" style={{ maxHeight: 420 }}>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {filteredProducts.map((product, i) => (
                        <TopProductCard key={product.product_id} rank={rankOffset + i + 1} product={product} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── List view ── */}
        {viewMode === "list" && (
          <div
            className="relative border-t border-border"
            style={
              data.pagination && data.pagination.totalPages > 1
                ? { maskImage: "linear-gradient(to bottom, black 0%, black 78%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 78%, transparent 100%)" }
                : undefined
            }
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="w-12 px-4 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Rank</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Product Title</th>
                    <th className="w-20 px-4 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Image</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</th>
                    <th className="hidden px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">Category</th>
                    <th className="hidden px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Last Seen</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product, i) => {
                    const rank = rankOffset + i + 1;
                    const href = "/" + lang + "/companies/" + slug + "/products/" + encodeURIComponent(product.product_id);
                    return (
                      <tr key={product.product_id}
                        className="cursor-pointer transition-colors hover:bg-muted/40"
                        onClick={() => { window.location.href = href; }}>
                        <td className="w-12 px-4 py-2.5 text-center">
                          <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded bg-foreground px-1.5 text-xs font-bold text-background">
                            #{rank}
                          </span>
                        </td>
                        <td className="max-w-[260px] px-4 py-2.5">
                          <p className="line-clamp-2 text-xs font-medium leading-snug text-foreground">{product.product_title}</p>
                          {product.discount_pct != null && product.discount_pct > 0 && (
                            <span className="mt-0.5 inline-block rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                              -{Math.round(product.discount_pct)}% off
                            </span>
                          )}
                        </td>
                        <td className="w-20 px-4 py-2 text-center">
                          <div className="mx-auto h-12 w-12 overflow-hidden rounded bg-muted">
                            {product.product_image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.product_image_url} alt="" className="h-full w-full object-contain p-0.5" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <svg className="h-4 w-4 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">
                          {product.discount_price != null ? (
                            <span className="flex flex-col items-end gap-0.5">
                              <span className="text-xs line-through text-muted-foreground">{fmtPrice(product.original_price)}</span>
                              <span className="text-sm font-semibold text-destructive">{fmtPrice(product.discount_price)}</span>
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-foreground">{fmtPrice(product.original_price)}</span>
                          )}
                        </td>
                        <td className="hidden px-4 py-2.5 sm:table-cell">
                          {product.category ? (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{product.category}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">\\u2014</span>
                          )}
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-2.5 text-right text-xs text-muted-foreground tabular-nums md:table-cell">
                          {product.last_seen ? timeAgo(product.last_seen) : "\\u2014"}
                        </td>
                        <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <a href={href} className="rounded border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                              Explore
                            </a>
                            {product.product_url && (
                              <a href={product.product_url} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted">
                                View <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredProducts.length === 0 && !state.loading && (
                <div className="py-12 text-center text-sm text-muted-foreground">No products match the current filters.</div>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {data.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <button disabled={pricingPage <= 1} onClick={() => setPricingPage((p) => p - 1)}
              className="rounded border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40">
              Prev
            </button>
            <span className="text-xs text-muted-foreground">
              Page {pricingPage} of {data.pagination.totalPages} \\u00b7 {formatNumber(data.pagination.total)} products
            </span>
            <button disabled={pricingPage >= data.pagination.totalPages} onClick={() => setPricingPage((p) => p + 1)}
              className="rounded border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </Card>

      {/* Discount Metrics + Price Distribution | Product Types TanStack table */}
      <div className="grid items-stretch gap-6 lg:grid-cols-3">
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

      {/* Pricing Over Time */}
      <PricingOverTimeChart
        slug={slug}
        data={timeseries.data ?? undefined}
        loading={timeseries.loading}
        error={timeseries.error}
      />
    </div>
  );
}
'''

with open("src/components/companies/tabs/PricingTab.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Done:", content.count("\\n"), "lines")
