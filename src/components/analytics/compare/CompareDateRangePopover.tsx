"use client";

import { useMemo } from "react";
import { ChevronDown } from "@untitledui/icons";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DatePreset = {
  id: string;
  label: string;
  getRange: () => { start: string; end: string };
};

type CompareDateRangePopoverProps = {
  startDate: string;
  endDate: string;
  onRangeChange: (range: { start: string; end: string }) => void;
};

function asIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftDays(base: Date, days: number): Date {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfQuarter(date: Date): Date {
  const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), quarterStartMonth, 1);
}

function endOfQuarter(date: Date): Date {
  const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), quarterStartMonth + 3, 0);
}

function startOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return shiftDays(date, diff);
}

function endOfWeek(date: Date): Date {
  return shiftDays(startOfWeek(date), 6);
}

function formatShort(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function sameRange(a: { start: string; end: string }, b: { start: string; end: string }): boolean {
  return a.start === b.start && a.end === b.end;
}

export function CompareDateRangePopover({ startDate, endDate, onRangeChange }: CompareDateRangePopoverProps) {
  const presets = useMemo<DatePreset[]>(() => {
    const now = new Date();
    const last7Start = shiftDays(now, -6);
    const last28Start = shiftDays(now, -27);
    const last90Start = shiftDays(now, -89);
    const last365Start = shiftDays(now, -364);
    const thisWeekStart = startOfWeek(now);
    const thisWeekEnd = endOfWeek(now);
    const lastWeekStart = shiftDays(thisWeekStart, -7);
    const lastWeekEnd = shiftDays(thisWeekEnd, -7);
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStart = startOfMonth(lastMonthDate);
    const lastMonthEnd = endOfMonth(lastMonthDate);
    const thisQuarterStart = startOfQuarter(now);
    const thisQuarterEnd = endOfQuarter(now);
    const lastQuarterDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const lastQuarterStart = startOfQuarter(lastQuarterDate);
    const lastQuarterEnd = endOfQuarter(lastQuarterDate);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    const thisYearEnd = new Date(now.getFullYear(), 11, 31);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);

    return [
      { id: "samePeriod", label: "Same Period", getRange: () => ({ start: startDate, end: endDate }) },
      { id: "previousPeriod", label: "Previous Period", getRange: () => ({ start: asIsoDate(shiftDays(new Date(startDate), -28)), end: asIsoDate(shiftDays(new Date(endDate), -28)) }) },
      { id: "previousQuarter", label: "Previous Quarter", getRange: () => ({ start: asIsoDate(lastQuarterStart), end: asIsoDate(lastQuarterEnd) }) },
      { id: "previousYear", label: "Previous Year", getRange: () => ({ start: asIsoDate(lastYearStart), end: asIsoDate(lastYearEnd) }) },
      { id: "last7Days", label: "Last 7 Days", getRange: () => ({ start: asIsoDate(last7Start), end: asIsoDate(now) }) },
      { id: "thisWeek", label: "This Week", getRange: () => ({ start: asIsoDate(thisWeekStart), end: asIsoDate(thisWeekEnd) }) },
      { id: "lastWeek", label: "Last Week", getRange: () => ({ start: asIsoDate(lastWeekStart), end: asIsoDate(lastWeekEnd) }) },
      { id: "last4Weeks", label: "Last 4 Weeks", getRange: () => ({ start: asIsoDate(last28Start), end: asIsoDate(now) }) },
      { id: "thisMonth", label: "This Month", getRange: () => ({ start: asIsoDate(thisMonthStart), end: asIsoDate(thisMonthEnd) }) },
      { id: "lastMonth", label: "Last Month", getRange: () => ({ start: asIsoDate(lastMonthStart), end: asIsoDate(lastMonthEnd) }) },
      { id: "last90Days", label: "Last 90 Days", getRange: () => ({ start: asIsoDate(last90Start), end: asIsoDate(now) }) },
      { id: "thisQuarter", label: "This Quarter", getRange: () => ({ start: asIsoDate(thisQuarterStart), end: asIsoDate(thisQuarterEnd) }) },
      { id: "lastQuarter", label: "Last Quarter", getRange: () => ({ start: asIsoDate(lastQuarterStart), end: asIsoDate(lastQuarterEnd) }) },
      { id: "last365Days", label: "Last 365 Days", getRange: () => ({ start: asIsoDate(last365Start), end: asIsoDate(now) }) },
      { id: "thisYear", label: "This Year", getRange: () => ({ start: asIsoDate(thisYearStart), end: asIsoDate(thisYearEnd) }) },
      { id: "lastYear", label: "Last Year", getRange: () => ({ start: asIsoDate(lastYearStart), end: asIsoDate(lastYearEnd) }) },
    ];
  }, [endDate, startDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 min-w-[9rem] items-center justify-between gap-2 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <span>{`${formatShort(startDate)} - ${formatShort(endDate)}`}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(95vw,764px)] border-border p-0">
        <div className="grid min-h-[26rem] grid-cols-[122px_1fr]">
          <div className="border-r border-border bg-muted/20 p-3">
            <div className="space-y-1">
              {presets.map((preset) => {
                const presetRange = preset.getRange();
                const active = sameRange(presetRange, { start: startDate, end: endDate });
                return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onRangeChange(presetRange)}
                  className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? "bg-background font-medium text-foreground ring-1 ring-inset ring-border"
                      : "text-foreground hover:bg-background"
                  }`}
                >
                  {preset.label}
                </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-between p-4">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Start date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => onRangeChange({ start: event.target.value, end: endDate })}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">End date</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => onRangeChange({ start: startDate, end: event.target.value })}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>
              </div>
              <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                Select range: <span className="font-medium text-foreground">{`${formatShort(startDate)} to ${formatShort(endDate)}`}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  2 Months Available
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 items-center rounded-md bg-primary/10 px-3 text-xs font-medium text-primary hover:bg-primary/20"
                >
                  Get more Historical
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{`Selected: ${formatShort(startDate)} to ${formatShort(endDate)}`}</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
