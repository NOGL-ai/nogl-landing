"use server";
import { prisma } from "@/lib/prismaDb";
import { isAuthorized } from "@/lib/isAuthorized";
import { runEngine } from "@/lib/repricing/engine";
import type {
  ProductPriceContext,
  RuleConflictCheck,
  RepricingJobDTO,
  RepricingProposalDTO,
  JobWithProposals,
  Guardrail,
} from "@/lib/repricing/types";
 
type AnyRecord = Record<string, any>;
import { createAlert } from "@/actions/alerts";
import { computeNextRunAt } from "./schedule-utils";

const ALERT_LARGE_DELTA_PCT = 5;  // fire alert when |delta|/current > 5%
const ALERT_SEVERE_DELTA_PCT = 20; // WARN severity when > 20%
const BLOCK_SPIKE_THRESHOLD = 0.5; // fire GUARDRAIL_BLOCK_SPIKE if >50% blocked

// ─── Simulate ─────────────────────────────────────────────────────────────────

/**
 * Simulate a rule over all products in its scope.
 * Creates a RepricingJob with status=SIMULATED + one RepricingProposal per product.
 * Does NOT update any prices.
 */
export async function simulateRule(ruleId: string): Promise<RepricingJobDTO> {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");

  const rule = await prisma.repricingRule.findFirstOrThrow({
    where: { id: ruleId, createdById: user.id },
  });

  // Build competitor price map from CompetitorPriceComparison (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Fetch all competitor prices for products in scope
  const competitorFilter =
    rule.competitorIds.length > 0
      ? { competitorId: { in: rule.competitorIds } }
      : {};

  const priceRows = await prisma.competitorPriceComparison.findMany({
    where: {
      ...competitorFilter,
      priceDate: { gte: sevenDaysAgo },
      deletedAt: null,
    },
    orderBy: { priceDate: "desc" },
  });

  // Build a product list based on scope
  const productFilter = buildProductFilter(rule);
  const dbProducts = await prisma.products.findMany({
    where: productFilter,
    select: {
      product_id: true,
      product_sku: true,
      product_discount_price: true,
      product_original_price: true,
    },
    take: 2000, // safety cap
  });

  // Group competitor prices by productSku
  const pricesBySkuMap = new Map<string, { competitorId: string; price: number; priceDate: Date }[]>();
  for (const row of priceRows) {
    if (!row.productSku) continue;
    if (!pricesBySkuMap.has(row.productSku)) pricesBySkuMap.set(row.productSku, []);
    pricesBySkuMap.get(row.productSku)!.push({
      competitorId: row.competitorId,
      price: Number(row.competitorPrice),
      priceDate: row.priceDate,
    });
  }

  const productContexts: ProductPriceContext[] = dbProducts
     
    .filter((p: any) => p.product_discount_price != null || p.product_original_price != null)
     
    .map((p: any) => ({
      productId: p.product_id,
      productSku: p.product_sku ?? p.product_id,
      currentPrice: Number(p.product_discount_price ?? p.product_original_price),
      cost: undefined,
      competitorPrices: pricesBySkuMap.get(p.product_sku ?? "") ?? [],
    }));

  // All active rules for conflict resolution
  const allActiveRules = await prisma.repricingRule.findMany({
    where: { status: "ACTIVE", createdById: user.id },
    select: { id: true, priority: true, scopeType: true, categoryIds: true, productIds: true },
  });
   
  const conflictInput: RuleConflictCheck[] = allActiveRules.map((r: any) => ({
    ruleId: r.id,
    priority: r.priority,
    scopeType: r.scopeType as RuleConflictCheck["scopeType"],
    categoryIds: r.categoryIds,
    productIds: r.productIds,
  }));

  // Run the engine
  const proposals = runEngine({
    rule: {
      id: rule.id,
      setPrice: rule.setPrice,
      priceDirection: rule.priceDirection as "PLUS" | "MINUS" | "PERCENTAGE" | "FIXED",
      comparisonSource: rule.comparisonSource as "MY_PRICE" | "CHEAPEST" | "AVERAGE" | "SPECIFIC",
      comparisonLogic: rule.comparisonLogic as "EQUAL" | "ABOVE" | "BELOW",
      specificCompetitorId: rule.specificCompetitorId ?? undefined,
      competitorIds: rule.competitorIds,
      guardrails: (rule.guardrails as unknown as Guardrail[]) ?? [],
      resolvedMin: undefined,
      resolvedMax: undefined,
    },
    products: productContexts,
    allActiveRules: conflictInput,
  });

  const willApplyCount = proposals.filter((p) => p.status === "WILL_APPLY").length;
  const blockedCount   = proposals.filter((p) => p.status === "BLOCKED").length;

  // Persist job + proposals in a transaction
   
  const job = await prisma.$transaction(async (tx: any) => {
    const newJob = await tx.repricingJob.create({
      data: {
        ruleId: rule.id,
        status: "SIMULATED",
        trigger: "MANUAL",
        productsAnalyzed: proposals.length,
        productsChanged: willApplyCount,
        productsBlocked: blockedCount,
        triggeredById: user.id,
        proposals: {
          createMany: {
             
            data: proposals.map((p: any) => ({
              productId: p.productId,
              productSku: p.productSku,
              currentPrice: p.currentPrice,
              proposedPrice: p.proposedPrice,
              costAtRun: p.proposedPrice != null ? undefined : null,
              cheapestCompetitorPrice: p.cheapestCompetitorPrice,
              highestCompetitorPrice: p.highestCompetitorPrice,
              avgCompetitorPrice: p.avgCompetitorPrice,
              minGuardrail: p.minGuardrail,
              maxGuardrail: p.maxGuardrail,
              status: mapProposalStatus(p.status),
              blockedReason: p.blockedReason,
            })),
          },
        },
      },
    });
    return newJob;
  });

  return prismaJobToDTO(job);
}

