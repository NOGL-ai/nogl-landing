import { GetProductsResponse, PageParams, ProductDTO } from "@/types/product";

// Force to use real API (mock disabled)
const useMock = false;

// Simple in-memory cache for API responses
const cache = new Map<string, { data: GetProductsResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(params: PageParams): string {
  return JSON.stringify(params);
}

function getCachedData(params: PageParams): GetProductsResponse | null {
  const key = getCacheKey(params);
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  // Clean up expired cache entries
  if (cached) {
    cache.delete(key);
  }
  
  return null;
}

function setCachedData(params: PageParams, data: GetProductsResponse): void {
  const key = getCacheKey(params);
  cache.set(key, { data, timestamp: Date.now() });
}

// Minimal mock dataset shaped like ProductDTO
const mockProducts: ProductDTO[] = [
  {
    id: "1",
    name: "Halskette Geo",
    sku: "0201493117_16",
    image:
      "https://cdn.shopify.com/s/files/1/0754/3170/6907/files/78843-image-squared-1-1630067079.jpg?v=1756801903",
    price: 49.9,
    currency: "EUR",
    channel: "shopify",
    brand: { id: "b1", name: "Ellijewelry", logo: null },
    category: { id: "c1", name: "Necklaces", slug: "necklaces" },
    competitors: [
      { id: "cmp1", name: "Pilgrim", cheapest: 45.9, avg: 52.3, highest: 58.9, cheapestColor: "green" },
    ],
    _count: { competitors: 1 },
  },
  {
    id: "2",
    name: "Armband Geo",
    sku: "0201493117_16",
    image:
      "https://cdn.shopify.com/s/files/1/0754/3170/6907/files/78843-image-squared-1-1630067079.jpg?v=1756801903",
    price: 69.9,
    currency: "EUR",
    channel: "shopify",
    brand: { id: "b1", name: "Ellijewelry", logo: null },
    category: { id: "c2", name: "Bracelets", slug: "bracelets" },
    competitors: [
      { id: "cmp2", name: "fejn", cheapest: 65.9, avg: 72.5, highest: 79.9, cheapestColor: "green" },
    ],
    _count: { competitors: 1 },
  },
];

function buildQuery(params: PageParams = {}): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    q.set(key, String(value));
  });
  return q.toString();
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      credentials: "include",
    });

    if (!res.ok) {
      let errorMessage = `Request failed: ${res.status} ${res.statusText}`;

      try {
        const errorData = await res.json();
        if (errorData && (errorData.error || errorData.message)) {
          errorMessage = `${errorData.error ?? errorData.message}`;
          if (errorData.message && errorData.error) {
            errorMessage += ` - ${errorData.message}`;
          }
          if (errorData.details && Array.isArray(errorData.details)) {
            errorMessage += ` - ${errorData.details.map((d: any) => d.message).join(', ')}`;
          }
        }
      } catch {
        // If JSON parsing fails, use the text response
        const text = await res.text().catch(() => "");
        if (text) {
          errorMessage += ` - ${text}`;
        }
      }

      throw new Error(errorMessage);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    // Normalize network/fetch errors
    if (err instanceof Error && err.message === 'Failed to fetch') {
      throw new Error('Network error: failed to reach the API. Please check your dev server or network connection.');
    }
    // Re-throw other errors with safe message
    throw new Error(err?.message ?? 'Unknown error while fetching data');
  }
}

export async function getProducts(params: PageParams = {}): Promise<GetProductsResponse> {
  if (useMock) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = mockProducts.slice(start, end);
    return {
      products: items,
      pagination: {
        page,
        limit,
        total: mockProducts.length,
        totalPages: Math.ceil(mockProducts.length / limit),
      },
      filters: {
        search: params.search,
        status: params.status as any,
        featured: params.featured,
        channel: params.channel,
        categoryId: params.categoryId,
        brandId: params.brandId,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
      },
    };
  }

  // Check cache first
  const cachedData = getCachedData(params);
  if (cachedData) {
    return cachedData;
  }

  const query = buildQuery({ sortBy: "createdAt", sortOrder: "desc", ...params });
  const url = `/api/products?${query}`;

  try {
    const data = await fetchJson<GetProductsResponse>(url);
    // Basic validation of shape
    if (!data || !Array.isArray((data as any).products)) {
      throw new Error('Invalid API response');
    }
    // Cache the successful response
    setCachedData(params, data);
    return data;
  } catch (error: any) {
    // In development fall back to mock data instead of throwing
    console.error('getProducts error:', error?.message ?? error);
    if (process.env.NODE_ENV === 'development') {
      console.warn('getProducts: falling back to mock products due to API error');
      const page = params.page ?? 1;
      const limit = params.limit ?? 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      const items = mockProducts.slice(start, end);
      const response: GetProductsResponse = {
        products: items,
        pagination: {
          page,
          limit,
          total: mockProducts.length,
          totalPages: Math.ceil(mockProducts.length / limit),
        },
        filters: {
          search: params.search,
          status: params.status as any,
          featured: params.featured,
          channel: params.channel,
          categoryId: params.categoryId,
          brandId: params.brandId,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
        },
      };
      // Cache the fallback to improve subsequent loads in dev
      setCachedData(params, response);
      return response;
    }

    // In production propagate the error so callers can handle it
    throw error;
  }
}
