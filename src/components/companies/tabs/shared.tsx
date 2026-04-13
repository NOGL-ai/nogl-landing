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
