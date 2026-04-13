import Image from "next/image";

import { Card } from "@/components/ui/card";
import type { CompanyOverviewResponse } from "@/types/company";
import {
  formatDateTime,
  formatEuro,
  formatNumber,
  formatPercent,
} from "./shared";

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

export function OverviewTab({ data }: OverviewTabProps) {
  const { company, snapshot } = data;
  const barData = [
    { label: "Products", value: snapshot.total_products, tone: "bg-chart-1" },
    { label: "Variants", value: snapshot.total_variants, tone: "bg-chart-2" },
    { label: "Discounted", value: snapshot.total_discounted, tone: "bg-chart-3" },
  ];
  const maxValue = Math.max(...barData.map((item) => item.value), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Products" value={formatNumber(snapshot.total_products)} />
        <StatCard label="Total Variants" value={formatNumber(snapshot.total_variants)} />
        <StatCard label="Discounted Items" value={formatNumber(snapshot.total_discounted)} />
        <StatCard label="Total Datapoints" value={formatNumber(snapshot.total_datapoints)} />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Volume Mix</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Products, variants, and discounted items scaled against the same peak.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Avg price {formatEuro(snapshot.avg_price)}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {barData.map((item) => (
            <div key={item.label} className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)_80px] sm:items-center">
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
          <h2 className="text-lg font-semibold text-foreground">Data Freshness</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-muted/50 p-4">
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Last scraped
              </dt>
              <dd className="mt-2 text-sm font-medium text-foreground">
                {formatDateTime(snapshot.last_scraped_at)}
              </dd>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Data since
              </dt>
              <dd className="mt-2 text-sm font-medium text-foreground">
                {formatDateTime(snapshot.data_since)}
              </dd>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Dataset Quality
              </dt>
              <dd className="mt-2 text-sm font-medium text-foreground">
                {formatPercent(
                  typeof company.dataset_quality_score === "number"
                    ? company.dataset_quality_score * 100
                    : null
                )}
              </dd>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Discount Rate
              </dt>
              <dd className="mt-2 text-sm font-medium text-foreground">
                {formatPercent(snapshot.avg_discount_pct)}
              </dd>
            </div>
          </dl>
        </Card>

        {snapshot.top_product_title ? (
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Top Product</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Highlighted from the most recent scrape.
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
                Product ID: {snapshot.top_product_id ?? "N/A"}
              </p>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
