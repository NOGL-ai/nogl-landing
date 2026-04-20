"use client";
import { TrendUp01 as TrendingUpIcon, TrendDown01 as TrendingDownIcon, Minus as MinusIcon } from '@untitledui/icons';


import { TrendUp01 as TrendingUpIcon, TrendDown01 as TrendingDownIcon, Minus as MinusIcon } from '@untitledui/icons';


import type { SparklineConfig, WidgetQueryResult } from "@/lib/dashboards/widgetSchemas";
import { z } from "zod";
import { ResponsiveContainer, LineChart, Line } from "recharts";


type Config = z.infer<typeof SparklineConfig>;
type Series = NonNullable<WidgetQueryResult["series"]>;

interface Props {
  value: number | string;
  delta: number;
  series: Series;
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
      if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
      return n.toFixed(0);
  }
}

export function SparklineWidget({ value, delta, series, config }: Props) {
  const formatted = formatValue(value, config.format);
  const isPositive = delta > 0;
  const isNeutral = delta === 0;
  const DeltaIcon = isNeutral ? MinusIcon : isPositive ? TrendingUpIcon : TrendingDownIcon;
  const deltaColor = isNeutral
    ? "text-muted-foreground"
    : isPositive
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";
  const lineColor = isPositive ? "#10b981" : "#ef4444";

  const chartData = series[0]?.data ?? [];

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Top: value + delta */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold tabular-nums">{formatted}</p>
          <p className="text-xs text-muted-foreground">{config.metric}</p>
        </div>
        <div className={`flex items-center gap-0.5 text-xs font-medium ${deltaColor}`}>
          <DeltaIcon className="h-3.5 w-3.5" />
          {isPositive ? "+" : ""}
          {delta.toFixed(1)}%
        </div>
      </div>

      {/* Sparkline */}
      {chartData.length > 1 && (
        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <Line
              type="monotone"
              dataKey="y"
              stroke={lineColor}
              dot={false}
              strokeWidth={1.5}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}