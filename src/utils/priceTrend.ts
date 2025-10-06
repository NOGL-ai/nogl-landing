export type TrendComputation = {
  value: number; // absolute percentage, rounded to whole number for concise chips
  precise: number; // signed percentage with decimals for tooltips/sorting
  up: boolean; // true when your price is lower than competitor's
  neutral: boolean; // true when equal or cannot be computed
};

/**
 * Compute price trend from two prices.
 * Positive trend means you are cheaper than competitor.
 * Percent is based on (myPrice - competitorPrice) / competitorPrice * 100.
 */
export function computeTrend(competitorPrice: number, myPrice: number): TrendComputation {
  const invalid = !(competitorPrice > 0 && Number.isFinite(competitorPrice) && Number.isFinite(myPrice));
  if (invalid) {
    return { value: 0, precise: 0, up: false, neutral: true };
  }
  const priceDiff = myPrice - competitorPrice;
  const pct = (priceDiff / competitorPrice) * 100; // signed
  const isEqual = priceDiff === 0;
  const up = myPrice < competitorPrice; // winning when cheaper
  return {
    value: Math.round(Math.abs(pct)),
    precise: pct,
    up,
    neutral: isEqual,
  };
}

export function formatPercentCompact(percent: number): string {
  // Show integer percent for compact chips
  const abs = Math.abs(percent);
  const rounded = Math.round(abs);
  return `${rounded}%`;
}

export function formatPercentDetailed(percent: number): string {
  const sign = percent > 0 ? '+' : percent < 0 ? '-' : '';
  return `${sign}${Math.abs(percent).toFixed(2)}%`;
}


