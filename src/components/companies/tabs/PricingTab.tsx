"use client";
import {
  LinkExternal01 as ExternalLink,
  SwitchVertical01 as ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from '@untitledui/icons';



import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";

import { FilterBar } from "@/components/companies/FilterBar";
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
    <div className="relative h-1.5 w-20 flex-shrink-0 rounded-full bg-bg-tertiary">
      <div
        className="absolute h-1.5 rounded-full bg-brand-600"
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
    return <p className="text-xs text-text-tertiary">No distribution data.</p>;

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
              stroke="var(--color-border-primary)"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
            <text
              x={ML - 4}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="9"
              fill="var(--color-text-tertiary)"
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
              fill="var(--color-brand-600)"
              opacity="0.75"
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
              fill="var(--color-text-tertiary)"
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
        stroke="var(--color-border-primary)"
        strokeWidth="0.8"
      />
    </svg>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PricingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-1/3 animate-pulse rounded bg-bg-tertiary" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl bg-bg-tertiary" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6">
          <div className="h-32 animate-pulse rounded-xl bg-bg-tertiary" />
          <div className="h-64 animate-pulse rounded-xl bg-bg-tertiary" />
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-bg-tertiary lg:col-span-2" />
      </div>
      <div className="h-96 animate-pulse rounded-xl bg-bg-tertiary" />
    </div>
  );
}

// ── TanStack column definitions for products ──────────────────────────────────

const productColumnHelper = createColumnHelper<CompanyPricingProduct>();

// ── Main ──────────────────────────────────────────────────────────────────────

