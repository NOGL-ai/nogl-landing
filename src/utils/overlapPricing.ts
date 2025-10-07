export interface OverlapItem {
  id?: string;
  myPrice: number;
  competitorPrice: number;
  currency?: string;
  inStock?: boolean;
  lastSeenAt?: string;
}

export interface OverlapSummary {
  n: number;
  medianDeltaPct: number | null;
  cheaperPct: number | null;
  equalPct: number | null;
  overpricedPct: number | null;
  p25?: number | null;
  p75?: number | null;
  min?: number | null;
  max?: number | null;
}

function isFinitePositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const rank = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  if (lower === upper) return sorted[lower];
  const weight = rank - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function computeOverlapSummary(
  overlaps: OverlapItem[] | undefined,
  options?: {
    equalityTolerancePct?: number; // e.g., 0.5 means +/-0.5%
    requireSameCurrency?: boolean;
    currency?: string; // if provided and requireSameCurrency is true, mismatches are filtered out
  }
): OverlapSummary {
  const eps = options?.equalityTolerancePct ?? 0.5;
  const requireSameCurrency = options?.requireSameCurrency ?? false;
  const targetCurrency = options?.currency;

  if (!overlaps || overlaps.length === 0) {
    return {
      n: 0,
      medianDeltaPct: null,
      cheaperPct: null,
      equalPct: null,
      overpricedPct: null,
      p25: null,
      p75: null,
      min: null,
      max: null,
    };
  }

  const deltas: number[] = [];

  for (const o of overlaps) {
    if (requireSameCurrency && targetCurrency && o.currency && o.currency !== targetCurrency) {
      continue;
    }
    if (!isFinitePositive(o.myPrice) || !isFinitePositive(o.competitorPrice)) continue;
    const deltaPct = ((o.myPrice - o.competitorPrice) / o.competitorPrice) * 100;
    deltas.push(deltaPct);
  }

  const n = deltas.length;
  if (n === 0) {
    return {
      n: 0,
      medianDeltaPct: null,
      cheaperPct: null,
      equalPct: null,
      overpricedPct: null,
      p25: null,
      p75: null,
      min: null,
      max: null,
    };
  }

  deltas.sort((a, b) => a - b);

  const min = deltas[0];
  const max = deltas[deltas.length - 1];
  const p25 = percentile(deltas, 25);
  const p75 = percentile(deltas, 75);

  const mid = Math.floor(n / 2);
  const medianDeltaPct = n % 2 === 0 ? (deltas[mid - 1] + deltas[mid]) / 2 : deltas[mid];

  let cheaper = 0;
  let equal = 0;
  let overpriced = 0;
  for (const d of deltas) {
    if (d < -eps) cheaper++;
    else if (Math.abs(d) <= eps) equal++;
    else overpriced++;
  }

  return {
    n,
    medianDeltaPct,
    cheaperPct: (cheaper / n) * 100,
    equalPct: (equal / n) * 100,
    overpricedPct: (overpriced / n) * 100,
    p25: p25 ?? null,
    p75: p75 ?? null,
    min,
    max,
  };
}


