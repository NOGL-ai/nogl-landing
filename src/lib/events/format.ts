import { format, isToday, isYesterday, subWeeks, subMonths, subYears } from "date-fns";

import type { CompanyEventDTO } from "@/types/company";

export type EventTypeMeta = {
  label: string;
  tone: string;
  badgeClass: string;
  borderClass: string;
  dotClass: string;
};

const META: Record<string, EventTypeMeta> = {
  PROMOTION: {
    label: "Promotion",
    tone: "amber",
    badgeClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    borderClass: "border-l-amber-500",
    dotClass: "bg-amber-500",
  },
  PRICE_DROP: {
    label: "Price drop",
    tone: "red",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    borderClass: "border-l-red-500",
    dotClass: "bg-red-500",
  },
  NEWSLETTER: {
    label: "Newsletter",
    tone: "blue",
    badgeClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    borderClass: "border-l-blue-500",
    dotClass: "bg-blue-500",
  },
  INSTAGRAM_POST: {
    label: "Instagram",
    tone: "purple",
    badgeClass:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    borderClass: "border-l-purple-500",
    dotClass: "bg-purple-500",
  },
  PRODUCT_NEWS: {
    label: "Product news",
    tone: "emerald",
    badgeClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    borderClass: "border-l-emerald-500",
    dotClass: "bg-emerald-500",
  },
  SPECIAL_EVENT: {
    label: "Special event",
    tone: "fuchsia",
    badgeClass:
      "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
    borderClass: "border-l-fuchsia-500",
    dotClass: "bg-fuchsia-500",
  },
};

const FALLBACK_META: EventTypeMeta = {
  label: "Event",
  tone: "zinc",
  badgeClass: "bg-muted text-muted-foreground",
  borderClass: "border-l-zinc-400",
  dotClass: "bg-zinc-400",
};

export function eventTypeMeta(eventType: string): EventTypeMeta {
  const meta = META[eventType];
  if (meta) return meta;
  return {
    ...FALLBACK_META,
    label: eventType.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
  };
}

export type EventDayGroup = {
  dayKey: string;
  label: string;
  events: CompanyEventDTO[];
};

export function groupEventsByDay(events: CompanyEventDTO[]): EventDayGroup[] {
  const groups = new Map<string, EventDayGroup>();
  for (const event of events) {
    const date = new Date(event.event_date);
    if (Number.isNaN(date.getTime())) continue;
    const dayKey = format(date, "yyyy-MM-dd");
    let group = groups.get(dayKey);
    if (!group) {
      const label = isToday(date)
        ? "Today"
        : isYesterday(date)
          ? "Yesterday"
          : format(date, "MMM d, yyyy");
      group = { dayKey, label, events: [] };
      groups.set(dayKey, group);
    }
    group.events.push(event);
  }
  return Array.from(groups.values()).sort((a, b) =>
    a.dayKey < b.dayKey ? 1 : a.dayKey > b.dayKey ? -1 : 0
  );
}

export type PeriodValue = "1w" | "4w" | "3m" | "6m" | "1y" | "all";

export function periodToDateRange(
  period: PeriodValue,
  now: Date = new Date()
): { from?: string; to?: string } {
  if (period === "all") return {};
  const to = now;
  let from: Date;
  switch (period) {
    case "1w":
      from = subWeeks(now, 1);
      break;
    case "4w":
      from = subWeeks(now, 4);
      break;
    case "3m":
      from = subMonths(now, 3);
      break;
    case "6m":
      from = subMonths(now, 6);
      break;
    case "1y":
      from = subYears(now, 1);
      break;
  }
  return { from: from.toISOString(), to: to.toISOString() };
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildEventsCsv(events: CompanyEventDTO[]): string {
  const header = [
    "id",
    "event_date",
    "event_type",
    "platform",
    "title",
    "summary",
    "source_url",
    "confidence",
    "createdAt",
  ];
  const rows = events.map((e) =>
    [
      e.id,
      e.event_date,
      e.event_type,
      e.platform ?? "",
      e.title ?? "",
      e.summary ?? "",
      e.source_url ?? "",
      e.confidence ?? "",
      e.createdAt,
    ]
      .map(csvEscape)
      .join(",")
  );
  return [header.join(","), ...rows].join("\n");
}

export function downloadEventsCsv(events: CompanyEventDTO[], filename: string): void {
  const csv = buildEventsCsv(events);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
