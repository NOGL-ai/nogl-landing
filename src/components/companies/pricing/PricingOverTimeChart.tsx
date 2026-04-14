"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Download, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export type PricingMetric = "discount" | "current_price" | "full_price";
export type TimeRange = "weekly" | "monthly";

export interface PricingTimeseriesPoint {
  date: string;
  value: number;
}

export interface PricingTimeseriesData {
  discount: PricingTimeseriesPoint[];
  current_price: PricingTimeseriesPoint[];
  full_price: PricingTimeseriesPoint[];
}

interface PricingOverTimeChartProps {
  slug: string;
  data?: PricingTimeseriesData;
  loading?: boolean;
  error?: string | null;
  onExportCsv?: () => Promise<void>;
}

type ChartDatum = {
  date: string;
  label: string;
  shortLabel: string;
  value: number;
  x: number;
  y: number;
};

const METRIC_KEYS: Record<PricingMetric, { label: string; key: keyof PricingTimeseriesData }> = {
  discount: { label: "Avg. Discount", key: "discount" },
  current_price: { label: "Avg. Current Price", key: "current_price" },
  full_price: { label: "Avg. Full Price", key: "full_price" },
};

const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
  { value: "weekly", label: "W" },
  { value: "monthly", label: "M" },
];

export function PricingOverTimeChart({
  slug,
  data,
  loading = false,
  error = null,
  onExportCsv,
}: PricingOverTimeChartProps) {
  const { theme } = useTheme();
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const [metric, setMetric] = useState<PricingMetric>("discount");
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActivePointIndex(null);
  }, [metric, timeRange, slug]);

  const metricData = data?.[METRIC_KEYS[metric].key] || [];

  const visibleData = useMemo(() => {
    const normalizedData = metricData.map((point) => ({
      ...point,
      value: metric === "discount" ? Math.round(point.value * 100) : point.value,
    }));

    if (timeRange === "monthly" && normalizedData.length > 8) {
      return normalizedData.filter((_, index) => index % 4 === 0 || index === normalizedData.length - 1);
    }

    return normalizedData;
  }, [metric, metricData, timeRange]);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const formatMetricValue = (value: number) => {
    if (metric === "discount") {
      return `${Math.round(value)}%`;
    }

    return `EUR ${value.toFixed(2)}`;
  };

  const chartGeometry = useMemo(() => {
    const width = 720;
    const height = 320;
    const padding = { top: 16, right: 20, bottom: 36, left: 72 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    if (visibleData.length === 0) {
      return null;
    }

    const values = visibleData.map((point) => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const spread = maxValue - minValue || Math.max(1, maxValue * 0.1);
    const yMin = Math.max(0, minValue - spread * 0.15);
    const yMax = maxValue + spread * 0.15;

    const points: ChartDatum[] = visibleData.map((point, index) => {
      const x =
        padding.left +
        (visibleData.length === 1 ? innerWidth / 2 : (index / (visibleData.length - 1)) * innerWidth);
      const ratio = yMax === yMin ? 0.5 : (point.value - yMin) / (yMax - yMin);
      const y = padding.top + innerHeight - ratio * innerHeight;
      const date = new Date(point.date);

      return {
        date: point.date,
        label: date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        shortLabel: date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        value: point.value,
        x,
        y,
      };
    });

    const linePath = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;
    const tickCount = 4;
    const yTicks = Array.from({ length: tickCount }, (_, index) => {
      const value = yMin + ((yMax - yMin) / (tickCount - 1)) * index;
      return {
        value,
        y: padding.top + innerHeight - (index / (tickCount - 1)) * innerHeight,
      };
    });

    return {
      width,
      height,
      padding,
      points,
      linePath,
      areaPath,
      yTicks,
    };
  }, [visibleData]);

  const activePoint =
    activePointIndex == null || !chartGeometry
      ? null
      : chartGeometry.points[activePointIndex] ?? null;

  const handleExportImage = async () => {
    if (typeof window === "undefined") {
      return;
    }

    const svg = document.getElementById(`pricing-over-time-chart-${slug}`);
    if (!svg) {
      return;
    }

    const serializer = new XMLSerializer();
    const svgBlob = new Blob([serializer.serializeToString(svg)], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = window.URL.createObjectURL(svgBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pricing-over-time-${metric}-${timeRange}.svg`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportCsv = async () => {
    if (!onExportCsv) {
      const csvContent = [
        ["Date", METRIC_KEYS[metric].label],
        ...metricData.map((point) => [
          point.date,
          metric === "discount" ? `${(point.value * 100).toFixed(1)}%` : `EUR ${point.value.toFixed(2)}`,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pricing-over-time-${metric}-${timeRange}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      await onExportCsv();
    }
  };

  if (error) {
    return (
      <Card className="flex items-center justify-center border-destructive/30 bg-destructive/5 p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-destructive">
            {t("companies.pricing.overTime.error") || "Failed to load pricing trends"}
          </p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </Card>
    );
  }

  if (!mounted) {
    return <Card className="h-96 animate-pulse bg-muted" />;
  }

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {t("companies.pricing.overTime.title") || "Pricing Over Time"}
          </h2>

          <div className="flex gap-2">
            <button
              onClick={handleExportImage}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              disabled={!metricData.length}
              title="Export as SVG"
            >
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Image</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              disabled={!metricData.length}
              title="Export as CSV"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>

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

        {metricData.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            {metricData[0]?.date && metricData[metricData.length - 1]?.date
              ? `${metricData[0].date} to ${metricData[metricData.length - 1].date}`
              : null}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-hidden px-4 py-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="text-sm text-muted-foreground">
                {t("companies.pricing.overTime.loading") || "Loading..."}
              </p>
            </div>
          </div>
        ) : chartGeometry ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-xl border border-border/60 bg-background/60">
              <svg
                id={`pricing-over-time-chart-${slug}`}
                viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
                className="h-80 w-full"
                role="img"
                aria-label={`${METRIC_KEYS[metric].label} over time`}
                onMouseLeave={() => setActivePointIndex(null)}
              >
                <defs>
                  <linearGradient id={`pricing-gradient-${slug}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.04" />
                  </linearGradient>
                </defs>

                {chartGeometry.yTicks.map((tick) => (
                  <g key={`${tick.y}-${tick.value}`}>
                    <line
                      x1={chartGeometry.padding.left}
                      x2={chartGeometry.width - chartGeometry.padding.right}
                      y1={tick.y}
                      y2={tick.y}
                      stroke={isDark ? "#374151" : "#e5e7eb"}
                      strokeDasharray="4 4"
                    />
                    <text
                      x={chartGeometry.padding.left - 12}
                      y={tick.y + 4}
                      textAnchor="end"
                      fontSize="12"
                      fill={isDark ? "#9ca3af" : "#6b7280"}
                    >
                      {formatMetricValue(tick.value)}
                    </text>
                  </g>
                ))}

                <path d={chartGeometry.areaPath} fill={`url(#pricing-gradient-${slug})`} />
                <path
                  d={chartGeometry.linePath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {chartGeometry.points.map((point, index) => (
                  <g key={`${point.date}-${index}`}>
                    <line
                      x1={point.x}
                      x2={point.x}
                      y1={chartGeometry.padding.top}
                      y2={chartGeometry.height - chartGeometry.padding.bottom}
                      stroke="#3b82f6"
                      strokeOpacity={activePointIndex === index ? 0.16 : 0}
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={activePointIndex === index ? 5 : 3}
                      fill="#3b82f6"
                      stroke={isDark ? "#111827" : "#ffffff"}
                      strokeWidth="2"
                      onMouseEnter={() => setActivePointIndex(index)}
                    />
                  </g>
                ))}

                {chartGeometry.points.map((point, index) => {
                  const labelStep = Math.max(1, Math.ceil(chartGeometry.points.length / 6));
                  const showLabel = index % labelStep === 0 || index === chartGeometry.points.length - 1;

                  return (
                    <text
                      key={`label-${point.date}-${index}`}
                      x={point.x}
                      y={chartGeometry.height - 10}
                      textAnchor="middle"
                      fontSize="12"
                      fill={isDark ? "#9ca3af" : "#6b7280"}
                    >
                      {showLabel ? point.shortLabel : ""}
                    </text>
                  );
                })}
              </svg>
            </div>

            {activePoint && (
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm">
                <span className="text-muted-foreground">{activePoint.label}</span>
                <span className="font-medium text-foreground">{formatMetricValue(activePoint.value)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t("companies.pricing.overTime.empty") || "No pricing data available"}
              </p>
            </div>
          </div>
        )}
      </div>

      {metricData.length > 0 && (
        <div className="border-t border-border bg-muted/20 px-6 py-3">
          <p className="text-xs text-muted-foreground">
            {t("companies.pricing.overTime.datapoints") || "Datapoints"}: {metricData.length}
          </p>
        </div>
      )}
    </Card>
  );
}
