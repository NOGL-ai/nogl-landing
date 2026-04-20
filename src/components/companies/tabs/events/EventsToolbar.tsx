"use client";

import { PeriodChip } from "@/components/companies/FilterBar";
import type { PeriodValue } from "@/lib/events/format";

import { EventTypeChips } from "./EventTypeChips";
import { ExportMenu } from "./ExportMenu";

type EventsToolbarProps = {
  total: number;
  period: PeriodValue;
  onPeriodChange: (v: PeriodValue) => void;
  selectedTypes: string[];
  onTypesChange: (next: string[]) => void;
  onExportCsv: () => void;
  exportDisabled: boolean;
};

export function EventsToolbar({
  total,
  period,
  onPeriodChange,
  selectedTypes,
  onTypesChange,
  onExportCsv,
  exportDisabled,
}: EventsToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString()} event{total === 1 ? "" : "s"} in selected range
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PeriodChip
            value={period}
            onChange={(v) => onPeriodChange(v as PeriodValue)}
          />
          <ExportMenu onExportCsv={onExportCsv} disabled={exportDisabled} />
        </div>
      </div>

      <EventTypeChips selected={selectedTypes} onChange={onTypesChange} />
    </div>
  );
}
