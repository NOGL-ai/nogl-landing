"use client";

import { ExternalLink } from "lucide-react";

import { CountryPill } from "@/components/companies/CountryPill";
import { Badge } from "@/components/ui/badge";
import type { CompanyDTO, CompanySnapshotDTO } from "@/types/company";

type CompanyHeaderProps = {
  company: CompanyDTO;
  snapshot: CompanySnapshotDTO;
};

function formatPrice(value?: number | null): string {
  return typeof value === "number" ? `€${value.toFixed(2)}` : "N/A";
}

function formatDiscount(value?: number | null): string {
  return typeof value === "number" ? `${value.toFixed(1)}%` : "N/A";
}

function TrackingStatusBadge({ status }: { status: CompanyDTO["tracking_status"] }) {
  const config =
    status === "TRACKED"
      ? { label: "Tracked", dot: "bg-emerald-500", variant: "success" as const }
      : status === "PAUSED"
        ? { label: "Paused", dot: "bg-amber-500", variant: "warning" as const }
        : { label: "Untracked", dot: "bg-zinc-400", variant: "secondary" as const };

  return (
    <Badge variant={config.variant} size="sm" className="gap-1.5 rounded-full">
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {config.label}
    </Badge>
  );
}

function KpiChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[144px] rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function CompanyHeader({ company, snapshot }: CompanyHeaderProps) {
  const websiteUrl = `https://${company.domain}`;

  return (
    <div className="sticky top-16 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {company.name}
              </h1>
              <CountryPill country_code={company.country_code} />
              <TrackingStatusBadge status={company.tracking_status} />
            </div>

            <a
              href={websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>{company.domain}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            <KpiChip
              label="Total Products"
              value={snapshot.total_products.toLocaleString()}
            />
            <KpiChip label="Avg Price" value={formatPrice(snapshot.avg_price)} />
            <KpiChip
              label="Discount Rate"
              value={formatDiscount(snapshot.avg_discount_pct)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
