"use server";
import { prisma } from "@/lib/prismaDb";
import { isAuthorized } from "@/lib/isAuthorized";
import { formToCreatePayload, dtoToFormData } from "@/lib/repricing/adapter";
import { computeConflictMap } from "@/lib/repricing/conflict";
import type { RepricingRuleFormData } from "@/types/repricing-rule";
import type { RepricingRuleDTO, RuleConflictCheck } from "@/lib/repricing/types";
import { computeNextRunAt } from "./schedule-utils";

 
type PrismaRule = Record<string, any>;

function prismaToDTO(rule: PrismaRule): RepricingRuleDTO {
  return {
    id: rule.id,
    name: rule.name,
    description: rule.description,
    status: rule.status as RepricingRuleDTO["status"],
    priority: rule.priority,
    scopeType: rule.scopeType as RepricingRuleDTO["scopeType"],
    categoryIds: rule.categoryIds,
    productIds: rule.productIds,
    setPrice: rule.setPrice,
    priceDirection: rule.priceDirection as RepricingRuleDTO["priceDirection"],
    comparisonSource: rule.comparisonSource as RepricingRuleDTO["comparisonSource"],
    comparisonLogic: rule.comparisonLogic as RepricingRuleDTO["comparisonLogic"],
    specificCompetitorId: rule.specificCompetitorId,
    competitorIds: rule.competitorIds,
    guardrails: (rule.guardrails as unknown as RepricingRuleDTO["guardrails"]) ?? [],
    minMaxType: rule.minMaxType as RepricingRuleDTO["minMaxType"],
    minMax: (rule.minMax as Record<string, unknown>) ?? {},
    ruleOptions: (rule.ruleOptions as Record<string, unknown>) ?? {},
    scheduleType: rule.scheduleType as RepricingRuleDTO["scheduleType"],
    scheduleHour: rule.scheduleHour,
    scheduleDow: rule.scheduleDow,
    autoApply: rule.autoApply,
    lastRunAt: rule.lastRunAt,
    nextRunAt: rule.nextRunAt,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
    createdById: rule.createdById,
  };
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listRules(opts?: {
  status?: RepricingRuleDTO["status"];
  search?: string;
}): Promise<RepricingRuleDTO[]> {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");

   
  const where: Record<string, any> = {
    createdById: user.id, // TODO(multi-tenant): replace with tenantId
    ...(opts?.status ? { status: opts.status } : { status: { not: "ARCHIVED" } }),
    ...(opts?.search
      ? { name: { contains: opts.search, mode: "insensitive" } }
      : {}),
  };

  const rules = await prisma.repricingRule.findMany({
    where,
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });

  const dtos: RepricingRuleDTO[] = (rules as PrismaRule[]).map(prismaToDTO);

  // Compute conflict map and attach conflictsWithRuleIds
  const conflictInput: RuleConflictCheck[] = dtos
    .filter((r) => r.status === "ACTIVE")
    .map((r) => ({
      ruleId: r.id,
      priority: r.priority,
      scopeType: r.scopeType,
      categoryIds: r.categoryIds,
      productIds: r.productIds,
    }));

  const conflictMap = computeConflictMap(conflictInput);

  return dtos.map((d) => ({
    ...d,
    conflictsWithRuleIds: conflictMap.get(d.id) ?? [],
  }));
}

// ─── Get one ──────────────────────────────────────────────────────────────────

export async function getRule(id: string): Promise<RepricingRuleDTO> {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");

  const rule = await prisma.repricingRule.findFirstOrThrow({
    where: { id, createdById: user.id },
  });

  return prismaToDTO(rule);
}

/** Get rule as form data (for editing in the wizard) */
export async function getRuleFormData(id: string): Promise<RepricingRuleFormData> {
  const dto = await getRule(id);
  return dtoToFormData(dto);
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createRule(
  input: RepricingRuleFormData
): Promise<RepricingRuleDTO> {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");

  const payload = formToCreatePayload(input, user.id);

  const rule = await prisma.repricingRule.create({
    data: {
      name: payload.name,
      description: payload.description ?? null,
      status: "DRAFT",
      priority: 0,
      scopeType: payload.scopeType,
      categoryIds: payload.categoryIds,
      productIds: payload.productIds,
      setPrice: payload.setPrice,
      priceDirection: payload.priceDirection,
      comparisonSource: payload.comparisonSource,
      comparisonLogic: payload.comparisonLogic,
      specificCompetitorId: payload.specificCompetitorId ?? null,
      competitorIds: payload.competitorIds,
       
      guardrails: payload.guardrails as any,
      minMaxType: payload.minMaxType,
       
      minMax: payload.minMax as any,
       
      ruleOptions: payload.ruleOptions as any,
      scheduleType: payload.scheduleType,
      scheduleHour: payload.scheduleHour ?? null,
      scheduleDow: payload.scheduleDow ?? null,
      autoApply: payload.autoApply,
      createdById: user.id,
    },
  });

  return prismaToDTO(rule);
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateRule(
  id: string,
  patch: Partial<RepricingRuleFormData>
): Promise<RepricingRuleDTO> {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");

  // Ensure the rule belongs to this user
  await prisma.repricingRule.findFirstOrThrow({
    where: { id, createdById: user.id },
  });

  // Build a partial payload from the patch
  const full = await getRuleFormData(id);
  const merged = { ...full, ...patch };
  const payload = formToCreatePayload(merged, user.id);

  const rule = await prisma.repricingRule.update({
    where: { id },
    data: {
      name: payload.name,
      description: payload.description ?? null,
      scopeType: payload.scopeType,
      categoryIds: payload.categoryIds,
      productIds: payload.productIds,
      setPrice: payload.setPrice,
      priceDirection: payload.priceDirection,
      comparisonSource: payload.comparisonSource,
      comparisonLogic: payload.comparisonLogic,
      specificCompetitorId: payload.specificCompetitorId ?? null,
      competitorIds: payload.competitorIds,
       
      guardrails: payload.guardrails as any,
      minMaxType: payload.minMaxType,
       
      minMax: payload.minMax as any,
       
      ruleOptions: payload.ruleOptions as any,
      scheduleType: payload.scheduleType,
      scheduleHour: payload.scheduleHour ?? null,
      scheduleDow: payload.scheduleDow ?? null,
      autoApply: payload.autoApply,
    },
  });

  return prismaToDTO(rule);
}

// ─── Status transitions ───────────────────────────────────────────────────────

export async function activateRule(id: string): Promise<void> {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");

  const rule = await prisma.repricingRule.findFirstOrThrow({
    where: { id, createdById: user.id },
  });

  const nextRunAt = computeNextRunAt(
    rule.scheduleType as "MANUAL" | "HOURLY" | "DAILY" | "WEEKLY",
    rule.scheduleHour ?? undefined,
    rule.scheduleDow ?? undefined
  );

  await prisma.repricingRule.update({
    where: { id },
    data: { status: "ACTIVE", nextRunAt },
  });
}

export async function pauseRule(id: string): Promise<void> {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");

  await prisma.repricingRule.updateMany({
    where: { id, createdById: user.id },
    data: { status: "PAUSED" },
  });
}

export async function archiveRule(id: string): Promise<void> {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");

  await prisma.repricingRule.updateMany({
    where: { id, createdById: user.id },
    data: { status: "ARCHIVED" },
  });
}

// ─── Duplicate ────────────────────────────────────────────────────────────────

export async function duplicateRule(id: string): Promise<RepricingRuleDTO> {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");

  const existing = await prisma.repricingRule.findFirstOrThrow({
    where: { id, createdById: user.id },
  });

  const rule = await prisma.repricingRule.create({
    data: {
      ...existing,
      id: undefined as unknown as string,  // let Prisma generate new id
      name: `${existing.name} (Copy)`,
      status: "DRAFT",
      priority: existing.priority + 1,
      lastRunAt: null,
      nextRunAt: null,
      createdAt: undefined as unknown as Date,
      updatedAt: undefined as unknown as Date,
    },
  });

  return prismaToDTO(rule);
}

// ─── Reorder (drag) ───────────────────────────────────────────────────────────

export async function reorderRules(orderedIds: string[]): Promise<void> {
  const user = await isAuthorized();
  if (!user?.id) throw new Error("Unauthorized");

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.repricingRule.updateMany({
        where: { id, createdById: user.id },
        data: { priority: index },
      })
    )
  );
}
