"use client";

import { format } from "date-fns";

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
      <div className="flex w-14 shrink-0 flex-col items-end pt-4 text-xs font-medium tabular-nums text-text-tertiary">
        {time}
      </div>

      <div className="relative flex-1">
        <span
          aria-hidden
          className={`absolute -left-[22px] top-6 h-3 w-3 rounded-full ring-4 ring-bg-primary ${meta.dotClass}`}
        />
        <div
          className={`group overflow-hidden rounded-xl border border-border-primary border-l-4 ${meta.borderClass} bg-bg-primary shadow-xs ${
            clickable ? "cursor-pointer transition-colors hover:bg-bg-secondary" : ""
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
                <span className="rounded-full border border-border-primary bg-bg-secondary px-2 py-0.5 text-xs font-medium text-text-tertiary">
                  {event.platform}
                </span>
              )}
              {isPlaceholder && (
                <span className="rounded-full border border-border-primary bg-bg-secondary px-2 py-0.5 text-xs font-medium text-text-tertiary">
                  Sample
                </span>
              )}
              {event.duration_days != null && event.duration_days > 0 && (
                <span className="rounded-full border border-border-primary bg-bg-secondary px-2 py-0.5 text-xs text-text-tertiary">
                  {event.duration_days} day{event.duration_days !== 1 ? "s" : ""}
                </span>
              )}
              {isNew && (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-text-brand">
                  New
                </span>
              )}
            </div>

            {event.title && (
              <h3 className="mt-2 text-base font-semibold text-text-primary">
                {event.title}
              </h3>
            )}

            {event.summary && (
              <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-text-tertiary">
                {event.summary}
              </p>
            )}

            {event.asset_preview_url && (
              <div className="mt-3 overflow-hidden rounded-lg bg-bg-tertiary">
                <img
                  src={event.asset_preview_url}
                  alt={event.title ?? "Event asset"}
                  className="max-h-48 w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
