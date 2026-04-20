/**
 * Guardrail evaluation engine.
 * Guardrails are evaluated in order; the first failure wins.
 * Pure function — no side effects.
 */
import type { Guardrail, GuardrailEvalResult } from "./types";

export interface GuardrailContext {
  guardrails: Guardrail[];
  cost?: number;
  msrp?: number;
}

/**
 * Evaluate all guardrails against a proposed price.
 * Returns { pass: true } if all pass, or { pass: false, reason } for the first failure.
 */
export function evaluateGuardrails(
  proposedPrice: number,
  ctx: GuardrailContext
): GuardrailEvalResult {
  for (const g of ctx.guardrails) {
    switch (g.type) {
      case "ABS_MIN":
        if (proposedPrice < g.value) {
          return {
            pass: false,
            reason: `Price €${proposedPrice.toFixed(2)} is below minimum €${g.value.toFixed(2)}`,
          };
        }
        break;

      case "ABS_MAX":
        if (proposedPrice > g.value) {
          return {
            pass: false,
            reason: `Price €${proposedPrice.toFixed(2)} exceeds maximum €${g.value.toFixed(2)}`,
          };
        }
        break;

      case "MARGIN_MIN_PCT_OF_COST": {
        if (ctx.cost == null) break; // can't evaluate without cost
        const minAllowed = ctx.cost * (1 + g.value / 100);
        if (proposedPrice < minAllowed) {
          return {
            pass: false,
            reason: `Margin below ${g.value}% of cost (min €${minAllowed.toFixed(2)})`,
          };
        }
        break;
      }

      case "MAX_DISCOUNT_PCT": {
        const msrp = ctx.msrp ?? g.msrp;
        const minAllowed = msrp * (1 - g.value / 100);
        if (proposedPrice < minAllowed) {
          return {
            pass: false,
            reason: `Discount exceeds ${g.value}% off MSRP (min €${minAllowed.toFixed(2)})`,
          };
        }
        break;
      }
    }
  }

  return { pass: true };
}

/**
 * Derive numeric min/max bounds from guardrails for display in the Preview table.
 */
export function resolveGuardrailBounds(
  guardrails: Guardrail[],
  ctx: { cost?: number; msrp?: number }
): { min: number | null; max: number | null } {
  let min: number | null = null;
  let max: number | null = null;

  for (const g of guardrails) {
    if (g.type === "ABS_MIN") {
      min = min === null ? g.value : Math.max(min, g.value);
    }
    if (g.type === "ABS_MAX") {
      max = max === null ? g.value : Math.min(max, g.value);
    }
    if (g.type === "MARGIN_MIN_PCT_OF_COST" && ctx.cost != null) {
      const derived = ctx.cost * (1 + g.value / 100);
      min = min === null ? derived : Math.max(min, derived);
    }
    if (g.type === "MAX_DISCOUNT_PCT") {
      const msrp = ctx.msrp ?? g.msrp;
      const derived = msrp * (1 - g.value / 100);
      min = min === null ? derived : Math.max(min, derived);
    }
  }

  return { min, max };
}
