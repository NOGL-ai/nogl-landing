"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts";
import { useTheme } from "next-themes";

import type { PriceDistributionBucket } from "@/types/company";
import { CHART_BLUE } from "./utils";

interface PriceDistributionChartProps {
  buckets: PriceDistributionBucket[];
  /** Called when user clicks a bar — use to apply min/max price filters */
  onBucketClick?: (bucket: PriceDistributionBucket) => void;
  slug?: string;
  loading?: boolean;
}

export function PriceDistributionChart({
  buckets,
  onBucketClick,
  loading = false,
}: PriceDistributionChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const chartData = buckets.map((b) => ({
    label: `€${b.range.replace(/-/g, "–")}`,
    value: b.percentage,
    _bucket: b,
  }));

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-border-primary bg-bg-primary p-5 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Price Distribution</h3>
          <p className="text-xs text-text-tertiary">P5–P95</p>
        </div>
        <span className="text-xs text-text-tertiary">% of Product Prices</span>
      </div>

      {onBucketClick && (
        <p className="mb-3 flex items-center gap-1.5 text-xs text-text-tertiary">
          <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Click a price bucket to apply price filters
        </p>
      )}

      <div className="relative" style={{ minHeight: 290 }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-bg-tertiary border-t-brand-600" />
          </div>
        )}
        {!loading && buckets.length === 0 && (
          <p className="flex h-[290px] items-center justify-center text-sm text-text-tertiary">
            No distribution data.
          </p>
        )}
        {!loading && buckets.length > 0 && (
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: textColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: textColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${Math.round(v)}%`}
              />
              <Tooltip
                contentStyle={{
                  background: isDark ? "#111827" : "#ffffff",
                  border: `1px solid ${gridColor}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: textColor }}
                formatter={(value) => [`${(value as number).toFixed(1)}%`, "% of Products"] as [string, string]}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                cursor={onBucketClick ? "pointer" : undefined}
                onClick={(_data: unknown, index: number) => {
                  if (buckets[index]) onBucketClick?.(buckets[index]);
                }}
              >
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_BLUE} fillOpacity={0.85} />
                ))}
                <LabelList
                  dataKey="value"
                  position="insideTop"
                  formatter={(value: unknown) => {
                    const v = value as number;
                    return v >= 5 ? `${Math.round(v)}%` : "";
                  }}
                  style={{ fill: "#ffffff", fontSize: 9, fontWeight: 700 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