// ─── Apply ────────────────────────────────────────────────────────────────────

/**
 * Apply approved proposals from a SIMULATED job.
 * Marks them as APPLIED and updates Product prices.
 * If proposalIds is omitted, applies all WILL_APPLY proposals.
 */
export async function applyJob(
  jobId: string,
  proposalIds?: string[]
): Promise<RepricingJobDTO> {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");

  const job = await prisma.repricingJob.findFirstOrThrow({
    where: { id: jobId },
    include: { rule: { select: { createdById: true } } },
  });
  if (job.rule.createdById !== user.id) throw new Error("Unauthorized");
  if (job.status !== "SIMULATED") throw new Error("Job is not in SIMULATED state");

  const whereProposals: AnyRecord = {
    jobId,
    status: "WILL_APPLY",
    ...(proposalIds ? { id: { in: proposalIds } } : {}),
  };

  const toApply = await prisma.repricingProposal.findMany({ where: whereProposals });

  let totalImpact = 0;

   
  await prisma.$transaction(async (tx: any) => {
    for (const p of toApply) {
      if (p.proposedPrice == null) continue;
      const proposed = Number(p.proposedPrice);
      const current = Number(p.currentPrice);
      totalImpact += Math.abs(proposed - current);

      // Update the product's price
      await tx.products.updateMany({
        where: { product_id: p.productId },
        data: { product_discount_price: proposed },
      });

      // Mark proposal APPLIED
      await tx.repricingProposal.update({
        where: { id: p.id },
        data: {
          status: "APPLIED",
          appliedPrice: proposed,
          decidedById: user.id,
          decidedAt: new Date(),
        },
      });
    }

    // Update job
    await tx.repricingJob.update({
      where: { id: jobId },
      data: {
        status: "APPLIED",
        finishedAt: new Date(),
        productsChanged: toApply.length,
        totalImpact,
        triggeredById: user.id,
      },
    });
  });

  // Fire alerts for large price changes (outside the transaction)
  for (const p of toApply) {
    if (p.proposedPrice == null) continue;
    const proposed = Number(p.proposedPrice);
    const current = Number(p.currentPrice);
    const deltaPct = Math.abs((proposed - current) / current) * 100;

    if (deltaPct >= ALERT_LARGE_DELTA_PCT) {
      const severity = deltaPct >= ALERT_SEVERE_DELTA_PCT ? "WARN" : "INFO";
      await createAlert({
        kind: "PRICE_CHANGE_APPLIED",
        severity,
        title: `Price changed by ${deltaPct.toFixed(1)}%`,
        message: `SKU ${p.productSku}: €${current.toFixed(2)} → €${proposed.toFixed(2)} (${deltaPct >= 0 ? "+" : ""}${((proposed - current) / current * 100).toFixed(1)}%)`,
        metadata: { proposedPrice: proposed, currentPrice: current, deltaPct },
        productId: p.productId,
        ruleId: job.ruleId,
        jobId,
      });
    }
  }

  const updated = await prisma.repricingJob.findUniqueOrThrow({ where: { id: jobId } });
  return prismaJobToDTO(updated);
}

