"use server";

import { prisma, isPrismaAvailable } from "@/lib/prismaDb";
import { getAuthSession } from "@/lib/auth";
import type {
  AlertAudience,
  AlertSeverity,
  AlertStatus,
  AlertType,
} from "@prisma/client";
import {
  MOCK_CMO_ALERTS,
  MOCK_CFO_ALERTS,
  MOCK_CMO_COUNTS,
  MOCK_CFO_COUNTS,
} from "@/lib/alerts/mockAlerts";

const PAGE_SIZE_DEFAULT = 50;

export interface AlertRow {
  id: string;
  companyId: string;
  audience: AlertAudience;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string | null;
  subjectProductId: string | null;
  subjectVariantId: string | null;
  subjectCompetitorId: string | null;
  estimatedImpact: number | null;
  impactCurrency: string;
  impactWindowDays: number;
  metadata: Record<string, unknown>;
  assignedToUserId: string | null;
  snoozeUntil: Date | null;
  resolvedAt: Date | null;
  resolvedByUserId: string | null;
  triggeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCountsResult {
  total: number;
  HOT: number;
  WARM: number;
  COLD: number;
  SNOOZED: number;
  RESOLVED: number;
  assigned: number;
}

export async function listAlerts(params: {
  companyId: string;
  audience: AlertAudience;
  severity?: AlertSeverity[];
  status?: AlertStatus[];
  type?: AlertType[];
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ alerts: AlertRow[]; total: number; page: number }> {
  await getAuthSession();

  // Dev fallback when no DATABASE_URL is set
  if (!isPrismaAvailable) {
    const pool = params.audience === "CMO" ? MOCK_CMO_ALERTS : MOCK_CFO_ALERTS;
    let rows = pool.filter((a) => {
      if (params.severity?.length && !params.severity.includes(a.severity)) return false;
      const allowedStatuses = params.status?.length ? params.status : ["OPEN", "SNOOZED"];
      if (!allowedStatuses.includes(a.status)) return false;
      if (params.type?.length && !params.type.includes(a.type)) return false;
      if (params.search && !a.title.toLowerCase().includes(params.search.toLowerCase())) return false;
      return true;
    });
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? PAGE_SIZE_DEFAULT;
    return { alerts: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page };
  }

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? PAGE_SIZE_DEFAULT;

  const where: Record<string, unknown> = {
    companyId: params.companyId,
    audience: params.audience,
  };

  if (params.severity?.length) where.severity = { in: params.severity };
  if (params.status?.length) {
    where.status = { in: params.status };
  } else {
    where.status = { in: ["OPEN", "SNOOZED"] };
  }
  if (params.type?.length) where.type = { in: params.type };
  if (params.search) {
    where.title = { contains: params.search, mode: "insensitive" };
  }

  const [alerts, total] = await Promise.all([
    prisma.alert.findMany({
      where,
      orderBy: [{ severity: "asc" }, { triggeredAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.alert.count({ where }),
  ]);

  return {
    alerts: alerts.map((a: any) => ({
      ...a,
      estimatedImpact: a.estimatedImpact ? Number(a.estimatedImpact) : null,
    })),
    total,
    page,
  };
}

export async function getAlertCounts(params: {
  companyId: string;
  audience: AlertAudience;
}): Promise<AlertCountsResult> {
  await getAuthSession();

  if (!isPrismaAvailable) {
    return params.audience === "CMO" ? MOCK_CMO_COUNTS : MOCK_CFO_COUNTS;
  }

  const rows = await prisma.alert.groupBy({
    by: ["severity"],
    where: {
      companyId: params.companyId,
      audience: params.audience,
      status: { in: ["OPEN", "SNOOZED"] },
    },
    _count: true,
  });

  const assigned = await prisma.alert.count({
    where: {
      companyId: params.companyId,
      audience: params.audience,
      status: { in: ["OPEN", "SNOOZED"] },
      assignedToUserId: { not: null },
    },
  });

  const counts: AlertCountsResult = {
    total: 0,
    HOT: 0,
    WARM: 0,
    COLD: 0,
    SNOOZED: 0,
    RESOLVED: 0,
    assigned,
  };

  for (const row of rows) {
    const key = row.severity as keyof AlertCountsResult;
    if (typeof counts[key] === "number") {
      (counts[key] as number) = row._count;
    }
    counts.total += row._count;
  }

  return counts;
}

export async function resolveAlert(id: string): Promise<void> {
  const session = await getAuthSession();
  if (!isPrismaAvailable) return; // mock: optimistic update handled client-side
  await prisma.alert.update({
    where: { id },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
      resolvedByUserId: session?.user?.id ?? null,
    },
  });
}

export async function snoozeAlert(id: string, until: Date): Promise<void> {
  await getAuthSession();
  if (!isPrismaAvailable) return;
  await prisma.alert.update({
    where: { id },
    data: { status: "SNOOZED", snoozeUntil: until },
  });
}

export async function bulkResolveAlerts(ids: string[]): Promise<void> {
  const session = await getAuthSession();
  if (!isPrismaAvailable) return;
  await prisma.alert.updateMany({
    where: { id: { in: ids } },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
      resolvedByUserId: session?.user?.id ?? null,
    },
  });
}

export async function bulkAssignAlerts(
  ids: string[],
  userId: string,
): Promise<void> {
  await getAuthSession();
  if (!isPrismaAvailable) return;
  await prisma.alert.updateMany({
    where: { id: { in: ids } },
    data: { assignedToUserId: userId },
  });
}

export async function createDraftOrderFromAlert(
  alertId: string,
): Promise<{ poId: string }> {
  await getAuthSession();
  // Stub: replenishment module not yet implemented.
  // Return a placeholder PO id so UI can redirect.
  return { poId: `po-stub-${alertId.slice(0, 8)}` };
}

// ── Subscriptions ──────────────────────────────────────────────────────────

export interface SubscriptionRow {
  alertType: AlertType;
  enabled: boolean;
  digestMode: string;
}

export async function getSubscriptions(params: {
  userId: string;
  companyId: string;
  audience: AlertAudience;
}): Promise<SubscriptionRow[]> {
  await getAuthSession();
  if (!isPrismaAvailable) return [];
  const rows = await prisma.alertSubscription.findMany({
    where: {
      userId: params.userId,
      companyId: params.companyId,
      audience: params.audience,
    },
  });
  return rows.map((r: any) => ({
    alertType: r.alertType,
    enabled: r.enabled,
    digestMode: r.digestMode,
  }));
}

export async function upsertSubscription(params: {
  userId: string;
  companyId: string;
  audience: AlertAudience;
  alertType: AlertType;
  enabled: boolean;
  digestMode?: string;
}): Promise<void> {
  await getAuthSession();
  if (!isPrismaAvailable) return;
  await prisma.alertSubscription.upsert({
    where: {
      userId_companyId_audience_alertType: {
        userId: params.userId,
        companyId: params.companyId,
        audience: params.audience,
        alertType: params.alertType,
      },
    },
    update: {
      enabled: params.enabled,
      digestMode: params.digestMode ?? "REALTIME",
    },
    create: {
      userId: params.userId,
      companyId: params.companyId,
      audience: params.audience,
      alertType: params.alertType,
      enabled: params.enabled,
      digestMode: params.digestMode ?? "REALTIME",
    },
  });
}
