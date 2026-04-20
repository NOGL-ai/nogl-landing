"use client";

import { LayoutGrid01 as LayoutGrid, RefreshCcw01 as RefreshCcw } from '@untitledui/icons';
import { useEffect, useMemo, useState } from "react";

import { Button } from '@/components/base/buttons/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CompanyPivotResponse,
  PivotColDimension,
  PivotDimension,
  PivotMetric,
} from "@/types/company";
import { fetchJson } from "./shared";

type PivotTabProps = { slug: string; active?: boolean };
type PivotState = { data: CompanyPivotResponse | null; error: string | null; loading: boolean };
type Period = "30d" | "90d" | "12mo" | "all";

const PRICE_RANGE_ORDER = ["0-50", "50-100", "100-250", "250-500", "500-1000", "1000+"];
const DISCOUNT_TIER_ORDER = ["No Discount", "1-10%", "10-25%", "25-50%", "50%+"];

function getPeriodRange(period: Period) {
  if (period === "all") return { from: null, to: null };
  const to = new Date();
  const from = new Date(to);
  if (period === "30d") from.setDate(from.getDate() - 30);
  if (period === "90d") from.setDate(from.getDate() - 90);
  if (period === "12mo") from.setFullYear(from.getFullYear() - 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

function formatValue(metric: PivotMetric, value: number | null) {
  if (value === null) return "—";
  if (metric === "count") return Math.round(value).toLocaleString();
  if (metric === "avg_discount") return `${value.toFixed(1)}%`;
  if (metric === "total_value") {
    return `€${value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `€${value.toFixed(2)}`;
}

function sortValues(values: string[], dimension: PivotDimension | PivotColDimension) {
  const items = [...values];
  if (dimension === "price_range") return items.sort((a, b) => PRICE_RANGE_ORDER.indexOf(a) - PRICE_RANGE_ORDER.indexOf(b));
  if (dimension === "discount_tier") return items.sort((a, b) => DISCOUNT_TIER_ORDER.indexOf(a) - DISCOUNT_TIER_ORDER.indexOf(b));
  return items.sort((a, b) => a.localeCompare(b));
}

function aggregate(metric: PivotMetric, values: number[]) {
  if (values.length === 0) return null;
  const sum = values.reduce((total, value) => total + value, 0);
  return metric === "avg_price" || metric === "avg_discount" ? sum / values.length : sum;
}

function PivotSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border-primary bg-bg-primary p-6 shadow-xs">
      <div className="animate-pulse space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-10 rounded-md bg-bg-tertiary animate-pulse" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, row) => (
            <div key={row} className="grid grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, col) => (
                <div key={col} className="h-10 rounded-md bg-bg-tertiary animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PivotTab({ slug }: PivotTabProps) {
  const [rowDimension, setRowDimension] = useState<PivotDimension>("category");
  const [colDimension, setColDimension] = useState<PivotColDimension>("month");
  const [metric, setMetric] = useState<PivotMetric>("count");
  const [period, setPeriod] = useState<Period>("all");
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<PivotState>({ data: null, error: null, loading: false });
  const periodRange = useMemo(() => getPeriodRange(period), [period]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState((current) => ({ ...current, loading: true, error: null }));
      try {
        const params = new URLSearchParams({ rowDimension, colDimension, metric });
        if (periodRange.from) params.set("from", periodRange.from);
        if (periodRange.to) params.set("to", periodRange.to);
        const data = await fetchJson<CompanyPivotResponse>(`/api/companies/${slug}/pivot?${params.toString()}`);
        if (!cancelled) setState({ data, error: null, loading: false });
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            error: error instanceof Error ? error.message : "Failed to load",
            loading: false,
          });
        }
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [slug, rowDimension, colDimension, metric, periodRange.from, periodRange.to, retryKey]);

  const matrix = useMemo(() => {
    if (!state.data) return null;
    const rows = sortValues(state.data.rows, rowDimension);
    const cols = sortValues(state.data.cols, colDimension);
    const values = state.data.cells.map((cell) => cell.value).sort((a, b) => a - b);
    const threshold = values.length ? values[Math.floor((values.length - 1) * 0.75)] ?? null : null;
    return {
      rows,
      cols,
      threshold,
      cellMap: new Map(state.data.cells.map((cell) => [`${cell.row}::${cell.col}`, cell.value])),
    };
  }, [state.data, rowDimension, colDimension]);

  const maxCellValue = useMemo(() => {
    if (!matrix) return 0;
    let max = 0;
    matrix.rows.forEach(row => {
      matrix.cols.forEach(col => {
        const v = matrix.cellMap.get(`${row}::${col}`);
        if (typeof v === 'number' && v > max) max = v;
      });
    });
    return max;
  }, [matrix]);

  const rowTotals = useMemo(() => new Map(
    matrix?.rows.map((row) => {
      const values = matrix.cols.map((col) => matrix.cellMap.get(`${row}::${col}`)).filter((value): value is number => typeof value === "number");
      return [row, aggregate(metric, values)];
    }) ?? []
  ), [matrix, metric]);

  const colTotals = useMemo(() => new Map(
    matrix?.cols.map((col) => {
      const values = matrix.rows.map((row) => matrix.cellMap.get(`${row}::${col}`)).filter((value): value is number => typeof value === "number");
      return [col, aggregate(metric, values)];
    }) ?? []
  ), [matrix, metric]);

  const grandTotal = useMemo(() => {
    const values = Array.from(rowTotals.values()).filter((value): value is number => typeof value === "number");
    return aggregate(metric, values);
  }, [metric, rowTotals]);

  function getCellHeatStyle(value: number | null, max: number): { bg: string; text: string } {
    if (value === null || max === 0) return { bg: '', text: 'text-text-primary' };
    const ratio = value / max;
    if (ratio >= 0.8) return { bg: 'bg-brand-700', text: 'text-white' };
    if (ratio >= 0.6) return { bg: 'bg-brand-600', text: 'text-white' };
    if (ratio >= 0.4) return { bg: 'bg-brand-500', text: 'text-white' };
    if (ratio >= 0.2) return { bg: 'bg-brand-100', text: 'text-text-brand' };
    if (ratio >= 0.05) return { bg: 'bg-brand-50', text: 'text-text-brand' };
    return { bg: '', text: 'text-text-primary' };
  }

  const handleRetry = () => {
    setRetryKey((current) => current + 1);
  };

  if (state.loading && !state.data) return <PivotSkeleton />;

  if (state.error) {
    return (
      <div className="space-y-4 rounded-xl border border-border-primary bg-bg-secondary p-6">
        <div className="text-sm text-text-error">Failed to load</div>
        <Button color="secondary" onClick={handleRetry}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const PIVOT_PRESETS: Array<{ label: string; row: PivotDimension; col: PivotColDimension; metric: PivotMetric }> = [
    { label: "Category Overview",  row: "category",      col: "month",         metric: "count" },
    { label: "Price Analysis",     row: "price_range",   col: "discount_tier", metric: "count" },
    { label: "Discount Breakdown", row: "discount_tier", col: "price_range",   metric: "count" },
    { label: "Brand by Price",     row: "brand",         col: "price_range",   metric: "count" },
    { label: "Monthly Avg Price",  row: "category",      col: "month",         metric: "avg_price" },
  ];

  function getPivotTitle(row: PivotDimension, col: PivotColDimension): string {
    const labels: Record<string, string> = {
      category: "Category", brand: "Brand", price_range: "Price Range", discount_tier: "Discount Tier",
      month: "Month", week: "Week",
    };
    return `${labels[row] ?? row} / ${labels[col] ?? col} Pivot`;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{getPivotTitle(rowDimension, colDimension)}</h2>
          <p className="text-sm text-text-tertiary">Click a cell to drill into data</p>
        </div>
      </div>

      {/* Presets */}
      <div>
        <p className="mb-2 text-sm text-text-tertiary">
          <span className="font-medium">Presets</span>{" "}
          Apply a preset configuration to quickly set controls for common use cases:
        </p>
        <div className="flex flex-wrap gap-2">
          {PIVOT_PRESETS.map((preset) => {
            const isActive = preset.row === rowDimension && preset.col === colDimension && preset.metric === metric;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setRowDimension(preset.row);
                  setColDimension(preset.col);
                  setMetric(preset.metric);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium shadow-xs transition-colors ${
                  isActive
                    ? 'border-border-brand bg-brand-50 text-text-brand-secondary'
                    : 'border-border-primary bg-bg-primary text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-border-primary bg-bg-secondary p-4 shadow-xs">
        <div className="mb-3 flex items-center gap-3 font-mono text-xs text-text-tertiary">
          <span>Row: <strong className="font-semibold text-text-secondary">{rowDimension.replace('_', ' ')}</strong></span>
          <span className="text-text-disabled">·</span>
          <span>Col: <strong className="font-semibold text-text-secondary">{colDimension.replace('_', ' ')}</strong></span>
          <span className="text-text-disabled">·</span>
          <span>Metric: <strong className="font-semibold text-text-secondary">{metric.replace('_', ' ')}</strong></span>
        </div>
        <div className="grid gap-3 xl:grid-cols-4">
          <Select value={rowDimension} onValueChange={(value: PivotDimension) => setRowDimension(value)}>
            <SelectTrigger><SelectValue placeholder="Row" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="category">Row: Category</SelectItem>
              <SelectItem value="brand">Row: Brand</SelectItem>
              <SelectItem value="price_range">Row: Price Range</SelectItem>
              <SelectItem value="discount_tier">Row: Discount Tier</SelectItem>
            </SelectContent>
          </Select>
          <Select value={colDimension} onValueChange={(value: PivotColDimension) => setColDimension(value)}>
            <SelectTrigger><SelectValue placeholder="Col" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Col: Month</SelectItem>
              <SelectItem value="week">Col: Week</SelectItem>
              <SelectItem value="price_range">Col: Price Range</SelectItem>
              <SelectItem value="discount_tier">Col: Discount Tier</SelectItem>
            </SelectContent>
          </Select>
          <Select value={metric} onValueChange={(value: PivotMetric) => setMetric(value)}>
            <SelectTrigger><SelectValue placeholder="Metric" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="count">Metric: Count</SelectItem>
              <SelectItem value="avg_price">Metric: Avg Price</SelectItem>
              <SelectItem value="avg_discount">Metric: Avg Discount</SelectItem>
              <SelectItem value="total_value">Metric: Total Value</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
            <SelectTrigger><SelectValue placeholder="Period" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Period: Last 30d</SelectItem>
              <SelectItem value="90d">Period: Last 90d</SelectItem>
              <SelectItem value="12mo">Period: Last 12mo</SelectItem>
              <SelectItem value="all">Period: All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {state.data && matrix && matrix.rows.length === 0 && (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-border-primary bg-bg-secondary p-8 text-text-tertiary">
          <LayoutGrid className="h-5 w-5" />
          <span>No pivot data for this company</span>
        </div>
      )}

      {state.data && matrix && matrix.rows.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border-primary bg-bg-primary shadow-xs">
          <div className="max-h-[500px] overflow-x-auto overflow-y-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="sticky top-0 z-20 bg-bg-primary">
                <tr>
                  <th className="sticky left-0 z-30 min-w-[180px] border-b border-border-primary bg-bg-primary px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary">Row</th>
                  {matrix.cols.map((col) => (
                    <th key={col} className="border-b border-border-primary bg-bg-primary px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary">{col}</th>
                  ))}
                  <th className="border-b border-border-primary bg-bg-primary px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary">Total</th>
                </tr>
              </thead>
              <tbody>
                {matrix.rows.map((row) => (
                  <tr key={row}>
                    <td className="sticky left-0 z-10 min-w-[180px] border-b border-border-primary bg-bg-primary px-4 py-3 text-sm font-medium text-text-primary">{row}</td>
                    {matrix.cols.map((col) => {
                      const value = matrix.cellMap.get(`${row}::${col}`) ?? null;
                      const heat = getCellHeatStyle(value, maxCellValue);
                      return (
                        <td
                          key={`${row}-${col}`}
                          className={`border-b border-border-primary px-4 py-3 text-right tabular-nums transition-colors ${
                            heat.bg
                              ? `${heat.bg} font-semibold ${heat.text}`
                              : value === null
                                ? 'text-text-disabled'
                                : 'text-text-primary'
                          }`}
                        >
                          {formatValue(metric, value)}
                        </td>
                      );
                    })}
                    <td className="border-b border-border-primary px-4 py-3 text-right tabular-nums font-semibold text-text-primary">{formatValue(metric, rowTotals.get(row) ?? null)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="sticky left-0 z-10 min-w-[180px] border-t border-border-primary bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-primary">Total</td>
                  {matrix.cols.map((col) => (
                    <td key={`total-${col}`} className="border-t border-border-primary bg-bg-secondary px-4 py-3 text-right tabular-nums font-semibold text-text-primary">{formatValue(metric, colTotals.get(col) ?? null)}</td>
                  ))}
                  <td className="border-t border-border-primary bg-bg-secondary px-4 py-3 text-right tabular-nums font-semibold text-text-primary">{formatValue(metric, grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
