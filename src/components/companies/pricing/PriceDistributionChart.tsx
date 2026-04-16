"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import ApexCharts from "apexcharts";

import { Card } from "@/components/ui/card";
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
  const containerRef = useRef<HTMLDivElement>(null);
  // useRef (not useState) — avoids extra re-render on instantiation
  const chartInstanceRef = useRef<ApexCharts | null>(null);

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!containerRef.current || loading || buckets.length === 0) return;

    const labelColor = isDark ? "#9ca3af" : "#6b7280";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    const bgColor = isDark ? "transparent" : "#ffffff";

    const options: ApexCharts.ApexOptions = {
      chart: {
        type: "bar",
        height: 290,
        toolbar: { show: false },
        zoom: { enabled: false },
        background: bgColor,
        foreColor: labelColor,
        animations: { enabled: false },
        events: {
          dataPointSelection(_e, _ctx, config) {
            const idx: number = config.dataPointIndex;
            if (idx >= 0 && buckets[idx]) {
              onBucketClick?.(buckets[idx]);
            }
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "75%",
          borderRadius: 4,
          dataLabels: { position: "inside" },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => (val >= 5 ? `${Math.round(val)}%` : ""),
        style: { fontSize: "9px", fontWeight: "700", colors: ["#ffffff"] },
        offsetY: 4,
      },
      stroke: { show: false },
      series: [{ name: "% of Products", data: buckets.map((b) => b.percentage) }],
      xaxis: {
        categories: buckets.map((b) => `€${b.range.replace(/-/g, "–")}`),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: "11px", colors: labelColor } },
      },
      yaxis: {
        labels: {
          style: { fontSize: "11px", colors: labelColor },
          formatter: (val) => `${Math.round(val)}%`,
        },
      },
      fill: { colors: [CHART_BLUE], opacity: 0.85 },
      states: {
        hover:  { filter: { type: "lighten" } },
        active: { filter: { type: "darken" } },
      },
      grid: { borderColor: gridColor, strokeDashArray: 4 },
      tooltip: {
        theme: isDark ? "dark" : "light",
        y: { formatter: (val) => `${val.toFixed(1)}%` },
      },
      responsive: [
        { breakpoint: 1024, options: { plotOptions: { bar: { columnWidth: "80%" } } } },
      ],
    };

    // Destroy previous instance before creating a new one
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
  }, [buckets, loading, isDark, onBucketClick]);

  return (
    <Card className="flex flex-1 flex-col p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Price Distribution</h3>
          <p className="text-xs text-muted-foreground">P5–P95</p>
        </div>
        <span className="text-xs text-muted-foreground">% of Product Prices</span>
      </div>

      {onBucketClick && (
        <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Click a price bucket to apply price filters
        </p>
      )}

      {/* Always keep container in the DOM — unmounting it while the chart
          is alive causes a removeChild crash in ApexCharts' useEffect cleanup */}
      <div className="relative">
        <div ref={containerRef} style={{ minHeight: 290 }} />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        )}
        {!loading && buckets.length === 0 && (
          <p className="flex h-[290px] items-center justify-center text-sm text-muted-foreground">
            No distribution data.
          </p>
        )}
      </div>
    </Card>
  );
}
