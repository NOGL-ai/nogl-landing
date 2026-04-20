"use client";
import { RefreshCcw01 as RefreshCcw, Table as Table2 } from '@untitledui/icons';


import { RefreshCcw01 as RefreshCcw, Table as Table2 } from '@untitledui/icons';



import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from '@/components/base/buttons/button';
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CompanyPivotResponse } from "@/types/company";
import { fetchJson, InlineError } from "@/components/companies/tabs/shared";

type PivotTabProps = {
  slug: string;
  active: boolean;
};

type PivotState = {
  data: CompanyPivotResponse | null;
  error: string | null;
  loading: boolean;
};

type QuickRange = "30d" | "90d" | "12mo" | "all";

type PivotControls = {
  rowDimension: "category" | "brand" | "price_range" | "discount_tier";
  colDimension: "month" | "week" | "price_range" | "discount_tier";
  metric: "count" | "avg_price" | "avg_discount" | "total_value";
  range: QuickRange;
};

const DEFAULT_CONTROLS: PivotControls = {
  rowDimension: "category",
  colDimension: "month",
  metric: "count",
  range: "all",
};

function getDateRange(range: QuickRange): { from: string | null; to: string | null } {
  if (range === "all") {
    return { from: null, to: null };
  }

  const to = new Date();
  const from = new Date(to);

  if (range === "30d") from.setDate(from.getDate() - 30);
  if (range === "90d") from.setDate(from.getDate() - 90);
  if (range === "12mo") from.setFullYear(from.getFullYear() - 1);

  return { from: from.toISOString(), to: to.toISOString() };
}

function formatMetricValue(metric: PivotControls["metric"], value: number | null): string {
  if (value === null) {
    return "—";
  }

  if (metric === "count") {
    return Math.round(value).toLocaleString();
  }

  if (metric === "avg_discount") {
    return `${value.toFixed(1)}%`;
  }

  return `€${value.toFixed(2)}`;
}

function PivotSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="animate-pulse space-y-4 p-6">
        <div className="grid gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-10 rounded-md bg-muted" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-10 rounded-md bg-muted" />
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 rounded-md bg-muted" />
          ))}
        </div>
      </div>
    </Card>
  );
}

