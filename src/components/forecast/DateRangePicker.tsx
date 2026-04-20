"use client";
import { CalendarDate as CalendarDays } from '@untitledui/icons';

import { CalendarDate as CalendarDays } from '@untitledui/icons';

import { useState, useRef, useEffect } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { format } from "date-fns";


interface DateRangePickerProps {
  value: { start: string; end: string };
  onChange: (range: { start: string; end: string }) => void;
  disabled?: boolean;
}

export function DateRangePicker({ value, onChange, disabled }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected: DateRange = {
    from: value.start ? new Date(value.start) : undefined,
    to: value.end ? new Date(value.end) : undefined,
  };

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const displayText =
    value.start && value.end
      ? `${format(new Date(value.start), "dd MMM yyyy")} – ${format(new Date(value.end), "dd MMM yyyy")}`
      : "Select date range";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <span>{displayText}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
          <DayPicker
            mode="range"
            selected={selected}
            numberOfMonths={2}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onChange({
                  start: format(range.from, "yyyy-MM-dd"),
                  end: format(range.to, "yyyy-MM-dd"),
                });
                setOpen(false);
              } else if (range?.from) {
                onChange({ start: format(range.from, "yyyy-MM-dd"), end: value.end });
              }
            }}
            classNames={{
              root: "p-3",
              months: "flex gap-4",
              month: "flex flex-col gap-2",
              caption: "flex items-center justify-between px-1",
              caption_label: "text-sm font-semibold text-foreground",
              nav: "flex items-center gap-1",
              nav_button:
                "h-7 w-7 rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
              table: "w-full border-collapse",
              head_row: "flex",
              head_cell: "w-8 text-center text-[10px] font-medium uppercase text-muted-foreground",
              row: "flex mt-1",
              cell: "w-8 p-0 text-center text-sm",
              day: "h-8 w-8 rounded-md text-sm font-normal text-foreground hover:bg-muted",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary",
              day_range_middle: "rounded-none bg-primary/20 text-foreground",
              day_range_start: "rounded-l-md bg-primary text-primary-foreground",
              day_range_end: "rounded-r-md bg-primary text-primary-foreground",
              day_today: "font-bold text-primary",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "opacity-30 cursor-not-allowed",
            }}
          />
        </div>
      )}
    </div>
  );
}