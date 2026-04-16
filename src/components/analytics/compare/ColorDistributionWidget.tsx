"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import ApexCharts from "apexcharts";
import { Download, FileDown, Lock, ChevronDown } from "lucide-react";

import { Card } from "@/components/ui/card";

// ── Types ─────────────────────────────────────────────────────────────────────

type DistributionType = "color" | "size" | "category" | "brand";
type TabMode = "count" | "revenue";

interface DistributionEntry {
  label: string;
  count: number;
  color?: string;
}

interface ColorDistributionWidgetProps {
  data?: DistributionEntry[];
  loading?: boolean;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_DATA: Record<DistributionType, DistributionEntry[]> = {
  color: [
    { label: "Black", count: 45, color: "#111827" },
    { label: "White", count: 32, color: "#f9fafb" },
    { label: "Gray", count: 18, color: "#9ca3af" },
    { label: "Blue", count: 12, color: "#3b82f6" },
    { label: "Red", count: 8, color: "#ef4444" },
    { label: "Green", count: 6, color: "#22c55e" },
    { label: "Beige", count: 5, color: "#d4b896" },
  ],
  size: [
    { label: "M", count: 38 },
    { label: "L", count: 34 },
    { label: "S", count: 28 },
    { label: "XL", count: 22 },
    { label: "XS", count: 15 },
    { label: "XXL", count: 10 },
  ],
  category: [
    { label: "Tops", count: 40 },
    { label: "Bottoms", count: 28 },
    { label: "Dresses", count: 22 },
    { label: "Footwear", count: 18 },
    { label: "Accessories", count: 14 },
    { label: "Outerwear", count: 10 },
  ],
  brand: [
    { label: "Nike", count: 35 },
    { label: "Adidas", count: 28 },
    { label: "Zara", count: 22 },
    { label: "H&M", count: 18 },
    { label: "Uniqlo", count: 14 },
  ],
};

const DISTRIBUTION_OPTIONS: { value: DistributionType; label: string }[] = [
  { value: "color", label: "Color Distribution" },
  { value: "size", label: "Size Distribution" },
  { value: "category", label: "Category Distribution" },
  { value: "brand", label: "Brand Distribution" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function ColorDistributionWidget({ loading = false }: ColorDistributionWidgetProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ApexCharts | null>(null);

  const [distributionType, setDistributionType] = useState<DistributionType>("color");
  const [activeTab, setActiveTab] = useState<TabMode>("count");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDark = resolvedTheme === "dark";
  const entries = MOCK_DATA[distributionType];
  const showRevenueOverlay = activeTab === "revenue";

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  // Build / rebuild chart
  useEffect(() => {
    if (!containerRef.current || loading || entries.length === 0) return;

    const labelColor = isDark ? "#9ca3af" : "#6b7280";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    const bgColor = isDark ? "transparent" : "#ffffff";

    const barColors = entries.map(
      (e, i) =>
        e.color ??
        ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#f97316"][i % 7]
    );

    const options: ApexCharts.ApexOptions = {
      chart: {
        type: "bar",
        height: 260,
        toolbar: { show: false },
        zoom: { enabled: false },
        background: bgColor,
        foreColor: labelColor,
        animations: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
          borderRadius: 3,
          barHeight: "65%",
          dataLabels: { position: "inside" },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => (val >= 5 ? `${Math.round(val)}%` : ""),
        style: { fontSize: "9px", fontWeight: "700", colors: ["#ffffff"] },
        offsetX: -4,
      },
      stroke: { show: false },
      series: [{ name: "Variant Count", data: entries.map((e) => e.count) }],
      xaxis: {
        categories: entries.map((e) => e.label),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: "11px", colors: labelColor } },
      },
      yaxis: {
        labels: { style: { fontSize: "11px", colors: labelColor } },
      },
      colors: barColors,
      legend: { show: false },
      grid: { borderColor: gridColor, strokeDashArray: 4 },
      tooltip: {
        theme: isDark ? "dark" : "light",
        y: { formatter: (val) => `${val} variants` },
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
  }, [entries, loading, isDark]);

  const selectedLabel =
    DISTRIBUTION_OPTIONS.find((o) => o.value === distributionType)?.label ?? "Color Distribution";

  return (
    <Card className="flex flex-col p-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Distribution</h3>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="Download image"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Export CSV"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <FileDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Distribution type selector */}
      <div ref={dropdownRef} className="relative mb-3">
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          className="inline-flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <span>{selectedLabel}</span>
          <ChevronDown
            className={`ml-2 h-3 w-3 shrink-0 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>
        {dropdownOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
            <div className="py-1">
              {DISTRIBUTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setDistributionType(opt.value); setDropdownOpen(false); }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors
                    ${opt.value === distributionType
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground hover:bg-muted"
                    }`}
                >
                  {opt.value === distributionType && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                  {opt.value !== distributionType && <span className="h-1.5 w-1.5" />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Color swatches row */}
      {distributionType === "color" && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">In results:</span>
          {entries.slice(0, 8).map((e) => (
            <span
              key={e.label}
              className="h-4 w-4 rounded-full border border-border/40"
              style={{ backgroundColor: e.color ?? "#9ca3af" }}
              title={e.label}
            />
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-3 flex gap-1 rounded-lg border border-border p-0.5">
        <button
          type="button"
          onClick={() => setActiveTab("count")}
          className={`flex-1 rounded-md py-1 text-xs font-medium transition-colors
            ${activeTab === "count"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Variant Count
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("revenue")}
          className={`flex-1 rounded-md py-1 text-xs font-medium transition-colors
            ${activeTab === "revenue"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Variant Sales Revenue
        </button>
      </div>

      {/* Chart area — always keep in DOM */}
      <div className="relative flex-1">
        <div ref={containerRef} style={{ minHeight: 260 }} />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        )}

        {!loading && entries.length === 0 && (
          <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            No distribution data.
          </p>
        )}

        {/* Coming Soon overlay for Revenue tab */}
        {showRevenueOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-card/60 backdrop-blur-sm">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">Coming Soon</span>
            <span className="text-[10px] text-muted-foreground">Sales revenue data not yet available</span>
          </div>
        )}
      </div>
    </Card>
  );
}
