/**
 * Shared math/date helpers used by generate-history and generate-quantiles.
 */

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function dayStart(d: Date): Date {
  const out = new Date(d);
  out.setUTCHours(0, 0, 0, 0);
  return out;
}

export function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() + days);
  return out;
}

export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ─── Random helpers ───────────────────────────────────────────────────────────

/** Box-Muller Gaussian sample mean=0, std=1 */
export function gaussianRand(mean = 0, std = 1): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Knuth Poisson sampler — exact for lambda < ~700.
 * For lambda >= 700 we use the Gaussian approximation (CLT).
 */
export function poissonSample(lambda: number): number {
  if (lambda <= 0) return 0;
  if (lambda >= 700) {
    // Gaussian approx: Poisson(λ) ≈ Normal(λ, λ) for large λ
    const s = Math.max(0, Math.round(lambda + gaussianRand(0, Math.sqrt(lambda))));
    return s;
  }
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

// ─── Seasonal helpers ─────────────────────────────────────────────────────────

/**
 * Sinusoidal seasonality centred on Q4.
 * Peak in November (month 10), trough in February (month 1).
 * Range: [0.65, 1.35]
 */
export function sinusoidalFactor(date: Date): number {
  const monthIndex = date.getUTCMonth(); // 0-11
  return 1.0 + 0.35 * Math.sin((monthIndex - 2) * Math.PI / 6);
}

// ─── German event calendar ────────────────────────────────────────────────────

type EventEntry = {
  start: string;
  end: string;
  multiplier: number;
  channels?: string[];
  categories?: string[];
};

const GERMAN_EVENTS: EventEntry[] = [
  // Black Friday
  { start: "2023-11-24", end: "2023-11-24", multiplier: 1.8 },
  { start: "2024-11-29", end: "2024-11-29", multiplier: 1.8 },
  { start: "2025-11-28", end: "2025-11-28", multiplier: 1.8 },
  // Cyber Monday
  { start: "2023-11-27", end: "2023-11-27", multiplier: 1.4, channels: ["web", "shopify", "amazon"] },
  { start: "2024-12-02", end: "2024-12-02", multiplier: 1.4, channels: ["web", "shopify", "amazon"] },
  { start: "2025-12-01", end: "2025-12-01", multiplier: 1.4, channels: ["web", "shopify", "amazon"] },
  // Photokina 2024
  { start: "2024-04-17", end: "2024-04-21", multiplier: 1.3, channels: ["b2b", "offline"], categories: ["cameras", "lenses"] },
  // Photokina 2026
  { start: "2026-05-06", end: "2026-05-10", multiplier: 1.3, channels: ["b2b", "offline"], categories: ["cameras", "lenses"] },
  // Sommerschlussverkauf
  { start: "2023-07-24", end: "2023-08-05", multiplier: 1.15, categories: ["accessories", "lighting"] },
  { start: "2024-07-24", end: "2024-08-05", multiplier: 1.15, categories: ["accessories", "lighting"] },
  { start: "2025-07-24", end: "2025-08-05", multiplier: 1.15, categories: ["accessories", "lighting"] },
  // Zwischen den Jahren (Dec 27 - Jan 5 each year)
  { start: "2023-12-27", end: "2024-01-05", multiplier: 1.3 },
  { start: "2024-12-27", end: "2025-01-05", multiplier: 1.3 },
  { start: "2025-12-27", end: "2026-01-05", multiplier: 1.3 },
  // Valentine's portrait promo
  { start: "2024-02-10", end: "2024-02-14", multiplier: 1.5, categories: ["lenses"] },
  { start: "2024-02-10", end: "2024-02-14", multiplier: 1.3, categories: ["cameras"] },
  { start: "2025-02-10", end: "2025-02-14", multiplier: 1.5, categories: ["lenses"] },
  { start: "2025-02-10", end: "2025-02-14", multiplier: 1.3, categories: ["cameras"] },
];

/**
 * Get the German event multiplier for a specific date, channel, and category.
 * Multiplicative — returns 1.0 if no event applies.
 */
export function germanEventFactor(
  date: Date,
  category: string,
  channelName: string,
): number {
  const key = dateKey(date);
  let factor = 1.0;
  for (const ev of GERMAN_EVENTS) {
    if (key < ev.start || key > ev.end) continue;
    if (ev.channels && !ev.channels.includes(channelName)) continue;
    if (ev.categories && !ev.categories.includes(category)) continue;
    factor = Math.max(factor, ev.multiplier);
  }
  return factor;
}

// ─── Channel helpers ──────────────────────────────────────────────────────────

export const CHANNEL_DISCOUNT_FACTOR: Record<string, number> = {
  shopify: 0.95,
  amazon: 0.88,
  marketplace: 0.80,
  b2b: 0.85,
  offline: 1.00,
  web: 0.95,
};

export const CATEGORY_WEIGHT: Record<string, number> = {
  cameras: 2.0,
  lenses: 1.5,
  lighting: 1.2,
  tripods: 0.9,
  accessories: 0.8,
};

/**
 * Weekday factor. B2B is nearly silent on weekends; marketplaces are
 * busier on weekends.
 */
export function weekdayFactor(date: Date, channelName: string): number {
  const dow = date.getUTCDay(); // 0=Sun, 6=Sat
  const isWeekend = dow === 0 || dow === 6;
  if (!isWeekend) return 1.0;
  if (channelName === "b2b") return 0.2;
  if (channelName === "marketplace") return 1.3;
  return 1.0;
}
