"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Download, Image as ImageIcon } from "lucide-react";
import type { ApexOptions } from "apexcharts";

import { Card } from "@/components/ui/card";
import type { PricingTimeseriesData } from "@/types/pricing";
import { CHART_BLUE, formatMetricValue } from "./utils";

// Avoid SSR — ApexCharts requires browser APIs
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type PricingMetric = "discount" | "current_price" | "full_price";
export type TimeRange = "weekly" | "monthly";

// Re-export types so existing imports still resolve
export type { PricingTimeseriesData };
export type { PricingTimeseriesPoint } from "@/types/pricing";

const METRIC_KEYS: Record<PricingMetric, { label: string; key: keyof PricingTimeseriesData }> = {
  discount:      { label: "Avg. Discount",     key: "discount" },
  current_price: { label: "Avg. Current Price", key: "current_price" },
  full_price:    { label: "Avg. Full Price",    key: "full_price" },
};

const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
  { value: "weekly",  label: "W" },
  { value: "monthly", label: "M" },
];

interface PricingOverTimeChartProps {
  slug: string;
  data?: PricingTimeseriesData;
  loading?: boolean;
  error?: string | null;
  onExportCsv?: () => Promise<void>;
}

export function PricingOverTimeChart({
  slug,
  data,
  loading = false,
  error = null,
  onExportCsv,
}: PricingOverTimeChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [metric, setMetric]       = useState<PricingMetric>("discount");
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");

  const rawPoints = data?.[METRIC_KEYS[metric].key] ?? [];

  // Normalise + optional monthly downsampling
  const visibleData = useMemo(() => {
    const normalised = rawPoints.map((p) => ({
      ...p,
      // API returns discount as 0–1 fraction; chart expects 0–100
      value: metric === "discount" ? Math.round(p.value * 100) : p.value,
    }));
    if (timeRange === "monthly" && normalised.length > 8) {
      return normalised.filter((_, i) => i % 4 === 0 || i === normalised.length - 1);
    }
    return normalised;
  }, [rawPoints, metric, timeRange]);

  // ── ApexCharts config ────────────────────────────────────────────────────────
  const series = useMemo(
    (): ApexOptions["series"] => [
      {
        name: METRIC_KEYS[metric].label,
        data: visibleData.map((p) => ({
          x: new Date(p.date).getTime(),
          y: p.value,
        })),
      },
    ],
    [visibleData, metric],
  );

  const options = useMemo((): ApexOptions => {
    const labelColor = isDark ? "#9ca3af" : "#6b7280";
    const gridColor  = isDark ? "#374151" : "#e5e7eb";

    return {
      chart: {
        id: `pricing-over-time-${slug}`,
        type: "area",
        height: 320,
        toolbar: { show: false },
        zoom:    { enabled: false },
        animations: { enabled: false },
        background: "transparent",
        foreColor: labelColor,
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3, colors: [CHART_BLUE] },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.04,
          stops: [0, 100],
          colorStops: [
            { offset: 0,   color: CHART_BLUE, opacity: 0.35 },
            { offset: 100, color: CHART_BLUE, opacity: 0.04 },
          ],
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          style: { colors: labelColor, fontSize: "12px" },
          datetimeFormatter: { day: "dd MMM", month: "MMM 'yy" },
        },
        axisBorder: { show: false },
        axisTicks:  { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: labelColor, fontSize: "12px" },
          formatter: (val) => formatMetricValue(val, metric),
        },
      },
      tooltip: {
        theme: isDark ? "dark" : "light",
        x:     { format: "dd MMM yyyy" },
        y:     { formatter: (val) => formatMetricValue(val, metric) },
      },
      grid: {
        borderColor: gridColor,
        strokeDashArray: 4,
        padding: { left: 8, right: 8 },
      },
      markers: {
        size: 4,
        colors: [CHART_BLUE],
        strokeColors: isDark ? "#111827" : "#ffffff",
        strokeWidth: 2,
        hover: { size: 6 },
      },
      theme: { mode: isDark ? "dark" : "light" },
    };
  }, [isDark, metric, slug]);

  // ── Export handlers ───────────────────────────────────────────────────────────
  const handleExportImage = async () => {
    if (typeof window === "undefined") return;
    // Use ApexCharts global registry instead of DOM query
    const ApexChartsLib = (await import("apexcharts")).default;
    const chart = ApexChartsLib.getChartByID(`pricing-over-time-${slug}`);
    if (!chart) return;
    const result = await chart.dataURI();
    const imgURI = "imgURI" in result ? result.imgURI : "";
    if (!imgURI) return;
    const a = document.createElement("a");
    a.href = imgURI;
    a.download = `pricing-over-time-${metric}-${timeRange}.png`;
    a.click();
  };

  const handleExportCsv = async () => {
    if (onExportCsv) {
      await onExportCsv();
      return;
    }
    const csvContent = [
      ["Date", METRIC_KEYS[metric].label],
      ...rawPoints.map((p) => [
        p.date,
        metric === "discount"
          ? `${(p.value * 100).toFixed(1)}%`
          : `EUR ${p.value.toFixed(2)}`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pricing-over-time-${metric}-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Card className="flex items-center justify-center border-destructive/30 bg-destructive/5 p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-destructive">Failed to load pricing trends</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </Card>
    );
  }

  const dateFrom = rawPoints[0]?.date;
  const dateTo   = rawPoints[rawPoints.length - 1]?.date;

  return (
    <Card className="flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">Pricing Over Time</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportImage}
              disabled={!rawPoints.length}
              title="Export as PNG"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Image</span>
            </button>
            <button
              onClick={handleExportCsv}
              disabled={!rawPoints.length}
              title="Export as CSV"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>

        {/* Metric tabs + time range */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
            {(Object.keys(METRIC_KEYS) as PricingMetric[]).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                  metric === m
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {METRIC_KEYS[m].label}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
            {TIME_RANGE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTimeRange(value)}
                className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                  timeRange === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {dateFrom && dateTo && (
          <p className="mt-3 text-xs text-muted-foreground">
            {dateFrom} to {dateTo}
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 overflow-hidden px-2 py-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        ) : visibleData.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">No pricing data available</p>
          </div>
        ) : (
          <ReactApexChart
            type="area"
            height={320}
            series={series}
            options={options}
          />
        )}
      </div>

      {rawPoints.length > 0 && (
        <div className="border-t border-border bg-muted/20 px-6 py-3">
          <p className="text-xs text-muted-foreground">
            Datapoints: {rawPoints.length}
          </p>
        </div>
      )}
    </Card>
  );
}
