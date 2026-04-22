"use client";

import type { BarChartConfig, WidgetQueryResult } from "@/lib/dashboards/widgetSchemas";
import { z } from "zod";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

type Config = z.infer<typeof BarChartConfig>;
type Series = NonNullable<WidgetQueryResult["series"]>;

// Dashboard palette — muted earthy tones
const PALETTE = [
  "#4b5563", // slate
  "#1d4ed8", // blue
  "#16a34a", // green
  "#d97706", // amber
  "#b45309", // brown
  "#9333ea", // purple
];

interface Props {
  series: Series;
  config: Config;
}

export function BarChartWidget({ series, config }: Props) {
  if (!series.length || !series[0]?.data?.length) {
    return (
      <p className="flex h-full items-center justify-center text-xs text-muted-foreground">
        No data
      </p>
    );
  }

  const chartData = series[0].data.map((point, i) => {
    const row: Record<string, unknown> = { x: point.x };
    for (const s of series) {
      row[s.name] = s.data[i]?.y ?? 0;
    }
    return row;
  });

  const isHorizontal = config.orientation === "horizontal";

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={100}>
      <BarChart
        data={chartData}
        layout={isHorizontal ? "vertical" : "horizontal"}
        margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        {isHorizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis dataKey="x" type="category" tick={{ fontSize: 10 }} width={80} tickLine={false} axisLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey="x" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
          </>
        )}
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--background)",
          }}
        />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s, si) =>
          config.stacked ? (
            <Bar key={s.name} dataKey={s.name} stackId="a" fill={PALETTE[si % PALETTE.length]} radius={si === series.length - 1 ? [4, 4, 0, 0] : undefined} />
          ) : (
            <Bar key={s.name} dataKey={s.name} fill={PALETTE[si % PALETTE.length]} radius={[4, 4, 0, 0]}>
              {/* Per-bar colour variation when single series */}
              {series.length === 1
                ? chartData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))
                : null}
            </Bar>
          )
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
