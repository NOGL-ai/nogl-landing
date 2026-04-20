"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfDay } from "date-fns";

import {
  FORECAST_CHANNELS,
  FORECAST_HISTORY_DAYS,
  FORECAST_HORIZON_DAYS,
  FORECAST_QUANTILES,
  type ForecastChannelName,
  type ForecastQuantile,
  type ForecastScale,
  type ForecastMetric,
} from "@/config/forecast";
import {
  getForecastCategories,
  getForecastRevenue,
  getForecastSales,
  getForecastSummary,
  type ForecastCategoryDTO,
  type ForecastResponse,
  type ForecastSummaryDTO,
} from "@/actions/forecast";
import { cx } from "@/utils/cx";
import { ForecastChart } from "./ForecastChart";

interface DemandClientProps {
  companyId: string;
  companyName: string;
  companyDomain: string;
  isDemoTenant: boolean;
}

const ALL_CHANNEL_NAMES: readonly ForecastChannelName[] = FORECAST_CHANNELS.map((c) => c.name);

export function DemandClient({
  companyId,
  companyName,
  companyDomain,
  isDemoTenant,
}: DemandClientProps) {
  // ─── State ────────────────────────────────────────────────────────────
  const today = startOfDay(new Date());
  const [startDate] = useState(() => addDays(today, -FORECAST_HISTORY_DAYS));
  const [endDate] = useState(() => addDays(today, FORECAST_HORIZON_DAYS));
  const [metric, setMetric] = useState<ForecastMetric>("sale");
  const [scale, setScale] = useState<ForecastScale>("daily");
  const [quantile, setQuantile] = useState<ForecastQuantile>(4);
  const [activeChannels, setActiveChannels] = useState<ReadonlySet<ForecastChannelName>>(
    () => new Set(ALL_CHANNEL_NAMES),
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // ─── Data ─────────────────────────────────────────────────────────────
  const summaryQuery = useQuery<ForecastSummaryDTO>({
    queryKey: ["forecast-summary", companyId],
    queryFn: () => getForecastSummary(companyId),
    staleTime: 60_000,
  });

  const categoriesQuery = useQuery<ForecastCategoryDTO[]>({
    queryKey: ["forecast-categories", companyId],
    queryFn: () => getForecastCategories(companyId),
    staleTime: 60_000,
  });

  const timeseriesQuery = useQuery<ForecastResponse>({
    queryKey: [
      "forecast-timeseries",
      companyId,
      metric,
      scale,
      quantile,
      activeCategory,
      Array.from(activeChannels).sort().join(","),
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () => {
      const params = {
        companyId,
        startDate,
        endDate,
        channels: Array.from(activeChannels),
        categories: activeCategory ? [activeCategory] : undefined,
        quantile,
        scale,
      };
      return metric === "sale" ? getForecastSales(params) : getForecastRevenue(params);
    },
    staleTime: 60_000,
  });

  // ─── Derived ──────────────────────────────────────────────────────────
  const categories = categoriesQuery.data ?? [];
  const timeseries = timeseriesQuery.data;
  const summary = summaryQuery.data;

  const kpis = useMemo(
    () => [
      { label: "Total Products", value: summary?.totalProducts?.toLocaleString() ?? "—" },
      {
        label: "Avg Price (€)",
        value: summary ? `€${summary.avgRrp.toFixed(2)}` : "—",
      },
      { label: "Channels", value: summary?.channels?.toString() ?? "—" },
    ],
    [summary],
  );

  // ─── Handlers ─────────────────────────────────────────────────────────
  const toggleChannel = (name: ForecastChannelName) => {
    setActiveChannels((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        // Keep at least one channel active
        if (next.size === 1) return prev;
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-secondary p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Demand forecast</h1>
            <p className="text-sm text-text-secondary">
              {companyName}{" "}
              <span className="text-text-tertiary">· {companyDomain}</span>
              {isDemoTenant ? (
                <span className="ml-2 rounded-full bg-bg-brand-secondary px-2 py-0.5 text-xs font-medium text-brand-secondary">
                  demo data
                </span>
              ) : null}
            </p>
          </div>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-border-primary bg-background p-4"
            >
              <div className="text-xs uppercase tracking-wide text-text-tertiary">{kpi.label}</div>
              <div className="mt-1 text-2xl font-semibold text-text-primary">{kpi.value}</div>
            </div>
          ))}
        </section>

        {/* Controls */}
        <section className="flex flex-wrap items-center gap-3 rounded-xl border border-border-primary bg-background p-4">
          <ToggleGroup
            label="Metric"
            options={[
              { value: "sale", label: "Units" },
              { value: "revenue", label: "Revenue" },
            ]}
            value={metric}
            onChange={setMetric}
          />
          <ToggleGroup
            label="Scale"
            options={[
              { value: "daily", label: "D" },
              { value: "weekly", label: "W" },
              { value: "monthly", label: "M" },
            ]}
            value={scale}
            onChange={setScale}
          />
          <ToggleGroup
            label="Quantile"
            options={FORECAST_QUANTILES.map((q) => ({
              value: q,
              label: q === 3 ? "P30" : q === 5 ? "P70" : "Median",
            }))}
            value={quantile}
            onChange={setQuantile}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">Channels</span>
            {FORECAST_CHANNELS.map((c) => {
              const active = activeChannels.has(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => toggleChannel(c.name)}
                  aria-pressed={active}
                  className={cx(
                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                    active
                      ? "border-transparent text-white"
                      : "border-border-primary text-text-tertiary hover:text-text-primary",
                  )}
                  style={active ? { backgroundColor: c.colorFg } : undefined}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Category chips */}
        {categories.length > 0 ? (
          <section className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-tertiary">Category:</span>
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={cx(
                "rounded-full border px-3 py-1 text-xs font-medium",
                activeCategory === null
                  ? "border-brand-solid bg-bg-brand-secondary text-brand-secondary"
                  : "border-border-primary text-text-tertiary hover:text-text-primary",
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() =>
                  setActiveCategory((prev) => (prev === cat.category ? null : cat.category))
                }
                className={cx(
                  "rounded-full border px-3 py-1 text-xs font-medium capitalize",
                  activeCategory === cat.category
                    ? "border-brand-solid bg-bg-brand-secondary text-brand-secondary"
                    : "border-border-primary text-text-tertiary hover:text-text-primary",
                )}
              >
                {cat.category} ({cat.variants.length})
              </button>
            ))}
          </section>
        ) : null}

        {/* Chart */}
        <section className="rounded-xl border border-border-primary bg-background p-4">
          {timeseriesQuery.isLoading ? (
            <ChartSkeleton />
          ) : timeseriesQuery.isError ? (
            <div className="flex h-80 items-center justify-center text-sm text-error-primary">
              Failed to load forecast:{" "}
              {(timeseriesQuery.error as Error)?.message ?? "Unknown error"}
            </div>
          ) : timeseries ? (
            <ForecastChart
              data={timeseries}
              metric={metric}
              activeChannels={activeChannels}
            />
          ) : null}
        </section>

        {/* Footer: data date range */}
        <footer className="text-xs text-text-tertiary">
          Showing {format(startDate, "yyyy-MM-dd")} → {format(endDate, "yyyy-MM-dd")} · Quantile{" "}
          {quantile === 4 ? "P50 (median)" : quantile === 3 ? "P30" : "P70"} · Scale {scale}
        </footer>
      </div>
    </div>
  );
}

// ─── Reusable bits (kept local; not worth extracting yet) ────────────────

interface ToggleGroupProps<T extends string | number> {
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (next: T) => void;
}

function ToggleGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: ToggleGroupProps<T>) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-tertiary">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex rounded-md border border-border-primary">
        {options.map((opt, idx) => {
          const active = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={cx(
                "px-3 py-1 text-xs font-medium transition",
                idx > 0 && "border-l border-border-primary",
                active ? "bg-bg-brand-secondary text-brand-secondary" : "text-text-tertiary hover:text-text-primary",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-96 flex-col gap-3">
      <div className="h-4 w-48 animate-pulse rounded bg-bg-secondary" />
      <div className="flex-1 animate-pulse rounded bg-bg-secondary" />
    </div>
  );
}
