"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CompanyEventsResponse } from "@/types/company";
import { fetchJson, formatDateTime, InlineError, EventsTabSkeleton, EventCardSkeleton } from "./shared";

type EventsTabProps = {
  slug: string;
};

type EventsState = {
  events: CompanyEventsResponse["events"];
  error: string | null;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
};

const INITIAL_LIMIT = 3;

function eventTone(eventType: string): string {
  if (eventType === "INSTAGRAM_POST") return "border-l-purple-500";
  if (eventType === "PRICE_DROP") return "border-l-red-500";
  if (eventType === "NEWSLETTER") return "border-l-blue-500";
  return "border-l-zinc-400";
}

function EventCard({ event }: { event: CompanyEventsResponse["events"][0] }) {
  return (
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
  );
}

export function EventsTab({ slug }: EventsTabProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<EventsState>({
    events: [],
    error: null,
    loading: false,
    loadingMore: false,
    hasMore: true,
    currentPage: 1,
    totalPages: 1,
  });

  // Load initial events
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((current) => ({ ...current, loading: true, error: null }));

      try {
        const url = `/api/companies/${slug}/events?page=1&limit=${INITIAL_LIMIT}`;
        const data = await fetchJson<CompanyEventsResponse>(url);
        if (!cancelled) {
          setState({
            events: data.events,
            error: null,
            loading: false,
            loadingMore: false,
            hasMore: data.pagination.page < data.pagination.pages,
            currentPage: 1,
            totalPages: data.pagination.pages,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            error: error instanceof Error ? error.message : "Could not load event data.",
            loading: false,
          }));
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Load more events
  const loadMore = useCallback(async () => {
    if (state.loadingMore || !state.hasMore || state.loading) {
      return;
    }

    setState((current) => ({ ...current, loadingMore: true }));

    let cancelled = false;

    try {
      const nextPage = state.currentPage + 1;
      const url = `/api/companies/${slug}/events?page=${nextPage}&limit=${INITIAL_LIMIT}`;
      const data = await fetchJson<CompanyEventsResponse>(url);

      if (!cancelled) {
        setState((current) => ({
          ...current,
          events: [...current.events, ...data.events],
          loadingMore: false,
          hasMore: data.pagination.page < data.pagination.pages,
          currentPage: nextPage,
          totalPages: data.pagination.pages,
        }));
      }
    } catch (error) {
      if (!cancelled) {
        setState((current) => ({
          ...current,
          loadingMore: false,
          error: error instanceof Error ? error.message : "Failed to load more events.",
        }));
      }
    }

    return () => {
      cancelled = true;
    };
  }, [state.currentPage, state.hasMore, state.loading, state.loadingMore, slug]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore]);

  if (state.loading && state.events.length === 0) {
    return <EventsTabSkeleton />;
  }

  if (state.error && state.events.length === 0) {
    return <InlineError message={state.error} />;
  }

  if (state.events.length === 0) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">No events detected yet.</Card>
    );
  }

  return (
    <div className="space-y-4">
      {state.events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}

      {/* Loading more indicator */}
      {state.loadingMore && (
        <div className="space-y-4">
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {state.hasMore && <div ref={sentinelRef} className="h-4" />}

      {/* End of list message */}
      {!state.hasMore && state.events.length > 0 && (
        <Card className="p-4 text-center text-sm text-muted-foreground">
          No more events to load
        </Card>
      )}
    </div>
  );
}
