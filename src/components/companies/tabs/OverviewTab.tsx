"use client";

import { LinkExternal01 as ExternalLink } from '@untitledui/icons';
import { useEffect, useState } from "react";

import { CompanyProfile } from "@/components/companies/CompanyProfile";
import { Card } from "@/components/ui/card";
import type { CompanyOverviewResponse, CompanyPricingTopProduct } from "@/types/company";

// Price helper
const fmtPrice = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return "—";
  if (n === 0) return "€0";
  if (n >= 1) return `€${Math.round(n).toLocaleString("en-US")}`;
  return `€${n.toFixed(2)}`;
};

type AssetItem = {
  id: string;
  thumbnail_url: string | null;
  channel: string;
  published_at: string | null;
};

type OverviewTabProps = {
  data: CompanyOverviewResponse;
};

function SkeletonRows({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          <div className="h-1.5 flex-1 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-10 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function OverviewTab({ data }: OverviewTabProps) {
  const { company, snapshot, socials, competitors, datasetQualityUiStatus } = data;
  const slug = company.slug;

  // Product types + top products
  const [productTypes, setProductTypes] = useState<{ type: string; count: number; avg_price: number | null }[]>([]);
  const [topProducts, setTopProducts] = useState<CompanyPricingTopProduct[]>([]);
  const [totalDiscounted, setTotalDiscounted] = useState<number | null>(null);
  const [ptLoading, setPtLoading] = useState(true);

  // Recent marketing assets
  const [recentAssets, setRecentAssets] = useState<AssetItem[]>([]);

  useEffect(() => {
    setPtLoading(true);
    fetch(`/api/companies/${slug}/pricing`)
      .then((r) => r.json())
      .then((d) => {
        if (d.product_types) setProductTypes(d.product_types);
        if (d.top_products) setTopProducts(d.top_products as CompanyPricingTopProduct[]);
        if (typeof d.total_discounted === "number") setTotalDiscounted(d.total_discounted);
      })
      .catch(() => {})
      .finally(() => setPtLoading(false));

    fetch(`/api/companies/${slug}/assets?limit=6`)
      .then((r) => r.json())
      .then((d) => {
        if (d.items) setRecentAssets(d.items as AssetItem[]);
      })
      .catch(() => {});
  }, [slug]);

  // Price distribution
  const dist: Array<{ range: string; count: number; percentage: number }> =
    snapshot.price_distribution
      ? typeof snapshot.price_distribution === "string"
        ? JSON.parse(snapshot.price_distribution)
        : (snapshot.price_distribution as unknown as Array<{ range: string; count: number; percentage: number }>)
      : [];
  const maxDistCount = dist.length > 0 ? Math.max(...dist.map((b) => b.count)) : 0;

  const topTypes = productTypes.slice(0, 10);
  const maxTypeCount = topTypes[0]?.count ?? 1;

  const discountedPct =
    totalDiscounted != null && snapshot.total_products > 0
      ? Math.round((totalDiscounted / snapshot.total_products) * 100)
      : typeof snapshot.avg_discount_pct === "number"
      ? Math.round(snapshot.avg_discount_pct)
      : null;

  return (
    <div className="space-y-6">

      {/* ── Section 1: Full-width Company Profile ── */}
      <CompanyProfile
        company={company}
        snapshot={snapshot}
        socials={socials}
        competitors={competitors}
        datasetQualityUiStatus={datasetQualityUiStatus}
      />

      {/* ── Section 2: Product Types (2/3) + Recent Marketing Assets (1/3) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Product Types */}
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold text-foreground">Product Types</h3>
            <span className="text-xs text-muted-foreground">
              {snapshot.total_products?.toLocaleString()} products
            </span>
          </div>
          <div className="p-5">
            {ptLoading ? (
              <SkeletonRows count={6} />
            ) : topTypes.length === 0 ? (
              <p className="text-xs text-muted-foreground">No category data yet.</p>
            ) : (
              <div className="space-y-2.5">
                {topTypes.map((pt) => {
                  const label =
                    !pt.type || pt.type === "product"
                      ? "General"
                      : pt.type.replace(/\b\w/g, (c) => c.toUpperCase());
                  const barPct = maxTypeCount > 0 ? (pt.count / maxTypeCount) * 100 : 0;
                  return (
                    <div key={pt.type ?? "general"} className="flex items-center gap-3">
                      <span className="w-44 shrink-0 truncate text-sm text-foreground">{label}</span>
                      <div className="flex-1 rounded-full bg-muted" style={{ height: "6px" }}>
                        <div
                          className="rounded-full bg-primary/50"
                          style={{ width: `${barPct}%`, height: "6px" }}
                        />
                      </div>
                      <span className="w-14 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {pt.count.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Recent Marketing Assets */}
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold text-foreground">Recent Marketing Assets</h3>
          </div>
          {recentAssets.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">No assets collected yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-1 p-1">
              {recentAssets.slice(0, 6).map((asset) => (
                <div key={asset.id} className="aspect-square overflow-hidden rounded bg-muted">
                  {asset.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.thumbnail_url}
                      alt={`${asset.channel} asset`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      {asset.channel}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Section 3: Best Selling Products (2/3) + Total Discounted (1/3) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Best Selling Products */}
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold text-foreground">Best Selling Products</h3>
          </div>
          {ptLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                  <div className="h-12 w-12 animate-pulse rounded bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">No product data yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {topProducts.slice(0, 5).map((product, i) => (
                <div
                  key={product.product_id}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/20"
                >
                  <span className="w-6 text-center text-base font-bold text-muted-foreground/40 tabular-nums">
                    {i + 1}
                  </span>
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-muted/40">
                    {product.product_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.product_image_url}
                        alt={product.product_title}
                        className="h-full w-full object-contain p-0.5"
                      />
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {product.product_title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.discount_price != null ? (
                        <>
                          <span className="mr-1 line-through">{fmtPrice(product.original_price)}</span>
                          <span className="font-medium text-foreground">{fmtPrice(product.discount_price)}</span>
                        </>
                      ) : (
                        fmtPrice(product.original_price)
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      className="rounded border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
                    >
                      Explore
                    </button>
                    {product.product_url && (
                      <a
                        href={product.product_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Total Discounted Products */}
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Total Discounted Products</h3>
          {ptLoading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-2">
              {/* Donut chart */}
              {(() => {
                const discTotal = totalDiscounted ?? 0;
                const total = snapshot.total_products ?? 0;
                const pct = total > 0 ? discTotal / total : 0;
                const radius = 52;
                const sw = 14;
                const circ = 2 * Math.PI * radius;
                const offset = circ - pct * circ;
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
                    <text x="64" y="57" textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="700" className="fill-foreground">
                      {discountedPct != null ? `${discountedPct}%` : "—"}
                    </text>
                    <text x="64" y="76" textAnchor="middle" dominantBaseline="middle" fontSize="10" className="fill-muted-foreground">
                      discounted
                    </text>
                  </svg>
                );
              })()}
              <p className="text-center text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {totalDiscounted != null
                    ? `${totalDiscounted.toLocaleString()} / ${snapshot.total_products.toLocaleString()}`
                    : `— / ${snapshot.total_products.toLocaleString()}`}
                </span>
                <br />
                products discounted
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* ── Section 4: Price Distribution ── */}
      {dist.length > 0 && maxDistCount > 0 && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Price Distribution</h3>
            <span className="text-xs text-muted-foreground">% of Product Prices</span>
          </div>
          <div className="space-y-2">
            {dist.map((bucket) => (
              <div key={bucket.range} className="flex items-center gap-3">
                <span className="w-20 shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                  {`€${bucket.range.replace(/-/g, "–")}`}
                </span>
                <div className="h-6 flex-1 overflow-hidden rounded bg-muted/50">
                  <div
                    className="flex h-6 items-center justify-end rounded bg-primary/60 pr-1.5 transition-all dark:bg-primary/80"
                    style={{
                      width: `${maxDistCount > 0 ? (bucket.count / maxDistCount) * 100 : 0}%`,
                      minWidth: bucket.count > 0 ? "24px" : "0",
                    }}
                  >
                    {bucket.percentage >= 4 && (
                      <span className="text-[10px] font-medium text-primary-foreground">
                        {Math.round(bucket.percentage)}%
                      </span>
                    )}
                  </div>
                </div>
                <span className="w-14 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {bucket.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
}
