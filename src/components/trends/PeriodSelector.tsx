"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Route } from 'next';

const OPTIONS = [
  { value: "4w", label: "Last 4 weeks" },
  { value: "12w", label: "Last 12 weeks" },
  { value: "52w", label: "Last 52 weeks", disabled: true },
] as const;

export type Period = "4w" | "12w" | "52w";

export function PeriodSelector({ period }: { period: Period }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function onChange(value: string) {
    const next = new URLSearchParams(params.toString());
    next.set("period", value);
    router.push(`${pathname}?${next.toString()}` as Route);
  }

  return (
    <Select value={period} onValueChange={onChange}>
      <SelectTrigger className="w-40 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} disabled={"disabled" in o && o.disabled}>
            {o.label}
            {"disabled" in o && o.disabled && (
              <span className="ml-2 text-xs text-muted-foreground">(soon)</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}