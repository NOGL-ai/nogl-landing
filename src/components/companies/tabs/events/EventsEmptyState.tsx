"use client";
import { Calendar } from '@untitledui/icons';

import { Card } from "@/components/ui/card";

type EventsEmptyStateProps = {
  hasFilters: boolean;
};

export function EventsEmptyState({ hasFilters }: EventsEmptyStateProps) {
  return (
    <Card className="flex flex-col items-center gap-3 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-tertiary text-text-tertiary">
        <Calendar className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary">No events in this period.</p>
        <p className="mt-1 text-xs text-text-tertiary">
          {hasFilters
            ? "Try expanding the date range or clearing type filters."
            : "New events will appear here as they are detected."}
        </p>
      </div>
    </Card>
  );
}
