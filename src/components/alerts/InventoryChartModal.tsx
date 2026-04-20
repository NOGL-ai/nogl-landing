"use client";

import React, { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import type { AlertAudience } from "@prisma/client";
import type { AlertRow } from "@/actions/alerts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Package,
  Tag01,
  CalendarDate,
  ClockRefresh,
  BarChart02,
  TrendUp01,
} from "@untitledui/icons";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  alert: AlertRow | null;
  onClose: () => void;
  audience: AlertAudience;
}

interface CfoSeries {
  name: string;
  color: string;
  dataKey: keyof CfoDatum;
  dashed?: boolean;
}

interface CmoSeries {
  name: string;
  color: string;
  dataKey: keyof CmoDatum;
}

interface CfoDatum {
  date: string;
  inventory: number;
  safetyBuffer: number;
  reorderReminder: number;
  reorderThreshold: number;
  overstockThreshold: number;
}

interface CmoDatum {
  date: string;
  myPrice: number;
  competitorPrice: number;
}

const CFO_WAREHOUSES = ["Example Warehouse 1", "Example Warehouse 2"];
const CMO_CHART_TABS = ["Price History", "Stock History", "Ad Creative Timeline"];

const CFO_SERIES: readonly CfoSeries[] = [
  { name: "Inventory",           color: "#2563EB", dataKey: "inventory" },
  { name: "Safety Buffer",       color: "#16A34A", dataKey: "safetyBuffer",       dashed: true },
  { name: "Reorder Reminder",    color: "#D97706", dataKey: "reorderReminder",    dashed: true },
  { name: "Reorder Threshold",   color: "#DC2626", dataKey: "reorderThreshold",   dashed: true },
  { name: "Overstock Threshold", color: "#9333EA", dataKey: "overstockThreshold", dashed: true },
] as const;

const CMO_SERIES: readonly CmoSeries[] = [
  { name: "My Price",         color: "#2563EB", dataKey: "myPrice" },
  { name: "Competitor Price", color: "#DC2626", dataKey: "competitorPrice" },
] as const;

// Generate demo chart data
function generateCfoChartData(days = 90): CfoDatum[] {
  const data: CfoDatum[] = [];
  const start = new Date();
  start.setDate(start.getDate() - days);

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const base = 5000 - i * 40 + Math.sin(i / 7) * 300;
    data.push({
      date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }),
      inventory: Math.max(0, Math.round(base + Math.random() * 200)),
      safetyBuffer: 800,
      reorderReminder: 1200,
      reorderThreshold: 600,
      overstockThreshold: 7000,
    });
  }
  return data;
}

function generateCmoChartData(days = 90): CmoDatum[] {
  const data: CmoDatum[] = [];
  const start = new Date();
  start.setDate(start.getDate() - days);

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    data.push({
      date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }),
      myPrice: Math.round(149 + Math.sin(i / 15) * 5 + Math.random() * 2),
      competitorPrice: Math.round(139 + Math.cos(i / 12) * 8 + Math.random() * 3),
    });
  }
  return data;
}

