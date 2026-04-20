import { resolveConflict, computeConflictMap } from "../conflict";
import type { RuleConflictCheck } from "../types";

const ruleAll = (id: string, priority = 0): RuleConflictCheck => ({
  ruleId: id,
  priority,
  scopeType: "ALL",
  categoryIds: [],
  productIds: [],
});

const ruleCat = (id: string, cats: string[], priority = 0): RuleConflictCheck => ({
  ruleId: id,
  priority,
  scopeType: "CATEGORIES",
  categoryIds: cats,
  productIds: [],
});

const ruleSpec = (id: string, products: string[], priority = 0): RuleConflictCheck => ({
  ruleId: id,
  priority,
  scopeType: "SPECIFIC",
  productIds: products,
  categoryIds: [],
});

describe("resolveConflict", () => {
  it("returns null when no rules match", () => {
    const result = resolveConflict([], { productId: "p1" });
    expect(result.winnerRuleId).toBeNull();
  });

  it("single rule matching ALL wins", () => {
    const result = resolveConflict([ruleAll("r1")], { productId: "p1" });
    expect(result.winnerRuleId).toBe("r1");
  });

  it("lower priority number wins (priority 0 beats priority 1)", () => {
    const rules = [ruleAll("r2", 1), ruleAll("r1", 0)];
    const result = resolveConflict(rules, { productId: "p1" });
    expect(result.winnerRuleId).toBe("r1");
    expect(result.conflicts).toHaveLength(2);
  });

  it("SPECIFIC rule covers its product", () => {
    const rules = [ruleSpec("r1", ["p1", "p2"])];
    expect(resolveConflict(rules, { productId: "p1" }).winnerRuleId).toBe("r1");
    expect(resolveConflict(rules, { productId: "p3" }).winnerRuleId).toBeNull();
  });

  it("CATEGORIES rule covers products in its category", () => {
    const rules = [ruleCat("r1", ["shoes"])];
    expect(resolveConflict(rules, { productId: "p1", categoryId: "shoes" }).winnerRuleId).toBe("r1");
    expect(resolveConflict(rules, { productId: "p1", categoryId: "bags" }).winnerRuleId).toBeNull();
  });

  it("CATEGORIES rule misses when no categoryId is provided", () => {
    const rules = [ruleCat("r1", ["shoes"])];
    expect(resolveConflict(rules, { productId: "p1" }).winnerRuleId).toBeNull();
  });
});

describe("computeConflictMap", () => {
  it("no conflicts for non-overlapping SPECIFIC rules", () => {
    const rules = [ruleSpec("r1", ["p1"]), ruleSpec("r2", ["p2"])];
    const map = computeConflictMap(rules);
    expect(map.get("r1")).toEqual([]);
    expect(map.get("r2")).toEqual([]);
  });

  it("flags overlap between ALL and any other rule", () => {
    const rules = [ruleAll("r1"), ruleCat("r2", ["shoes"])];
    const map = computeConflictMap(rules);
    expect(map.get("r1")).toContain("r2");
    expect(map.get("r2")).toContain("r1");
  });

  it("flags overlap between two SPECIFIC rules sharing a product", () => {
    const rules = [ruleSpec("r1", ["p1", "p2"]), ruleSpec("r2", ["p2", "p3"])];
    const map = computeConflictMap(rules);
    expect(map.get("r1")).toContain("r2");
    expect(map.get("r2")).toContain("r1");
  });
});
