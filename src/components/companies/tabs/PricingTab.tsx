"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import type {
  CompanyPricingResponse,
  CompanyPricingTopProduct,
  CompanySnapshotDTO,
  PriceDistributionBucket,
} from "@/types/company";
import { fetchJson, formatNumber, formatPercent, InlineError } from "./shared";

type PricingTabProps = {
  slug: string;
  snapshot?: CompanySnapshotDTO | null;
  active?: boolean;
};

type PricingState = {
  data: CompanyPricingResponse | null;
  error: string | null;
  loading: boolean;
};

// Smart price formatter
function fmtPrice(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n === 0) return "€0";
  if (n >= 1) return `€${Math.round(n).toLocaleString("en-US")}`;
  return `€${n.toFixed(2)}`;
}

// Donut chart
function DonutChart({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? value / total : 0;
  const radius = 52;
  const sw = 14;
  const circ = 2 * Math.PI * radius;
  const offset = circ - pct * circ;
  const label = `${Math.round(pct * 100)}%`;
  return (
    <svg viewBox="0 0 128 128" className="h-28 w-28">
      <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth={sw} fill="none" className="text-muted" />
      {pct > 0 && (
        <circle
          cx="64" cy="64" r={radius}
          stroke="currentColor" strokeWidth={sw} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary"
          style={{ transform: "rotate(-90deg)", transformOrigin: "64px 64px" }}
        />
      )}
      <text x="64" y="57" textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="700" className="fill-foreground">{label}</text>
      <text x="64" y="78" textAnchor="middle" dominantBaseline="middle" fontSize="10" className="fill-muted-foreground">discounted</text>
    </svg>
  );
}

// Price range bar
function PriceRangeBar({
  min, max, globalMin, globalMax,
}: { min: number; max: number; globalMin: number; globalMax: number }) {
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

// Top product card
function TopProductCard({ rank, product }: { rank: number; product: CompanyPricingTopProduct }) {
  return (
    <div className="relative flex w-[200px] flex-shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="absolute left-2 top-2 z-10 flex h-6 min-w-[24px] items-center justify-center rounded bg-foreground px-1 text-xs font-bold text-background">
        #{rank}
      </div>
      <div className="flex h-36 items-center justify-center overflow-hidden bg-muted/40">
        {product.product_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.product_image_url}
            alt={product.product_title}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <div className="text-xs text-muted-foreground">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-xs font-medium leading-snug text-foreground">
          {product.product_title}
        </p>
        <p className="text-sm font-semibold text-foreground">
          {product.discount_price != null ? (
            <>
              <span className="mr-1 text-xs font-normal line-through text-muted-foreground">
                {fmtPrice(product.original_price)}
              </span>
              {fmtPrice(product.discount_price)}
            </>
          ) : (
            fmtPrice(product.original_price)
          )}
        </p>
        <div className="mt-auto flex gap-1.5">
          <button
            type="button"
            className="flex-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
          >
            Explore
          </button>
          {product.product_url && (
            <a
              href={product.product_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Skeleton
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

export function PricingTab({ slug, snapshot }: PricingTabProps) {
  const [state, setState] = useState<PricingState>({ data: null, error: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await fetchJson<CompanyPricingResponse>(`/api/companies/${slug}/pricing`);
        if (!cancelled) setState({ data, error: null, loading: false });
      } catch (err) {
        if (!cancelled)
          setState({ data: null, error: err instanceof Error ? err.message : "Could not load pricing data.", loading: false });
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [slug]);

  if (state.loading) return <PricingSkeleton />;
  if (state.error) return <InlineError message={state.error} />;
  if (!state.data) return null;

  const { data } = state;

  const priceDist: PriceDistributionBucket[] =
    snapshot?.price_distribution
      ? typeof snapshot.price_distribution === "string"
        ? (JSON.parse(snapshot.price_distribution) as PriceDistributionBucket[])
        : (snapshot.price_distribution as unknown as PriceDistributionBucket[])
      : [];

  const maxDistCount = priceDist.length > 0 ? Math.max(...priceDist.map((b) => b.count)) : 0;

  const validPrices = data.product_types.filter((r) => r.min_price > 0 || r.max_price > 0);
  const globalMin = validPrices.length > 0 ? Math.min(...validPrices.map((r) => r.min_price)) : 0;
  const globalMax = validPrices.length > 0 ? Math.max(...validPrices.map((r) => r.max_price)) : 1;

  const topProducts = data.top_products ?? [];

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
        <span>Found:</span>
        <span className="font-semibold text-foreground">{formatNumber(data.total_products)} products</span>
        <span>·</span>
        <span className="font-semibold text-foreground">{formatNumber(data.total_variants)} variants</span>
        <span>·</span>
        <span className="font-semibold text-foreground">{formatNumber(data.total_datapoints)} total datapoints</span>
      </div>

      {/* Best Selling Products */}
      {topProducts.length > 0 && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Best Selling Products</h2>
            <span className="text-xs text-muted-foreground">Sort by: Price</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {topProducts.map((product, i) => (
              <TopProductCard key={product.product_id} rank={i + 1} product={product} />
            ))}
          </div>
        </Card>
      )}

      {/* Total Discounted + Product Types (mirroring Particl: left col = donut + dist, right col = table) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Donut + Price Distribution stacked */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="mb-1 text-sm font-semibold text-foreground">Total Discounted Products</h3>
            <div className="flex flex-col items-center gap-3 py-6">
              <DonutChart value={data.total_discounted} total={data.total_products} />
              <p className="text-center text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {data.total_discounted.toLocaleString()} / {data.total_products.toLocaleString()}
                </span>
                <br />
                products discounted
              </p>
            </div>
          </Card>

          {/* Price Distribution — in left column, below donut */}
          {priceDist.length > 0 && maxDistCount > 0 && (
            <Card className="p-5">
              <h3 className="mb-1 text-sm font-semibold text-foreground">Price Distribution</h3>
              <p className="mb-4 text-xs text-muted-foreground">% of Product Prices</p>
              <div className="space-y-2">
                {priceDist.map((bucket) => (
                  <div key={bucket.range} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                      {`€${bucket.range.replace(/-/g, "–")}`}
                    </span>
                    <div className="relative h-6 flex-1 overflow-hidden rounded bg-muted/50">
                      <div
                        className="flex h-6 items-center justify-end rounded bg-primary/70 pr-1.5 transition-all dark:bg-primary/80"
                        style={{
                          width: `${(bucket.count / maxDistCount) * 100}%`,
                          minWidth: bucket.count > 0 ? "24px" : "0",
                        }}
                      >
                        {bucket.percentage >= 3 && (
                          <span className="text-[10px] font-medium text-primary-foreground">
                            {Math.round(bucket.percentage)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {bucket.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column (2/3): Product Types */}
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold text-foreground">Product Types</h3>
            <span className="text-xs text-muted-foreground">
              {formatNumber(data.total_products)} products
            </span>
          </div>
          {data.product_types.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">No category data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"># Products</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">% Discount</th>
                    <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Price Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.product_types.map((row) => (
                    <tr key={row.type} className="hover:bg-muted/20 transition-colors">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}