export function PivotTab({ slug, active }: PivotTabProps) {
  const fetchedRef = useRef<string | null>(null);
  const [controls, setControls] = useState<PivotControls>(DEFAULT_CONTROLS);
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<PivotState>({ data: null, error: null, loading: false });

  const dateRange = useMemo(() => getDateRange(controls.range), [controls.range]);
  const requestKey = JSON.stringify({ slug, ...controls, ...dateRange, retryKey });

  useEffect(() => {
    if (!active || fetchedRef.current === requestKey) {
      return;
    }

    fetchedRef.current = requestKey;
    let cancelled = false;

    async function load() {
      setState((current) => ({ ...current, loading: true, error: null }));

      try {
        const params = new URLSearchParams({
          rowDimension: controls.rowDimension,
          colDimension: controls.colDimension,
          metric: controls.metric,
        });

        if (dateRange.from) params.set("from", dateRange.from);
        if (dateRange.to) params.set("to", dateRange.to);

        const data = await fetchJson<CompanyPivotResponse>(
          `/api/companies/${slug}/pivot?${params.toString()}`
        );

        if (!cancelled) {
          setState({ data, error: null, loading: false });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            error: error instanceof Error ? error.message : "Failed to load pivot data.",
            loading: false,
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [active, controls, dateRange, requestKey, slug]);

  const matrix = useMemo(() => {
    if (!state.data) {
      return null;
    }

    const cellMap = new Map(state.data.cells.map((cell) => [`${cell.row}::${cell.col}`, cell.value]));
    const rowTotals = new Map<string, number>();
    const colTotals = new Map<string, number>();
    const values = state.data.cells.map((cell) => cell.value).sort((valueA, valueB) => valueA - valueB);
    const quartileThreshold =
      values.length > 0 ? values[Math.floor((values.length - 1) * 0.75)] ?? null : null;

    for (const cell of state.data.cells) {
      rowTotals.set(cell.row, (rowTotals.get(cell.row) ?? 0) + cell.value);
      colTotals.set(cell.col, (colTotals.get(cell.col) ?? 0) + cell.value);
    }

    return { cellMap, rowTotals, colTotals, quartileThreshold };
  }, [state.data]);

  const pivotData = state.data;

  const setControl = <K extends keyof PivotControls>(key: K, value: PivotControls[K]) => {
    setControls((current) => ({ ...current, [key]: value }));
  };

  const handleRetry = () => {
    fetchedRef.current = null;
    setRetryKey((current) => current + 1);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
          <Select
            value={controls.rowDimension}
            onValueChange={(value: PivotControls["rowDimension"]) => setControl("rowDimension", value)}
          >
            <SelectTrigger><SelectValue placeholder="Row dimension" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="category">Row: Category</SelectItem>
              <SelectItem value="brand">Row: Brand</SelectItem>
              <SelectItem value="price_range">Row: Price Range</SelectItem>
              <SelectItem value="discount_tier">Row: Discount Tier</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={controls.colDimension}
            onValueChange={(value: PivotControls["colDimension"]) => setControl("colDimension", value)}
          >
            <SelectTrigger><SelectValue placeholder="Column dimension" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Col: Month</SelectItem>
              <SelectItem value="week">Col: Week</SelectItem>
              <SelectItem value="price_range">Col: Price Range</SelectItem>
              <SelectItem value="discount_tier">Col: Discount Tier</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={controls.metric}
            onValueChange={(value: PivotControls["metric"]) => setControl("metric", value)}
          >
            <SelectTrigger><SelectValue placeholder="Metric" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="count">Metric: Count</SelectItem>
              <SelectItem value="avg_price">Metric: Avg Price</SelectItem>
              <SelectItem value="avg_discount">Metric: Avg Discount</SelectItem>
              <SelectItem value="total_value">Metric: Total Value</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex flex-wrap gap-2">
            {([
              ["30d", "Last 30d"],
              ["90d", "Last 90d"],
              ["12mo", "Last 12mo"],
              ["all", "All time"],
            ] as const).map(([value, label]) => (
              <Button
                key={value}
                color={controls.range === value ? "primary" : "secondary"}
                size="sm"
                onClick={() => setControl("range", value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {state.loading && !state.data ? <PivotSkeleton /> : null}

      {state.error ? (
        <Card className="space-y-4 p-6">
          <InlineError message="Failed to load pivot data" />
          <Button color="secondary" onClick={handleRetry}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </Card>
      ) : null}

      {!state.loading && !state.error && pivotData && pivotData.rows.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center">
          <Table2 className="h-10 w-10 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">No pivot data available</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different dimension combination or widen the date range.
            </p>
          </div>
        </Card>
      ) : null}

      {!state.loading && !state.error && pivotData && matrix ? (
        <Card className="overflow-hidden">
          <div className="overflow-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="bg-muted/40">
                  <th className="sticky left-0 z-10 border-b border-border bg-background px-4 py-3 text-left font-semibold">
                    {pivotData.meta.rowDimension.replace("_", " ")}
                  </th>
                  {pivotData.cols.map((col) => (
                    <th key={col} className="border-b border-border px-4 py-3 text-right font-semibold">
                      {col}
                    </th>
                  ))}
                  <th className="border-b border-border px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {pivotData.rows.map((row) => (
                  <tr key={row}>
                    <td className="sticky left-0 z-10 border-b border-border bg-background px-4 py-3 font-medium text-foreground">
                      {row}
                    </td>
                    {pivotData.cols.map((col) => {
                      const value = matrix.cellMap.get(`${row}::${col}`) ?? null;
                      const highlight = value !== null && matrix.quartileThreshold !== null && value >= matrix.quartileThreshold;

                      return (
                        <td
                          key={`${row}-${col}`}
                          className={`border-b border-border px-4 py-3 text-right ${
                            highlight ? "bg-primary/10 text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {formatMetricValue(controls.metric, value)}
                        </td>
                      );
                    })}
                    <td className="border-b border-border px-4 py-3 text-right font-semibold text-foreground">
                      {formatMetricValue(controls.metric, matrix.rowTotals.get(row) ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/30">
                  <td className="sticky left-0 z-10 border-t border-border bg-background px-4 py-3 font-semibold text-foreground">
                    Total
                  </td>
                  {pivotData.cols.map((col) => (
                    <td key={`total-${col}`} className="border-t border-border px-4 py-3 text-right font-semibold text-foreground">
                      {formatMetricValue(controls.metric, matrix.colTotals.get(col) ?? 0)}
                    </td>
                  ))}
                  <td className="border-t border-border px-4 py-3 text-right font-semibold text-foreground">
                    {formatMetricValue(
                      controls.metric,
                      Array.from(matrix.rowTotals.values()).reduce((sum, value) => sum + value, 0)
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}