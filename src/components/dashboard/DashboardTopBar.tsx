"use client";
import { Bell01 as Bell, Columns02 as Columns2, Lock01 as Lock } from '@untitledui/icons';
// @ts-nocheck


import { useTranslations } from "next-intl";
import { Suspense } from "react";

import { DateRangeSelect } from "@/components/dashboard/DateRangeSelect";
import { ProductSearchField } from "@/components/dashboard/ProductSearchField";
import { Button } from '@/components/base/buttons/button';

function DateRangeFallback() {
  const t = useTranslations("companies");
  return (
    <Button type="button" color="secondary" size="sm" className="gap-2 rounded-full" disabled>
      {t("chrome.rangeLast4w")}
    </Button>
  );
}

export function DashboardTopBar() {
  const t = useTranslations("companies");

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1 sm:flex sm:justify-center">
          <ProductSearchField className="w-full sm:max-w-xl" />
        </div>
        <div className="flex flex-shrink-0 items-center justify-end gap-2">
          <Button
            type="button"
            color="tertiary"
            size="icon"
            className="rounded-full"
            aria-label={t("chrome.notificationsAria")}
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button type="button" color="secondary" size="sm" className="gap-2 rounded-full text-foreground">
            <Columns2 className="h-4 w-4" aria-hidden />
            {t("chrome.compare")}
          </Button>
          <Button
            type="button"
            color="secondary"
            size="icon"
            className="rounded-lg"
            aria-label={t("chrome.accountAria")}
          >
            <Lock className="h-4 w-4" />
          </Button>
          <Suspense fallback={<DateRangeFallback />}>
            <DateRangeSelect />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

