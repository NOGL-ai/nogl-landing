"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import ApexCharts from "apexcharts";

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

// ── Mock data ─────────────────────────────────────────────────────────────────

const DEFAULT_DATA: GenderEntry[] = [
  { gender: "Male", count: 1842, pct: 59, color: "#3b82f6" },
  { gender: "Unisex", count: 905, pct: 29, color: "#8b5cf6" },
  { gender: "Female", count: 374, pct: 12, color: "#ec4899" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function GenderDistributionWidget({
  data = DEFAULT_DATA,
  loading = false,
}: GenderDistributionWidgetProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ApexCharts | null>(null);

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!containerRef.current || loading || data.length === 0) return;

    const labelColor = isDark ? "#9ca3af" : "#6b7280";
    const bgColor = isDark ? "transparent" : "#ffffff";

    const options: ApexCharts.ApexOptions = {
      chart: {
        type: "donut",
        height: 200,
        toolbar: { show: false },
        background: bgColor,
        foreColor: labelColor,
        animations: { enabled: false },
      },
      series: data.map((d) => d.pct),
      labels: data.map((d) => d.gender),
      colors: data.map((d) => d.color),
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            labels: {
              show: true,
              total: {
                show: true,
                showAlways: true,
                label: "Total",
                fontSize: "11px",
                color: labelColor,
                formatter: () =>
                  data.reduce((acc, d) => acc + d.count, 0).toLocaleString(),
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${Math.round(val)}%`,
        style: { fontSize: "10px", fontWeight: "600", colors: ["#ffffff"] },
        dropShadow: { enabled: false },
      },
      legend: {
        show: true,
        position: "right",
        fontSize: "11px",
        labels: { colors: labelColor },
        markers: { size: 6 },
      },
      stroke: { width: 0 },
      tooltip: {
        theme: isDark ? "dark" : "light",
        y: { formatter: (val) => `${val}%` },
      },
    };

    try { chartInstanceRef.current?.destroy(); } catch { /* ignore */ }
    chartInstanceRef.current = null;

    const chart = new ApexCharts(containerRef.current, options);
    chartInstanceRef.current = chart;
    void chart.render();

    return () => {
      try { chartInstanceRef.current?.destroy(); } catch { /* ignore */ }
      chartInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loading, isDark]);

  const total = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <Card className="flex flex-col p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Gender Distribution</h3>
      </div>

      {/* Chart — always keep in DOM */}
      <div className="relative">
        <div ref={containerRef} style={{ minHeight: 200 }} />

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
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: row.color }}
                      />
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

      {/* Footnote */}
      <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
        Not all products are categorized with a gender, and some products may be categorized with
        multiple genders.
      </p>
    </Card>
  );
}
