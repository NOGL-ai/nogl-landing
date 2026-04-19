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

export type ForecastChannelName = "web" | "marketplace" | "b2b";

export interface ForecastChannelDef {
  name: ForecastChannelName;
  label: string;
  colorFg: string;
  colorBg: string;
  weight: number; // share of total demand used by the seed script
}

export const FORECAST_CHANNELS: readonly ForecastChannelDef[] = [
  { name: "web", label: "Web", colorFg: "#2970FF", colorBg: "#EFF4FF", weight: 0.6 },
  { name: "marketplace", label: "Marketplace", colorFg: "#F79009", colorBg: "#FFFAEB", weight: 0.3 },
  { name: "b2b", label: "B2B", colorFg: "#12B76A", colorBg: "#ECFDF3", weight: 0.1 },
] as const;

export const FORECAST_CHANNEL_NAMES: readonly ForecastChannelName[] = FORECAST_CHANNELS.map(
  (c) => c.name,
);

export type ForecastQuantile = 3 | 4 | 5;
export const FORECAST_QUANTILES: readonly ForecastQuantile[] = [3, 4, 5] as const;
export const DEFAULT_QUANTILE: ForecastQuantile = 4;

export type ForecastScale = "daily" | "weekly" | "monthly";
export const DEFAULT_SCALE: ForecastScale = "daily";

export type ForecastMetric = "sale" | "revenue";
export const DEFAULT_METRIC: ForecastMetric = "sale";

export const FORECAST_HORIZON_DAYS = 60;
export const FORECAST_HISTORY_DAYS = 14;

export const FORECAST_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const FORECAST_CACHE_MAX_ENTRIES = 500;

// Approximate fixed rate used only when seeding the Indonesian Instax dataset.
// Not used for any real-money conversion.
export const SEED_IDR_TO_EUR = 0.000058;
