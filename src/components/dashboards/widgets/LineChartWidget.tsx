"use client";

import type { LineChartConfig, WidgetQueryResult } from "@/lib/dashboards/widgetSchemas";
import { z } from "zod";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type Config = z.infer<typeof LineChartConfig>;
type Series = NonNullable<WidgetQueryResult["series"]>;

const COLORS = [
  "var(--color-primary, hsl(221 83% 53%))",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

interface Props {
  series: Series;
  config: Config;
}

export function LineChartWidget({ series, config }: Props) {
  if (!series.length || !series[0]?.data?.length) {
    return (
      <p className="flex h-full items-center justify-center text-xs text-muted-foreground">
        No data
      </p>
    );
  }

  // Flatten series into recharts format: [{ x, series1: y, series2: y }]
  const chartData = series[0].data.map((point, i) => {
    const row: Record<string, unknown> = { x: point.x };
    for (const s of series) {
      row[s.name] = s.data[i]?.y ?? 0;
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={100}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="x"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--background)",
          }}
        />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s, i) => (
          <Line
            key={s.name}
            type={config.smooth ? "monotone" : "linear"}
            dataKey={s.name}
            stroke={COLORS[i % COLORS.length]}
            dot={false}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
