"use client";

import { Clock } from '@untitledui/icons';

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useCallback, useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Route } from 'next';

export const DATE_RANGE_PARAM = "range";

const RANGE_VALUES = ["4w", "90d", "12m"] as const;
export type DateRangeValue = (typeof RANGE_VALUES)[number];

function isDateRangeValue(value: string | null): value is DateRangeValue {
  return RANGE_VALUES.includes(value as DateRangeValue);
}

type DateRangeSelectProps = {
  className?: string;
};

export function DateRangeSelect({ className }: DateRangeSelectProps) {
  const t = useTranslations("companies");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value: DateRangeValue = useMemo(() => {
    const raw = searchParams.get(DATE_RANGE_PARAM);
    return isDateRangeValue(raw) ? raw : "4w";
  }, [searchParams]);

  const setValue = useCallback(
    (next: string) => {
      const nextRange = isDateRangeValue(next) ? next : "4w";
      const params = new URLSearchParams(searchParams.toString());
      params.set(DATE_RANGE_PARAM, nextRange);
      router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger
        className={`h-10 w-fit min-w-[9rem] gap-2 rounded-full border-border ${className ?? ""}`}
        aria-label={t("chrome.rangeLast4w")}
      >
        <Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="4w">{t("chrome.rangeLast4w")}</SelectItem>
        <SelectItem value="90d">{t("chrome.rangeLast90d")}</SelectItem>
        <SelectItem value="12m">{t("chrome.rangeLast12m")}</SelectItem>
      </SelectContent>
    </Select>
  );
}