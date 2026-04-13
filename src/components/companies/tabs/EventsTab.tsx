"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CompanyEventsResponse } from "@/types/company";
import { fetchJson, formatDateTime, InlineError, PanelSkeleton } from "./shared";

type EventsTabProps = {
  slug: string;
  active: boolean;
};

type EventsState = {
  data: CompanyEventsResponse | null;
  error: string | null;
  loading: boolean;
};

function eventTone(eventType: string): string {
  if (eventType === "INSTAGRAM_POST") return "border-l-purple-500";
  if (eventType === "PRICE_DROP") return "border-l-red-500";
  if (eventType === "NEWSLETTER") return "border-l-blue-500";
  return "border-l-zinc-400";
}

export function EventsTab({ slug, active }: EventsTabProps) {
  const [state, setState] = useState<EventsState>({
    data: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    if (!active || state.data || state.loading) {
      return;
    }

    let cancelled = false;

    async function load() {
      setState((current) => ({ ...current, loading: true, error: null }));

      try {
        const data = await fetchJson<CompanyEventsResponse>(`/api/companies/${slug}/events`);
        if (!cancelled) {
          setState({ data, error: null, loading: false });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            error: error instanceof Error ? error.message : "Could not load event data.",
            loading: false,
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [active, slug, state.data, state.loading]);

  if (state.loading && !state.data) {
    return <PanelSkeleton rows={3} grid="grid-cols-1" />;
  }

  if (state.error) {
    return <InlineError message={state.error} />;
  }

  if (!state.data) {
    return null;
  }

  return (
    <div className="space-y-4">
      {state.data.events.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">No events detected yet.</Card>
      ) : (
        state.data.events.map((event) => (
          <Card
            key={event.id}
            className={`border-l-4 p-5 ${eventTone(event.event_type)}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" size="sm" className="rounded-full">
                {event.event_type}
              </Badge>
              {event.platform ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {event.platform}
                </span>
              ) : null}
              {event.id.startsWith("placeholder-") ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Sample
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-foreground">{event.title ?? "Untitled event"}</h3>
                {event.summary ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {event.summary}
                  </p>
                ) : null}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDateTime(event.event_date)}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
