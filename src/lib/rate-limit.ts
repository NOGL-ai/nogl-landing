import { LRUCache } from "lru-cache";

export interface RateLimitConfig {
  interval: number;
  uniqueTokenPerInterval: number;
}

export function rateLimit(options: RateLimitConfig) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: async (req: Request, limit: number, token: string) => {
      const tokenCount = (tokenCache.get(token) as number[]) || [0];
      if (tokenCount[0] === 0) {
        tokenCache.set(token, tokenCount);
      }
      tokenCount[0] += 1;

      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage >= limit;

      return {
        success: !isRateLimited,
        limit,
        remaining: isRateLimited ? 0 : limit - currentUsage,
      };
    },
  };
}

