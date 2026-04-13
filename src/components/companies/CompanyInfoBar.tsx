"use client";

import { ExternalLink, Globe, Sparkles, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { CompanyDTO, CompanySnapshotDTO } from "@/types/company";

type CompanyInfoBarProps = {
  company: CompanyDTO;
  snapshot: CompanySnapshotDTO;
};

function QualityBadge({ score, qualityLabel }: { score: number | undefined | null; qualityLabel: string }) {
  const percentage = score ?? 0;
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 85) return "rgb(16, 185, 129)";
    if (s >= 70) return "rgb(59, 130, 246)";
    if (s >= 50) return "rgb(245, 158, 11)";
    return "rgb(239, 68, 68)";
  };

  const color = getColor(percentage);
  const getGrade = (s: number) => {
    if (s >= 85) return "A+";
    if (s >= 80) return "A";
    if (s >= 75) return "A-";
    if (s >= 70) return "B+";
    if (s >= 65) return "B";
    if (s >= 60) return "B-";
    return "C";
  };

  return (
    <button
      type="button"
      className="flex items-center gap-3 rounded-lg border border-border bg-bg-secondary px-4 py-2.5 transition-colors hover:bg-bg-tertiary"
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
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-text-primary">{getGrade(percentage)}</span>
        </div>
      </div>
      <div className="text-left">
        <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">{qualityLabel}</p>
        <p className="text-sm font-semibold text-text-primary">{percentage.toFixed(1)}%</p>
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
    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-bg-secondary text-text-secondary transition-colors hover:text-text-primary">
      {icons[type as keyof typeof icons] || <Sparkles className="h-3 w-3" />}
    </div>
  );
}

function DataTypesBadge() {
  const t = useTranslations("companies");

  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
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

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return t("notAvailable");
    return new Date(dateStr).toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="border-b border-border bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/60">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <QualityBadge score={company.dataset_quality_score} qualityLabel={t("quality")} />

          <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-bg-secondary px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary">
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
            className="flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            <Globe className="h-3 w-3" />
            <span className="max-w-[150px] truncate">{company.domain}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
