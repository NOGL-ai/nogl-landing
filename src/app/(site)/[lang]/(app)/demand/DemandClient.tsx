"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { addDays, subDays, format } from "date-fns";
import { Download02 } from "@untitledui/icons";
import {
  getForecastCategories,
  getForecastSales,
  getForecastRevenue,
  getForecastAnnotations,
} from "@/actions/forecast";
import { ForecastChart } from "@/components/forecast/charts/ForecastChart";
import { ComparisonForecastChart } from "@/components/forecast/charts/ComparisonForecastChart";
import { FilterPanel } from "@/components/forecast/FilterPanel";
import { ExportModal } from "@/components/forecast/ExportModal";
import { ForecastLoadingSkeleton } from "@/components/forecast/ForecastLoadingSkeleton";
import {
  CHANNEL_CONFIGS,
  DEFAULT_CHANNEL_NAMES,
  FORECAST_SESSION_KEY,
} from "@/config/forecast";
import type {
  ForecastMetric,
  ForecastScale,
  ForecastQuantileValue,
  ForecastResponse,
  CategoryWithVariants,
  ForecastAnnotation,
  ForecastAnnotationKind,
} from "@/types/forecast";

const ANNOTATION_LAYER_LABELS: Record<ForecastAnnotationKind, string> = {
  event_spike: "Events",
  out_of_stock: "Stock-outs",
  promotion: "Promotions",
  launch: "Launches",
};

const ALL_ANNOTATION_KINDS: ForecastAnnotationKind[] = [
  "event_spike",
  "out_of_stock",
  "promotion",
  "launch",
];

interface DemandClientProps {
  companyId: string;
  companyName: string;
  companyDomain: string;
}

