"use server";

import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prismaDb";

// Single tenant for now — swap to session.user.companyId once multi-tenant auth lands
const CALUMET_COMPANY_ID = "cmnw4qqo10000ltccgauemneu";

async function assertAuth() {
  const session = await getAuthSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

/** Returns the tenant company ID for the current session. Swap body when multi-tenant auth lands. */
function resolveTenantCompanyId() {
  return CALUMET_COMPANY_ID;
}

/** Invalidates the competitor page cache for all locales. */
function invalidateCompetitorPage() {
  revalidatePath("/[lang]/companies/competitor", "page");
}

export async function listTrackedCompetitors(tenantCompanyId: string) {
  await assertAuth();
  return prisma.trackedCompetitor.findMany({
    where: { tenantCompanyId, status: { not: "ARCHIVED" } },
    include: {
      competitor: {
        select: {
          id: true,
          name: true,
          slug: true,
          domain: true,
          country_code: true,
          website: true,
          snapshot: { select: { total_products: true } },
        },
      },
    },
    orderBy: [{ priority: "asc" }, { addedAt: "asc" }],
  });
}

export async function addTrackedCompetitor(input: {
  tenantCompanyId: string;
  competitorId: string;
  nickname?: string;
}) {
  const session = await assertAuth();
  const tenantCompanyId = resolveTenantCompanyId();

  // Ensure caller can only add to their own tenant
  if (input.tenantCompanyId !== tenantCompanyId) {
    throw new Error("Forbidden");
  }

  const result = await prisma.trackedCompetitor.upsert({
    where: {
      tenantCompanyId_competitorId: {
        tenantCompanyId: input.tenantCompanyId,
        competitorId: input.competitorId,
      },
    },
    create: {
      tenantCompanyId: input.tenantCompanyId,
      competitorId: input.competitorId,
      nickname: input.nickname ?? null,
      addedByUserId: session.user.id,
      status: "ACTIVE",
    },
    update: {
      status: "ACTIVE",
      pausedAt: null,
      pauseReason: null,
      nickname: input.nickname ?? null,
    },
  });
  invalidateCompetitorPage();
  return result;
}

export async function removeTrackedCompetitor(id: string) {
  await assertAuth();
  const tenantCompanyId = resolveTenantCompanyId();

  // Scope to tenant — updateMany silently no-ops if id doesn't belong to this tenant
  const { count } = await prisma.trackedCompetitor.updateMany({
    where: { id, tenantCompanyId },
    data: { status: "ARCHIVED" },
  });
  if (count === 0) throw new Error("Competitor not found or access denied");
  invalidateCompetitorPage();
}

export async function pauseTrackedCompetitor(id: string, reason?: string) {
  await assertAuth();
  const tenantCompanyId = resolveTenantCompanyId();

  const { count } = await prisma.trackedCompetitor.updateMany({
    where: { id, tenantCompanyId },
    data: { status: "PAUSED", pausedAt: new Date(), pauseReason: reason ?? null },
  });
  if (count === 0) throw new Error("Competitor not found or access denied");
  invalidateCompetitorPage();
}

export async function resumeTrackedCompetitor(id: string) {
  await assertAuth();
  const tenantCompanyId = resolveTenantCompanyId();

  const { count } = await prisma.trackedCompetitor.updateMany({
    where: { id, tenantCompanyId },
    data: { status: "ACTIVE", pausedAt: null, pauseReason: null },
  });
  if (count === 0) throw new Error("Competitor not found or access denied");
  invalidateCompetitorPage();
}

export async function renameTrackedCompetitor(id: string, nickname: string) {
  await assertAuth();
  const tenantCompanyId = resolveTenantCompanyId();

  const { count } = await prisma.trackedCompetitor.updateMany({
    where: { id, tenantCompanyId },
    data: { nickname: nickname.trim() || null },
  });
  if (count === 0) throw new Error("Competitor not found or access denied");
  invalidateCompetitorPage();
}

export async function reorderTrackedCompetitors(orderedIds: string[]) {
  await assertAuth();
  const tenantCompanyId = resolveTenantCompanyId();

  // Use a transaction to keep priorities consistent
  await prisma.$transaction(
    orderedIds.map((id, priority) =>
      prisma.trackedCompetitor.updateMany({
        where: { id, tenantCompanyId },
        data: { priority },
      })
    )
  );
  invalidateCompetitorPage();
}

export async function listAvailableCompetitors(
  tenantCompanyId: string,
  search?: string
) {
  await assertAuth();
  const alreadyTracked = await prisma.trackedCompetitor.findMany({
    where: { tenantCompanyId, status: { not: "ARCHIVED" } },
    select: { competitorId: true },
  });
  const excluded = [
    ...alreadyTracked.map((t: { competitorId: string }) => t.competitorId),
    tenantCompanyId,
  ];

  return prisma.company.findMany({
    where: {
      id: { notIn: excluded },
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
              { domain: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      domain: true,
      country_code: true,
      website: true,
      snapshot: { select: { total_products: true } },
    },
    take: 20,
    orderBy: { name: "asc" },
  });
}

export { resolveTenantCompanyId, CALUMET_COMPANY_ID };
