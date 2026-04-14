"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { CompanyProfile } from "@/components/companies/CompanyProfile";
import { Card } from "@/components/ui/card";
import type { CompanyOverviewResponse } from "@/types/company";
import { formatNumber } from "./shared";

// Fix 3 — rounded price with thousand separator, no decimals
const fmtPrice = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return "—";
  if (n === 0) return "€0";
  return `€${Math.round(n).toLocaleString("de-DE")}`;
};

// Fix 4 — suppress zero counts with em-dash
const fmtCount = (n: number | null | undefined): string =>
  !n || n === 0 ? "—" : n.toLocaleString("de-DE");

type OverviewTabProps = {
  data: CompanyOverviewResponse;
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
    </Card>
  );
}

function formatRelative(dateStr: string | null): string {
  if (!dateStr) {
    return "—";
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / dayMs);

  if (days <= 0) {
    return "Today";
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 30) {
    return `${days} days ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function formatMonthYear(dateStr: string | null): string {
  if (!dateStr) {
    return "—";
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

export function OverviewTab({ data }: OverviewTabProps) {
  const t = useTranslations("companies");
  const { company, snapshot, socials, competitors, datasetQualityUiStatus } = data;
  const dist: Array<{ range: string; count: number; percentage: number }> =
    snapshot.price_distribution
      ? (typeof snapshot.price_distribution === "string"
          ? JSON.parse(snapshot.price_distribution)
          : (snapshot.price_distribution as unknown as Array<{
              range: string;
              count: number;
              percentage: number;
            }>))
      : [];
  const maxCount = dist.length > 0 ? Math.max(...dist.map((bucket) => bucket.count)) : 0;

  // Fix 4 — use fmtCount for variants and discounted in Volume Mix
  const barData = [
    { label: t("overview.barProduct"), value: snapshot.total_products, tone: "bg-chart-1" },
    { label: t("overview.barVariant"), value: snapshot.total_variants, tone: "bg-chart-2" },
    { label: t("overview.barDiscounted"), value: snapshot.total_discounted, tone: "bg-chart-3" },
  ];
  const maxValue = Math.max(...barData.map((item) => item.value), 1);

  return (
    <div className="space-y-6">
      <CompanyProfile
        company={company}
        snapshot={snapshot}
        socials={socials}
        competitors={competitors}
        datasetQualityUiStatus={datasetQualityUiStatus}
      />

      {/* Fix 3 — header stat cards use fmtPrice for price values */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label={t("totalProducts")} value={formatNumber(snapshot.total_products)} />
        <StatCard label={t("avgPrice")} value={fmtPrice(snapshot.avg_price)} />
        <StatCard
          label={t("discountRate")}
          value={
            typeof snapshot.avg_discount_pct === "number"
              ? `${snapshot.avg_discount_pct.toFixed(1)}%`
              : "—"
          }
        />
        <StatCard
          label="Price Range"
          value={`${fmtPrice(snapshot.min_price)}–${fmtPrice(snapshot.max_price)}`}
        />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("overview.volumeMixTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("overview.volumeMixDescription")}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {t("overview.avgPricePrefix")} {fmtPrice(snapshot.avg_price)}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {barData.map((item) => (
            <div
              key={item.label}
              className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)_80px] sm:items-center"
            >
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${item.tone}`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              {/* Fix 4 — fmtCount for variants and discounted only */}
              <p className="text-sm text-muted-foreground sm:text-right">
                {item.label === t("overview.barProduct")
                  ? item.value.toLocaleString()
                  : fmtCount(item.value)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">
            {t("overview.dataFreshnessTitle")}
          </h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-muted/50 p-4">
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Products Tracked
              </dt>
              <dd className="mt-2 text-sm font-medium text-foreground">
                {formatNumber(snapshot.total_datapoints)}
              </dd>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {t("overview.lastScraped")}
              </dt>
              <dd className="mt-2 text-sm font-medium text-foreground">
                {formatRelative(snapshot.last_scraped_at ?? null)}
              </dd>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {t("dataSince")}
              </dt>
              <dd className="mt-2 text-sm font-medium text-foreground">
                {formatMonthYear(snapshot.data_since ?? null)}
              </dd>
            </div>
            {/* Fix 2 — quality: 0 or null → '—', never split value from unit */}
            <div className="rounded-2xl bg-muted/50 p-4">
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {t("overview.datasetQualityLabel")}
              </dt>
              <dd className="mt-2 text-sm font-medium text-foreground">
                {typeof company.dataset_quality_score === "number" &&
                company.dataset_quality_score > 0
                  ? `${(company.dataset_quality_score * 100).toFixed(1)}%`
                  : "—"}
              </dd>
            </div>
          </dl>

          {dist.length > 0 && maxCount > 0 ? (
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Price Distribution
              </p>
              <div className="space-y-2">
                {dist.map((bucket) => (
                  <div key={bucket.range} className="flex items-center gap-3">
                    {/* Fix 1 — single element, template literal, whitespace-nowrap */}
                    <span className="w-20 shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                      {`€${bucket.range.replace(/-/g, "–")}`}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      {/* Fix 8 — dark mode contrast for histogram bar */}
                      <div
                        className="h-2 rounded-full bg-primary/60 transition-all dark:bg-primary/80"
                        style={{
                          width: `${maxCount > 0 ? (bucket.count / maxCount) * 100 : 0}%`,
                          minWidth: bucket.count > 0 ? "4px" : "0",
                        }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
                      {bucket.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Card>

        {/* Fix 5 — Top Product: remove Product ID row (bridge hash not user-facing) */}
        {snapshot.top_product_title ? (
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                {t("overview.topProductTitle")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("overview.topProductHelp")}
              </p>
            </div>
            <div className="p-6">
              {snapshot.top_product_image_url ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={snapshot.top_product_image_url}
                    alt={snapshot.top_product_title}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                </div>
              ) : null}
              <p className="mt-4 line-clamp-2 text-base font-semibold text-foreground">
                {snapshot.top_product_title}
              </p>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
