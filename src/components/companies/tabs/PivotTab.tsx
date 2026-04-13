"use client";

import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";

type PivotTabProps = {
  active: boolean;
};

export function PivotTab({ active: _active }: PivotTabProps) {
  const t = useTranslations("companies");

  return (
    <Card className="p-8">
      <h2 className="text-lg font-semibold text-foreground">{t("pivot.emptyTitle")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("pivot.emptyDescription")}</p>
    </Card>
  );
}
