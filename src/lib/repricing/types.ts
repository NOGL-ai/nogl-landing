/**
 * Pure TypeScript types for the repricing engine.
 * No Prisma, no Next.js — fully unit-testable.
 */

// ─── Guardrail union ──────────────────────────────────────────────────────────

export type Guardrail =
  | { type: "ABS_MIN"; value: number }
  | { type: "ABS_MAX"; value: number }
  | { type: "MARGIN_MIN_PCT_OF_COST"; value: number }
  | { type: "MAX_DISCOUNT_PCT"; value: number; msrp: number };

// ─── Engine inputs ────────────────────────────────────────────────────────────

export interface CompetitorPriceSample {
  competitorId: string;
  price: number;
  priceDate: Date;
}

export interface ProductPriceContext {
  productId: string;
  productSku: string;
  currentPrice: number;
  cost?: number;
  msrp?: number; // for MAX_DISCOUNT_PCT guardrail
  competitorPrices: CompetitorPriceSample[];
}

export interface RuleEngineInput {
  // Strategy
  setPrice: number;
  priceDirection: "PLUS" | "MINUS" | "PERCENTAGE" | "FIXED";
  comparisonSource: "MY_PRICE" | "CHEAPEST" | "AVERAGE" | "SPECIFIC";
  comparisonLogic: "EQUAL" | "ABOVE" | "BELOW";
  specificCompetitorId?: string;

  // Competitor filter
  competitorIds: string[]; // empty = all

  // Guardrails
  guardrails: Guardrail[];

  // Min/max (resolved numeric bounds, already computed from MinMaxType logic)
  resolvedMin?: number;
  resolvedMax?: number;
}

// ─── Engine outputs ───────────────────────────────────────────────────────────

export type ProposalStatusLocal =
  | "WILL_APPLY"
  | "BLOCKED"
  | "NO_CHANGE"
  | "NO_DATA";

export interface ProposalResult {
  productId: string;
  productSku: string;
  currentPrice: number;
  proposedPrice: number | null;
  cheapestCompetitorPrice: number | null;
  highestCompetitorPrice: number | null;
  avgCompetitorPrice: number | null;
  minGuardrail: number | null;
  maxGuardrail: number | null;
  status: ProposalStatusLocal;
  blockedReason: string | null;
}

export interface GuardrailEvalResult {
  pass: boolean;
  reason?: string;
}

// ─── Conflict resolution ──────────────────────────────────────────────────────

export interface RuleConflictCheck {
  ruleId: string;
  priority: number;
  scopeType: "ALL" | "CATEGORIES" | "SPECIFIC";
  categoryIds: string[];
  productIds: string[];
}

export interface ConflictResult {
  winnerRuleId: string | null;
  conflicts: Array<{ ruleId: string; priority: number }>;
}

// ─── DTO types used by server actions ────────────────────────────────────────

export interface RepricingRuleDTO {
  id: string;
  name: string;
  description?: string | null;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
  priority: number;
  scopeType: "ALL" | "CATEGORIES" | "SPECIFIC";
  categoryIds: string[];
  productIds: string[];
  setPrice: number;
  priceDirection: "PLUS" | "MINUS" | "PERCENTAGE" | "FIXED";
  comparisonSource: "MY_PRICE" | "CHEAPEST" | "AVERAGE" | "SPECIFIC";
  comparisonLogic: "EQUAL" | "ABOVE" | "BELOW";
  specificCompetitorId?: string | null;
  competitorIds: string[];
  guardrails: Guardrail[];
  minMaxType: "MANUAL" | "GROSS_MARGIN" | "COST" | "PRICE" | "MAP";
  minMax: Record<string, unknown>;
  ruleOptions: Record<string, unknown>;
  scheduleType: "MANUAL" | "HOURLY" | "DAILY" | "WEEKLY";
  scheduleHour?: number | null;
  scheduleDow?: number | null;
  autoApply: boolean;
  lastRunAt?: Date | string | null;
  nextRunAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdById?: string | null;
  conflictsWithRuleIds?: string[]; // computed at list time, not stored
}

export interface RepricingJobDTO {
  id: string;
  ruleId: string;
  ruleName?: string;
  status: "SIMULATED" | "APPLIED" | "ROLLED_BACK" | "FAILED";
  trigger: "MANUAL" | "SCHEDULED" | "APPLY_ACTION";
  productsAnalyzed: number;
  productsChanged: number;
  productsBlocked: number;
  totalImpact: number | null;
  startedAt: Date | string;
  finishedAt?: Date | string | null;
  triggeredById?: string | null;
  rolledBackAt?: Date | string | null;
  rollbackOfId?: string | null;
  error?: string | null;
}

export interface RepricingProposalDTO {
  id: string;
  jobId: string;
  productId: string;
  productSku: string;
  currentPrice: number;
  proposedPrice: number | null;
  appliedPrice: number | null;
  costAtRun: number | null;
  cheapestCompetitorPrice: number | null;
  highestCompetitorPrice: number | null;
  avgCompetitorPrice: number | null;
  minGuardrail: number | null;
  maxGuardrail: number | null;
  status: "WILL_APPLY" | "BLOCKED" | "NO_CHANGE" | "APPLIED" | "REJECTED" | "ROLLED_BACK";
  blockedReason: string | null;
  decidedById: string | null;
  decidedAt: Date | string | null;
  // enriched at query time:
  productName?: string;
  productCategory?: string;
  ruleName?: string;
}

export interface JobWithProposals extends RepricingJobDTO {
  proposals: RepricingProposalDTO[];
}

export type AlertKindLocal = "PRICE_CHANGE_APPLIED" | "RULE_RUN_FAILED" | "GUARDRAIL_BLOCK_SPIKE";
export type AlertSevLocal = "INFO" | "WARN" | "CRITICAL";

export interface CreateAlertInput {
  kind: AlertKindLocal;
  severity: AlertSevLocal;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  productId?: string;
  ruleId?: string;
  jobId?: string;
}
