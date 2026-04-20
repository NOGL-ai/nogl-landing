"use client";
import { TrendUp01 as TrendingUpIcon, TrendDown01 as TrendingDownIcon, Minus as MinusIcon } from '@untitledui/icons';


import { TrendUp01 as TrendingUpIcon, TrendDown01 as TrendingDownIcon, Minus as MinusIcon } from '@untitledui/icons';


import type { StatConfig } from "@/lib/dashboards/widgetSchemas";
import { z } from "zod";


type Config = z.infer<typeof StatConfig>;

interface Props {
  value: number | string;
  delta?: number;
  config: Config;
}

function formatValue(value: number | string, format: Config["format"]): string {
  const n = Number(value);
  if (isNaN(n)) return String(value);
  switch (format) {
    case "currency":
      if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}m`;
      if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
      return `$${n.toFixed(2)}`;
    case "percent":
      return `${n.toFixed(1)}%`;
    default:
      if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
      if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
      return n.toFixed(0);
  }
}

export function StatWidget({ value, delta, config }: Props) {
  const formatted = formatValue(value, config.format);
  const hasDelta = delta !== undefined && delta !== null && config.comparison?.showDelta;
  const isPositive = (delta ?? 0) > 0;
  const isNeutral = (delta ?? 0) === 0;

  const DeltaIcon = isNeutral ? MinusIcon : isPositive ? TrendingUpIcon : TrendingDownIcon;
  const deltaColor = isNeutral
    ? "text-muted-foreground"
    : isPositive
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";

  return (
    <div className="flex h-full flex-col justify-center gap-1 px-1 py-2">
      {/* Label */}
      {config.label && (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {config.label}
        </p>
      )}

      {/* Big number — Particl style: large, prominent */}
      <p className="text-3xl font-bold tabular-nums leading-tight">{formatted}</p>

      {/* Sub-label */}
      <p className="text-xs text-muted-foreground">{config.metric}</p>

      {/* Delta badge */}
      {hasDelta && (
        <div className={`flex items-center gap-1 text-xs font-medium ${deltaColor}`}>
          <DeltaIcon className="h-3.5 w-3.5" />
          <span>
            {isPositive ? "+" : ""}
            {(delta ?? 0).toFixed(1)}%{" "}
            <span className="font-normal text-muted-foreground">
              vs prev {config.comparison?.period}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}