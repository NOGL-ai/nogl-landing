"use server";
import { prisma } from "@/lib/prismaDb";
import type { CreateAlertInput } from "@/lib/repricing/types";

/**
 * Create an in-app alert record.
 * Called from the repricing engine after apply jobs and cron runs.
 */
export async function createAlert(input: CreateAlertInput) {
  return prisma.alert.create({
    data: {
      kind: input.kind,
      severity: input.severity,
      title: input.title,
      message: input.message,
      metadata: input.metadata ?? {},
      productId: input.productId,
      ruleId: input.ruleId,
      jobId: input.jobId,
    },
  });
}

export async function markAlertRead(id: string) {
  return prisma.alert.update({
    where: { id },
    data: { readAt: new Date() },
  });
}

export async function markAllAlertsRead() {
  return prisma.alert.updateMany({
    where: { readAt: null },
    data: { readAt: new Date() },
  });
}

export async function listAlerts(opts?: {
  unreadOnly?: boolean;
  limit?: number;
}) {
  return prisma.alert.findMany({
    where: opts?.unreadOnly ? { readAt: null } : undefined,
    orderBy: { createdAt: "desc" },
    take: opts?.limit ?? 50,
  });
}
