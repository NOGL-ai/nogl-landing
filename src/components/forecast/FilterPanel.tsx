import { Calendar, Sliders01 as SlidersHorizontal, X } from '@untitledui/icons';
"use client";

import { useEffect, useRef, useState } from "react";

import { DateRangePicker } from "./DateRangePicker";
import { ToggleGroup } from "./ToggleGroup";
import { QuantileSelect } from "./QuantileSelect";
import { ChannelFilter } from "./ChannelFilter";
import { CategoryMenu } from "./CategoryMenu";
import { CHANNEL_CONFIGS } from "@/config/forecast";
import type {
  ForecastScale,
  ForecastQuantileValue,
  CategoryWithVariants,
} from "@/types/forecast";

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
  /**
   * Label shown in the trigger button (e.g. "13.01.2024 – 24.11.2024").
   * When omitted, the trigger shows the generic "Filters" label.
   */
  triggerLabel?: string;
  /**
   * "button" — default compact pill with icon + "Filters".
   * "field"  — full-width input-style trigger used inside form grids.
   */
  triggerVariant?: "button" | "field";
  /**
   * When the panel opens, scroll this section into view. Used to wire the
   * "Compare to" field directly to the comparison section of the slide-over,
   * so there is only one surface for configuring comparison.
   */
  initialSection?: "dateRange" | "comparison" | "channels" | "scale" | "quantile" | "sets" | "categories";
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
  triggerLabel,
  triggerVariant = "button",
  initialSection,
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

  const comparisonRef = useRef<HTMLElement | null>(null);

  const handleOpen = () => {
    // If the trigger is the "Compare to" field, pre-enable comparison mode
    // so the DateRangePicker is visible immediately.
    const draftComparisonMode =
      initialSection === "comparison" ? true : comparisonMode;
    setDraft({
      dateRange,
      categories: selectedCategories,
      variantIds: selectedVariants,
      channels: selectedChannels,
      scale,
      quantile,
      isSet,
      comparisonMode: draftComparisonMode,
      comparedDateRange,
    });
    setOpen(true);
  };

  // When opened with a target section, scroll it into view on the next frame
  useEffect(() => {
    if (open && initialSection === "comparison" && comparisonRef.current) {
      // Defer so the slide-over transition has started
      requestAnimationFrame(() => {
        comparisonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [open, initialSection]);

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
      {triggerVariant === "field" ? (
        <button
          type="button"
          onClick={handleOpen}
          className="flex h-10 w-full items-center justify-between rounded-lg border border-border-secondary bg-bg-primary px-3 text-sm text-primary transition-colors hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-border-brand"
        >
          <span className="flex items-center gap-2 truncate">
            <Calendar className="h-4 w-4 text-tertiary" aria-hidden="true" />
            <span className="truncate">{triggerLabel ?? "Select time frame"}</span>
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      )}

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
              <section ref={comparisonRef as React.RefObject<HTMLElement>}>
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
                  channels={CHANNEL_CONFIGS}
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
