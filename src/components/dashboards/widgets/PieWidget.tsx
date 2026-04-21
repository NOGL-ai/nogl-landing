"use client";

import type { PieConfig, WidgetQueryResult } from "@/lib/dashboards/widgetSchemas";
import { z } from "zod";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

type Config = z.infer<typeof PieConfig>;
type Slices = NonNullable<WidgetQueryResult["slices"]>;

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16",
];

interface Props {
  slices: Slices;
  config: Config;
}

export function PieWidget({ slices, config }: Props) {
  if (!slices.length) {
    return (
      <p className="flex h-full items-center justify-center text-xs text-muted-foreground">
        No data
      </p>
    );
  }

  const innerRadius = config.donut ? "55%" : 0;

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={120}>
      <PieChart>
        <Pie
          data={slices}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius="70%"
          paddingAngle={2}
        >
          {slices.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [
            Number(value).toLocaleString(),
            String(name),
          ]}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--background)",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          formatter={(value) =>
            value.length > 18 ? value.slice(0, 16) + "…" : value
          }
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
