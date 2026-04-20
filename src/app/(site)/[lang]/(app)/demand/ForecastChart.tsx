"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { FORECAST_CHANNELS, type ForecastChannelName } from "@/config/forecast";
import type { ForecastResponse } from "@/actions/forecast";

interface ForecastChartProps {
  data: ForecastResponse;
  metric: "sale" | "revenue";
  activeChannels: ReadonlySet<ForecastChannelName>;
}

interface MergedPoint {
  date: string;
  [key: string]: string | number | null;
}

export function ForecastChart({ data, metric, activeChannels }: ForecastChartProps) {
  const merged = useMemo<MergedPoint[]>(() => {
    const byDate = new Map<string, MergedPoint>();
    for (const channel of FORECAST_CHANNELS) {
      const series = data.channels[channel.name];
      if (!series) continue;
      for (const pt of series) {
        const row = byDate.get(pt.date) ?? { date: pt.date };
        row[`${channel.name}_real`] = pt.real_value;
        row[`${channel.name}_forecast`] = pt.forecast_value;
        byDate.set(pt.date, row);
      }
    }
    return Array.from(byDate.values()).sort((a, b) =>
      String(a.date).localeCompare(String(b.date)),
    );
  }, [data]);

  const yAxisLabel = metric === "sale" ? "Units" : "Revenue (€)";

  if (!merged.length) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl border border-border-primary bg-bg-secondary text-sm text-text-secondary">
        No data in this range. Try widening the date range or clearing category filters.
      </div>
    );
  }

  return (
    <div
      className="h-96 w-full"
      role="img"
      aria-label={`Demand forecast chart — ${metric === "sale" ? "units" : "revenue"} across active channels`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={merged} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-primary, #eee)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => String(v).slice(5)}
            minTickGap={32}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            label={{ value: yAxisLabel, angle: -90, position: "insideLeft", fontSize: 11 }}
            width={64}
          />
          <Tooltip
            formatter={(value) =>
              typeof value === "number"
                ? metric === "revenue"
                  ? `€${value.toFixed(2)}`
                  : value.toFixed(1)
                : value
            }
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine
            x={data.startForecastDate}
            stroke="var(--color-border-secondary, #999)"
            strokeDasharray="4 4"
            label={{ value: "Today", position: "top", fontSize: 11 }}
          />
          {FORECAST_CHANNELS.filter((c) => activeChannels.has(c.name)).flatMap((channel) => [
            <Line
              key={`${channel.name}_real`}
              type="monotone"
              dataKey={`${channel.name}_real`}
              name={`${channel.label} (actual)`}
              stroke={channel.colorFg}
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />,
            <Line
              key={`${channel.name}_forecast`}
              type="monotone"
              dataKey={`${channel.name}_forecast`}
              name={`${channel.label} (forecast)`}
              stroke={channel.colorFg}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
              isAnimationActive={false}
            />,
          ])}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
