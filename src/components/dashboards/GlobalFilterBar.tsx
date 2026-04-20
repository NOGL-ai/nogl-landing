import { Calendar as CalendarIcon, X as XIcon, Plus as PlusIcon, ChevronDown as ChevronDownIcon } from '@untitledui/icons';
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { GlobalFilters } from "@/lib/dashboards/widgetSchemas";

const DATE_PRESETS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 28 days", value: "28d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Year to date", value: "ytd" },
];

function presetToRange(preset: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];
  if (preset === "ytd") {
    const from = `${now.getFullYear()}-01-01`;
    return { from, to };
  }
  const days = parseInt(preset);
  const from = new Date(now.getTime() - days * 86_400_000)
    .toISOString()
    .split("T")[0];
  return { from, to };
}

export function GlobalFilterBar({
  filters,
  onChange,
}: {
  filters: GlobalFilters;
  onChange: (f: GlobalFilters) => void;
}) {
  const [dateOpen, setDateOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  function applyPreset(preset: string) {
    setActivePreset(preset);
    onChange({ ...filters, dateRange: presetToRange(preset) });
    setDateOpen(false);
  }

  function clearDate() {
    setActivePreset(null);
    onChange({ ...filters, dateRange: null });
  }

  const presetLabel =
    DATE_PRESETS.find((p) => p.value === activePreset)?.label ??
    (filters.dateRange
      ? `${filters.dateRange.from} → ${filters.dateRange.to}`
      : null);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Date range chip */}
      <Popover open={dateOpen} onOpenChange={setDateOpen}>
        <PopoverTrigger asChild>
          <button
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors
              ${presetLabel
                ? "border-primary bg-primary/10 text-primary"
                : "border-dashed text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
          >
            <CalendarIcon className="h-3 w-3" />
            {presetLabel ?? "Date range"}
            <ChevronDownIcon className="h-3 w-3 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-1" align="start">
          {DATE_PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => applyPreset(p.value)}
              className={`flex w-full items-center rounded px-3 py-1.5 text-left text-xs hover:bg-muted
                ${activePreset === p.value ? "font-medium text-primary" : ""}`}
            >
              {p.label}
            </button>
          ))}
          {presetLabel && (
            <>
              <div className="my-1 border-t" />
              <button
                onClick={clearDate}
                className="flex w-full items-center gap-1.5 rounded px-3 py-1.5 text-left text-xs text-destructive hover:bg-muted"
              >
                <XIcon className="h-3 w-3" /> Clear
              </button>
            </>
          )}
        </PopoverContent>
      </Popover>

      {/* Dataset count badge — Particl shows "→ 1 dataset(s)" */}
      <span className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
        → 1 dataset(s)
      </span>

      {/* Add filter — placeholder for future filter chips */}
      <button className="flex items-center gap-1 rounded-full border border-dashed px-2 py-1 text-xs text-muted-foreground hover:border-foreground hover:text-foreground transition-colors">
        <PlusIcon className="h-3 w-3" />
      </button>
    </div>
  );
}
