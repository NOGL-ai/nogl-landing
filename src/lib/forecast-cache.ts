import { getRedisClient } from "./redis";

const TTL = parseInt(process.env.REDIS_CACHE_TTL_SECONDS ?? "7200");

export async function forecastCacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await getRedisClient().get(`forecast:${key}`);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

export async function forecastCacheSet(key: string, value: unknown): Promise<void> {
  try {
    await getRedisClient().setex(`forecast:${key}`, TTL, JSON.stringify(value));
  } catch {
    // Cache failures are non-fatal
  }
}

export async function forecastCacheDelete(key: string): Promise<void> {
  try {
    await getRedisClient().del(`forecast:${key}`);
  } catch {
    // Cache failures are non-fatal
  }
}
