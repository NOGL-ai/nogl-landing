// Types for the company products tab and product detail page

import type { PageMeta } from "@/types/product";

export type ProductListItem = {
  id: string;
  title: string;
  brand: string | null;
  category: string | null;
  current_price: number | null;
  image_url: string | null;
  first_seen: string; // ISO
  last_seen: string; // ISO
  discount_pct: number | null;
};

export type CompanyProductsListResponse = {
  products: ProductListItem[];
  pagination: PageMeta;
};

export type PriceHistoryPoint = {
  date: string; // ISO
  price: number;
};

export type ProductVariant = {
  id: string;
  title: string;
  price: number | null;
  discount_price: number | null;
  in_stock: boolean | null;
};

export type ProductDetail = {
  id: string;
  title: string;
  brand: string | null;
  category: string | null;
  current_price: number | null;
  original_price: number | null;
  discount_price: number | null;
  discount_pct: number | null;
  min_price: number | null;
  max_price: number | null;
  dataset_quality_score: number | null;
  image_url: string | null;
  source_url: string | null;
  first_seen: string; // ISO
  last_seen: string; // ISO
  variants_count: number;
};

export type ProductDetailResponse = {
  product: ProductDetail;
  price_history: PriceHistoryPoint[];
  variants: ProductVariant[];
};
