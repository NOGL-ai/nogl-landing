import { runEngine } from "../engine";
import type { ProductPriceContext, RuleConflictCheck } from "../types";

const makeProduct = (
  id: string,
  currentPrice: number,
  competitorPrices: { id: string; price: number }[] = [],
  cost?: number
): ProductPriceContext => ({
  productId: id,
  productSku: `SKU-${id}`,
  currentPrice,
  cost,
  competitorPrices: competitorPrices.map((c) => ({
    competitorId: c.id,
    price: c.price,
    priceDate: new Date(),
  })),
});

const baseRule = {
  id: "rule1",
  setPrice: 1,
  priceDirection: "PERCENTAGE" as const,
  comparisonSource: "CHEAPEST" as const,
  comparisonLogic: "BELOW" as const,
  specificCompetitorId: undefined,
  competitorIds: [],
  guardrails: [] as never[],
  resolvedMin: undefined,
  resolvedMax: undefined,
};

const ruleConflict: RuleConflictCheck = {
  ruleId: "rule1",
  priority: 0,
  scopeType: "ALL",
  categoryIds: [],
  productIds: [],
};

describe("runEngine — basic simulation", () => {
  it("produces WILL_APPLY for a valid price change", () => {
    const products = [makeProduct("p1", 100, [{ id: "c1", price: 80 }])];
    const results = runEngine({ rule: baseRule, products, allActiveRules: [ruleConflict] });
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("WILL_APPLY");
    expect(results[0].proposedPrice).toBe(79.20);
  });

  it("produces NO_DATA when there are no competitor prices", () => {
    const products = [makeProduct("p1", 100, [])];
    const results = runEngine({ rule: baseRule, products, allActiveRules: [ruleConflict] });
    expect(results[0].status).toBe("NO_DATA");
  });

  it("produces NO_CHANGE when price delta is less than 1 cent", () => {
    // 1% below 100 = 99 — but current price is already 99
    const products = [makeProduct("p1", 99, [{ id: "c1", price: 100 }])];
    const results = runEngine({ rule: baseRule, products, allActiveRules: [ruleConflict] });
    // proposed = 100 * 0.99 = 99 — same as current
    expect(results[0].status).toBe("NO_CHANGE");
  });

  it("produces BLOCKED when guardrail fails", () => {
    const ruleWithGuardrail = {
      ...baseRule,
      guardrails: [{ type: "ABS_MIN" as const, value: 85 }],
    };
    const products = [makeProduct("p1", 100, [{ id: "c1", price: 80 }])];
    const results = runEngine({
      rule: ruleWithGuardrail,
      products,
      allActiveRules: [ruleConflict],
    });
    // proposed = 79.20, min = 85 → BLOCKED
    expect(results[0].status).toBe("BLOCKED");
    expect(results[0].blockedReason).toContain("minimum");
  });
});

describe("runEngine — conflict resolution", () => {
  it("marks product as NO_CHANGE when a higher-priority rule wins", () => {
    const winnerRule: RuleConflictCheck = {
      ruleId: "winner",
      priority: 0, // higher priority (lower number)
      scopeType: "ALL",
      categoryIds: [],
      productIds: [],
    };
    const thisRule: RuleConflictCheck = {
      ruleId: "rule1",
      priority: 1, // lower priority
      scopeType: "ALL",
      categoryIds: [],
      productIds: [],
    };

    const products = [makeProduct("p1", 100, [{ id: "c1", price: 80 }])];
    const results = runEngine({
      rule: baseRule,
      products,
      allActiveRules: [winnerRule, thisRule],
    });

    expect(results[0].status).toBe("NO_CHANGE");
    expect(results[0].blockedReason).toContain("higher-priority");
  });
});

describe("runEngine — multiple products", () => {
  it("handles 3 products with mixed outcomes", () => {
    const products = [
      makeProduct("p1", 100, [{ id: "c1", price: 80 }]),            // WILL_APPLY (79.20)
      makeProduct("p2", 100, []),                                     // NO_DATA
      makeProduct("p3", 100, [{ id: "c1", price: 80 }], 90),         // BLOCKED (margin)
    ];
    const ruleWithMargin = {
      ...baseRule,
      guardrails: [{ type: "MARGIN_MIN_PCT_OF_COST" as const, value: 15 }],
    };
    const results = runEngine({
      rule: ruleWithMargin,
      products,
      allActiveRules: [ruleConflict],
    });

    expect(results[0].status).toBe("WILL_APPLY");  // 79.20, cost undefined so margin skip
    expect(results[1].status).toBe("NO_DATA");
    // p3: cost=90, proposed=79.20, min=90*1.15=103.5 → BLOCKED
    expect(results[2].status).toBe("BLOCKED");
  });
});
