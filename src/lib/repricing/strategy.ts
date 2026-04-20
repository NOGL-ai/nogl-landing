/**
 * Core pricing strategy computation.
 * Pure function — no side effects, fully unit-testable.
 */
import type { RuleEngineInput, CompetitorPriceSample } from "./types";

/** Round a number to `decimals` decimal places using "round half up" */
export function roundHalfUp(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function filterCompetitors(
  prices: CompetitorPriceSample[],
  competitorIds: string[]
): CompetitorPriceSample[] {
  if (!competitorIds.length) return prices;
  return prices.filter((p) => competitorIds.includes(p.competitorId));
}

function safeMean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export interface StrategyResult {
  targetPrice: number | null;
  cheapestCompetitorPrice: number | null;
  highestCompetitorPrice: number | null;
  avgCompetitorPrice: number | null;
  refPrice: number | null;
  skipReason?: string;
}

/**
 * Compute the target (proposed) price for a single product given a rule.
 * Returns null if no reference price can be determined.
 */
export function computeTargetPrice(
  rule: Pick<
    RuleEngineInput,
    | "setPrice"
    | "priceDirection"
    | "comparisonSource"
    | "comparisonLogic"
    | "specificCompetitorId"
    | "competitorIds"
  >,
  context: {
    currentPrice: number;
    competitorPrices: CompetitorPriceSample[];
  }
): StrategyResult {
  const filtered = filterCompetitors(
    context.competitorPrices,
    rule.competitorIds
  );
  const prices = filtered.map((p) => p.price);

  const cheapest = prices.length ? Math.min(...prices) : null;
  const highest = prices.length ? Math.max(...prices) : null;
  const avg = safeMean(prices);

  // 1. Pick reference price
  let refPrice: number | null;
  switch (rule.comparisonSource) {
    case "CHEAPEST":
      refPrice = cheapest;
      break;
    // Note: HIGHEST is not in CmpSource enum but kept here as a fallback
    // for any legacy data that uses it. Use SPECIFIC for a highest-competitor preset.
    case "AVERAGE":
      refPrice = avg;
      break;
    case "SPECIFIC": {
      const match = filtered.find(
        (p) => p.competitorId === rule.specificCompetitorId
      );
      refPrice = match?.price ?? null;
      break;
    }
    case "MY_PRICE":
    default:
      refPrice = context.currentPrice;
      break;
  }

  if (refPrice === null) {
    return {
      targetPrice: null,
      cheapestCompetitorPrice: cheapest,
      highestCompetitorPrice: highest,
      avgCompetitorPrice: avg,
      refPrice: null,
      skipReason: "no competitor data",
    };
  }

  // 2. Compute offset
  let offset = 0;
  if (rule.priceDirection === "PERCENTAGE") {
    offset = refPrice * (rule.setPrice / 100);
  } else if (rule.priceDirection === "FIXED" || rule.priceDirection === "PLUS" || rule.priceDirection === "MINUS") {
    offset = rule.setPrice;
  }

  // 3. Apply comparison logic
  let target: number;
  switch (rule.comparisonLogic) {
    case "BELOW":
      target = refPrice - offset;
      break;
    case "ABOVE":
      target = refPrice + offset;
      break;
    case "EQUAL":
    default:
      target = refPrice;
      break;
  }

  return {
    targetPrice: roundHalfUp(target, 2),
    cheapestCompetitorPrice: cheapest,
    highestCompetitorPrice: highest,
    avgCompetitorPrice: avg !== null ? roundHalfUp(avg, 2) : null,
    refPrice,
  };
}
