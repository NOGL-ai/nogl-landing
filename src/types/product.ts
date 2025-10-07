// Shared DTOs for products and pagination to align UI and API

export type SortOrder = "asc" | "desc";

export type BrandDTO = {
  id: string;
  name: string;
  logo?: string | null;
};

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
};

export type CompetitorPriceDTO = {
  id: string;
  name: string;
  cheapest: number;
  avg: number;
  highest: number;
  // Keep string fallback to match any custom color names coming from backend
  cheapestColor?: "green" | "red" | "yellow" | string;
};

export type ProductDTO = {
  id: string;
  name: string;
  sku: string;
  image?: string | null;
  price: number;
  currency: string;
  channel?: string | null;
  brand?: BrandDTO | null;
  category?: CategoryDTO | null;
  competitors?: CompetitorPriceDTO[];
  _count?: {
    competitors: number;
  };
};

export type ProductFilters = {
  search?: string;
  status?: string;
  featured?: boolean;
  channel?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type ProductSort = {
  sortBy?: string;
  sortOrder?: SortOrder;
};

export type PageParams = {
  page?: number;
  limit?: number;
} & ProductFilters & ProductSort;

export type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<TItem, TFilters = unknown> = {
  items: TItem[];
  pagination: PageMeta;
  filters?: TFilters;
};

// Shape matching /api/products exactly (keep alongside generic PaginatedResponse)
export type GetProductsResponse = {
  products: ProductDTO[];
  pagination: PageMeta;
  filters: ProductFilters;
};


