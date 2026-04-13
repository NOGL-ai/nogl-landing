"use client";

import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";

type RatingsTabProps = {
  active: boolean;
};

export function RatingsTab({ active: _active }: RatingsTabProps) {
  const t = useTranslations("companies");

  return (
    <Card className="p-8">
      <h2 className="text-lg font-semibold text-foreground">{t("ratings.emptyTitle")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("ratings.emptyDescription")}</p>
    </Card>
  );
}
