"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { addDays, subDays, format } from "date-fns";
import { getForecastCategories, getForecastSales, getForecastRevenue } from "@/actions/forecast";
import { ForecastChart } from "@/components/forecast/charts/ForecastChart";
import { ComparisonForecastChart } from "@/components/forecast/charts/ComparisonForecastChart";
import { ToggleGroup } from "@/components/forecast/ToggleGroup";
import { FilterPanel } from "@/components/forecast/FilterPanel";
import { ExportModal } from "@/components/forecast/ExportModal";
import { ForecastLoadingSkeleton } from "@/components/forecast/ForecastLoadingSkeleton";
import type {
  ForecastMetric,
  ForecastScale,
  ForecastQuantileValue,
  ForecastResponse,
  CategoryWithVariants,
  ForecastChannelConfig,
} from "@/types/forecast";

const SESSION_KEY = (id: string) => `forecast:filter:${id}`;
const DEFAULT_CHANNELS = ["web", "marketplace", "b2b"];

const CHANNEL_CONFIGS: ForecastChannelConfig[] = [
  { name: "web",         label: "Web",         colorFg: "#2970FF", colorBg: "#EFF4FF" },
  { name: "marketplace", label: "Marketplace",  colorFg: "#F79009", colorBg: "#FFFAEB" },
  { name: "b2b",         label: "B2B",          colorFg: "#12B76A", colorBg: "#ECFDF3" },
];

interface DemandClientProps {
  companyId: string;
}

export default function DemandClient({ companyId }: DemandClientProps) {
  const today = new Date();
  const [metric, setMetric]           = useState<ForecastMetric>("sale");
  const [scale, setScale]             = useState<ForecastScale>("daily");
  const [quantile, setQuantile]       = useState<ForecastQuantileValue>(4);
  const [dateRange, setDateRange]     = useState({
    start: format(subDays(today, 14), "yyyy-MM-dd"),
    end:   format(addDays(today, 60), "yyyy-MM-dd"),
  });
  const [categories, setCategories]   = useState<string[]>([]);
  const [variantIds, setVariantIds]   = useState<string[]>([]);
  const [channels, setChannels]       = useState<string[]>([...DEFAULT_CHANNELS]);
  const [isSet, setIsSet]             = useState<boolean | undefined>(undefined);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparedDateRange, setComparedDateRange] = useState({ start: "", end: "" });

  const [salesData, setSalesData]     = useState<ForecastResponse | null>(null);
  const [revenueData, setRevenueData] = useState<ForecastResponse | null>(null);
  const [comparedSales, setComparedSales]   = useState<ForecastResponse | null>(null);
  const [comparedRevenue, setComparedRevenue] = useState<ForecastResponse | null>(null);
  const [allCategories, setAllCategories]   = useState<CategoryWithVariants[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [exportOpen, setExportOpen]   = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load categories once
  useEffect(() => {
    getForecastCategories(companyId).then(setAllCategories).catch(console.error);
  }, [companyId]);

  // Restore from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY(companyId));
      if (saved) {
        const s = JSON.parse(saved);
        if (s.metric)    setMetric(s.metric);
        if (s.scale)     setScale(s.scale);
        if (s.quantile)  setQuantile(s.quantile);
        if (s.dateRange) setDateRange(s.dateRange);
        if (s.categories) setCategories(s.categories);
        if (s.channels)  setChannels(s.channels);
      }
    } catch { /* ignore */ }
  }, [companyId]);

  // Persist to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        SESSION_KEY(companyId),
        JSON.stringify({ metric, scale, quantile, dateRange, categories, channels })
      );
    } catch { /* ignore */ }
  }, [metric, scale, quantile, dateRange, categories, channels, companyId]);

  // Debounced data fetch
  const fetchData = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      const params = {
        companyId,
        start: dateRange.start,
        end: dateRange.end,
        categories,
        variantIds,
        channels: channels as ("web" | "marketplace" | "b2b")[],
        isSet,
        scale,
        quantile,
      };
      try {
        const [sales, revenue] = await Promise.all([
          getForecastSales(params),
          getForecastRevenue(params),
        ]);
        setSalesData(sales);
        setRevenueData(revenue);

        if (comparisonMode && comparedDateRange.start) {
          const cParams = { ...params, start: comparedDateRange.start, end: comparedDateRange.end };
          const [cs, cr] = await Promise.all([getForecastSales(cParams), getForecastRevenue(cParams)]);
          setComparedSales(cs);
          setComparedRevenue(cr);
        }
      } catch (err) {
        console.error("[DemandClient] fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 500);
  }, [companyId, dateRange, categories, variantIds, channels, isSet, scale, quantile, comparisonMode, comparedDateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeData    = metric === "sale" ? salesData    : revenueData;
  const activeCompared = metric === "sale" ? comparedSales : comparedRevenue;

  const visibleChannels = CHANNEL_CONFIGS.filter((c) => channels.includes(c.name));

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Demand Forecast</h1>
          <p className="text-sm text-muted-foreground">Calumet Photographic — sales & revenue outlook</p>
        </div>
        <div className="flex gap-2">
          <FilterPanel
            categories={allCategories}
            selectedCategories={categories}
            selectedVariants={variantIds}
            selectedChannels={channels}
            scale={scale}
            quantile={quantile}
            isSet={isSet}
            dateRange={dateRange}
            comparisonMode={comparisonMode}
            comparedDateRange={comparedDateRange}
            onApply={(f) => {
              setCategories(f.categories);
              setVariantIds(f.variantIds);
              setChannels(f.channels);
              setScale(f.scale);
              setQuantile(f.quantile);
              setIsSet(f.isSet);
              setDateRange(f.dateRange);
              setComparisonMode(f.comparisonMode);
              setComparedDateRange(f.comparedDateRange);
            }}
          />
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Export
          </button>
        </div>
      </div>

      {/* Metric + Scale toggles */}
      <div className="flex flex-wrap gap-3">
        <ToggleGroup
          options={[
            { value: "sale",    label: "Sales Qty" },
            { value: "revenue", label: "Revenue" },
          ]}
          value={metric}
          onChange={(v) => setMetric(v as ForecastMetric)}
        />
        <ToggleGroup
          options={[
            { value: "daily",   label: "Daily" },
            { value: "weekly",  label: "Weekly" },
            { value: "monthly", label: "Monthly" },
          ]}
          value={scale}
          onChange={(v) => setScale(v as ForecastScale)}
        />
      </div>

      {/* Chart area */}
      {isLoading ? (
        <ForecastLoadingSkeleton />
      ) : comparisonMode && activeData && activeCompared ? (
        <ComparisonForecastChart
          primaryData={activeData.channels}
          comparedData={activeCompared.channels}
          primaryLabel={`${dateRange.start} – ${dateRange.end}`}
          comparedLabel={`${comparedDateRange.start} – ${comparedDateRange.end}`}
          metric={metric}
          scale={scale}
          quantile={quantile}
          channels={visibleChannels}
        />
      ) : activeData ? (
        <ForecastChart
          data={activeData.channels}
          metric={metric}
          scale={scale}
          quantile={quantile}
          channels={visibleChannels}
          startForecastDate={activeData.startForecastDate}
        />
      ) : (
        <div className="flex h-[360px] items-center justify-center rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">
            No forecast data available. Run the seed script first.
          </p>
        </div>
      )}

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        companyId={companyId}
        defaultDateRange={dateRange}
        defaultScale={scale}
        defaultQuantile={quantile}
      />
    </div>
  );
}
