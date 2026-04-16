import type { PricingMetric } from "./PricingOverTimeChart";

/** Shared blue accent — matches Particl's chart color */
export const CHART_BLUE = "#3b82f6";

/** Format a price value to a compact Euro string */
export function fmtPrice(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n === 0) return "€0";
  if (n >= 1) return `€${Math.round(n).toLocaleString("en-US")}`;
  return `€${n.toFixed(2)}`;
}

/** Format a timeseries metric value for display in chart labels / tooltips */
export function formatMetricValue(value: number, metric: PricingMetric): string {
  if (metric === "discount") return `${Math.round(value)}%`;
  return `€${value.toFixed(2)}`;
}
