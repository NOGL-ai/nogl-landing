"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { CompanyProfile } from "@/components/companies/CompanyProfile";
import { Card } from "@/components/ui/card";
import type { CompanyOverviewResponse } from "@/types/company";
import { formatEuro, formatNumber, formatPercent } from "./shared";

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

function formatPriceRange(
  minPrice: number | null | undefined,
  maxPrice: number | null | undefined
): string {
  if (typeof minPrice !== "number" || typeof maxPrice !== "number") {
    return "—";
  }

  return `${formatEuro(minPrice)}–${formatEuro(maxPrice)}`;
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

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label={t("totalProducts")} value={formatNumber(snapshot.total_products)} />
        <StatCard label={t("avgPrice")} value={formatEuro(snapshot.avg_price)} />
        <StatCard label={t("discountRate")} value={formatPercent(snapshot.avg_discount_pct)} />
        <StatCard
          label="Price Range"
          value={formatPriceRange(snapshot.min_price, snapshot.max_price)}
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
            {t("overview.avgPricePrefix")} {formatEuro(snapshot.avg_price)}
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
              <p className="text-sm text-muted-foreground sm:text-right">
                {item.value.toLocaleString()}
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
            <div className="rounded-2xl bg-muted/50 p-4">
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {t("overview.datasetQualityLabel")}
              </dt>
              <dd className="mt-2 text-sm font-medium text-foreground">
                {formatPercent(
                  typeof company.dataset_quality_score === "number"
                    ? company.dataset_quality_score * 100
                    : null
                )}
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
                    <span className="w-20 shrink-0 text-xs text-muted-foreground">
                      €{bucket.range.replace("-", "–")}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary/60 transition-all"
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
              <p className="mt-4 text-base font-semibold text-foreground">
                {snapshot.top_product_title}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("overview.productId")}: {snapshot.top_product_id ?? t("notAvailable")}
              </p>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
