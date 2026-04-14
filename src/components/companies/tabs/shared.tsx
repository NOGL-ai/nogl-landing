"use client";

import { Card } from "@/components/ui/card";

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Ignore parse failure and keep the HTTP message fallback.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function PanelSkeleton({
  rows = 3,
  grid = "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
}: {
  rows?: number;
  grid?: string;
}) {
  return (
    <div className="space-y-6">
      <div className={`grid gap-4 ${grid}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <Card key={index} className="animate-pulse p-5">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="mt-4 h-8 w-16 rounded bg-muted" />
          </Card>
        ))}
      </div>
      <Card className="animate-pulse p-6">
        <div className="h-5 w-36 rounded bg-muted" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-10 rounded bg-muted" />
          ))}
        </div>
      </Card>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-zinc-400 p-5 animate-pulse">
      {/* Header badges */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-6 w-24 rounded-full bg-muted" />
        <div className="h-6 w-20 rounded-full bg-muted" />
        <div className="h-6 w-16 rounded-full bg-muted" />
      </div>

      {/* Content and date row */}
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        {/* Left content */}
        <div className="min-w-0 flex-1">
          {/* Title */}
          <div className="h-6 w-3/4 rounded bg-muted" />
          {/* Summary lines */}
          <div className="mt-2 space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
          </div>
        </div>
        {/* Date */}
        <div className="h-4 w-32 rounded bg-muted flex-shrink-0" />
      </div>

      {/* Image carousel area */}
      <div className="mt-4 flex justify-center">
        <div className="h-48 w-full rounded-lg bg-muted" />
      </div>

      {/* Engagement metrics */}
      <div className="mt-4 flex gap-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-muted" />
          <div className="h-4 w-12 rounded bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-muted" />
          <div className="h-4 w-12 rounded bg-muted" />
        </div>
      </div>
    </Card>
  );
}

export function EventsTabSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      {message}
    </Card>
  );
}

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatNumber(value?: number | null): string {
  return typeof value === "number" ? value.toLocaleString() : "N/A";
}

export function formatEuro(value?: number | null): string {
  return typeof value === "number" ? `€${value.toFixed(2)}` : "N/A";
}

export function formatPercent(value?: number | null): string {
  return typeof value === "number" ? `${value.toFixed(1)}%` : "N/A";
}