// ─── Reject proposals ─────────────────────────────────────────────────────────

export async function rejectProposals(
  jobId: string,
  proposalIds: string[]
): Promise<void> {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");

  await prisma.repricingProposal.updateMany({
    where: { jobId, id: { in: proposalIds }, status: "WILL_APPLY" },
    data: { status: "REJECTED", decidedById: user.id, decidedAt: new Date() },
  });
}

// ─── Rollback ─────────────────────────────────────────────────────────────────

/**
 * Rollback an APPLIED job — reverts all prices to their pre-apply values.
 * Creates a new RepricingJob (trigger=APPLY_ACTION, rollbackOfId=original) for the audit trail.
 */
export async function rollbackJob(jobId: string): Promise<RepricingJobDTO> {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");

  const original = await prisma.repricingJob.findFirstOrThrow({
    where: { id: jobId },
    include: {
      rule: { select: { createdById: true } },
      proposals: { where: { status: "APPLIED" } },
    },
  });

  if (original.rule.createdById !== user.id) throw new Error("Unauthorized");
  if (original.status !== "APPLIED") throw new Error("Job is not in APPLIED state");

  let totalImpact = 0;

   
  const rollbackJob = await prisma.$transaction(async (tx: any) => {
    // Revert prices
    for (const p of original.proposals) {
      const current = Number(p.currentPrice); // currentPrice was the price before apply
      await tx.products.updateMany({
        where: { product_id: p.productId },
        data: { product_discount_price: current },
      });
      totalImpact += Math.abs(Number(p.appliedPrice ?? p.proposedPrice ?? 0) - current);
    }

    // Mark original proposals ROLLED_BACK
    await tx.repricingProposal.updateMany({
      where: { jobId, status: "APPLIED" },
      data: { status: "ROLLED_BACK" },
    });

    // Mark original job ROLLED_BACK
    await tx.repricingJob.update({
      where: { id: jobId },
      data: { status: "ROLLED_BACK", rolledBackAt: new Date(), rolledBackById: user.id },
    });

    // Create rollback job for audit trail
    const rj = await tx.repricingJob.create({
      data: {
        ruleId: original.ruleId,
        status: "APPLIED",
        trigger: "APPLY_ACTION",
        productsAnalyzed: original.proposals.length,
        productsChanged: original.proposals.length,
        productsBlocked: 0,
        totalImpact,
        finishedAt: new Date(),
        triggeredById: user.id,
        rollbackOfId: jobId,
        proposals: {
          createMany: {
             
            data: original.proposals.map((p: any) => ({
              productId: p.productId,
              productSku: p.productSku,
              currentPrice: p.appliedPrice ?? p.proposedPrice ?? p.currentPrice,
              proposedPrice: p.currentPrice,
              appliedPrice: p.currentPrice,
              status: "ROLLED_BACK" as const,
            })),
          },
        },
      },
    });
    return rj;
  });

  return prismaJobToDTO(rollbackJob);
}

// ─── List jobs (history) ──────────────────────────────────────────────────────