export default function DemandClient({
  companyId,
  companyName,
  companyDomain,
}: DemandClientProps) {
  const today = new Date();
  const [metric, setMetric] = useState<ForecastMetric>("sale");
  const [scale, setScale] = useState<ForecastScale>("daily");
  const [quantile, setQuantile] = useState<ForecastQuantileValue>(4);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(today, 14), "yyyy-MM-dd"),
    end: format(addDays(today, 60), "yyyy-MM-dd"),
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [variantIds, setVariantIds] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([...DEFAULT_CHANNEL_NAMES]);
  const [isSet, setIsSet] = useState<boolean | undefined>(undefined);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparedDateRange, setComparedDateRange] = useState({
    start: "",
    end: "",
  });

  const [salesData, setSalesData] = useState<ForecastResponse | null>(null);
  const [revenueData, setRevenueData] = useState<ForecastResponse | null>(null);
  const [comparedSales, setComparedSales] = useState<ForecastResponse | null>(null);
  const [comparedRevenue, setComparedRevenue] = useState<ForecastResponse | null>(null);
  const [allCategories, setAllCategories] = useState<CategoryWithVariants[]>([]);
  const [annotations, setAnnotations] = useState<ForecastAnnotation[]>([]);
  const [enabledKinds, setEnabledKinds] = useState<Set<ForecastAnnotationKind>>(
    () => new Set<ForecastAnnotationKind>(ALL_ANNOTATION_KINDS)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load categories once
  useEffect(() => {
    getForecastCategories(companyId).then(setAllCategories).catch(console.error);
  }, [companyId]);

  // Restore from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(FORECAST_SESSION_KEY(companyId));
      if (saved) {
        const s = JSON.parse(saved);
        if (s.metric) setMetric(s.metric);
        if (s.scale) setScale(s.scale);
        if (s.quantile) setQuantile(s.quantile);
        if (s.dateRange) setDateRange(s.dateRange);
        if (s.categories) setCategories(s.categories);
        if (s.channels) setChannels(s.channels);
      }
    } catch {
      /* ignore */
    }
  }, [companyId]);

  // Persist to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        FORECAST_SESSION_KEY(companyId),
        JSON.stringify({ metric, scale, quantile, dateRange, categories, channels })
      );
    } catch {
      /* ignore */
    }
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
        const [sales, revenue, anns] = await Promise.all([
          getForecastSales(params),
          getForecastRevenue(params),
          getForecastAnnotations({
            companyId,
            start: dateRange.start,
            end: dateRange.end,
          }),
        ]);
        setSalesData(sales);
        setRevenueData(revenue);
        setAnnotations(anns);

        if (comparisonMode && comparedDateRange.start) {
          const cParams = {
            ...params,
            start: comparedDateRange.start,
            end: comparedDateRange.end,
          };
          const [cs, cr] = await Promise.all([
            getForecastSales(cParams),
            getForecastRevenue(cParams),
          ]);
          setComparedSales(cs);
          setComparedRevenue(cr);
        }
      } catch (err) {
        console.error("[DemandClient] fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 500);
  }, [
    companyId,
    dateRange,
    categories,
    variantIds,
    channels,
    isSet,
    scale,
    quantile,
    comparisonMode,
    comparedDateRange,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeData = metric === "sale" ? salesData : revenueData;
  const activeCompared = metric === "sale" ? comparedSales : comparedRevenue;

  const visibleChannels = CHANNEL_CONFIGS.filter((c) => channels.includes(c.name));

  const visibleAnnotations = annotations.filter((a) => enabledKinds.has(a.kind));

  const annotationLayers = ALL_ANNOTATION_KINDS.map((kind) => ({
    kind,
    label: ANNOTATION_LAYER_LABELS[kind],
    enabled: enabledKinds.has(kind),
    onToggle: () => {
      setEnabledKinds((prev) => {
        const next = new Set(prev);
        if (next.has(kind)) next.delete(kind);
        else next.add(kind);
        return next;
      });
    },
  }));

  const prettyRange = `${dateRange.start.split("-").reverse().join(".")} – ${dateRange.end.split("-").reverse().join(".")}`;
  const prettyCompared = comparedDateRange.start
    ? `${comparedDateRange.start.split("-").reverse().join(".")} – ${comparedDateRange.end.split("-").reverse().join(".")}`
    : "";

  const productContextLabel =
    categories.length === 1
      ? categories[0]
      : variantIds.length === 1
        ? "Selected variant"
        : "All products";

  // One shared onApply handler — used by all FilterPanel triggers so the
  // comparison toggle + date live in ONE surface (the slide-over).
  const handleApplyFilters = (f: {
    dateRange: { start: string; end: string };
    categories: string[];
    variantIds: string[];
    channels: string[];
    scale: ForecastScale;
    quantile: ForecastQuantileValue;
    isSet?: boolean;
    comparisonMode: boolean;
    comparedDateRange: { start: string; end: string };
  }) => {
    setCategories(f.categories);
    setVariantIds(f.variantIds);
    setChannels(f.channels);
    setScale(f.scale);
    setQuantile(f.quantile);
    setIsSet(f.isSet);
    setDateRange(f.dateRange);
    setComparisonMode(f.comparisonMode);
    setComparedDateRange(f.comparedDateRange);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header — readable company name + product context badge */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-primary">
            Forecast for {companyName}
          </h1>
          <p className="text-sm text-tertiary">{companyDomain}</p>
        </div>
        <span className="inline-flex max-w-full items-center rounded-full border border-border-secondary bg-bg-secondary px-3 py-1 text-sm text-secondary">
          {productContextLabel}
        </span>

        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border-secondary bg-bg-primary px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-border-brand"
          >
            <Download02 className="h-4 w-4" aria-hidden="true" />
            Export
          </button>
        </div>
      </div>

      {/* Filter bar — 4 labelled fields */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border-secondary bg-bg-primary p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-tertiary">Metric</label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as ForecastMetric)}
            className="h-10 rounded-lg border border-border-secondary bg-bg-primary px-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-brand"
          >
            <option value="sale">Sales quantity</option>
            <option value="revenue">Revenue (€)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-tertiary">Granularity</label>
          <select
            value={scale}
            onChange={(e) => setScale(e.target.value as ForecastScale)}
            className="h-10 rounded-lg border border-border-secondary bg-bg-primary px-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-border-brand"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-tertiary">Time frame</label>
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
            onApply={handleApplyFilters}
            triggerLabel={prettyRange}
            triggerVariant="field"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-tertiary">Compare to</label>
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
            onApply={handleApplyFilters}
            triggerLabel={
              comparisonMode && prettyCompared
                ? prettyCompared
                : "Add a comparison period"
            }
            triggerVariant="field"
            initialSection="comparison"
          />
        </div>
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
          annotations={visibleAnnotations}
          annotationLayers={annotationLayers}
        />
      ) : activeData ? (
        <ForecastChart
          data={activeData.channels}
          metric={metric}
          scale={scale}
          quantile={quantile}
          channels={visibleChannels}
          startForecastDate={activeData.startForecastDate}
          annotations={visibleAnnotations}
          annotationLayers={annotationLayers}
        />
      ) : (
        <div className="flex h-[360px] items-center justify-center rounded-xl border border-border-secondary bg-bg-primary">
          <p className="text-sm text-tertiary">
            We couldn&apos;t find a forecast for this range. Try widening the date
            range or clearing category filters.
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
