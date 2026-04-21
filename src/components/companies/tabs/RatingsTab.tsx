"use client";

import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";

type RatingsTabProps = {
  active: boolean;
};

export function RatingsTab({ active: _active }: RatingsTabProps) {
  const t = useTranslations("companies");

  return (
    <div className="rounded-xl border border-border-primary bg-bg-primary p-8 shadow-xs">
      <h2 className="text-lg font-semibold text-text-primary">{t("ratings.emptyTitle")}</h2>
      <p className="mt-2 text-sm text-text-tertiary">{t("ratings.emptyDescription")}</p>
    </div>
  );
}
