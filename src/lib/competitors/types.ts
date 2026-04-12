export interface CompetitorRow {
  id: string;
  name: string;
  domain: string;
  website: string | null;
  productCount: number;
  status: "ACTIVE" | "INACTIVE" | "MONITORING" | "PAUSED" | "ARCHIVED";
  isMonitoring: boolean;
  lastScrapedAt: string | null;
  marketPosition: number | null;
  marketShare: string | null;
  categories: string[];
  createdAt: string;
}

export interface CompetitorProduct {
  id: string;
  title: string;
  price: number;
  currency: string;
  url: string;
  lastSeenAt: string | null;
}

export interface PriceHistoryPoint {
  date: string;
  avgPrice: number;
}

export interface CompetitorDetail extends CompetitorRow {
  products: CompetitorProduct[];
  priceHistory?: PriceHistoryPoint[];
}

export interface CompetitorsResponse {
  competitors: CompetitorRow[];
}
