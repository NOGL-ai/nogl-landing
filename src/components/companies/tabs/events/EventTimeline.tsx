"use client";

import type { CompanyEventDTO } from "@/types/company";
import type { EventDayGroup } from "@/lib/events/format";

import { EventCard } from "./EventCard";

type EventTimelineProps = {
  groups: EventDayGroup[];
  onSelect: (event: CompanyEventDTO) => void;
  newIds: Set<string>;
};

export function EventTimeline({ groups, onSelect, newIds }: EventTimelineProps) {
  return (
    <ol className="space-y-8">
      {groups.map((group) => (
        <li key={group.dayKey}>
          <div className="sticky top-0 z-10 -mx-1 mb-3 bg-bg-primary/90 px-1 py-1 backdrop-blur-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary">{group.label}</h2>
          </div>
          <div className="relative ml-[56px] border-l border-border-primary pl-6">
            <div className="space-y-3">
              {group.events.map((event) => (
                <div key={event.id} className="-ml-[56px]">
                  <EventCard
                    event={event}
                    onSelect={onSelect}
                    isNew={newIds.has(event.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
