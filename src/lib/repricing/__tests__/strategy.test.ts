import { computeTargetPrice, roundHalfUp } from "../strategy";
import type { CompetitorPriceSample } from "../types";

const mkSample = (competitorId: string, price: number): CompetitorPriceSample => ({
  competitorId,
  price,
  priceDate: new Date(),
});

describe("roundHalfUp", () => {
  it("rounds to 2 decimals", () => {
    expect(roundHalfUp(1.005, 2)).toBe(1.01);
    expect(roundHalfUp(1.004, 2)).toBe(1.00);
    expect(roundHalfUp(9.999, 2)).toBe(10.00);
  });
});

describe("computeTargetPrice — CHEAPEST + PERCENTAGE + BELOW", () => {
  const rule = {
    setPrice: 1,
    priceDirection: "PERCENTAGE" as const,
    comparisonSource: "CHEAPEST" as const,
    comparisonLogic: "BELOW" as const,
    specificCompetitorId: undefined,
    competitorIds: [],
  };

  it("prices 1% below cheapest competitor", () => {
    const ctx = {
      currentPrice: 100,
      competitorPrices: [mkSample("c1", 90), mkSample("c2", 80), mkSample("c3", 95)],
    };
    const result = computeTargetPrice(rule, ctx);
    // cheapest = 80, 1% below = 79.20
    expect(result.targetPrice).toBe(79.20);
    expect(result.cheapestCompetitorPrice).toBe(80);
    expect(result.highestCompetitorPrice).toBe(95);
  });

  it("returns null when no competitor prices", () => {
    const ctx = { currentPrice: 100, competitorPrices: [] };
    const result = computeTargetPrice(rule, ctx);
    expect(result.targetPrice).toBeNull();
    expect(result.skipReason).toBe("no competitor data");
  });
});

describe("computeTargetPrice — MATCH_CHEAPEST (EQUAL, 0 offset)", () => {
  const rule = {
    setPrice: 0,
    priceDirection: "PERCENTAGE" as const,
    comparisonSource: "CHEAPEST" as const,
    comparisonLogic: "EQUAL" as const,
    specificCompetitorId: undefined,
    competitorIds: [],
  };

  it("matches cheapest exactly", () => {
    const ctx = {
      currentPrice: 100,
      competitorPrices: [mkSample("c1", 75), mkSample("c2", 85)],
    };
    expect(computeTargetPrice(rule, ctx).targetPrice).toBe(75);
  });
});

describe("computeTargetPrice — BEAT_CHEAPEST FIXED 0.01", () => {
  const rule = {
    setPrice: 0.01,
    priceDirection: "FIXED" as const,
    comparisonSource: "CHEAPEST" as const,
    comparisonLogic: "BELOW" as const,
    specificCompetitorId: undefined,
    competitorIds: [],
  };

  it("beats cheapest by 1 cent", () => {
    const ctx = {
      currentPrice: 100,
      competitorPrices: [mkSample("c1", 60), mkSample("c2", 70)],
    };
    expect(computeTargetPrice(rule, ctx).targetPrice).toBe(59.99);
  });
});

describe("computeTargetPrice — MATCH_AVG", () => {
  const rule = {
    setPrice: 0,
    priceDirection: "PERCENTAGE" as const,
    comparisonSource: "AVERAGE" as const,
    comparisonLogic: "EQUAL" as const,
    specificCompetitorId: undefined,
    competitorIds: [],
  };

  it("matches average competitor price", () => {
    const ctx = {
      currentPrice: 100,
      competitorPrices: [mkSample("c1", 60), mkSample("c2", 80), mkSample("c3", 100)],
    };
    // avg = 80
    expect(computeTargetPrice(rule, ctx).targetPrice).toBe(80);
    expect(computeTargetPrice(rule, ctx).avgCompetitorPrice).toBe(80);
  });
});

describe("computeTargetPrice — competitor filter", () => {
  const rule = {
    setPrice: 0,
    priceDirection: "PERCENTAGE" as const,
    comparisonSource: "CHEAPEST" as const,
    comparisonLogic: "EQUAL" as const,
    specificCompetitorId: undefined,
    competitorIds: ["c2"], // only c2
  };

  it("ignores competitors not in the filter list", () => {
    const ctx = {
      currentPrice: 100,
      competitorPrices: [mkSample("c1", 50), mkSample("c2", 70)],
    };
    // c1 is filtered out, cheapest of {c2} = 70
    expect(computeTargetPrice(rule, ctx).targetPrice).toBe(70);
  });
});

describe("computeTargetPrice — MY_PRICE + ABOVE + FIXED", () => {
  const rule = {
    setPrice: 5,
    priceDirection: "FIXED" as const,
    comparisonSource: "MY_PRICE" as const,
    comparisonLogic: "ABOVE" as const,
    specificCompetitorId: undefined,
    competitorIds: [],
  };

  it("adds fixed amount above current price", () => {
    const ctx = {
      currentPrice: 100,
      competitorPrices: [],
    };
    expect(computeTargetPrice(rule, ctx).targetPrice).toBe(105);
  });
});
