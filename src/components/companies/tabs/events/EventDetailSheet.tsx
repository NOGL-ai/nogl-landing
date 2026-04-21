"use client";
import { LinkExternal01 as ExternalLink } from '@untitledui/icons';





import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CompanyEventDTO } from "@/types/company";
import { eventTypeMeta } from "@/lib/events/format";
import { formatDateTime } from "../shared";

type EventDetailSheetProps = {
  event: CompanyEventDTO | null;
  onClose: () => void;
};

function SourcePreview({ event }: { event: CompanyEventDTO }) {
  const img = event.asset_preview_url ?? event.asset_url;
  switch (event.event_type) {
    case "NEWSLETTER":
    case "PROMOTION":
      return (
        <div className="space-y-3">
          {img && (
            <div className="overflow-hidden rounded-lg border border-border-primary bg-bg-tertiary">
              <img
                src={img}
                alt={event.title ?? "Source asset"}
                className="w-full object-cover"
              />
            </div>
          )}
          {event.summary && (
            <p className="text-sm leading-6 text-text-primary whitespace-pre-wrap">
              {event.summary}
            </p>
          )}
        </div>
      );
    case "PRODUCT_NEWS":
    case "PRICE_DROP":
      return (
        <div className="space-y-3 rounded-lg border p-4">
          {img && (
            <div className="overflow-hidden rounded bg-bg-tertiary">
              <img
                src={img}
                alt={event.title ?? "Product"}
                className="max-h-56 w-full object-contain"
              />
            </div>
          )}
          {event.title && <p className="text-sm font-semibold">{event.title}</p>}
          {event.summary && (
            <p className="text-sm text-text-tertiary">{event.summary}</p>
          )}
        </div>
      );
    case "INSTAGRAM_POST":
    case "SPECIAL_EVENT":
      return (
        <div className="space-y-3">
          {img && (
            <div className="overflow-hidden rounded-lg border border-border-primary bg-bg-tertiary">
              <img
                src={img}
                alt={event.title ?? "Event"}
                className="w-full object-cover"
              />
            </div>
          )}
          {event.platform && (
            <span className="inline-flex rounded-full border border-border-primary bg-bg-secondary px-2 py-0.5 text-xs font-medium text-text-tertiary">
              {event.platform}
            </span>
          )}
          {event.summary && (
            <p className="text-sm leading-6 text-text-primary">{event.summary}</p>
          )}
        </div>
      );
    default:
      return event.summary ? (
        <p className="text-sm leading-6 text-text-primary">{event.summary}</p>
      ) : null;
  }
}

export function EventDetailSheet({ event, onClose }: EventDetailSheetProps) {
  const open = event !== null;
  const meta = event ? eventTypeMeta(event.event_type) : null;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetContent side="right" className="flex flex-col p-0">
        {event && meta && (
          <>
            <SheetHeader>
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
              </div>
              <SheetTitle className="mt-2">
                {event.title ?? "Event details"}
              </SheetTitle>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-text-tertiary">
                <div>
                  <dt className="font-medium">Occurred</dt>
                  <dd>{formatDateTime(event.event_date)}</dd>
                </div>
                <div>
                  <dt className="font-medium">Detected</dt>
                  <dd>{formatDateTime(event.createdAt)}</dd>
                </div>
              </dl>
            </SheetHeader>

            <SheetBody className="space-y-4">
              <SourcePreview event={event} />

              {event.raw_payload !== null && event.raw_payload !== undefined && (
                <details className="rounded-lg border border-border-primary p-3 text-xs">
                  <summary className="cursor-pointer font-medium text-text-primary">
                    Metadata
                  </summary>
                  <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-bg-tertiary p-2 text-[11px] text-text-tertiary">
                    {JSON.stringify(event.raw_payload, null, 2)}
                  </pre>
                </details>
              )}
            </SheetBody>

            <SheetFooter>
              {event.source_url ? (
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-bg-brand-solid px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-bg-brand-solid-hover"
                >
                  Open source
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded-md bg-bg-tertiary px-4 py-2 text-sm font-medium text-text-tertiary">
                  No source link
                </span>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}