"use client";
import { LinkExternal01 as ExternalLink, Globe01 as Globe, Stars01 as Sparkles, TrendUp01 as TrendingUp, CurrencyDollar as DollarSign, Calendar } from '@untitledui/icons';



import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { PeriodChip } from "@/components/companies/FilterBar";
import type { CompanyDTO, CompanySnapshotDTO } from "@/types/company";

// When the DB has no stored score, estimate from snapshot coverage metrics (0–1 fraction)
function estimateQualityScore(snapshot: CompanySnapshotDTO): number | null {
  if (!snapshot.total_products || snapshot.total_products === 0) return null;
  // Price coverage: products with a price / total
  const priceCoverage = snapshot.avg_price != null ? 0.5 : 0;
  // Discount coverage bonus
  const discountBonus = snapshot.total_discounted != null && snapshot.total_products > 0
    ? Math.min(0.3, (snapshot.total_discounted / snapshot.total_products) * 0.3)
    : 0;
  // Volume bonus (more products = better coverage)
  const volumeBonus = Math.min(0.2, Math.log10(snapshot.total_products) / 20);
  return Math.min(1, priceCoverage + discountBonus + volumeBonus);
}

type CompanyInfoBarProps = {
  company: CompanyDTO;
  snapshot: CompanySnapshotDTO;
};

function getGrade(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "A-";
  if (pct >= 60) return "B+";
  if (pct >= 50) return "B";
  if (pct >= 40) return "C";
  return "D";
}

function getGradeColor(pct: number): string {
  if (pct >= 70) return "rgb(16, 185, 129)";
  if (pct >= 50) return "rgb(59, 130, 246)";
  if (pct >= 30) return "rgb(245, 158, 11)";
  return "rgb(239, 68, 68)";
}

function QualityBadge({ score, qualityLabel }: { score: number | undefined | null; qualityLabel: string }) {
  // score is stored as 0–1 fraction; convert to 0–100 for display
  const hasScore = score != null && score > 0;
  const percentage = hasScore ? (score! * 100) : 0;
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = hasScore ? getGradeColor(percentage) : "currentColor";

  return (
    <button
      type="button"
      className="flex items-center gap-3 rounded-lg border border-border-primary bg-bg-secondary px-4 py-2.5 transition-colors hover:bg-bg-tertiary"
    >
      <div className="relative h-10 w-10 flex-shrink-0">
        <svg className="h-10 w-10 -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-text-quaternary"
          />
          {hasScore && (
            <circle
              cx="24"
              cy="24"
              r={radius}
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 500ms ease-in-out" }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {hasScore ? (
            <span className="text-xs font-bold text-text-primary">{getGrade(percentage)}</span>
          ) : (
            <span className="text-xs font-bold text-text-tertiary">—</span>
          )}
        </div>
      </div>
      <div className="text-left">
        <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">{qualityLabel}</p>
        {hasScore ? (
          <p className="text-sm font-semibold text-text-primary">{percentage.toFixed(1)}%</p>
        ) : (
          <p className="text-sm font-semibold text-text-tertiary">—</p>
        )}
      </div>
    </button>
  );
}

function DataTypeIcon({ type }: { type: string }) {
  const icons = {
    pricing: <DollarSign className="h-3 w-3" />,
    products: <Sparkles className="h-3 w-3" />,
    events: <TrendingUp className="h-3 w-3" />,
    social: <Globe className="h-3 w-3" />,
  };

  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border-primary bg-bg-secondary text-text-secondary transition-colors hover:text-text-primary">
      {icons[type as keyof typeof icons] || <Sparkles className="h-3 w-3" />}
    </div>
  );
}

function DataTypesBadge() {
  const t = useTranslations("companies");

  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full border border-border-primary bg-bg-secondary px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
    >
      <div className="flex gap-1">
        <DataTypeIcon type="pricing" />
        <DataTypeIcon type="products" />
        <DataTypeIcon type="events" />
        <DataTypeIcon type="social" />
      </div>
      {t("dataTypes")}
    </button>
  );
}

export function CompanyInfoBar({ company, snapshot }: CompanyInfoBarProps) {
  const t = useTranslations("companies");
  const locale = useLocale();
  const websiteUrl = `https://${company.domain}`;
  const [period, setPeriod] = useState("4w");

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return t("notAvailable");
    return new Date(dateStr).toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="border-b border-border-primary bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/60">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Show stored score; fall back to snapshot estimate so we never show "—" when data exists */}
          <QualityBadge
            score={company.dataset_quality_score ?? estimateQualityScore(snapshot)}
            qualityLabel={t("quality")}
          />

          <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border-primary bg-bg-secondary px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span>
              {t("dataSince")} {formatDate(snapshot.data_since)}
            </span>
          </div>

          <DataTypesBadge />

          <a
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border border-border-primary bg-bg-secondary px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            <Globe className="h-3 w-3" />
            <span className="max-w-[150px] truncate">{company.domain}</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          {/* Global period selector — matches Particl top-right "Last 4w" */}
          <div className="ml-auto">
            <PeriodChip value={period} onChange={setPeriod} />
          </div>
        </div>
      </div>
    </div>
  );
}