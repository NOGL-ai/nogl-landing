/**
 * Market Intelligence API Types
 * 
 * Type definitions for the Market Intelligence API integration
 */

export interface MarketIntelligenceSearchRequest {
  imageUrl: string;
  threshold?: number;
  limit?: number;
  offset?: number;
  searchExternal?: boolean;
}

// Removed MarketIntelligenceSearchParams - using Record<string, any> instead

export interface MarketIntelligenceApiResponse {
  results: Array<{
    id: string;
    score: number;
    payload?: {
      product_title?: string;
      product_original_price?: number;
      product_discount_price?: number;
      product_page_image_url?: string;
      product_brand?: string;
      product_vendor?: string;
      product_category?: string;
      product_sku?: string;
      product_url?: string;
      product_currency?: string;
      product_condition?: string;
      product_material?: string;
      product_color?: string;
      product_gender?: string;
      product_season?: string;
      product_family?: string;
      source_url?: string;
      extraction_timestamp?: string;
      [key: string]: any;
    };
  }>;
}

export interface SimilarityMatch {
  id: string;
  name: string;
  score: number;
  price?: number;
  imageUrl?: string;
  brand?: string;
  vendor?: string;
  category?: string;
  sku?: string;
  url?: string;
  currency?: string;
  condition?: string;
  material?: string;
  color?: string;
  gender?: string;
  season?: string;
  family?: string;
  sourceUrl?: string;
  extractionDate?: string;
}

export interface SimilaritySearchResult {
  success: boolean;
  totalMatches: number;
  closestMatch?: SimilarityMatch;
  matches: SimilarityMatch[];
  threshold: number;
  searchTime?: number;
  error?: string;
}

export interface MarketIntelligenceError {
  success: false;
  error: string;
  details?: string;
}

export interface MarketIntelligenceConfig {
  apiUrl: string;
  apiKey: string;
  qdrantHost: string;
  qdrantApiKey: string;
  collectionName: string;
  defaultThreshold: number;
  defaultLimit: number;
  timeout: number;
  retryAttempts: number;
}

export interface SearchOptions {
  threshold?: number;
  limit?: number;
  offset?: number;
  includePayload?: boolean;
  includeVector?: boolean;
  similarityMetric?: string;
  filterQuery?: string;
  customParams?: Record<string, any>;
}

// Legacy types for backward compatibility
export interface SearchRequest {
  imageUrl: string;
  threshold?: number;
  limit?: number;
  qdrantHost?: string;
  qdrantApiKey?: string;
  collectionName?: string;
}

export interface SearchResultItem {
  id: string;
  score: number;
  imageUrl?: string;
  productName?: string;
  productBrand?: string;
  productPrice?: number;
  productUrl?: string;
  [key: string]: any;
}
