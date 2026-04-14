"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { CompanyProfile } from "@/components/companies/CompanyProfile";
import { Card } from "@/components/ui/card";
import type { CompanyOverviewResponse } from "@/types/company";
import { formatNumber } from "./shared";

// Price helper — en-US locale, no decimals above €1, two decimals below
const fmtPrice = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return "—";
  if (n === 0) return "€0";
  if (n >= 1) return `€${Math.round(n).toLocaleString("en-US")}`;
  return `€${n.toFixed(2)}`;
};

type ProductTypeRow = { type: string; count: number; avg_price: number | null };

type OverviewTabProps = {
  data: CompanyOverviewResponse;
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </Card>
  );
}

function formatMonthYear(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-3.5 flex-1 animate-pulse rounded bg-muted" />
          <div className="h-1.5 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-3.5 w-10 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function OverviewTab({ data }: OverviewTabProps) {
  const t = useTranslations("companies");
  const { company, snapshot, socials, competitors, datasetQualityUiStatus } = data;
  const slug = company.slug;

  // Product types — fetched client-side from pricing API
  const [productTypes, setProductTypes] = useState<ProductTypeRow[]>([]);
  const [ptLoading, setPtLoading] = useState(true);

  useEffect(() => {
    setPtLoading(true);
    fetch(`/api/companies/${slug}/pricing`)
      .then((r) => r.json())
      .then((d) => {
        if (d.product_types) setProductTypes(d.product_types as ProductTypeRow[]);
      })
      .catch(() => {})
      .finally(() => setPtLoading(false));
  }, [slug]);

  // Price distribution
  const dist: Array<{ range: string; count: number; percentage: number }> =
    snapshot.price_distribution
      ? typeof snapshot.price_distribution === "string"
        ? JSON.parse(snapshot.price_distribution)
        : (snapshot.price_distribution as unknown as Array<{
            range: string;
            count: number;
            percentage: number;
          }>)
      : [];
  const maxDistCount = dist.length > 0 ? Math.max(...dist.map((b) => b.count)) : 0;

  const topTypes = productTypes.slice(0, 10);
  const maxTypeCount = topTypes[0]?.count ?? 1;

  return (
    <div className="space-y-6">
      {/* ── Section 1: KPI Strip ────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label={t("totalProducts")}
          value={formatNumber(snapshot.total_products)}
        />
        <StatCard
          label={t("avgPrice")}
          value={fmtPrice(snapshot.avg_price)}
        />
        <StatCard
          label={t("discountRate")}
          value={
            typeof snapshot.avg_discount_pct === "number"
              ? `${snapshot.avg_discount_pct.toFixed(1)}%`
              : "—"
          }
        />
      </div>

      {/* ── Section 2: Two-column body ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* LEFT — Company Profile + Data Freshness (1/3) */}
        <div className="space-y-4 lg:col-span-1">
          <CompanyProfile
            company={company}
            snapshot={snapshot}
            socials={socials}
            competitors={competitors}
            datasetQualityUiStatus={datasetQualityUiStatus}
          />

          {/* Data Freshness card */}
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              {t("overview.dataFreshnessTitle")}
            </h3>
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground">Products tracked</dt>
                <dd className="text-xs font-medium text-foreground">
                  {formatNumber(snapshot.total_datapoints)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground">{t("overview.lastScraped")}</dt>
                <dd className="text-xs font-medium text-foreground">
                  {formatRelative(snapshot.last_scraped_at ?? null)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground">{t("dataSince")}</dt>
                <dd className="text-xs font-medium text-foreground">
                  {formatMonthYear(snapshot.data_since ?? null)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground">
                  {t("overview.datasetQualityLabel")}
                </dt>
                <dd className="text-xs font-medium text-foreground">
                  {typeof company.dataset_quality_score === "number" &&
                  company.dataset_quality_score > 0
                    ? `${(company.dataset_quality_score * 100).toFixed(1)}%`
                    : "—"}
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* RIGHT — Product Types + Price Dist + Top Products (2/3) */}
        <div className="space-y-6 lg:col-span-2">

          {/* Block A — Product Types */}
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Product Types</h3>
              <span className="text-xs text-muted-foreground">
                {snapshot.total_products?.toLocaleString()} products
              </span>
            </div>
            {ptLoading ? (
              <SkeletonRows count={5} />
            ) : topTypes.length === 0 ? (
              <p className="text-xs text-muted-foreground">No category data yet.</p>
            ) : (
              <div className="space-y-2">
                {topTypes.map((pt) => {
                  const label =
                    !pt.type || pt.type === "product"
                      ? "General"
                      : pt.type.replace(/\b\w/g, (c) => c.toUpperCase());
                  const barPct = maxTypeCount > 0 ? (pt.count / maxTypeCount) * 100 : 0;
                  return (
                    <div key={pt.type ?? "general"} className="flex items-center gap-3">
                      <span className="flex-1 truncate text-sm text-foreground">{label}</span>
                      <div className="max-w-[120px] flex-1 rounded-full bg-muted" style={{ height: "6px" }}>
                        <div
                          className="rounded-full bg-primary/50"
                          style={{ width: `${barPct}%`, height: "6px" }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">
                        {pt.count.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Block B — Price Distribution */}
          {dist.length > 0 && maxDistCount > 0 && (
            <Card className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Price Distribution</h3>
              <div className="space-y-2">
                {dist.map((bucket) => (
                  <div key={bucket.range} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                      {`€${bucket.range.replace(/-/g, "–")}`}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary/60 transition-all dark:bg-primary/80"
                        style={{
                          width: `${maxDistCount > 0 ? (bucket.count / maxDistCount) * 100 : 0}%`,
                          minWidth: bucket.count > 0 ? "4px" : "0",
                        }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {bucket.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Block C — Top Products */}
          {snapshot.top_product_title && (
            <Card className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Top Products</h3>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                {snapshot.top_product_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={snapshot.top_product_image_url}
                    alt={snapshot.top_product_title}
                    className="h-12 w-12 flex-shrink-0 rounded bg-white object-contain"
                  />
                ) : (
                  <div className="h-12 w-12 flex-shrink-0 rounded bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-foreground">
                    {snapshot.top_product_title}
                  </p>
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
