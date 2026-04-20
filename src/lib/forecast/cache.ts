/**
 * Per-process LRU cache for forecast server-action responses.
 *
 * Scope: single Next.js instance. Invalidate by restarting the dev server
 * or waiting for the TTL (default 5 min). A Redis-backed cache can replace
 * this in a later iteration without changing call sites.
 */

import { LRUCache } from "lru-cache";
import { FORECAST_CACHE_MAX_ENTRIES, FORECAST_CACHE_TTL_MS } from "@/config/forecast";

const cache = new LRUCache<string, object>({
  max: FORECAST_CACHE_MAX_ENTRIES,
  ttl: FORECAST_CACHE_TTL_MS,
});

export function forecastCacheGet<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function forecastCacheSet(key: string, value: unknown): void {
  cache.set(key, value as object);
}

export function forecastCacheClear(): void {
  cache.clear();
}

/**
 * Build a deterministic cache key from the company and filter params.
 * `undefined` parts collapse to `_` so different param orders cannot collide.
 */
export function forecastCacheKey(
  namespace: string,
  companyId: string,
  params: Record<string, unknown> = {},
): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${serializePart(params[k])}`)
    .join("&");
  return `forecast:${namespace}:${companyId}:${sorted}`;
}

function serializePart(v: unknown): string {
  if (v === undefined || v === null) return "_";
  if (Array.isArray(v)) return v.map(serializePart).join(",");
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}