export function InventoryChartModal({ alert, onClose, audience }: Props) {
  const [activeWarehouse, setActiveWarehouse] = useState(0);
  const [showHistory, setShowHistory] = useState(true);
  const [activeCmoTab, setActiveCmoTab] = useState(0);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const textColor = isDark ? "#9CA3AF" : "#667085";
  const gridColor = isDark ? "#1F2937" : "#EAECF0";

  const meta = (alert?.metadata ?? {}) as Record<string, unknown>;

  const cfoData = useMemo(() => generateCfoChartData(), []);
  const cmoData = useMemo(() => generateCmoChartData(), []);

  // Sparse ticks — only show every Nth label so the X axis stays readable.
  const xTickInterval = Math.max(0, Math.floor((audience === "CFO" ? cfoData.length : cmoData.length) / 8) - 1);

  const formatNumber = (v: number) => v.toLocaleString();

  return (
    <Dialog open={!!alert} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        {alert && (
          <div className="flex h-[600px]">
            {/* Left sidebar */}
            <div className="w-56 border-r border-border p-5 flex-shrink-0 bg-utility-gray-50 dark:bg-utility-gray-900 overflow-y-auto">
              <div className="size-16 rounded-xl border border-border bg-background overflow-hidden mb-3">
                {meta.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={meta.imageUrl as string} alt="" className="size-full object-cover" />
                ) : (
                  <Package className="size-7 m-4.5 text-tertiary" />
                )}
              </div>
              <p className="font-semibold text-sm text-foreground leading-snug">
                {(meta.productTitle as string | undefined) ?? "Product"}
              </p>

              <div className="mt-4 space-y-2.5 text-xs text-tertiary">
                {meta.sku != null && (
                  <div className="flex items-center gap-1.5">
                    <Tag01 className="size-3.5 flex-shrink-0" />
                    <span className="font-mono">{String(meta.sku)}</span>
                  </div>
                )}
                {audience === "CFO" && meta.supplierLeadDays != null && (
                  <div className="flex items-center gap-1.5">
                    <ClockRefresh className="size-3.5 flex-shrink-0" />
                    Lead time: {String(meta.supplierLeadDays)}d
                  </div>
                )}
                {meta.reorderBy != null && (
                  <div className="flex items-center gap-1.5">
                    <CalendarDate className="size-3.5 flex-shrink-0" />
                    Reorder by:{" "}
                    {new Date(String(meta.reorderBy)).toLocaleDateString("en-GB")}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="mt-5 pt-4 border-t border-border space-y-2">
                <p className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-2">
                  Legend
                </p>
                {(audience === "CFO" ? CFO_SERIES : CMO_SERIES).map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs text-secondary">
                    <span
                      className="size-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Right main area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
                <DialogTitle className="text-base font-semibold flex items-center gap-2">
                  {audience === "CFO" ? (
                    <BarChart02 className="size-4 text-tertiary" />
                  ) : (
                    <TrendUp01 className="size-4 text-tertiary" />
                  )}
                  {audience === "CFO" ? "Inventory Chart" : "Price History"}
                </DialogTitle>
              </DialogHeader>

              {/* Warehouse / tab pills */}
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-border">
                <div className="flex gap-1.5">
                  {(audience === "CFO" ? CFO_WAREHOUSES : CMO_CHART_TABS).map((name, i) => (
                    <button
                      key={name}
                      onClick={() =>
                        audience === "CFO"
                          ? setActiveWarehouse(i)
                          : setActiveCmoTab(i)
                      }
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                        (audience === "CFO" ? activeWarehouse : activeCmoTab) === i
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                          : "text-tertiary hover:text-secondary",
                      )}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                {audience === "CFO" && (
                  <div className="flex items-center gap-3 text-xs text-secondary">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="chartMode"
                        checked={showHistory}
                        onChange={() => setShowHistory(true)}
                        className="accent-brand-600"
                      />
                      Show History
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="chartMode"
                        checked={!showHistory}
                        onChange={() => setShowHistory(false)}
                        className="accent-brand-600"
                      />
                      Show Unfulfilled Preorders
                    </label>
                  </div>
                )}
              </div>

              {/* Chart */}
              <div className="flex-1 px-4 pt-3 pb-2 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  {audience === "CFO" ? (
                    <LineChart
                      data={cfoData}
                      margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid
                        stroke={gridColor}
                        strokeDasharray="4 4"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        interval={xTickInterval}
                        tick={{ fill: textColor, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: textColor, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={formatNumber}
                        width={56}
                      />
                      <Tooltip
                        contentStyle={{
                          background: isDark ? "#111827" : "#ffffff",
                          border: `1px solid ${gridColor}`,
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: textColor }}
                        formatter={(value, name) =>
                          [formatNumber(value as number), String(name)] as [string, string]
                        }
                      />
                      {CFO_SERIES.map((s) => (
                        <Line
                          key={s.dataKey}
                          type="monotone"
                          dataKey={s.dataKey}
                          name={s.name}
                          stroke={s.color}
                          strokeWidth={s.dashed ? 1.5 : 2.5}
                          strokeDasharray={s.dashed ? "4 4" : undefined}
                          dot={false}
                          activeDot={s.dashed ? false : { r: 4 }}
                          isAnimationActive={false}
                        />
                      ))}
                    </LineChart>
                  ) : (
                    <LineChart
                      data={cmoData}
                      margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid
                        stroke={gridColor}
                        strokeDasharray="4 4"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        interval={xTickInterval}
                        tick={{ fill: textColor, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: textColor, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={formatNumber}
                        width={56}
                      />
                      <Tooltip
                        contentStyle={{
                          background: isDark ? "#111827" : "#ffffff",
                          border: `1px solid ${gridColor}`,
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: textColor }}
                        formatter={(value, name) =>
                          [formatNumber(value as number), String(name)] as [string, string]
                        }
                      />
                      {CMO_SERIES.map((s) => (
                        <Line
                          key={s.dataKey}
                          type="monotone"
                          dataKey={s.dataKey}
                          name={s.name}
                          stroke={s.color}
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 4 }}
                          isAnimationActive={false}
                        />
                      ))}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Out of stock events */}
              {audience === "CFO" && (
                <div className="px-5 pb-4 border-t border-border pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-tertiary mb-2">
                    Out of Stock Events
                  </p>
                  <div className="text-sm text-secondary italic">
                    No recent out-of-stock events recorded.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
