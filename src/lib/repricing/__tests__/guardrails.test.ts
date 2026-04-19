import { evaluateGuardrails, resolveGuardrailBounds } from "../guardrails";
import type { Guardrail } from "../types";

describe("evaluateGuardrails — ABS_MIN", () => {
  const guardrails: Guardrail[] = [{ type: "ABS_MIN", value: 10 }];

  it("passes when price is above minimum", () => {
    expect(evaluateGuardrails(15, { guardrails }).pass).toBe(true);
  });

  it("passes when price equals minimum", () => {
    expect(evaluateGuardrails(10, { guardrails }).pass).toBe(true);
  });

  it("blocks when price is below minimum", () => {
    const result = evaluateGuardrails(9, { guardrails });
    expect(result.pass).toBe(false);
    expect(result.reason).toContain("minimum");
  });
});

describe("evaluateGuardrails — ABS_MAX", () => {
  const guardrails: Guardrail[] = [{ type: "ABS_MAX", value: 100 }];

  it("passes when price is below maximum", () => {
    expect(evaluateGuardrails(99, { guardrails }).pass).toBe(true);
  });

  it("blocks when price exceeds maximum", () => {
    const result = evaluateGuardrails(101, { guardrails });
    expect(result.pass).toBe(false);
    expect(result.reason).toContain("maximum");
  });
});

describe("evaluateGuardrails — MARGIN_MIN_PCT_OF_COST", () => {
  const guardrails: Guardrail[] = [{ type: "MARGIN_MIN_PCT_OF_COST", value: 20 }];

  it("passes when margin is sufficient (cost=50, proposed=65 → 30% margin)", () => {
    expect(evaluateGuardrails(65, { guardrails, cost: 50 }).pass).toBe(true);
  });

  it("blocks when margin is too thin (cost=50, min=60, proposed=58)", () => {
    const result = evaluateGuardrails(58, { guardrails, cost: 50 });
    expect(result.pass).toBe(false);
    expect(result.reason).toContain("20%");
  });

  it("skips if no cost provided", () => {
    // Without cost, guardrail cannot fire
    expect(evaluateGuardrails(1, { guardrails }).pass).toBe(true);
  });
});

describe("evaluateGuardrails — MAX_DISCOUNT_PCT", () => {
  const guardrails: Guardrail[] = [{ type: "MAX_DISCOUNT_PCT", value: 30, msrp: 100 }];

  it("passes when discount is within cap (30% off 100 = min 70)", () => {
    expect(evaluateGuardrails(70, { guardrails }).pass).toBe(true);
  });

  it("blocks when discount exceeds cap", () => {
    const result = evaluateGuardrails(69, { guardrails });
    expect(result.pass).toBe(false);
    expect(result.reason).toContain("30%");
  });
});

describe("evaluateGuardrails — ordering", () => {
  it("first failure wins (ABS_MIN blocks before MARGIN_MIN)", () => {
    const guardrails: Guardrail[] = [
      { type: "ABS_MIN", value: 50 },
      { type: "MARGIN_MIN_PCT_OF_COST", value: 10 },
    ];
    const result = evaluateGuardrails(30, { guardrails, cost: 20 });
    expect(result.pass).toBe(false);
    expect(result.reason).toContain("minimum");
  });

  it("second guardrail can block when first passes", () => {
    const guardrails: Guardrail[] = [
      { type: "ABS_MIN", value: 10 },
      { type: "ABS_MAX", value: 50 },
    ];
    const result = evaluateGuardrails(60, { guardrails });
    expect(result.pass).toBe(false);
    expect(result.reason).toContain("maximum");
  });
});

describe("resolveGuardrailBounds", () => {
  it("returns the highest ABS_MIN as lower bound", () => {
    const guardrails: Guardrail[] = [
      { type: "ABS_MIN", value: 10 },
      { type: "ABS_MIN", value: 20 },
    ];
    const { min } = resolveGuardrailBounds(guardrails, {});
    expect(min).toBe(20);
  });

  it("derives min from margin guardrail given cost", () => {
    const guardrails: Guardrail[] = [{ type: "MARGIN_MIN_PCT_OF_COST", value: 25 }];
    const { min } = resolveGuardrailBounds(guardrails, { cost: 40 });
    expect(min).toBe(50); // 40 * 1.25
  });
});