export async function listJobs(opts?: {
  ruleId?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}): Promise<(RepricingJobDTO & { ruleName: string })[]> {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");

  const jobs = await prisma.repricingJob.findMany({
    where: {
      rule: { createdById: user.id },
      ...(opts?.ruleId ? { ruleId: opts.ruleId } : {}),
      ...(opts?.status ? { status: opts.status as never } : {}),
      ...(opts?.dateFrom || opts?.dateTo
        ? {
            startedAt: {
              ...(opts?.dateFrom ? { gte: opts.dateFrom } : {}),
              ...(opts?.dateTo ? { lte: opts.dateTo } : {}),
            },
          }
        : {}),
    },
    include: { rule: { select: { name: true } } },
    orderBy: { startedAt: "desc" },
    take: opts?.limit ?? 50,
    skip: opts?.offset ?? 0,
  });

   
  return jobs.map((j: any) => ({
    ...prismaJobToDTO(j),
    ruleName: j.rule.name,
  }));
}

// ─── Get single job with proposals (drill-in) ────────────────────────────────

export async function getJob(jobId: string): Promise<JobWithProposals> {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");

  const job = await prisma.repricingJob.findFirstOrThrow({
    where: { id: jobId, rule: { createdById: user.id } },
    include: {
      rule: { select: { name: true } },
      proposals: { orderBy: { status: "asc" } },
    },
  });

  return {
    ...prismaJobToDTO(job),
    ruleName: job.rule.name,
    proposals: job.proposals.map(prismaProposalToDTO),
  };
}

// ─── Cron executor (called by the hourly cron route) ─────────────────────────

