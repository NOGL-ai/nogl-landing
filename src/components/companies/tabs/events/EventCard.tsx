"use client";

import { format } from "date-fns";

import { Card } from "@/components/ui/card";
import type { CompanyEventDTO } from "@/types/company";
import { eventTypeMeta } from "@/lib/events/format";

type EventCardProps = {
  event: CompanyEventDTO;
  onSelect?: (event: CompanyEventDTO) => void;
  isNew?: boolean;
};

export function EventCard({ event, onSelect, isNew }: EventCardProps) {
  const meta = eventTypeMeta(event.event_type);
  const eventDate = new Date(event.event_date);
  const time = Number.isNaN(eventDate.getTime()) ? null : format(eventDate, "HH:mm");
  const isPlaceholder = event.id.startsWith("placeholder-");

  const clickable = Boolean(onSelect);

  return (
    <div className="flex gap-3">
      <div className="flex w-14 shrink-0 flex-col items-end pt-4 text-xs font-medium tabular-nums text-muted-foreground">
        {time}
      </div>

      <div className="relative flex-1">
        <span
          aria-hidden
          className={`absolute -left-[22px] top-6 h-3 w-3 rounded-full ring-4 ring-background ${meta.dotClass}`}
        />
        <Card
          className={`group overflow-hidden border-l-4 ${meta.borderClass} ${
            clickable ? "cursor-pointer transition-colors hover:bg-muted/40" : ""
          }`}
          onClick={clickable ? () => onSelect?.(event) : undefined}
          role={clickable ? "button" : undefined}
          tabIndex={clickable ? 0 : undefined}
          onKeyDown={
            clickable
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect?.(event);
                  }
                }
              : undefined
          }
        >
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.badgeClass}`}
              >
                {meta.label}
              </span>
              {event.platform && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {event.platform}
                </span>
              )}
              {isPlaceholder && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Sample
                </span>
              )}
              {isNew && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  NEW
                </span>
              )}
            </div>

            {event.title && (
              <h3 className="mt-2 text-base font-semibold text-foreground">
                {event.title}
              </h3>
            )}

            {event.summary && (
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {event.summary}
              </p>
            )}

            {event.asset_preview_url && (
              <div className="mt-3 overflow-hidden rounded-lg bg-muted">
                <img
                  src={event.asset_preview_url}
                  alt={event.title ?? "Event asset"}
                  className="max-h-48 w-full object-cover"
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
