"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
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

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  alert: AlertRow | null;
  onClose: () => void;
  audience: AlertAudience;
}

const CFO_WAREHOUSES = ["Example Warehouse 1", "Example Warehouse 2"];
const CMO_CHART_TABS = ["Price History", "Stock History", "Ad Creative Timeline"];

// Generate demo chart data
function generateCfoChartData(days = 90) {
  const categories: string[] = [];
  const inventory: number[] = [];
  const safetyBuffer: number[] = [];
  const reorderReminder: number[] = [];
  const reorderThreshold: number[] = [];
  const overstockThreshold: number[] = [];

  const start = new Date();
  start.setDate(start.getDate() - days);

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    categories.push(d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }));

    const base = 5000 - i * 40 + Math.sin(i / 7) * 300;
    inventory.push(Math.max(0, Math.round(base + Math.random() * 200)));
    safetyBuffer.push(800);
    reorderReminder.push(1200);
    reorderThreshold.push(600);
    overstockThreshold.push(7000);
  }

  return { categories, inventory, safetyBuffer, reorderReminder, reorderThreshold, overstockThreshold };
}

function generateCmoChartData(days = 90) {
  const categories: string[] = [];
  const myPrice: number[] = [];
  const competitorPrice: number[] = [];

  const start = new Date();
  start.setDate(start.getDate() - days);

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    categories.push(d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }));
    myPrice.push(Math.round(149 + Math.sin(i / 15) * 5 + Math.random() * 2));
    competitorPrice.push(Math.round(139 + Math.cos(i / 12) * 8 + Math.random() * 3));
  }

  return { categories, myPrice, competitorPrice };
}

export function InventoryChartModal({ alert, onClose, audience }: Props) {
  const [activeWarehouse, setActiveWarehouse] = useState(0);
  const [showHistory, setShowHistory] = useState(true);
  const [activeCmoTab, setActiveCmoTab] = useState(0);

  const meta = (alert?.metadata ?? {}) as Record<string, unknown>;

  const cfoData = generateCfoChartData();
  const cmoData = generateCmoChartData();

  const cfoSeries = [
    { name: "Inventory", data: cfoData.inventory, color: "#2563EB" },
    { name: "Safety Buffer", data: cfoData.safetyBuffer, color: "#16A34A" },
    { name: "Reorder Reminder", data: cfoData.reorderReminder, color: "#D97706" },
    { name: "Reorder Threshold", data: cfoData.reorderThreshold, color: "#DC2626" },
    { name: "Overstock Threshold", data: cfoData.overstockThreshold, color: "#9333EA" },
  ];

  const cmoSeries = [
    { name: "My Price", data: cmoData.myPrice, color: "#2563EB" },
    { name: "Competitor Price", data: cmoData.competitorPrice, color: "#DC2626" },
  ];

  const chartOptions = (categories: string[], colors: string[]): ApexCharts.ApexOptions => ({
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
      fontFamily: "inherit",
    },
    stroke: {
      width: [2.5, 1.5, 1.5, 1.5, 1.5],
      dashArray: [0, 4, 4, 4, 4],
      curve: "smooth",
    },
    xaxis: {
      categories,
      tickAmount: 8,
      labels: {
        style: { fontSize: "11px", colors: ["#667085"] },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "11px", colors: ["#667085"] },
        formatter: (v: number) => v.toLocaleString(),
      },
    },
    colors,
    grid: {
      borderColor: "#EAECF0",
      strokeDashArray: 4,
    },
    legend: { show: false },
    tooltip: {
      theme: "light",
      y: { formatter: (v: number) => v.toLocaleString() },
    },
  });

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
                {(audience === "CFO" ? cfoSeries : cmoSeries).map((s) => (
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
                <ApexChart
                  type="line"
                  height="100%"
                  series={
                    audience === "CFO"
                      ? cfoSeries.map(({ name, data }) => ({ name, data }))
                      : cmoSeries.map(({ name, data }) => ({ name, data }))
                  }
                  options={chartOptions(
                    audience === "CFO" ? cfoData.categories : cmoData.categories,
                    audience === "CFO"
                      ? cfoSeries.map((s) => s.color)
                      : cmoSeries.map((s) => s.color),
                  )}
                />
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
