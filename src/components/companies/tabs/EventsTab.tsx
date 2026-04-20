"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { CompanyEventDTO, CompanyEventsResponse } from "@/types/company";
import {
  downloadEventsCsv,
  groupEventsByDay,
  periodToDateRange,
  type PeriodValue,
} from "@/lib/events/format";

import { EventsEmptyState } from "./events/EventsEmptyState";
import { EventDetailSheet } from "./events/EventDetailSheet";
import { EventsToolbar } from "./events/EventsToolbar";
import { EventTimeline } from "./events/EventTimeline";
import { fetchJson, EventsTabSkeleton, InlineError } from "./shared";

type EventsTabProps = {
  slug: string;
  active?: boolean;
};

const PAGE_SIZE = 50;
const NEW_BADGE_MS = 5000;

type EventsState = {
  events: CompanyEventDTO[];
  error: string | null;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
  total: number;
};

function buildQuery(
  slug: string,
  page: number,
  period: PeriodValue,
  selectedTypes: string[]
): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(PAGE_SIZE));
  const { from, to } = periodToDateRange(period);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (selectedTypes.length > 0) params.set("eventTypes", selectedTypes.join(","));
  return `/api/companies/${slug}/events?${params.toString()}`;
}

export function EventsTab({ slug }: EventsTabProps) {
  const [period, setPeriod] = useState<PeriodValue>("all");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CompanyEventDTO | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  const [state, setState] = useState<EventsState>({
    events: [],
    error: null,
    loading: false,
    loadingMore: false,
    hasMore: false,
    currentPage: 1,
    total: 0,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initial + filter-driven refetch
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetch(buildQuery(slug, 1, period, selectedTypes), {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Request failed with status ${res.status}`);
        }
        const data = (await res.json()) as CompanyEventsResponse;
        setState({
          events: data.events,
          error: null,
          loading: false,
          loadingMore: false,
          hasMore: data.pagination.page < data.pagination.totalPages,
          currentPage: 1,
          total: data.pagination.total,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState((s) => ({
          ...s,
          loading: false,
          error:
            error instanceof Error ? error.message : "Could not load events.",
        }));
      }
    }
    void load();
    return () => controller.abort();
  }, [slug, period, selectedTypes]);

  const loadMore = useCallback(async () => {
    if (state.loadingMore || !state.hasMore || state.loading) return;
    setState((s) => ({ ...s, loadingMore: true }));
    try {
      const nextPage = state.currentPage + 1;
      const data = await fetchJson<CompanyEventsResponse>(
        buildQuery(slug, nextPage, period, selectedTypes)
      );
      setState((s) => ({
        ...s,
        events: [...s.events, ...data.events],
        loadingMore: false,
        hasMore: data.pagination.page < data.pagination.totalPages,
        currentPage: nextPage,
        total: data.pagination.total,
      }));
    } catch (error) {
      setState((s) => ({
        ...s,
        loadingMore: false,
        error:
          error instanceof Error ? error.message : "Failed to load more events.",
      }));
    }
  }, [
    slug,
    period,
    selectedTypes,
    state.currentPage,
    state.hasMore,
    state.loading,
    state.loadingMore,
  ]);

  // Infinite scroll sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(sentinel);
    return () => observerRef.current?.disconnect();
  }, [loadMore]);

  // SSE subscribe for new events
  useEffect(() => {
    const source = new EventSource(`/api/companies/${slug}/events/stream`);
    const onEvent = (msg: MessageEvent<string>) => {
      try {
        const incoming = JSON.parse(msg.data) as CompanyEventDTO;
        setState((s) => {
          if (s.events.some((e) => e.id === incoming.id)) return s;
          return {
            ...s,
            events: [incoming, ...s.events],
            total: s.total + 1,
          };
        });
        setNewIds((ids) => {
          const next = new Set(ids);
          next.add(incoming.id);
          return next;
        });
        setTimeout(() => {
          setNewIds((ids) => {
            if (!ids.has(incoming.id)) return ids;
            const next = new Set(ids);
            next.delete(incoming.id);
            return next;
          });
        }, NEW_BADGE_MS);
      } catch {
        // Ignore malformed frame.
      }
    };
    source.addEventListener("event", onEvent as EventListener);
    return () => {
      source.removeEventListener("event", onEvent as EventListener);
      source.close();
    };
  }, [slug]);

  const hasFilters = selectedTypes.length > 0 || period !== "all";
  const groups = useMemo(() => groupEventsByDay(state.events), [state.events]);

  const handleExportCsv = useCallback(() => {
    const filename = `events-${slug}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    downloadEventsCsv(state.events, filename);
  }, [slug, state.events]);

  const body = (() => {
    if (state.loading && state.events.length === 0) {
      return <EventsTabSkeleton />;
    }
    if (state.error && state.events.length === 0) {
      return <InlineError message={state.error} />;
    }
    if (state.events.length === 0) {
      return <EventsEmptyState hasFilters={hasFilters} />;
    }
    return (
      <>
        <EventTimeline
          groups={groups}
          onSelect={setSelectedEvent}
          newIds={newIds}
        />
        {state.loadingMore && (
          <p className="py-4 text-center text-sm text-text-tertiary">
            Loading more events…
          </p>
        )}
        {state.hasMore && <div ref={sentinelRef} className="h-4" />}
        {!state.hasMore && state.events.length > 0 && (
          <p className="py-4 text-center text-xs text-text-quaternary">
            All events loaded
          </p>
        )}
      </>
    );
  })();

  return (
    <div className="space-y-6">
      <EventsToolbar
        total={state.total}
        period={period}
        onPeriodChange={setPeriod}
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        onExportCsv={handleExportCsv}
        exportDisabled={state.events.length === 0}
      />

      {body}

      <EventDetailSheet
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
