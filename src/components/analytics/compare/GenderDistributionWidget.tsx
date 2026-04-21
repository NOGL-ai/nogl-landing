"use client";

import { useTheme } from "next-themes";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import { Card } from "@/components/ui/card";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GenderEntry {
  gender: string;
  count: number;
  pct: number;
  color: string;
}

interface GenderDistributionWidgetProps {
  data?: GenderEntry[];
  loading?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GenderDistributionWidget({
  data = [],
  loading = false,
}: GenderDistributionWidgetProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const total = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <Card className="flex flex-col p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Gender Distribution</h3>
      </div>

      <div className="relative" style={{ minHeight: 200 }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        )}
        {!loading && data.length === 0 && (
          <p className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No gender data.
          </p>
        )}
        {!loading && data.length > 0 && (
          <div className="flex items-center gap-6">
            {/* Donut chart with center label */}
            <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={140}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="pct"
                    nameKey="gender"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: isDark ? "#111827" : "#ffffff",
                      border: `1px solid ${gridColor}`,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: textColor }}
                    formatter={(value) => [`${value as number}%`, ""] as [string, string]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label overlay */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-foreground">{total.toLocaleString()}</span>
                <span className="text-[10px] text-muted-foreground">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2">
              {data.map((d) => (
                <div key={d.gender} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-foreground">{d.gender}</span>
                  <span className="ml-2 tabular-nums text-muted-foreground">
                    {total > 0 ? ((d.count / total) * 100).toFixed(1) : d.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table breakdown */}
      {!loading && data.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Gender
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  # Products
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row) => (
                <tr key={row.gender} className="transition-colors hover:bg-muted/20">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                      <span className="text-foreground">{row.gender}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {row.count.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {total > 0 ? ((row.count / total) * 100).toFixed(1) : row.pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
        Not all products are categorized with a gender, and some products may be categorized with
        multiple genders.
      </p>
    </Card>
  );
}
