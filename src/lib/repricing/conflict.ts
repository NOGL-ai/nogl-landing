/**
 * Conflict resolution: when multiple ACTIVE rules cover the same SKU,
 * the rule with the lowest priority number wins.
 *
 * Pure function — no DB access.
 */
import type { RuleConflictCheck, ConflictResult } from "./types";

export interface ProductScope {
  productId: string;
  categoryId?: string;
}

/**
 * Returns the winning rule for a product + the list of all matching rules.
 * If no rule matches, winnerRuleId is null.
 */
export function resolveConflict(
  rules: RuleConflictCheck[],
  product: ProductScope
): ConflictResult {
  const matching: Array<{ ruleId: string; priority: number }> = [];

  for (const rule of rules) {
    if (ruleCoversProduct(rule, product)) {
      matching.push({ ruleId: rule.ruleId, priority: rule.priority });
    }
  }

  if (!matching.length) {
    return { winnerRuleId: null, conflicts: [] };
  }

  // Sort ascending: lower priority number = higher importance
  matching.sort((a, b) => a.priority - b.priority);

  return {
    winnerRuleId: matching[0].ruleId,
    conflicts: matching,
  };
}

function ruleCoversProduct(
  rule: RuleConflictCheck,
  product: ProductScope
): boolean {
  switch (rule.scopeType) {
    case "ALL":
      return true;
    case "CATEGORIES":
      return product.categoryId != null
        ? rule.categoryIds.includes(product.categoryId)
        : false;
    case "SPECIFIC":
      return rule.productIds.includes(product.productId);
  }
}

/**
 * For a list of rules, return a map of ruleId → conflicting ruleIds.
 * Used to render ⚠ Conflict badges on the rules list page.
 */
export function computeConflictMap(
  rules: RuleConflictCheck[]
): Map<string, string[]> {
  const result = new Map<string, string[]>();
  rules.forEach((r) => result.set(r.ruleId, []));

  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      if (rulesOverlap(rules[i], rules[j])) {
        result.get(rules[i].ruleId)!.push(rules[j].ruleId);
        result.get(rules[j].ruleId)!.push(rules[i].ruleId);
      }
    }
  }

  return result;
}

function rulesOverlap(a: RuleConflictCheck, b: RuleConflictCheck): boolean {
  // ALL overlaps with everything
  if (a.scopeType === "ALL" || b.scopeType === "ALL") return true;

  if (a.scopeType === "CATEGORIES" && b.scopeType === "CATEGORIES") {
    return a.categoryIds.some((c) => b.categoryIds.includes(c));
  }

  if (a.scopeType === "SPECIFIC" && b.scopeType === "SPECIFIC") {
    return a.productIds.some((p) => b.productIds.includes(p));
  }

  // CATEGORIES vs SPECIFIC — can't determine overlap without a product DB lookup;
  // conservatively treat as overlapping so operators see the badge
  return true;
}
