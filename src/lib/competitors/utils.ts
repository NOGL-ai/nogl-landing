import { headers } from "next/headers";

export function formatRelativeTime(value: string | null): string {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const diffMs = date.getTime() - Date.now();
  const absDiffMs = Math.abs(diffMs);

  if (absDiffMs < 60_000) {
    return "just now";
  }

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
    { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
    { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
    { unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
    { unit: "day", ms: 24 * 60 * 60 * 1000 },
    { unit: "hour", ms: 60 * 60 * 1000 },
    { unit: "minute", ms: 60 * 1000 },
  ];

  for (const { unit, ms } of units) {
    if (absDiffMs >= ms || unit === "minute") {
      return formatter.format(Math.round(diffMs / ms), unit);
    }
  }

  return "just now";
}

export function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "nogl.ai:3000";
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${protocol}://${host}`.replace(/\/$/, "");
}
