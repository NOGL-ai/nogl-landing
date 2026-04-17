"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";
import { ToggleGroup } from "./ToggleGroup";
import { QuantileSelect } from "./QuantileSelect";
import { ChannelFilter } from "./ChannelFilter";
import { CategoryMenu } from "./CategoryMenu";
import type {
  ForecastScale,
  ForecastQuantileValue,
  ForecastChannelConfig,
  CategoryWithVariants,
} from "@/types/forecast";

const DEFAULT_CHANNELS: ForecastChannelConfig[] = [
  { name: "web",         label: "Web",         colorFg: "#2970FF", colorBg: "#EFF4FF" },
  { name: "marketplace", label: "Marketplace",  colorFg: "#F79009", colorBg: "#FFFAEB" },
  { name: "b2b",         label: "B2B",          colorFg: "#12B76A", colorBg: "#ECFDF3" },
];

interface FilterState {
  dateRange: { start: string; end: string };
  categories: string[];
  variantIds: string[];
  channels: string[];
  scale: ForecastScale;
  quantile: ForecastQuantileValue;
  isSet?: boolean;
  comparisonMode: boolean;
  comparedDateRange: { start: string; end: string };
}

interface FilterPanelProps {
  categories: CategoryWithVariants[];
  selectedCategories: string[];
  selectedVariants: string[];
  selectedChannels: string[];
  scale: ForecastScale;
  quantile: ForecastQuantileValue;
  isSet?: boolean;
  dateRange: { start: string; end: string };
  comparisonMode: boolean;
  comparedDateRange: { start: string; end: string };
  onApply: (filters: FilterState) => void;
}

export function FilterPanel({
  categories,
  selectedCategories,
  selectedVariants,
  selectedChannels,
  scale,
  quantile,
  isSet,
  dateRange,
  comparisonMode,
  comparedDateRange,
  onApply,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterState>({
    dateRange,
    categories: selectedCategories,
    variantIds: selectedVariants,
    channels: selectedChannels,
    scale,
    quantile,
    isSet,
    comparisonMode,
    comparedDateRange,
  });

  const handleOpen = () => {
    setDraft({
      dateRange,
      categories: selectedCategories,
      variantIds: selectedVariants,
      channels: selectedChannels,
      scale,
      quantile,
      isSet,
      comparisonMode,
      comparedDateRange,
    });
    setOpen(true);
  };

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  const handleReset = () => {
    setDraft({
      dateRange,
      categories: [],
      variantIds: [],
      channels: ["web", "marketplace", "b2b"],
      scale: "daily",
      quantile: 4,
      isSet: undefined,
      comparisonMode: false,
      comparedDateRange: { start: "", end: "" },
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      {/* Slide-over */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <div className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col overflow-y-auto bg-background shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-foreground">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
              {/* Date range */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date Range
                </h3>
                <DateRangePicker
                  value={draft.dateRange}
                  onChange={(r) => setDraft((d) => ({ ...d, dateRange: r }))}
                />
              </section>

              {/* Comparison mode */}
              <section>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={draft.comparisonMode}
                    onChange={(e) => setDraft((d) => ({ ...d, comparisonMode: e.target.checked }))}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  Comparison mode
                </label>
                {draft.comparisonMode && (
                  <div className="mt-2">
                    <p className="mb-1 text-xs text-muted-foreground">Compare against period:</p>
                    <DateRangePicker
                      value={draft.comparedDateRange}
                      onChange={(r) => setDraft((d) => ({ ...d, comparedDateRange: r }))}
                    />
                  </div>
                )}
              </section>

              {/* Channels */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sale Channels
                </h3>
                <ChannelFilter
                  channels={DEFAULT_CHANNELS}
                  selected={draft.channels}
                  onChange={(c) => setDraft((d) => ({ ...d, channels: c }))}
                />
              </section>

              {/* Scale */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Time Scale
                </h3>
                <ToggleGroup
                  options={[
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "monthly", label: "Monthly" },
                  ]}
                  value={draft.scale}
                  onChange={(v) => setDraft((d) => ({ ...d, scale: v as ForecastScale }))}
                />
              </section>

              {/* Quantile */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Scenario
                </h3>
                <QuantileSelect
                  value={draft.quantile}
                  onChange={(v) => setDraft((d) => ({ ...d, quantile: v }))}
                />
              </section>

              {/* Sets toggle */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product Type
                </h3>
                <ToggleGroup
                  options={[
                    { value: "all", label: "All" },
                    { value: "sets", label: "Sets/Bundles only" },
                  ]}
                  value={draft.isSet === true ? "sets" : "all"}
                  onChange={(v) =>
                    setDraft((d) => ({ ...d, isSet: v === "sets" ? true : undefined }))
                  }
                />
              </section>

              {/* Categories */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Categories & Variants
                </h3>
                <CategoryMenu
                  categories={categories}
                  selectedCategories={draft.categories}
                  selectedVariants={draft.variantIds}
                  onCategoryChange={(c) => setDraft((d) => ({ ...d, categories: c }))}
                  onVariantChange={(v) => setDraft((d) => ({ ...d, variantIds: v }))}
                />
              </section>
            </div>

            {/* Footer */}
            <div className="flex gap-2 border-t border-border px-5 py-4">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
