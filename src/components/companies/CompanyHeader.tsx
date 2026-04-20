"use client";

import { LinkExternal01 as ExternalLink } from '@untitledui/icons';


import { useTranslations } from "next-intl";

import { CountryPill } from "@/components/companies/CountryPill";
import { Badge } from "@/components/ui/badge";
import type { CompanyDTO, CompanySnapshotDTO } from "@/types/company";

type CompanyHeaderProps = {
  company: CompanyDTO;
  snapshot: CompanySnapshotDTO;
};

function formatPrice(value: number | null | undefined, na: string): string {
  return typeof value === "number" ? `€${value.toFixed(2)}` : na;
}

function formatDiscount(value: number | null | undefined, na: string, hasProducts = false): string {
  if (typeof value === "number") return `${value.toFixed(1)}%`;
  // If we have products but no discount data, the discount rate is effectively 0%
  return hasProducts ? "0%" : na;
}

function TrackingStatusBadge({
  status,
  labels,
}: {
  status: CompanyDTO["tracking_status"];
  labels: { tracked: string; paused: string; untracked: string };
}) {
  const config =
    status === "TRACKED"
      ? { label: labels.tracked, dot: "bg-white/90", variant: "success" as const }
      : status === "PAUSED"
        ? { label: labels.paused, dot: "bg-white/90", variant: "warning" as const }
        : { label: labels.untracked, dot: "bg-text-disabled", variant: "secondary" as const };

  return (
    <Badge variant={config.variant} size="sm" className="gap-1.5 rounded-full">
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {config.label}
    </Badge>
  );
}

function KpiChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-primary bg-bg-primary px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-tertiary">
        {label}
      </p>
      <p className="mt-1.5 text-base font-semibold text-text-primary sm:mt-2 sm:text-lg">{value}</p>
    </div>
  );
}

export function CompanyHeader({ company, snapshot }: CompanyHeaderProps) {
  const t = useTranslations("companies");
  const websiteUrl = `https://${company.domain}`;
  const na = t("notAvailable");

  return (
    <div className="border-b border-border-primary bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/60">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://img.logo.dev/${company.domain}?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ`}
                alt=""
                className="h-9 w-9 shrink-0 rounded-lg border border-border-primary bg-bg-primary object-contain p-0.5"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">{company.name}</h1>
              <CountryPill country_code={company.country_code} />
              <TrackingStatusBadge
                status={company.tracking_status}
                labels={{
                  tracked: t("trackingTracked"),
                  paused: t("trackingPaused"),
                  untracked: t("trackingUntracked"),
                }}
              />
            </div>

            <a
              href={websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 text-sm text-text-tertiary transition-colors hover:text-text-primary"
            >
              <span>{company.domain}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:shrink-0">
            <KpiChip label={t("totalProducts")} value={snapshot.total_products.toLocaleString()} />
            <KpiChip label={t("avgPrice")} value={formatPrice(snapshot.avg_price, na)} />
            <KpiChip label={t("discountRate")} value={formatDiscount(snapshot.avg_discount_pct, na, snapshot.total_products > 0)} />
          </div>
        </div>
      </div>
    </div>
  );
}