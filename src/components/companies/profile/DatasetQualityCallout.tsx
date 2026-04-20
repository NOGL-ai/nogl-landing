import { CheckCircle as CheckCircle2 } from '@untitledui/icons';

import { useTranslations } from "next-intl";

type DatasetQualityCalloutProps = {
  variant: "ok" | "warning";
};

export function DatasetQualityCallout({ variant }: DatasetQualityCalloutProps) {
  const t = useTranslations("companies");

  if (variant === "ok") {
    return (
      <div className="flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-3 py-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
        <span>{t("datasetQualityOk")}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-3 py-1 text-xs font-medium text-orange-600">
      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span title={t("delayedInventoryTooltip")}>{t("delayedInventoryReporting")}</span>
    </div>
  );
}
