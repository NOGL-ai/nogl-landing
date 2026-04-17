"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import type {
  ForecastChannelData,
  ForecastChannelConfig,
  ForecastMetric,
  ForecastScale,
  ForecastQuantileValue,
} from "@/types/forecast";

const QUANTILE_LABELS: Record<ForecastQuantileValue, string> = {
  3: "Pessimistic",
  4: "Median",
  5: "Optimistic",
};

interface ForecastChartProps {
  data: ForecastChannelData;
  metric: ForecastMetric;
  scale: ForecastScale;
  quantile: ForecastQuantileValue;
  channels: ForecastChannelConfig[];
  height?: number;
  startForecastDate?: string;
}

function formatAxisDate(date: string, scale: ForecastScale): string {
  try {
    const d = parseISO(date);
    if (scale === "monthly") return format(d, "MMM yy");
    if (scale === "weekly") return format(d, "d MMM");
    return format(d, "d MMM");
  } catch {
    return date;
  }
}

function formatValue(v: number, metric: ForecastMetric): string {
  if (metric === "revenue") {
    return v >= 1000 ? `€${(v / 1000).toFixed(1)}K` : `€${Math.round(v)}`;
  }
  return v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(Math.round(v));
}

export function ForecastChart({
  data,
  metric,
  scale,
  quantile,
  channels,
  height = 360,
  startForecastDate,
}: ForecastChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const today = format(new Date(), "yyyy-MM-dd");

  const { chartData, allDates } = useMemo(() => {
    const dateSet = new Set<string>();
    for (const ch of channels) {
      (data[ch.name] ?? []).forEach((p) => dateSet.add(p.date));
    }
    const dates = Array.from(dateSet).sort();
    const rows = dates.map((date) => {
      const row: Record<string, string | number | null> = { date };
      for (const ch of channels) {
        const point = (data[ch.name] ?? []).find((p) => p.date === date);
        row[`${ch.name}_real`] = point?.real_value ?? null;
        row[`${ch.name}_forecast`] = point?.forecast_value ?? null;
      }
      return row;
    });
    return { chartData: rows, allDates: dates };
  }, [data, channels]);

  const isDaily = scale === "daily";
  const ChartComponent = isDaily ? LineChart : BarChart;

  const tooltipContent = {
    contentStyle: {
      background: isDark ? "#111827" : "#ffffff",
      border: `1px solid ${gridColor}`,
      borderRadius: 8,
      fontSize: 12,
    },
    labelStyle: { color: textColor, marginBottom: 4 },
    labelFormatter: (label: unknown) => {
      try { return format(parseISO(label as string), "dd MMM yyyy"); } catch { return String(label); }
    },
    formatter: (value: unknown, name: unknown) => {
      const v = value as number;
      const n = String(name);
      const chName = n.replace("_real", "").replace("_forecast", "");
      const type = n.endsWith("_forecast") ? ` (${QUANTILE_LABELS[quantile]})` : " (Actual)";
      const ch = channels.find((c) => c.name === chName);
      return [formatValue(v, metric), `${ch?.label ?? chName}${type}`] as [string, string];
    },
  };

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(d: string) => formatAxisDate(d, scale)}
            interval={Math.max(0, Math.floor(allDates.length / 8) - 1)}
          />
          <YAxis
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatValue(v, metric)}
          />
          <Tooltip {...tooltipContent} />
          <Legend
            formatter={(value: string) => {
              const ch = channels.find(
                (c) => c.name === value.replace("_real", "").replace("_forecast", "")
              );
              const type = value.endsWith("_forecast") ? ` (${QUANTILE_LABELS[quantile]})` : " (Actual)";
              return (
                <span style={{ color: textColor, fontSize: 11 }}>
                  {ch?.label ?? value}{type}
                </span>
              );
            }}
          />

          {/* Today / forecast start reference line */}
          {startForecastDate && (
            <ReferenceLine
              x={startForecastDate}
              stroke={textColor}
              strokeDasharray="4 2"
              label={{ value: "Forecast", fill: textColor, fontSize: 10, position: "top" }}
            />
          )}
          {!startForecastDate && (
            <ReferenceLine
              x={today}
              stroke={textColor}
              strokeDasharray="4 2"
            />
          )}

          {channels.flatMap((ch) =>
            isDaily
              ? [
                  <Line
                    key={`${ch.name}_real`}
                    type="monotone"
                    dataKey={`${ch.name}_real`}
                    stroke={ch.colorFg}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3 }}
                    connectNulls={false}
                  />,
                  <Line
                    key={`${ch.name}_forecast`}
                    type="monotone"
                    dataKey={`${ch.name}_forecast`}
                    stroke={ch.colorFg}
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={false}
                    activeDot={{ r: 3 }}
                    connectNulls={false}
                  />,
                ]
              : [
                  <Bar
                    key={`${ch.name}_real`}
                    dataKey={`${ch.name}_real`}
                    fill={ch.colorFg}
                    fillOpacity={0.9}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={20}
                  />,
                  <Bar
                    key={`${ch.name}_forecast`}
                    dataKey={`${ch.name}_forecast`}
                    fill={ch.colorFg}
                    fillOpacity={0.4}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={20}
                  />,
                ]
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
