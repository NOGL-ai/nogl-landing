import { GetProductsResponse, PageParams, ProductDTO } from "@/types/product";

// Force to use real API (mock disabled)
const useMock = false;

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
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${res.statusText} ${text}`);
  }
  return (await res.json()) as T;
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

  const query = buildQuery({ sortBy: "createdAt", sortOrder: "desc", ...params });
  const url = `/api/products?${query}`;
  // API already returns { products, pagination, filters }
  return await fetchJson<GetProductsResponse>(url);
}


