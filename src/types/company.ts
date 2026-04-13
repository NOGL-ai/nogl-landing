import { PageMeta } from "./product";

export type CompanyTrackingStatus = "UNTRACKED" | "TRACKED" | "PAUSED";

export type CompanyDTO = {
  id: string;
  slug: string;
  name: string;
  domain: string;
  country_code: string;
  locale?: string | null;
  website?: string | null;
  source_key?: string | null;
  industry?: string | null;
  product_types: string[];
  dataset_quality_score?: number | null;
  tracking_status: CompanyTrackingStatus;
  tracked_competitor_id?: string | null;
  wm_key?: string | null;
  arango_id?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PriceDistributionBucket = {
  range: string;
  count: number;
  percentage: number;
};

export type CompanySnapshotDTO = {
  id: string;
  company_id: string;
  rank?: number | null;
  percentile?: number | null;
  total_products: number;
  total_variants: number;
  total_datapoints: number;
  total_discounted: number;
  avg_discount_pct?: number | null;
  avg_price?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  price_distribution?: PriceDistributionBucket[] | null;
  top_product_id?: string | null;
  top_product_title?: string | null;
  top_product_image_url?: string | null;
  data_since?: string | null;
  last_scraped_at?: string | null;
  ig_followers?: number | null;
  ig_avg_likes?: number | null;
  ig_most_liked_url?: string | null;
  ig_asset_count?: number | null;
  computed_at: string;
};

export type CompanyEventDTO = {
  id: string;
  company_id: string;
  event_type: string;
  platform?: string | null;
  title?: string | null;
  summary?: string | null;
  asset_url?: string | null;
  asset_preview_url?: string | null;
  event_date: string;
  duration_days?: number | null;
  confidence?: number | null;
  score?: number | null;
  source_url?: string | null;
  raw_payload?: unknown;
  createdAt: string;
};

export type CompanyAssetDTO = {
  id: string;
  company_id: string;
  channel: string;
  asset_type: string;
  url?: string | null;
  thumbnail_url?: string | null;
  caption?: string | null;
  likes?: number | null;
  comments?: number | null;
  published_at?: string | null;
  raw_payload?: unknown;
  createdAt: string;
};

export type CompanyOverviewResponse = {
  company: CompanyDTO;
  snapshot: CompanySnapshotDTO;
};

export type CompanyEventsResponse = {
  company: Pick<CompanyDTO, "id" | "slug" | "name" | "country_code">;
  events: CompanyEventDTO[];
  pagination: PageMeta;
};

export type CompanyPricingProductTypeRow = {
  type: string;
  count: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  avg_discount_pct: number;
};

export type CompanyPricingResponse = {
  company: Pick<CompanyDTO, "id" | "slug" | "name" | "country_code">;
  total_products: number;
  total_variants: number;
  total_datapoints: number;
  total_discounted: number;
  avg_discount_pct?: number | null;
  avg_price?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  product_types: CompanyPricingProductTypeRow[];
  pagination: PageMeta;
};

export type CompanyAssetsResponse = {
  company: Pick<CompanyDTO, "id" | "slug" | "name" | "country_code">;
  ig_followers?: number | null;
  ig_avg_likes?: number | null;
  ig_asset_count?: number | null;
  ig_most_liked_url?: string | null;
  items: CompanyAssetDTO[];
  pagination: PageMeta;
};

export type CompanyListItem = {
  id: string;
  slug: string;
  name: string;
  domain: string;
  country_code: string;
  industry?: string | null;
  tracking_status: CompanyTrackingStatus;
  dataset_quality_score?: number | null;
  total_products: number;
  last_scraped_at?: string | null;
};

export type GetCompaniesResponse = {
  companies: CompanyListItem[];
  pagination: PageMeta;
};
