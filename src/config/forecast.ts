/**
 * Demand-forecast configuration.
 * Shared by the seed script, server actions, and the demand page.
 * Single source of truth for tenant identity, channel palette,
 * and default forecast-horizon settings.
 */

export const CALUMET_COMPANY_ID = "cmnw4qqo10000ltccgauemneu" as const;

export const CALUMET_COMPANY = {
  id: CALUMET_COMPANY_ID,
  slug: "calumet",
  name: "Calumet Photo",
  domain: "calumetphoto.com",
  country_code: "NL",
} as const;

export type ForecastChannelName =
  | "web"
  | "marketplace"
  | "b2b"
  | "shopify"
  | "amazon"
  | "offline";

export interface ForecastChannelDef {
  name: ForecastChannelName;
  label: string;
  colorFg: string;
  colorBg: string;
  weight: number; // share of total demand used by the seed script
}

export const FORECAST_CHANNELS: readonly ForecastChannelDef[] = [
  { name: "web", label: "Web", colorFg: "#2970FF", colorBg: "#EFF4FF", weight: 0.4 },
  { name: "marketplace", label: "Marketplace", colorFg: "#F79009", colorBg: "#FFFAEB", weight: 0.2 },
  { name: "b2b", label: "B2B", colorFg: "#12B76A", colorBg: "#ECFDF3", weight: 0.1 },
  { name: "shopify", label: "Shopify", colorFg: "#2563EB", colorBg: "#EFF4FF", weight: 0.15 },
  { name: "amazon", label: "Amazon", colorFg: "#EC4899", colorBg: "#FCE7F3", weight: 0.1 },
  { name: "offline", label: "Offline Store", colorFg: "#1E3A5F", colorBg: "#E0E7FF", weight: 0.05 },
] as const;

/**
 * Alias of FORECAST_CHANNELS kept for FilterPanel / ChannelFilter consumers
 * that expect the generic `ForecastChannelConfig[]` shape.
 *
 * Spread into a fresh array so the type is mutable (assignable to the
 * non-readonly `ForecastChannelConfig[]` prop of `ChannelFilter`). The
 * values themselves are still the canonical `FORECAST_CHANNELS` entries.
 */
export const CHANNEL_CONFIGS: ForecastChannelDef[] = [...FORECAST_CHANNELS];

export const FORECAST_CHANNEL_NAMES: readonly ForecastChannelName[] = FORECAST_CHANNELS.map(
  (c) => c.name,
);

export type ForecastQuantile = 3 | 4 | 5;
export const FORECAST_QUANTILES: readonly ForecastQuantile[] = [3, 4, 5] as const;
export const DEFAULT_QUANTILE: ForecastQuantile = 4;

/**
 * Human-readable label for each quantile, used by chart legends, tooltips,
 * and accessibility text in `<ForecastChart />`.
 *  - 3 → pessimistic lower bound
 *  - 4 → median (most likely)
 *  - 5 → optimistic upper bound
 */
export const QUANTILE_LABELS: Record<ForecastQuantile, string> = {
  3: "Pessimistic",
  4: "Median",
  5: "Optimistic",
} as const;

/**
 * Per-channel palette for HISTORY bars (saturated, matches
 * `FORECAST_CHANNELS[i].colorFg`). Indexed positionally so charts that receive
 * a filtered subset of channels still get stable colors.
 */
export const HISTORY_PALETTE: readonly string[] = [
  "#2970FF", // web   — blue
  "#F79009", // marketplace — amber
  "#12B76A", // b2b   — green
  "#90C4FF", // shopify history (light sky)
  "#2563EB", // amazon history (medium blue)
  "#1E3A5F", // offline history (dark navy)
] as const;

/**
 * Per-channel palette for FORECAST bars. Lighter / desaturated versions of
 * `HISTORY_PALETTE` so the forecast stack is visually subordinate to actuals.
 */
export const FORECAST_PALETTE: readonly string[] = [
  "#84ADFF", // web   — light blue
  "#FEC84B", // marketplace — light amber
  "#6CE9A6", // b2b   — light green
  "#F9A8D4", // shopify forecast (light pink)
  "#EC4899", // amazon forecast (hot pink)
  "#7C3AED", // offline forecast (muted purple)
] as const;

export type ForecastScale = "daily" | "weekly" | "monthly";
export const DEFAULT_SCALE: ForecastScale = "daily";

export type ForecastMetric = "sale" | "revenue";
export const DEFAULT_METRIC: ForecastMetric = "sale";

export const FORECAST_HORIZON_DAYS = 180;
export const FORECAST_HISTORY_DAYS = 365;

export const FORECAST_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const FORECAST_CACHE_MAX_ENTRIES = 500;

// Approximate fixed rate used only when seeding the Indonesian Instax dataset.
// Not used for any real-money conversion.
export const SEED_IDR_TO_EUR = 0.000058;

/**
 * Multipliers applied to the median forecast value when synthesizing the
 * pessimistic (Q30) and optimistic (Q70) quantile series in seed scripts.
 *
 * The spread is intentionally visible on a monthly chart:
 *  3 → 0.65× median  (35% below)
 *  4 → 1.0× median   (median)
 *  5 → 1.35× median  (35% above)
 *
 * TODO Wave 2: replace the inline literals in scripts/seed-calumet-forecast.ts
 * (line ~671) and scripts/seed-forecast-demo.ts (line ~337) with these values.
 */
export const QUANTILE_MULTIPLIERS: Record<3 | 4 | 5, number> = {
  3: 0.65,
  4: 1.0,
  5: 1.35,
} as const;

/**
 * Calumet-specific channel weight overrides.
 * Reflects their real sales mix: flagship Shopify store, 30+ physical stores
 * (offline), professional/studio B2B market, Amazon.de listing, other web
 * traffic, and a small idealo/eBay residual (marketplace).
 *
 * TODO Wave 2: read from CALUMET_CHANNEL_WEIGHTS in ensureTenantAndChannels()
 * inside src/lib/forecast/seed-helpers.ts when companyId === CALUMET_COMPANY_ID.
 */
export const CALUMET_CHANNEL_WEIGHTS: Record<ForecastChannelName, number> = {
  shopify: 0.30,
  offline: 0.22,
  b2b: 0.18,
  amazon: 0.15,
  web: 0.10,
  marketplace: 0.05,
} as const;
