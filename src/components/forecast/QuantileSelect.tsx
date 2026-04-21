"use client";

import type { ForecastQuantileValue } from "@/types/forecast";

interface QuantileSelectProps {
  value: ForecastQuantileValue;
  onChange: (v: ForecastQuantileValue) => void;
  disabled?: boolean;
}

const OPTIONS: { value: ForecastQuantileValue; label: string }[] = [
  { value: 3, label: "Pessimistic" },
  { value: 4, label: "Median" },
  { value: 5, label: "Optimistic" },
];

export function QuantileSelect({ value, onChange, disabled }: QuantileSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value) as ForecastQuantileValue)}
      disabled={disabled}
      className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
