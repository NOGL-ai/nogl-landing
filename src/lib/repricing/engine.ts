/**
 * Top-level repricing simulation engine.
 * Combines strategy + guardrails + conflict resolution into ProposalResult[].
 *
 * This module is pure TypeScript but accepts DB results as plain-object inputs
 * so it remains unit-testable without Prisma.
 */
import { computeTargetPrice } from "./strategy";
import { evaluateGuardrails, resolveGuardrailBounds } from "./guardrails";
import { resolveConflict } from "./conflict";
import type {
  ProductPriceContext,
  RuleEngineInput,
  RuleConflictCheck,
  ProposalResult,
} from "./types";

export interface EngineRunInput {
  rule: RuleEngineInput & { id: string };
  products: ProductPriceContext[];
  /** All ACTIVE rules for conflict resolution (include the current rule) */
  allActiveRules: RuleConflictCheck[];
}

/**
 * Simulate a repricing rule over a batch of products.
 * Returns one ProposalResult per product.
 */
export function runEngine(input: EngineRunInput): ProposalResult[] {
  const { rule, products, allActiveRules } = input;
  const proposals: ProposalResult[] = [];

  for (const product of products) {
    // 1. Conflict resolution — skip this product if another rule has higher priority
    const conflict = resolveConflict(allActiveRules, {
      productId: product.productId,
      categoryId: undefined, // enriched if categories available
    });

    if (conflict.winnerRuleId !== null && conflict.winnerRuleId !== rule.id) {
      // Another rule owns this SKU; emit a NO_CHANGE so the operator can see it
      proposals.push({
        productId: product.productId,
        productSku: product.productSku,
        currentPrice: product.currentPrice,
        proposedPrice: null,
        cheapestCompetitorPrice: null,
        highestCompetitorPrice: null,
        avgCompetitorPrice: null,
        minGuardrail: null,
        maxGuardrail: null,
        status: "NO_CHANGE",
        blockedReason: `Overridden by higher-priority rule`,
      });
      continue;
    }

    // 2. Compute target price
    const strategyResult = computeTargetPrice(rule, {
      currentPrice: product.currentPrice,
      competitorPrices: product.competitorPrices,
    });

    if (strategyResult.targetPrice === null) {
      proposals.push({
        productId: product.productId,
        productSku: product.productSku,
        currentPrice: product.currentPrice,
        proposedPrice: null,
        cheapestCompetitorPrice: strategyResult.cheapestCompetitorPrice,
        highestCompetitorPrice: strategyResult.highestCompetitorPrice,
        avgCompetitorPrice: strategyResult.avgCompetitorPrice,
        minGuardrail: null,
        maxGuardrail: null,
        status: "NO_DATA",
        blockedReason: strategyResult.skipReason ?? "no competitor data",
      });
      continue;
    }

    const proposed = strategyResult.targetPrice;

    // 3. No-change detection (within 1 cent)
    if (Math.abs(proposed - product.currentPrice) < 0.01) {
      proposals.push({
        productId: product.productId,
        productSku: product.productSku,
        currentPrice: product.currentPrice,
        proposedPrice: proposed,
        cheapestCompetitorPrice: strategyResult.cheapestCompetitorPrice,
        highestCompetitorPrice: strategyResult.highestCompetitorPrice,
        avgCompetitorPrice: strategyResult.avgCompetitorPrice,
        minGuardrail: null,
        maxGuardrail: null,
        status: "NO_CHANGE",
        blockedReason: null,
      });
      continue;
    }

    // 4. Guardrail evaluation
    const bounds = resolveGuardrailBounds(rule.guardrails, {
      cost: product.cost,
      msrp: product.msrp,
    });

    const guardResult = evaluateGuardrails(proposed, {
      guardrails: rule.guardrails,
      cost: product.cost,
      msrp: product.msrp,
    });

    if (!guardResult.pass) {
      proposals.push({
        productId: product.productId,
        productSku: product.productSku,
        currentPrice: product.currentPrice,
        proposedPrice: proposed,
        cheapestCompetitorPrice: strategyResult.cheapestCompetitorPrice,
        highestCompetitorPrice: strategyResult.highestCompetitorPrice,
        avgCompetitorPrice: strategyResult.avgCompetitorPrice,
        minGuardrail: bounds.min,
        maxGuardrail: bounds.max,
        status: "BLOCKED",
        blockedReason: guardResult.reason ?? "Guardrail violation",
      });
      continue;
    }

    proposals.push({
      productId: product.productId,
      productSku: product.productSku,
      currentPrice: product.currentPrice,
      proposedPrice: proposed,
      cheapestCompetitorPrice: strategyResult.cheapestCompetitorPrice,
      highestCompetitorPrice: strategyResult.highestCompetitorPrice,
      avgCompetitorPrice: strategyResult.avgCompetitorPrice,
      minGuardrail: bounds.min,
      maxGuardrail: bounds.max,
      status: "WILL_APPLY",
      blockedReason: null,
    });
  }

  return proposals;
}
