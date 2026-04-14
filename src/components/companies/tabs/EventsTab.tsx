"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import type { CompanyEventsResponse } from "@/types/company";
import { fetchJson, InlineError, EventsTabSkeleton } from "./shared";

type EventsTabProps = {
  slug: string;
  active?: boolean;
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
  if (eventType === "PROMOTION") return "border-l-amber-500";
  if (eventType === "SPECIAL_EVENT") return "border-l-purple-500";
  if (eventType === "PRODUCT_NEWS") return "border-l-blue-500";
  return "border-l-zinc-400";
}

function eventBadgeColor(eventType: string): string {
  if (eventType === "INSTAGRAM_POST") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
  if (eventType === "PRICE_DROP") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  if (eventType === "NEWSLETTER") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  if (eventType === "PROMOTION") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  if (eventType === "SPECIAL_EVENT") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
  if (eventType === "PRODUCT_NEWS") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  return "bg-muted text-muted-foreground";
}

function EventCard({ event }: { event: CompanyEventsResponse["events"][0] }) {
  const formattedDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <Card className={`border-l-4 ${eventTone(event.event_type)} overflow-hidden`}>
      {/* Date header */}
      {formattedDate && (
        <p className="border-b border-border px-5 py-2 text-sm font-medium text-muted-foreground">
          {formattedDate}
        </p>
      )}
      <div className="p-5">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${eventBadgeColor(event.event_type)}`}>
            {event.event_type.replace(/_/g, " ")}
          </span>
          {event.platform && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {event.platform}
            </span>
          )}
          {event.id.startsWith("placeholder-") && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Sample
            </span>
          )}
        </div>

        {/* Title */}
        {event.title && (
          <h3 className="mt-3 text-lg font-semibold text-foreground">{event.title}</h3>
        )}

        {/* Image */}
        {event.asset_preview_url && (
          <div className="mt-4 overflow-hidden rounded-lg bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.asset_preview_url}
              alt={event.title ?? "Event asset"}
              className="mx-auto max-h-64 w-full object-cover"
            />
          </div>
        )}

        {/* Summary — full text, no line-clamp */}
        {event.summary && (
          <p className="mt-4 text-sm leading-7 text-muted-foreground">{event.summary}</p>
        )}
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
            hasMore: data.pagination.page < data.pagination.totalPages,
            currentPage: 1,
            totalPages: data.pagination.totalPages,
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
          hasMore: data.pagination.page < data.pagination.totalPages,
          currentPage: nextPage,
          totalPages: data.pagination.totalPages,
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
        <p className="py-4 text-center text-sm text-muted-foreground">Loading more events...</p>
      )}

      {/* Infinite scroll sentinel */}
      {state.hasMore && <div ref={sentinelRef} className="h-4" />}

      {/* End of list message */}
      {!state.hasMore && state.events.length > 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">No more events to load</p>
      )}
    </div>
  );
}
