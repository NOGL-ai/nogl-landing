/**
 * Pure helper functions for the forecast demo seed script.
 * Extracted so they can be unit-tested without a Prisma connection.
 */

import type { ForecastChannelName } from "@/config/forecast";

// ─── Category mapping ────────────────────────────────────────────────────

const INSTAX_CATEGORY_MAP: Record<string, string> = {
  Kamera: "cameras",
  Film: "accessories",
  Aksesoris: "accessories",
  Lens: "lenses",
  Lensa: "lenses",
  Lighting: "lighting",
  Pencahayaan: "lighting",
  Tripod: "tripods",
};

export type NoglCategory = "cameras" | "lenses" | "accessories" | "lighting" | "tripods";

export function mapInstaxCategoryToNogl(instaxCategory: string): NoglCategory {
  const trimmed = instaxCategory?.trim();
  if (!trimmed) return "accessories";
  const mapped = INSTAX_CATEGORY_MAP[trimmed];
  return (mapped ?? "accessories") as NoglCategory;
}

// ─── Channel mapping from Instax `Method` column ─────────────────────────

const INSTAX_METHOD_TO_CHANNEL: Record<string, ForecastChannelName> = {
  "Online Store": "web",
  Website: "web",
  Web: "web",
  Tokopedia: "marketplace",
  Shopee: "marketplace",
  Lazada: "marketplace",
  Bukalapak: "marketplace",
  "Physical Store": "web",
  Store: "web",
  Offline: "web",
  Wholesale: "b2b",
  B2B: "b2b",
};

export function mapInstaxMethodToChannel(method: string): ForecastChannelName {
  const trimmed = method?.trim();
  if (!trimmed) return "web";
  return INSTAX_METHOD_TO_CHANNEL[trimmed] ?? "web";
}

// ─── Seasonal + weekday factors used by quantile synthesis ───────────────

/**
 * Multiplier on baseline demand for a given day.
 * Mirrors consumer-camera Q4 spike (Black Friday + holiday) and mild summer lift.
 */
export function seasonalFactor(date: Date): number {
  const month = date.getUTCMonth(); // 0-indexed
  if (month === 10 || month === 11) return 1.5; // Nov, Dec
  if (month === 6 || month === 7) return 1.1; // Jul, Aug
  return 1.0;
}

export function weekdayFactor(channel: ForecastChannelName, date: Date): number {
  const day = date.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = day === 0 || day === 6;
  if (channel === "b2b" && isWeekend) return 0.2;
  return 1.0;
}

export function discountFactor(channel: ForecastChannelName): number {
  switch (channel) {
    case "web":
    case "shopify":
      return 1.0;
    case "marketplace":
    case "amazon":
      return 0.92;
    case "b2b":
      return 0.85;
    case "offline":
      return 1.0;
  }
}

// ─── Misc utilities ──────────────────────────────────────────────────────

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Parse the Instax CSV `Tanggal` field.
 * Supports ISO (YYYY-MM-DD), slash (YYYY/MM/DD), and Indonesian (DD/MM/YYYY).
 * Returns a UTC-midnight Date or null if unparseable.
 */
export function parseInstaxDate(raw: string): Date | null {
  if (!raw) return null;
  const s = raw.trim();

  // YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(s);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return toUtcDate(+y, +m, +d);
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/.exec(s);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return toUtcDate(+y, +m, +d);
  }

  const parsed = new Date(s);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function toUtcDate(year: number, month: number, day: number): Date | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (isNaN(d.getTime())) return null;
  return d;
}

/** Indonesian Rupiah → Euro at a fixed rate used only for demo seeding. */
export function idrToEur(idr: number, rate: number): number {
  if (!Number.isFinite(idr)) return 0;
  return Math.round(idr * rate * 100) / 100;
}
