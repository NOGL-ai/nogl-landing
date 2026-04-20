"use client";
import { Download01 as Download } from '@untitledui/icons';


import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";


import { Card } from "@/components/ui/card";
import type { PricingTimeseriesData } from "@/types/pricing";
import { CHART_BLUE, formatMetricValue } from "./utils";

export type PricingMetric = "discount" | "current_price" | "full_price";
export type TimeRange = "weekly" | "monthly";

// Re-export types so existing imports still resolve
export type { PricingTimeseriesData };
export type { PricingTimeseriesPoint } from "@/types/pricing";

const METRIC_KEYS: Record<PricingMetric, { label: string; key: keyof PricingTimeseriesData }> = {
  discount:      { label: "Avg. Discount",     key: "discount" },
  current_price: { label: "Avg. Current Price", key: "current_price" },
  full_price:    { label: "Avg. Full Price",    key: "full_price" },
};

const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
  { value: "weekly",  label: "W" },
  { value: "monthly", label: "M" },
];

interface PricingOverTimeChartProps {
  slug: string;
  data?: PricingTimeseriesData;
  loading?: boolean;
  error?: string | null;
  onExportCsv?: () => Promise<void>;
}

export function PricingOverTimeChart({
  data,
  loading = false,
  error = null,
  onExportCsv,
}: PricingOverTimeChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [metric, setMetric]       = useState<PricingMetric>("discount");
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");

  const rawPoints = data?.[METRIC_KEYS[metric].key] ?? [];

  const visibleData = useMemo(() => {
    const normalised = rawPoints.map((p) => ({
      ...p,
      value: metric === "discount" ? Math.round(p.value * 100) : p.value,
    }));
    if (timeRange === "monthly" && normalised.length > 8) {
      return normalised.filter((_, i) => i % 4 === 0 || i === normalised.length - 1);
    }
    return normalised;
  }, [rawPoints, metric, timeRange]);

  const textColor  = isDark ? "#9ca3af" : "#6b7280";
  const gridColor  = isDark ? "#374151" : "#e5e7eb";
  const gradientId = "pricingAreaGradient";

  const handleExportCsv = async () => {
    if (onExportCsv) {
      await onExportCsv();
      return;
    }
    const csvContent = [
      ["Date", METRIC_KEYS[metric].label],
      ...rawPoints.map((p) => [
        p.date,
        metric === "discount"
          ? `${(p.value * 100).toFixed(1)}%`
          : `EUR ${p.value.toFixed(2)}`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pricing-over-time-${metric}-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <Card className="flex items-center justify-center border-destructive/30 bg-destructive/5 p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-destructive">Failed to load pricing trends</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </Card>
    );
  }

  const dateFrom = rawPoints[0]?.date;
  const dateTo   = rawPoints[rawPoints.length - 1]?.date;

  return (
    <Card className="flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">Pricing Over Time</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportCsv}
              disabled={!rawPoints.length}
              title="Export as CSV"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>

        {/* Metric tabs + time range */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
            {(Object.keys(METRIC_KEYS) as PricingMetric[]).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                  metric === m
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {METRIC_KEYS[m].label}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
            {TIME_RANGE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTimeRange(value)}
                className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                  timeRange === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {dateFrom && dateTo && (
          <p className="mt-3 text-xs text-muted-foreground">
            {dateFrom} to {dateTo}
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 overflow-hidden px-2 py-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        ) : visibleData.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">No pricing data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={visibleData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_BLUE} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART_BLUE} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: textColor, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(d: string) => {
                  try {
                    return format(
                      parseISO(d),
                      timeRange === "monthly" ? "MMM yy" : "dd MMM",
                    );
                  } catch {
                    return d;
                  }
                }}
              />
              <YAxis
                tick={{ fill: textColor, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatMetricValue(v, metric)}
              />
              <Tooltip
                contentStyle={{
                  background: isDark ? "#111827" : "#ffffff",
                  border: `1px solid ${gridColor}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: textColor }}
                labelFormatter={(label: unknown) => {
                  try { return format(parseISO(label as string), "dd MMM yyyy"); } catch { return String(label); }
                }}
                formatter={(value) => [formatMetricValue(value as number, metric), METRIC_KEYS[metric].label] as [string, string]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={CHART_BLUE}
                strokeWidth={3}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: isDark ? "#111827" : "#ffffff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {rawPoints.length > 0 && (
        <div className="border-t border-border bg-muted/20 px-6 py-3">
          <p className="text-xs text-muted-foreground">Datapoints: {rawPoints.length}</p>
        </div>
      )}
    </Card>
  );
}