"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";
import {
  HISTORY_PALETTE,
  FORECAST_PALETTE,
  QUANTILE_LABELS,
} from "@/config/forecast";
import type {
  ForecastChannelData,
  ForecastChannelConfig,
  ForecastMetric,
  ForecastScale,
  ForecastQuantileValue,
} from "@/types/forecast";

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

/* ─── Dual legend (HISTORY | FORECAST) ────────────────────────────────────── */

interface LegendProps {
  channels: ForecastChannelConfig[];
  textColor: string;
  subtleColor: string;
}

function DualLegend({ channels, textColor, subtleColor }: LegendProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-6 rounded-lg border border-border-secondary bg-bg-secondary px-3 py-2 text-[11px]">
      <div className="flex items-center gap-3">
        <span
          className="font-semibold uppercase tracking-wider"
          style={{ color: subtleColor, letterSpacing: "0.08em" }}
        >
          History
        </span>
        {channels.map((ch, i) => (
          <div key={`h-${ch.name}`} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: HISTORY_PALETTE[i % HISTORY_PALETTE.length] }}
            />
            <span style={{ color: textColor }}>{ch.label}</span>
          </div>
        ))}
      </div>

      <div className="h-4 w-px bg-border-secondary" />

      <div className="flex items-center gap-3">
        <span
          className="font-semibold uppercase tracking-wider"
          style={{ color: subtleColor, letterSpacing: "0.08em" }}
        >
          Forecast
        </span>
        {channels.map((ch, i) => (
          <div key={`f-${ch.name}`} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: FORECAST_PALETTE[i % FORECAST_PALETTE.length] }}
            />
            <span style={{ color: textColor }}>{ch.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Chart ───────────────────────────────────────────────────────────────── */

export function ForecastChart({
  data,
  metric,
  scale,
  quantile,
  channels,
  height = 400,
  startForecastDate,
}: ForecastChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const textColor = isDark ? "#d5d7da" : "#414651";
  const subtleColor = isDark ? "#94979c" : "#717680";
  const gridColor = isDark ? "#1f242f" : "#eaecf0";
  const today = format(new Date(), "yyyy-MM-dd");
  const boundary = startForecastDate ?? today;

  // Flatten: one row per date, with history_<ch> OR forecast_<ch> set (never both).
  const { chartData, allDates } = useMemo(() => {
    const dateSet = new Set<string>();
    for (const ch of channels) {
      (data[ch.name] ?? []).forEach((p) => dateSet.add(p.date));
    }
    const dates = Array.from(dateSet).sort();

    const rows = dates.map((date) => {
      const row: Record<string, string | number | null> = { date };
      const isFuture = date >= boundary;
      for (const ch of channels) {
        const point = (data[ch.name] ?? []).find((p) => p.date === date);
        // History (real_value) lives in past, Forecast (forecast_value) in future.
        // Keep them in separate dataKeys so Recharts renders two stacks with
        // different palettes.
        row[`history_${ch.name}`] = isFuture ? null : point?.real_value ?? null;
        row[`forecast_${ch.name}`] = isFuture ? point?.forecast_value ?? null : null;
      }
      return row;
    });
    return { chartData: rows, allDates: dates };
  }, [data, channels, boundary]);

  const ariaSummary =
    allDates.length > 0
      ? `${metric === "revenue" ? "Revenue" : "Sales"} forecast, ${
          channels.length
        } ${channels.length === 1 ? "channel" : "channels"}, ${scale} granularity, ${QUANTILE_LABELS[quantile]} scenario, from ${allDates[0]} to ${
          allDates[allDates.length - 1]
        }.`
      : "Empty forecast chart — no data points available.";

  return (
    <div
      role="img"
      aria-label={ariaSummary}
      className="rounded-xl border border-border-secondary bg-bg-primary p-4"
    >
      <DualLegend
        channels={channels}
        textColor={textColor}
        subtleColor={subtleColor}
      />

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          barCategoryGap="20%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: subtleColor, fontSize: 11 }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
            tickFormatter={(d: string) => formatAxisDate(d, scale)}
            interval={Math.max(0, Math.floor(allDates.length / 10) - 1)}
          />
          <YAxis
            tick={{ fill: subtleColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={54}
            tickFormatter={(v: number) => formatValue(v, metric)}
          />
          <Tooltip
            cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
            contentStyle={{
              background: isDark ? "#0a0d12" : "#ffffff",
              border: `1px solid ${gridColor}`,
              borderRadius: 8,
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            labelStyle={{ color: subtleColor, marginBottom: 4, fontWeight: 500 }}
            labelFormatter={(label: unknown) => {
              try {
                return format(parseISO(label as string), "dd MMM yyyy");
              } catch {
                return String(label);
              }
            }}
            formatter={(value: unknown, name: unknown) => {
              const v = value as number | null;
              if (v === null || v === undefined) return ["—", String(name)];
              const n = String(name);
              const isForecast = n.startsWith("forecast_");
              const chName = n.replace("history_", "").replace("forecast_", "");
              const ch = channels.find((c) => c.name === chName);
              const suffix = isForecast
                ? ` • Forecast (${QUANTILE_LABELS[quantile]})`
                : " • Actual";
              return [
                formatValue(v, metric),
                `${ch?.label ?? chName}${suffix}`,
              ] as [string, string];
            }}
          />

          <ReferenceLine
            x={boundary}
            stroke={subtleColor}
            strokeDasharray="3 3"
            label={{
              value: "Forecast →",
              fill: subtleColor,
              fontSize: 10,
              position: "insideTopRight",
            }}
          />

          {/* HISTORY stack (blues) */}
          {channels.map((ch, i) => (
            <Bar
              key={`h-${ch.name}`}
              dataKey={`history_${ch.name}`}
              stackId="history"
              fill={HISTORY_PALETTE[i % HISTORY_PALETTE.length]}
              radius={
                i === channels.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]
              }
              maxBarSize={24}
              isAnimationActive={false}
            />
          ))}

          {/* FORECAST stack (pinks) */}
          {channels.map((ch, i) => (
            <Bar
              key={`f-${ch.name}`}
              dataKey={`forecast_${ch.name}`}
              stackId="forecast"
              fill={FORECAST_PALETTE[i % FORECAST_PALETTE.length]}
              radius={
                i === channels.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]
              }
              maxBarSize={24}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