export function PricingTab({ slug }: PricingTabProps) {
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
  const [listSorting, setListSorting] = useState<SortingState>([]);

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

  const productColumns = useMemo(
    () => [
      productColumnHelper.display({
        id: "image",
        header: "",
        enableSorting: false,
        cell: (info) => {
          const product = info.row.original;
          return (
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-bg-tertiary">
              {product.product_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.product_image_url}
                  alt={product.product_title}
                  className="h-full w-full object-contain p-0.5"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg className="h-4 w-4 text-text-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                  </svg>
                </div>
              )}
            </div>
          );
        },
      }),
      productColumnHelper.accessor("product_title", {
        header: "Product",
        enableSorting: true,
        cell: (info) => {
          const product = info.row.original;
          const href = `/${lang}/companies/${currentSlug}/products/${encodeURIComponent(product.product_id)}`;
          return (
            <a href={href} className="line-clamp-2 max-w-[200px] text-xs font-medium leading-snug text-text-primary hover:underline">
              {info.getValue()}
            </a>
          );
        },
      }),
      productColumnHelper.accessor("category", {
        header: "Category",
        enableSorting: true,
        cell: (info) => info.getValue() ? (
          <span className="rounded bg-bg-secondary px-1.5 py-0.5 text-[10px] text-text-tertiary">
            {info.getValue()}
          </span>
        ) : <span className="text-text-disabled">—</span>,
      }),
      productColumnHelper.accessor("original_price", {
        header: "Price",
        enableSorting: true,
        meta: { align: "right" as const },
        cell: (info) => {
          const product = info.row.original;
          if (product.discount_price != null) {
            return (
              <span className="flex flex-col items-end gap-0.5">
                <span className="text-xs line-through text-text-tertiary">{fmtPrice(info.getValue())}</span>
                <span className="text-sm font-semibold text-text-success">{fmtPrice(product.discount_price)}</span>
              </span>
            );
          }
          return <span className="tabular-nums text-xs font-medium text-text-primary">{fmtPrice(info.getValue())}</span>;
        },
      }),
      productColumnHelper.accessor("discount_pct", {
        header: "Disc.",
        enableSorting: true,
        meta: { align: "right" as const },
        cell: (info) => {
          const pct = info.getValue();
          return pct != null && pct > 0 ? (
            <span className="rounded bg-bg-success px-1.5 py-0.5 text-[10px] font-semibold text-text-success">
              -{Math.round(pct)}%
            </span>
          ) : <span className="text-text-disabled">—</span>;
        },
      }),
      productColumnHelper.accessor("last_seen", {
        header: "Last seen",
        enableSorting: true,
        cell: (info) => {
          const v = info.getValue();
          return v ? (
            <span className="text-xs tabular-nums text-text-tertiary">{timeAgo(v)}</span>
          ) : <span className="text-text-disabled">—</span>;
        },
      }),
      productColumnHelper.accessor("product_url", {
        id: "link",
        header: "",
        enableSorting: false,
        cell: (info) => {
          const url = info.getValue();
          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded border border-border-primary px-2 py-1 text-xs text-text-tertiary transition-colors hover:bg-bg-secondary"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : null;
        },
      }),
    ],
    [lang, currentSlug]
  );

  const listTable = useReactTable({
    data: state.data?.products ?? [],
    columns: productColumns,
    state: { sorting: listSorting },
    onSortingChange: setListSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border-primary bg-bg-secondary px-4 py-3">
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
            <span className="text-xs text-text-tertiary">
              {formatNumber(data.total_variants)} variants ·{" "}
              {formatNumber(data.total_datapoints)} datapoints
            </span>
          }
        />
        {state.loading && (
          <span className="ml-2 animate-pulse text-xs text-text-tertiary">
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
            <div className="rounded-xl border border-border-primary bg-bg-primary p-5 shadow-xs">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">
                  Price Distribution
                </h3>
                <span className="text-xs text-text-tertiary">
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
            </div>
          )}
        </div>

        {/* Right column (2/3): Product Types table */}
        <div className="overflow-hidden rounded-xl border border-border-primary bg-bg-primary shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border-primary px-5 py-3">
            <h3 className="text-sm font-semibold text-text-primary">
              Product Types
            </h3>
            <span className="text-xs text-text-tertiary">
              {formatNumber(data.total_products)} products
            </span>
          </div>
          {data.product_types.length === 0 ? (
            <p className="px-5 py-8 text-sm text-text-tertiary">
              No category data yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-border-primary bg-bg-primary">
                  <tr>
                    <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      Name
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      # Products
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      % Discount
                    </th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      Price Range
                    </th>
                    <th className="w-6 px-2 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary">
                  {data.product_types.map((row) => {
                    const isActive = filters.productType === row.type;
                    return (
                      <tr
                        key={row.type}
                        className={`cursor-pointer transition-colors hover:bg-bg-secondary ${isActive ? "bg-brand-50" : ""}`}
                        onClick={() => {
                          setFilter("productType", row.type);
                          setProductPage(1);
                        }}
                      >
                        <td className={`max-w-[200px] truncate px-5 py-3 font-medium ${isActive ? "text-text-brand underline" : "text-text-primary"}`}>
                          {row.type}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-text-tertiary">
                          {row.count.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-text-success">
                          {formatPercent(row.avg_discount_pct)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-14 text-right text-xs text-text-tertiary">
                              {fmtPrice(row.min_price)}
                            </span>
                            <PriceRangeBar
                              min={row.min_price}
                              max={row.max_price}
                              globalMin={globalMin}
                              globalMax={globalMax}
                            />
                            <span className="w-14 text-xs text-text-tertiary">
                              {fmtPrice(row.max_price)}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-xs text-text-tertiary">
                          ›
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Top Pricing (TanStack table) ──────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border-primary bg-bg-primary shadow-xs">
        {/* Header with sort + active filter label */}
        <div className="flex items-center justify-between border-b border-border-primary px-5 py-3">
          <div>
            <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-text-primary">
              Top Pricing
            </h2>
            <p className="mt-0.5 text-xs text-text-tertiary">
              <span className="font-medium text-text-primary">{formatNumber(data.total_products)}</span> products
              {filters.productType ? ` · filtered by "${filters.productType}"` : ""}
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
                className="text-xs text-text-tertiary underline hover:text-text-primary"
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
              className="rounded border border-border-primary bg-bg-primary px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-border-brand"
            >
              <option value="last_seen_desc">Recently added</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="discount_desc">Discount ↓</option>
            </select>
          </div>
        </div>

        {/* TanStack sortable table */}
        <div className="overflow-x-auto" style={{ maxHeight: 480 }}>
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 border-b border-border-primary bg-bg-primary">
              {listTable.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const align = (header.column.columnDef.meta as { align?: string } | undefined)?.align ?? "left";
                    const canSort = header.column.getCanSort();
                    return (
                      <th
                        key={header.id}
                        className={`whitespace-nowrap px-3 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary ${
                          align === "right" ? "text-right" : "text-left"
                        } ${canSort ? "cursor-pointer select-none hover:text-text-primary" : ""}`}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          header.column.getIsSorted() === "asc" ? <ArrowUp className="ml-1 inline h-3 w-3" /> :
                          header.column.getIsSorted() === "desc" ? <ArrowDown className="ml-1 inline h-3 w-3" /> :
                          <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-30" />
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border-primary">
              {listTable.getRowModel().rows.map((row) => (
                <tr key={row.id} className="cursor-pointer transition-colors hover:bg-bg-secondary">
                  {row.getVisibleCells().map((cell) => {
                    const align = (cell.column.columnDef.meta as { align?: string } | undefined)?.align ?? "left";
                    return (
                      <td
                        key={cell.id}
                        className={`px-3 py-2.5 ${align === "right" ? "text-right" : "text-left"}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {(data.products ?? []).length === 0 && !state.loading && (
            <div className="py-12 text-center text-sm text-text-tertiary">
              No products match the current filters.
            </div>
          )}
        </div>

        {/* Product-level pagination */}
        {data.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border-primary px-5 py-3">
            <button
              disabled={productPage <= 1}
              onClick={() => setProductPage((p) => p - 1)}
              className="rounded border border-border-primary px-3 py-1.5 text-xs font-medium transition-colors hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-xs text-text-tertiary">
              Page {productPage} of {data.pagination.totalPages}
              {" · "}
              {formatNumber(data.pagination.total)} products
            </span>
            <button
              disabled={productPage >= data.pagination.totalPages}
              onClick={() => setProductPage((p) => p + 1)}
              className="rounded border border-border-primary px-3 py-1.5 text-xs font-medium transition-colors hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
