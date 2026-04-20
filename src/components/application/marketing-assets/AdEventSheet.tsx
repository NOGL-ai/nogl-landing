"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export interface AdEventRow {
  id: string;
  event_type: string;
  platform: string;
  source: string;
  ts: string;
  ingestion_run_id: string;
  idempotency_key: string;
  payload: unknown;
  metrics: unknown;
  handle: string | null;
  account_id: string;
}

interface AdEventSheetProps {
  event: AdEventRow | null;
  onClose: () => void;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  CREATIVE_SEEN: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  CREATIVE_UPDATED: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  POST_METRICS: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  PROFILE_SNAPSHOT: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  PLACEMENT_CHANGE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
};

export function AdEventSheet({ event, onClose }: AdEventSheetProps) {
  return (
    <Sheet open={!!event} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-xl">
        {event && (
          <>
            <SheetHeader className="mb-4">
              <SheetTitle className="flex items-center gap-2 text-base">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${EVENT_TYPE_COLORS[event.event_type] ?? "bg-bg-secondary text-text-secondary"}`}
                >
                  {event.event_type}
                </span>
                <span className="font-mono text-xs text-text-tertiary">{event.id.slice(0, 12)}…</span>
              </SheetTitle>
            </SheetHeader>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Field label="Platform" value={event.platform} />
              <Field label="Source" value={event.source} />
              <Field label="Account" value={event.handle ? `@${event.handle}` : event.account_id} />
              <Field label="Time" value={new Date(event.ts).toLocaleString()} />
              <div className="col-span-2">
                <Field label="Run ID" value={event.ingestion_run_id} mono />
              </div>
              <div className="col-span-2">
                <Field label="Idempotency Key" value={event.idempotency_key} mono />
              </div>
            </dl>

            {event.metrics && (
              <section className="mt-5">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Metrics
                </h3>
                <pre className="overflow-x-auto rounded-lg bg-bg-secondary p-3 text-xs">
                  {JSON.stringify(event.metrics, null, 2)}
                </pre>
              </section>
            )}

            <section className="mt-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Payload
              </h3>
              <pre className="overflow-x-auto rounded-lg bg-bg-secondary p-3 text-xs">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </section>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-text-tertiary">{label}</dt>
      <dd className={`mt-0.5 truncate text-sm text-text-primary ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
