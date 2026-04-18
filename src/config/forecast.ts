/**
 * Shared forecast configuration — single source of truth for channel labels,
 * palettes, and constants. Used by DemandClient, FilterPanel, ChannelFilter,
 * ForecastChart, and ComparisonForecastChart.
 *
 * Channel names (`web`, `marketplace`, `b2b`) MUST match the `ForecastSaleChannel.name`
 * values seeded in `scripts/seed-calumet-forecast.ts`.
 */

import type { ForecastChannelConfig, ForecastQuantileValue } from "@/types/forecast";

export const CALUMET_COMPANY_ID = "cmnw4qqo10000ltccgauemneu";

export const DEFAULT_CHANNEL_NAMES = ["web", "marketplace", "b2b"] as const;

export const CHANNEL_CONFIGS: ForecastChannelConfig[] = [
  {
    name: "web",
    label: "Online Store",
    colorFg: "#2970FF",
    colorBg: "#EFF4FF",
  },
  {
    name: "marketplace",
    label: "Marketplace",
    colorFg: "#F79009",
    colorBg: "#FFFAEB",
  },
  {
    name: "b2b",
    label: "B2B Wholesale",
    colorFg: "#12B76A",
    colorBg: "#ECFDF3",
  },
];

/**
 * Two palettes — HISTORY in blues, FORECAST in pinks — matching the reference.
 * Ordered light → dark so stacked bars read correctly on screen.
 */
export const HISTORY_PALETTE = ["#D3E4FD", "#2970FF", "#1D2939"];
export const FORECAST_PALETTE = ["#FCE7F3", "#F472B6", "#701A75"];

export const QUANTILE_LABELS: Record<ForecastQuantileValue, string> = {
  3: "Pessimistic",
  4: "Median",
  5: "Optimistic",
};

export const FORECAST_SESSION_KEY = (id: string) => `forecast:filter:${id}`;
