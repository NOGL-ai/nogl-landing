import { GetCompetitorsResponse, CompetitorDTO, CompetitorPriceComparisonDTO } from '@/types/product';

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(params: any): string {
  return JSON.stringify(params);
}

function getCachedData(params: any): any | null {
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

function setCachedData(params: any, data: any): void {
  const key = getCacheKey(params);
  cache.set(key, { data, timestamp: Date.now() });
}

function buildQuery(params: any = {}): string {
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

export async function getCompetitors(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<GetCompetitorsResponse> {
  // Check cache first
  const cachedData = getCachedData(params);
  if (cachedData) {
    return cachedData;
  }

  const query = buildQuery({ sortBy: "createdAt", sortOrder: "desc", ...params });
  const url = `/api/competitors?${query}`;

  try {
    const data = await fetchJson<GetCompetitorsResponse>(url);
    // Basic validation of shape
    if (!data || !Array.isArray((data as any).competitors)) {
      throw new Error('Invalid API response');
    }
    // Cache the successful response
    setCachedData(params, data);
    return data;
  } catch (error: any) {
    console.error('getCompetitors error:', error?.message ?? error);
    throw error;
  }
}

export async function getCompetitor(id: string): Promise<CompetitorDTO> {
  const url = `/api/competitors/${id}`;
  
  try {
    const data = await fetchJson<CompetitorDTO>(url);
    return data;
  } catch (error: any) {
    console.error('getCompetitor error:', error?.message ?? error);
    throw error;
  }
}

export async function createCompetitor(data: Partial<CompetitorDTO>): Promise<CompetitorDTO> {
  const res = await fetch('/api/competitors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create competitor');
  }

  // Invalidate cache
  cache.clear();
  return res.json();
}

export async function updateCompetitor(id: string, data: Partial<CompetitorDTO>): Promise<CompetitorDTO> {
  const res = await fetch(`/api/competitors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update competitor');
  }

  // Invalidate cache
  cache.clear();
  return res.json();
}

export async function deleteCompetitor(id: string): Promise<void> {
  const res = await fetch(`/api/competitors/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete competitor');
  }

  // Invalidate cache
  cache.clear();
}

export async function getCompetitorPrices(
  id: string,
  params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<{
  prices: CompetitorPriceComparisonDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  competitor: {
    id: string;
    name: string;
    domain: string;
  };
}> {
  const query = buildQuery(params);
  const url = `/api/competitors/${id}/prices?${query}`;

  try {
    const data = await fetchJson(url);
    return data;
  } catch (error: any) {
    console.error('getCompetitorPrices error:', error?.message ?? error);
    throw error;
  }
}

export async function addCompetitorPrice(
  id: string,
  data: {
    competitorPrice: number;
    myPrice: number;
    priceDate?: string;
    currency?: string;
    notes?: string;
    sourceUrl?: string;
    productId?: string;
  }
): Promise<CompetitorPriceComparisonDTO> {
  const res = await fetch(`/api/competitors/${id}/prices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to add price comparison');
  }

  // Invalidate cache
  cache.clear();
  return res.json();
}

export async function getCompetitorStats(): Promise<{
  overview: {
    totalCompetitors: number;
    activeCompetitors: number;
    inactiveCompetitors: number;
    monitoringCompetitors: number;
    pausedCompetitors: number;
    totalPriceComparisons: number;
    averagePriceComparisons: number;
    recentActivity: number;
  };
  breakdown: {
    status: Array<{ status: string; count: number }>;
    categories: Array<{ category: string; count: number }>;
  };
  trends: {
    recentActivity: number;
    averagePriceComparisonsPerCompetitor: number;
  };
}> {
  const url = '/api/competitors/stats';

  try {
    const data = await fetchJson(url);
    return data;
  } catch (error: any) {
    console.error('getCompetitorStats error:', error?.message ?? error);
    throw error;
  }
}

// Utility function to clear all caches
export function clearCache(): void {
  cache.clear();
}
