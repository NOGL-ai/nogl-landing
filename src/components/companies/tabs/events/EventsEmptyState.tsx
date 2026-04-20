// eslint-disable-next-line no-restricted-imports -- icon has no @untitledui/icons equivalent; keep in lucide-react until UUI ships it
import { CalendarRange } from 'lucide-react';
"use client";



import { Card } from "@/components/ui/card";

type EventsEmptyStateProps = {
  hasFilters: boolean;
};

export function EventsEmptyState({ hasFilters }: EventsEmptyStateProps) {
  return (
    <Card className="flex flex-col items-center gap-3 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CalendarRange className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">No events in this period.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {hasFilters
            ? "Try expanding the date range or clearing type filters."
            : "New events will appear here as they are detected."}
        </p>
      </div>
    </Card>
  );
}
