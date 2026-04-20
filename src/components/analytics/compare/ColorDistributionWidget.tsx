"use client";
import { Download01 as Download, FileDownload01 as FileDown, Lock01 as Lock, ChevronDown } from '@untitledui/icons';

import { Download01 as Download, FileDownload01 as FileDown, Lock01 as Lock, ChevronDown } from '@untitledui/icons';

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";


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
    { label: "Gray",  count: 18, color: "#9ca3af" },
    { label: "Blue",  count: 12, color: "#3b82f6" },
    { label: "Red",   count: 8,  color: "#ef4444" },
    { label: "Green", count: 6,  color: "#22c55e" },
    { label: "Beige", count: 5,  color: "#d4b896" },
  ],
  size: [
    { label: "M",   count: 38 },
    { label: "L",   count: 34 },
    { label: "S",   count: 28 },
    { label: "XL",  count: 22 },
    { label: "XS",  count: 15 },
    { label: "XXL", count: 10 },
  ],
  category: [
    { label: "Tops",        count: 40 },
    { label: "Bottoms",     count: 28 },
    { label: "Dresses",     count: 22 },
    { label: "Footwear",    count: 18 },
    { label: "Accessories", count: 14 },
    { label: "Outerwear",   count: 10 },
  ],
  brand: [
    { label: "Nike",   count: 35 },
    { label: "Adidas", count: 28 },
    { label: "Zara",   count: 22 },
    { label: "H&M",    count: 18 },
    { label: "Uniqlo", count: 14 },
  ],
};

const FALLBACK_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#f97316"];

const DISTRIBUTION_OPTIONS: { value: DistributionType; label: string }[] = [
  { value: "color",    label: "Color Distribution"    },
  { value: "size",     label: "Size Distribution"     },
  { value: "category", label: "Category Distribution" },
  { value: "brand",    label: "Brand Distribution"    },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function ColorDistributionWidget({ loading = false }: ColorDistributionWidgetProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [distributionType, setDistributionType] = useState<DistributionType>("color");
  const [activeTab, setActiveTab]               = useState<TabMode>("count");
  const [dropdownOpen, setDropdownOpen]         = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const entries = MOCK_DATA[distributionType];
  const showRevenueOverlay = activeTab === "revenue";

  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const chartData = entries.map((e, i) => ({
    label: e.label,
    count: e.count,
    fill: e.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));

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

  const selectedLabel =
    DISTRIBUTION_OPTIONS.find((o) => o.value === distributionType)?.label ?? "Color Distribution";

  return (
    <Card className="flex flex-col p-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Distribution</h3>
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
                  <span className={`h-1.5 w-1.5 rounded-full ${opt.value === distributionType ? "bg-primary" : ""}`} />
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

      {/* Chart area */}
      <div className="relative flex-1" style={{ minHeight: 260 }}>
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
        {!loading && entries.length > 0 && (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke={gridColor} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: textColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: textColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  background: isDark ? "#111827" : "#ffffff",
                  border: `1px solid ${gridColor}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: textColor }}
                formatter={(value) => [`${value as number} variants`, "Count"] as [string, string]}
              />
              <Bar dataKey="count" radius={[0, 3, 3, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="count"
                  position="insideRight"
                  formatter={(value: unknown) => {
                    const v = value as number;
                    return v >= 5 ? `${Math.round(v)}%` : "";
                  }}
                  style={{ fill: "#ffffff", fontSize: 9, fontWeight: 700 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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