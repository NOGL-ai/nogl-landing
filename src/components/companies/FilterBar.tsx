"use client";
import { ChevronDown, X } from '@untitledui/icons';


import { useEffect, useRef, useState } from "react";

// ── FilterChip ──────────────────────────────────────────────────────────────
// A single dropdown filter pill matching Particl's style.
// Renders the label (or active value) + chevron. Click opens the dropdown.
// When a value is selected it shows a clear (×) button instead of chevron.

type FilterChipOption = { label: string; value: string };

type FilterChipProps = {
  label: string;
  options: FilterChipOption[];
  value: string | null;
  onChange: (v: string | null) => void;
  /** Show a free-text input instead of a list (for price range etc.) */
  inputMode?: boolean;
  inputPlaceholder?: string;
  inputValueLabel?: string;
};

function FilterChip({
  label,
  options,
  value,
  onChange,
  inputMode = false,
  inputPlaceholder,
  inputValueLabel,
}: FilterChipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const hasValue = value !== null && value !== "";
  const displayLabel = hasValue ? (inputMode ? (inputValueLabel ?? value) : (options.find((o) => o.value === value)?.label ?? value)) : label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors
          ${hasValue
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border bg-background text-muted-foreground hover:border-border/80 hover:bg-muted/50 hover:text-foreground"
          }`}
      >
        <span>{displayLabel}</span>
        {hasValue ? (
          <X
            className="h-3 w-3 shrink-0 opacity-70 hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); onChange(null); setOpen(false); }}
          />
        ) : (
          <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {inputMode ? (
            <div className="p-3">
              <input
                type="text"
                placeholder={inputPlaceholder ?? "Enter value…"}
                defaultValue={value ?? ""}
                autoFocus
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onChange((e.target as HTMLInputElement).value || null);
                    setOpen(false);
                  }
                  if (e.key === "Escape") setOpen(false);
                }}
              />
              <p className="mt-1.5 text-[10px] text-muted-foreground">Press Enter to apply</p>
            </div>
          ) : (
            <div className="py-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value === value ? null : opt.value); setOpen(false); }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors
                    ${opt.value === value ? "bg-primary/10 font-medium text-primary" : "text-foreground hover:bg-muted"}`}
                >
                  {opt.value === value && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  {opt.value !== value && <span className="h-1.5 w-1.5" />}
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── PeriodChip ───────────────────────────────────────────────────────────────
// The "Last 4w" global period selector — fixed options.

export const PERIOD_OPTIONS = [
  { label: "Last 1w", value: "1w" },
  { label: "Last 4w", value: "4w" },
  { label: "Last 3m", value: "3m" },
  { label: "Last 6m", value: "6m" },
  { label: "Last 1y", value: "1y" },
  { label: "All time", value: "all" },
];

export function PeriodChip({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const label = PERIOD_OPTIONS.find((o) => o.value === value)?.label ?? "Last 4w";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-secondary px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
      >
        <span>{label}</span>
        <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[120px] overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          <div className="py-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors
                  ${opt.value === value ? "bg-primary/10 font-medium text-primary" : "text-foreground hover:bg-muted"}`}
              >
                {opt.value === value && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                {opt.value !== value && <span className="h-1.5 w-1.5" />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── FilterBar ────────────────────────────────────────────────────────────────
// Horizontal bar with multiple FilterChips + optional result count.

type FilterDef = {
  key: string;
  label: string;
  options: FilterChipOption[];
  inputMode?: boolean;
  inputPlaceholder?: string;
  inputValueLabel?: string;
};

type FilterBarProps = {
  filters: FilterDef[];
  values: Record<string, string | null>;
  onChange: (key: string, value: string | null) => void;
  resultCount?: number;
  resultLabel?: string;
  /** Extra slot on the right (e.g. sort control) */
  right?: React.ReactNode;
  className?: string;
};

export function FilterBar({ filters, values, onChange, resultCount, resultLabel = "results", right, className = "" }: FilterBarProps) {
  const hasAnyFilter = Object.values(values).some((v) => v !== null && v !== "");

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {filters.map((f) => (
        <FilterChip
          key={f.key}
          label={f.label}
          options={f.options}
          value={values[f.key] ?? null}
          onChange={(v) => onChange(f.key, v)}
          inputMode={f.inputMode}
          inputPlaceholder={f.inputPlaceholder}
          inputValueLabel={f.inputValueLabel}
        />
      ))}

      {hasAnyFilter && (
        <button
          type="button"
          onClick={() => filters.forEach((f) => onChange(f.key, null))}
          className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Clear all
        </button>
      )}

      {resultCount !== undefined && (
        <span className="ml-1 text-xs text-muted-foreground">
          {resultCount.toLocaleString()} {resultLabel}
        </span>
      )}

      {right && <div className="ml-auto">{right}</div>}
    </div>
  );
}

export { FilterChip };
export type { FilterChipOption, FilterDef };
