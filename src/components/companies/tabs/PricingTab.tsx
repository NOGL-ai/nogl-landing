"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { FilterBar } from "@/components/companies/FilterBar";
import { Card } from "@/components/ui/card";
import { DiscountMetricsCard } from "@/components/companies/pricing/DiscountMetricsCard";
import type {
  CompanyPricingResponse,
  CompanyPricingProduct,
  PriceDistributionBucket,
} from "@/types/company";
import { fetchJson, formatNumber, formatPercent, InlineError } from "./shared";

// ── Types ─────────────────────────────────────────────────────────────────────

type PricingTabProps = {
  slug: string;
  active?: boolean;
};

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

type SortOption = "price_asc" | "price_desc" | "discount_desc" | "last_seen_desc";

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtPrice(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n === 0) return "€0";
  if (n >= 1) return `€${Math.round(n).toLocaleString("en-US")}`;
  return `€${n.toFixed(2)}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// ── Price range bar ───────────────────────────────────────────────────────────

function PriceRangeBar({
  min,
  max,
  globalMin,
  globalMax,
}: {
  min: number;
  max: number;
  globalMin: number;
  globalMax: number;
}) {
  const range = Math.max(globalMax - globalMin, 1);
  const left = ((min - globalMin) / range) * 100;
  const width = Math.max(((max - min) / range) * 100, 3);
  return (
    <div className="relative h-1.5 w-20 flex-shrink-0 rounded-full bg-muted">
      <div
        className="absolute h-1.5 rounded-full bg-primary/60"
        style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
      />
    </div>
  );
}

// ── Price distribution bars ───────────────────────────────────────────────────

function parseBucketRange(range: string): [number, number] {
  if (range.endsWith("+")) {
    const min = parseInt(range.slice(0, -1), 10);
    return [isNaN(min) ? 0 : min, 999999];
  }
  const parts = range.split("-");
  const lo = parseInt(parts[0] ?? "0", 10);
  const hi = parseInt(parts[1] ?? "0", 10);
  return [isNaN(lo) ? 0 : lo, isNaN(hi) ? 999999 : hi];
}

function PriceDistributionBars({
  buckets,
  onBucketClick,
}: {
  buckets: PriceDistributionBucket[];
  onBucketClick?: (min: number, max: number) => void;
}) {
  if (!buckets.length)
    return <p className="text-xs text-muted-foreground">No distribution data.</p>;

  const maxPct = Math.max(...buckets.map((b) => b.percentage), 1);
  const chartMax = Math.ceil(maxPct / 20) * 20 || 20;
  const yTicks = Array.from(
    { length: Math.floor(chartMax / 20) + 1 },
    (_, i) => i * 20
  );

  const W = 420;
  const H = 160;
  const ML = 36;
  const MB = 32;
  const MT = 8;
  const chartW = W - ML;
  const bw = (chartW / buckets.length) * 0.6;
  const gap = (chartW / buckets.length) * 0.4;

  return (
    <svg
      viewBox={`0 0 ${W} ${H + MB + MT}`}
      className="w-full"
      style={{ overflow: "visible" }}
    >
      {yTicks.map((tick) => {
        const y = MT + H - (tick / chartMax) * H;
        return (
          <g key={tick}>
            <line
              x1={ML}
              x2={W}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeDasharray="3 3"
              className="text-border"
              strokeWidth="0.8"
            />
            <text
              x={ML - 4}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="9"
              className="fill-muted-foreground"
            >
              {tick}%
            </text>
          </g>
        );
      })}

      {buckets.map((bucket, i) => {
        const barH = Math.max((bucket.percentage / chartMax) * H, 1);
        const x = ML + i * (chartW / buckets.length) + gap / 2;
        const y = MT + H - barH;
        const label = `€${bucket.range.replace(/-/g, "–")}`;
        const [rMin, rMax] = parseBucketRange(bucket.range);

        return (
          <g
            key={bucket.range}
            className={onBucketClick ? "cursor-pointer" : undefined}
            onClick={onBucketClick ? () => onBucketClick(rMin, rMax) : undefined}
          >
            <rect
              x={x}
              y={y}
              width={bw}
              height={barH}
              rx="3"
              className="fill-primary/70 hover:fill-primary transition-colors"
            />
            {bucket.percentage >= 4 && (
              <text
                x={x + bw / 2}
                y={y + 11}
                textAnchor="middle"
                fontSize="8"
                fontWeight="600"
                fill="white"
              >
                {Math.round(bucket.percentage)}%
              </text>
            )}
            <text
              x={x + bw / 2}
              y={MT + H + 14}
              textAnchor="middle"
              fontSize="8.5"
              className="fill-muted-foreground"
            >
              {label}
            </text>
          </g>
        );
      })}

      <line
        x1={ML}
        x2={ML}
        y1={MT}
        y2={MT + H}
        stroke="currentColor"
        strokeWidth="0.8"
        className="text-border"
      />
    </svg>
  );
}

// ── Product row ───────────────────────────────────────────────────────────────

function ProductRow({
  product,
  lang,
  slug,
}: {
  product: CompanyPricingProduct;
  lang: string;
  slug: string;
}) {
  const href = `/${lang}/companies/${slug}/products/${encodeURIComponent(product.product_id)}`;

  return (
    <tr
      className="cursor-pointer transition-colors hover:bg-muted/40"
      onClick={() => {
        window.location.href = href;
      }}
    >
      <td className="w-12 px-4 py-2">
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-muted">
          {product.product_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.product_image_url}
              alt=""
              className="h-full w-full object-contain p-0.5"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg
                className="h-4 w-4 text-muted-foreground/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                />
              </svg>
            </div>
          )}
        </div>
      </td>
      <td className="max-w-[200px] px-4 py-2">
        <p className="line-clamp-2 text-xs font-medium leading-snug text-foreground">
          {product.product_title}
        </p>
      </td>
      <td className="hidden px-4 py-2 sm:table-cell">
        {product.category ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {product.category}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-2 text-right tabular-nums">
        {product.discount_price != null ? (
          <span className="flex flex-col items-end gap-0.5">
            <span className="text-xs line-through text-muted-foreground">
              {fmtPrice(product.original_price)}
            </span>
            <span className="text-sm font-semibold text-destructive">
              {fmtPrice(product.discount_price)}
            </span>
          </span>
        ) : (
          <span className="text-sm font-medium text-foreground">
            {fmtPrice(product.original_price)}
          </span>
        )}
      </td>
      <td className="hidden px-4 py-2 text-right sm:table-cell">
        {product.discount_pct != null && product.discount_pct > 0 ? (
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
            -{Math.round(product.discount_pct)}%
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </td>
      <td className="hidden whitespace-nowrap px-4 py-2 text-right text-xs text-muted-foreground tabular-nums md:table-cell">
        {product.last_seen ? timeAgo(product.last_seen) : "—"}
      </td>
      <td
        className="px-4 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        {product.product_url && (
          <a
            href={product.product_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-muted-foreground/50 hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </td>
    </tr>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PricingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-80 animate-pulse rounded-lg bg-muted" />
      <div className="h-56 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted lg:col-span-2" />
      </div>
      <div className="h-40 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function PricingTab({ slug }: PricingTabProps) {
  // FIX 4 — get lang + slug from URL params for navigation
  const routeParams = useParams<{ lang: string; slug: string }>();
  const lang = routeParams.lang ?? "en";
  const currentSlug = routeParams.slug ?? slug;

  const [state, setState] = useState<PricingState>({
    data: null,
    error: null,
    loading: true,
  });
  const [allProductTypes, setAllProductTypes] = useState<string[]>([]);
  const [filters, setFilters] = useState<PricingFilters>({
    productType: null,
    minPrice: null,
    maxPrice: null,
  });
  const [sort, setSort] = useState<SortOption>("last_seen_desc");
  const [productPage, setProductPage] = useState(1);

  function buildUrl(f: PricingFilters, s: SortOption, pp: number): string {
    const params = new URLSearchParams();
    if (f.productType) params.set("product_type", f.productType);
    if (f.minPrice && !isNaN(Number(f.minPrice))) params.set("min_price", f.minPrice);
    if (f.maxPrice && !isNaN(Number(f.maxPrice))) params.set("max_price", f.maxPrice);
    params.set("sort", s);
    params.set("product_page", String(pp));
    params.set("product_limit", "20");
    const qs = params.toString();
    return `/api/companies/${slug}/pricing${qs ? `?${qs}` : ""}`;
  }

  // Single effect — re-fetch whenever slug, filters, sort, or productPage change
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await fetchJson<CompanyPricingResponse>(
          buildUrl(filters, sort, productPage)
        );
        if (!cancelled) {
          setState({ data, error: null, loading: false });
          // Populate product type options from first load
          if (allProductTypes.length === 0) {
            const types = data.product_types
              .map((r) => r.type)
              .filter(Boolean);
            setAllProductTypes(types);
          }
        }
      } catch (err) {
        if (!cancelled)
          setState({
            data: null,
            error:
              err instanceof Error ? err.message : "Could not load pricing data.",
            loading: false,
          });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, filters, sort, productPage]);

  function setFilter(key: string, value: string | null) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setProductPage(1);
  }

  if (state.loading && !state.data) return <PricingSkeleton />;
  if (state.error) return <InlineError message={state.error} />;
  if (!state.data) return null;

  const { data } = state;

  const priceDist: PriceDistributionBucket[] = data.price_distribution ?? [];

  const validPrices = data.product_types.filter(
    (r) => r.min_price > 0 || r.max_price > 0
  );
  const globalMin =
    validPrices.length > 0
      ? Math.min(...validPrices.map((r) => r.min_price))
      : 0;
  const globalMax =
    validPrices.length > 0
      ? Math.max(...validPrices.map((r) => r.max_price))
      : 1;

  const hasFilters = Boolean(
    filters.productType || filters.minPrice || filters.maxPrice
  );

  return (
    <div className="space-y-6">
      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <FilterBar
          filters={[
            {
              key: "productType",
              label: "Product Types",
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
              inputValueLabel: filters.minPrice
                ? `≥ €${filters.minPrice}`
                : undefined,
            },
            {
              key: "maxPrice",
              label: "Max Price",
              options: [],
              inputMode: true,
              inputPlaceholder: "e.g. 500",
              inputValueLabel: filters.maxPrice
                ? `≤ €${filters.maxPrice}`
                : undefined,
            },
          ]}
          values={{
            productType: filters.productType,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
          }}
          onChange={setFilter}
          resultCount={data.total_products}
          resultLabel="products"
          right={
            <span className="text-xs text-muted-foreground">
              {formatNumber(data.total_variants)} variants ·{" "}
              {formatNumber(data.total_datapoints)} datapoints
            </span>
          }
        />
        {state.loading && (
          <span className="ml-2 text-xs text-muted-foreground animate-pulse">
            Filtering…
          </span>
        )}
      </div>

      {/* ── Discount donut + Price Distribution (left) | Product Types (right 2/3) ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <DiscountMetricsCard
            totalDiscounted={data.total_discounted}
            totalProducts={data.total_products}
            loading={state.loading}
          />

          {priceDist.length > 0 && (
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Price Distribution
                </h3>
                <span className="text-xs text-muted-foreground">
                  % of Product Prices
                </span>
              </div>
              <PriceDistributionBars
                buckets={priceDist}
                onBucketClick={(min, max) => {
                  setFilter("minPrice", String(min));
                  setFilter("maxPrice", max >= 999999 ? "" : String(max));
                  setProductPage(1);
                }}
              />
            </Card>
          )}
        </div>

        {/* Right column (2/3): Product Types table — rows are clickable */}
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold text-foreground">
              Product Types
            </h3>
            <span className="text-xs text-muted-foreground">
              {formatNumber(data.total_products)} products
            </span>
          </div>
          {data.product_types.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">
              No category data yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Name
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      # Products
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      % Discount
                    </th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Price Range
                    </th>
                    <th className="w-6 px-2 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.product_types.map((row) => (
                    <tr
                      key={row.type}
                      className="cursor-pointer transition-colors hover:bg-muted/30"
                      onClick={() => {
                        setFilter("productType", row.type);
                        setProductPage(1);
                      }}
                    >
                      <td className="max-w-[200px] truncate px-5 py-3 font-medium text-foreground">
                        {row.type}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {row.count.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {formatPercent(row.avg_discount_pct)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-14 text-right text-xs text-muted-foreground">
                            {fmtPrice(row.min_price)}
                          </span>
                          <PriceRangeBar
                            min={row.min_price}
                            max={row.max_price}
                            globalMin={globalMin}
                            globalMax={globalMax}
                          />
                          <span className="w-14 text-xs text-muted-foreground">
                            {fmtPrice(row.max_price)}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-xs text-muted-foreground/50">
                        ›
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ── Product table ──────────────────────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        {/* Header with sort + active filter label */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Products</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatNumber(data.total_products)} total
              {filters.productType
                ? ` · filtered by "${filters.productType}"`
                : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <button
                onClick={() => {
                  setFilters({
                    productType: null,
                    minPrice: null,
                    maxPrice: null,
                  });
                  setProductPage(1);
                }}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Clear filters
              </button>
            )}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortOption);
                setProductPage(1);
              }}
              className="rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="last_seen_desc">Latest first</option>
              <option value="price_asc">Price: low → high</option>
              <option value="price_desc">Price: high → low</option>
              <option value="discount_desc">Biggest discount</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="w-12 px-4 py-2.5" />
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Product
                </th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                  Category
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Price
                </th>
                <th className="hidden px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                  Discount
                </th>
                <th className="hidden px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                  Last Seen
                </th>
                <th className="w-8 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data.products ?? []).map((product) => (
                <ProductRow
                  key={product.product_id}
                  product={product}
                  lang={lang}
                  slug={currentSlug}
                />
              ))}
            </tbody>
          </table>
          {(data.products ?? []).length === 0 && !state.loading && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No products match the current filters.
            </div>
          )}
        </div>

        {/* Product-level pagination */}
        {data.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <button
              disabled={productPage <= 1}
              onClick={() => setProductPage((p) => p - 1)}
              className="rounded border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <span className="text-xs text-muted-foreground">
              Page {productPage} of {data.pagination.totalPages}
              {" · "}
              {formatNumber(data.pagination.total)} products
            </span>
            <button
              disabled={productPage >= data.pagination.totalPages}
              onClick={() => setProductPage((p) => p + 1)}
              className="rounded border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