export async function runScheduledRules(): Promise<{ ranCount: number; errors: string[] }> {
  const now = new Date();

  const dueRules = await prisma.repricingRule.findMany({
    where: { status: "ACTIVE", nextRunAt: { lte: now } },
  });

  const errors: string[] = [];

  for (const rule of dueRules) {
    try {
      // Create a temporary "system" context — no user session in cron
      const job = await simulateRuleSystem(rule);

      if (rule.autoApply) {
        // Apply all WILL_APPLY proposals automatically
        await applyJobSystem(job.id, rule.id);
      } else {
        // Notify operator via alert
        await createAlert({
          kind: "PRICE_CHANGE_APPLIED",
          severity: "INFO",
          title: `Repricing preview ready: ${rule.name}`,
          message: `${job.productsChanged} products ready to reprice. Review and apply in the dashboard.`,
          ruleId: rule.id,
          jobId: job.id,
        });
      }

      // Update schedule
      const nextRunAt = computeNextRunAt(
        rule.scheduleType as "MANUAL" | "HOURLY" | "DAILY" | "WEEKLY",
        rule.scheduleHour ?? undefined,
        rule.scheduleDow ?? undefined
      );
      await prisma.repricingRule.update({
        where: { id: rule.id },
        data: { lastRunAt: now, nextRunAt },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Rule ${rule.id}: ${msg}`);
      await createAlert({
        kind: "RULE_RUN_FAILED",
        severity: "CRITICAL",
        title: `Repricing rule failed: ${rule.name}`,
        message: msg,
        ruleId: rule.id,
      });
    }
  }

  return { ranCount: dueRules.length, errors };
}

// ─── Internal helpers (no auth check — called from cron) ─────────────────────

async function simulateRuleSystem(
  rule: Awaited<ReturnType<typeof prisma.repricingRule.findFirstOrThrow>>
): Promise<RepricingJobDTO> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const competitorFilter =
    rule.competitorIds.length > 0
      ? { competitorId: { in: rule.competitorIds } }
      : {};

  const priceRows = await prisma.competitorPriceComparison.findMany({
    where: { ...competitorFilter, priceDate: { gte: sevenDaysAgo }, deletedAt: null },
    orderBy: { priceDate: "desc" },
  });

  const productFilter = buildProductFilter(rule);
  const dbProducts = await prisma.products.findMany({
    where: productFilter,
    select: {
      product_id: true,
      product_sku: true,
      product_discount_price: true,
      product_original_price: true,
    },
    take: 2000,
  });

  const pricesBySkuMap = new Map<string, { competitorId: string; price: number; priceDate: Date }[]>();
  for (const row of priceRows) {
    if (!row.productSku) continue;
    if (!pricesBySkuMap.has(row.productSku)) pricesBySkuMap.set(row.productSku, []);
    pricesBySkuMap.get(row.productSku)!.push({
      competitorId: row.competitorId,
      price: Number(row.competitorPrice),
      priceDate: row.priceDate,
    });
  }

  const productContexts: ProductPriceContext[] = dbProducts
     
    .filter((p: any) => p.product_discount_price != null || p.product_original_price != null)
     
    .map((p: any) => ({
      productId: p.product_id,
      productSku: p.product_sku ?? p.product_id,
      currentPrice: Number(p.product_discount_price ?? p.product_original_price),
      competitorPrices: pricesBySkuMap.get(p.product_sku ?? "") ?? [],
    }));

  const allActiveRules = await prisma.repricingRule.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, priority: true, scopeType: true, categoryIds: true, productIds: true },
  });
   
  const conflictInput: RuleConflictCheck[] = allActiveRules.map((r: any) => ({
    ruleId: r.id,
    priority: r.priority,
    scopeType: r.scopeType as RuleConflictCheck["scopeType"],
    categoryIds: r.categoryIds,
    productIds: r.productIds,
  }));

  const proposals = runEngine({
    rule: {
      id: rule.id,
      setPrice: rule.setPrice,
      priceDirection: rule.priceDirection as "PLUS" | "MINUS" | "PERCENTAGE" | "FIXED",
      comparisonSource: rule.comparisonSource as "MY_PRICE" | "CHEAPEST" | "AVERAGE" | "SPECIFIC",
      comparisonLogic: rule.comparisonLogic as "EQUAL" | "ABOVE" | "BELOW",
      specificCompetitorId: rule.specificCompetitorId ?? undefined,
      competitorIds: rule.competitorIds,
      guardrails: (rule.guardrails as unknown as Guardrail[]) ?? [],
      resolvedMin: undefined,
      resolvedMax: undefined,
    },
    products: productContexts,
    allActiveRules: conflictInput,
  });

  const willApplyCount = proposals.filter((p) => p.status === "WILL_APPLY").length;
  const blockedCount   = proposals.filter((p) => p.status === "BLOCKED").length;

  const blockRatio = proposals.length > 0 ? blockedCount / proposals.length : 0;
  if (blockRatio > BLOCK_SPIKE_THRESHOLD) {
    await createAlert({
      kind: "GUARDRAIL_BLOCK_SPIKE",
      severity: "WARN",
      title: `High guardrail block rate: ${rule.name}`,
      message: `${(blockRatio * 100).toFixed(0)}% of products blocked by guardrails on this run.`,
      ruleId: rule.id,
    });
  }

   
  const job = await prisma.$transaction(async (tx: any) => {
    return tx.repricingJob.create({
      data: {
        ruleId: rule.id,
        status: "SIMULATED",
        trigger: "SCHEDULED",
        productsAnalyzed: proposals.length,
        productsChanged: willApplyCount,
        productsBlocked: blockedCount,
        proposals: {
          createMany: {
             
            data: proposals.map((p: any) => ({
              productId: p.productId,
              productSku: p.productSku,
              currentPrice: p.currentPrice,
              proposedPrice: p.proposedPrice,
              cheapestCompetitorPrice: p.cheapestCompetitorPrice,
              highestCompetitorPrice: p.highestCompetitorPrice,
              avgCompetitorPrice: p.avgCompetitorPrice,
              minGuardrail: p.minGuardrail,
              maxGuardrail: p.maxGuardrail,
              status: mapProposalStatus(p.status),
              blockedReason: p.blockedReason,
            })),
          },
        },
      },
    });
  });

  return prismaJobToDTO(job);
}

async function applyJobSystem(jobId: string, ruleId: string): Promise<void> {
  const toApply = await prisma.repricingProposal.findMany({
    where: { jobId, status: "WILL_APPLY" },
  });

  let totalImpact = 0;

   
  await prisma.$transaction(async (tx: any) => {
    for (const p of toApply) {
      if (p.proposedPrice == null) continue;
      const proposed = Number(p.proposedPrice);
      const current  = Number(p.currentPrice);
      totalImpact += Math.abs(proposed - current);

      await tx.products.updateMany({
        where: { product_id: p.productId },
        data: { product_discount_price: proposed },
      });
      await tx.repricingProposal.update({
        where: { id: p.id },
        data: { status: "APPLIED", appliedPrice: proposed, decidedAt: new Date() },
      });
    }
    await tx.repricingJob.update({
      where: { id: jobId },
      data: { status: "APPLIED", finishedAt: new Date(), productsChanged: toApply.length, totalImpact },
    });
  });

  // Alerts for large deltas
  for (const p of toApply) {
    if (p.proposedPrice == null) continue;
    const proposed = Number(p.proposedPrice);
    const current  = Number(p.currentPrice);
    const deltaPct = Math.abs((proposed - current) / current) * 100;
    if (deltaPct >= ALERT_LARGE_DELTA_PCT) {
      await createAlert({
        kind: "PRICE_CHANGE_APPLIED",
        severity: deltaPct >= ALERT_SEVERE_DELTA_PCT ? "WARN" : "INFO",
        title: `Price changed by ${deltaPct.toFixed(1)}% (autopilot)`,
        message: `SKU ${p.productSku}: €${current.toFixed(2)} → €${proposed.toFixed(2)}`,
        metadata: { deltaPct, autoApply: true },
        productId: p.productId,
        ruleId,
        jobId,
      });
    }
  }
}

// ─── DB → DTO mappers ─────────────────────────────────────────────────────────

function buildProductFilter(
  rule: { scopeType: string; categoryIds: string[]; productIds: string[] }
): Record<string, unknown> {
  if (rule.scopeType === "SPECIFIC" && rule.productIds.length > 0) {
    return { product_id: { in: rule.productIds } };
  }
  if (rule.scopeType === "CATEGORIES" && rule.categoryIds.length > 0) {
    return { product_category: { in: rule.categoryIds } };
  }
  return {}; // ALL
}

function mapProposalStatus(
  status: "WILL_APPLY" | "BLOCKED" | "NO_CHANGE" | "NO_DATA"
): "WILL_APPLY" | "BLOCKED" | "NO_CHANGE" {
  if (status === "NO_DATA") return "NO_CHANGE";
  return status;
}

function prismaJobToDTO(
  job: AnyRecord
): RepricingJobDTO {
  return {
    id: job.id,
    ruleId: job.ruleId,
    status: job.status as RepricingJobDTO["status"],
    trigger: job.trigger as RepricingJobDTO["trigger"],
    productsAnalyzed: job.productsAnalyzed,
    productsChanged: job.productsChanged,
    productsBlocked: job.productsBlocked,
    totalImpact: job.totalImpact != null ? Number(job.totalImpact) : null,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    triggeredById: job.triggeredById,
    rolledBackAt: job.rolledBackAt,
    rollbackOfId: job.rollbackOfId,
    error: job.error,
  };
}

function prismaProposalToDTO(
  p: AnyRecord
): RepricingProposalDTO {
  return {
    id: p.id,
    jobId: p.jobId,
    productId: p.productId,
    productSku: p.productSku,
    currentPrice: Number(p.currentPrice),
    proposedPrice: p.proposedPrice != null ? Number(p.proposedPrice) : null,
    appliedPrice: p.appliedPrice != null ? Number(p.appliedPrice) : null,
    costAtRun: p.costAtRun != null ? Number(p.costAtRun) : null,
    cheapestCompetitorPrice: p.cheapestCompetitorPrice != null ? Number(p.cheapestCompetitorPrice) : null,
    highestCompetitorPrice: p.highestCompetitorPrice != null ? Number(p.highestCompetitorPrice) : null,
    avgCompetitorPrice: p.avgCompetitorPrice != null ? Number(p.avgCompetitorPrice) : null,
    minGuardrail: p.minGuardrail != null ? Number(p.minGuardrail) : null,
    maxGuardrail: p.maxGuardrail != null ? Number(p.maxGuardrail) : null,
    status: p.status as RepricingProposalDTO["status"],
    blockedReason: p.blockedReason,
    decidedById: p.decidedById,
    decidedAt: p.decidedAt,
  };
}
