export type ForecastMetric = "sale" | "revenue";
export type ForecastScale = "daily" | "weekly" | "monthly";
export type ForecastQuantileValue = 3 | 4 | 5;
export type SaleChannel = "web" | "marketplace" | "b2b";

export interface ForecastDataPoint {
  date: string;
  forecast_value: number | null;
  real_value: number | null;
  quantile: ForecastQuantileValue;
}

export interface ForecastChannelData {
  [channel: string]: ForecastDataPoint[];
}

export interface ForecastResponse {
  startForecastDate: string;
  channels: ForecastChannelData;
}

export interface ForecastSalesParams {
  companyId: string;
  start: string;
  end: string;
  categories?: string[];
  variantIds?: string[];
  channels?: SaleChannel[];
  isSet?: boolean;
  scale: ForecastScale;
  quantile: ForecastQuantileValue;
}

export interface CategoryWithVariants {
  category: string;
  label: string;
  variants: { id: string; title: string; sku: string | null }[];
}

export interface ExportParams {
  companyId: string;
  start: string;
  end: string;
  scale: ForecastScale;
  productGranularity: "variant" | "product" | "category";
  quantile: ForecastQuantileValue;
  preview?: boolean;
}

export interface ForecastChannelConfig {
  name: string;
  label: string;
  colorFg: string;
  colorBg: string;
  weight?: number;
}

// ─── Forecast annotations (event spikes, stock-outs, promotions, launches) ───

export type ForecastAnnotationKind =
  | "event_spike"
  | "out_of_stock"
  | "promotion"
  | "launch";

export type ForecastAnnotationSeverity = "info" | "warning" | "critical";

export interface ForecastAnnotation {
  id: string;
  annotationDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  kind: ForecastAnnotationKind;
  severity: ForecastAnnotationSeverity;
  title: string;
  description: string | null;
  delta: number | null;
  channelName: string | null;
  variantId: string | null;
}
