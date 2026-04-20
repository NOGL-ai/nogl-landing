import { prisma } from "@/lib/prismaDb";
import { publishAlert, alertChannel } from "@/lib/alertBus";
import type { AlertAudience, AlertType, AlertSeverity } from "@prisma/client";

export interface AlertCreateInput {
  companyId: string;
  audience: AlertAudience;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description?: string;
  subjectProductId?: string;
  subjectVariantId?: string;
  subjectCompetitorId?: string;
  estimatedImpact?: number;
  impactCurrency?: string;
  impactWindowDays?: number;
  metadata?: Record<string, unknown>;
  assignedToUserId?: string;
}

export async function createAlert(input: AlertCreateInput) {
  // Check if subscriber has this type enabled
  const subscriptions = await prisma.alertSubscription.findMany({
    where: {
      companyId: input.companyId,
      audience: input.audience,
      alertType: input.type,
      enabled: false,
    },
  });

  if (subscriptions.length > 0) {
    return null; // At least one subscription explicitly disabled
  }

  const alert = await prisma.alert.create({
    data: {
      companyId: input.companyId,
      audience: input.audience,
      type: input.type,
      severity: input.severity,
      title: input.title,
      description: input.description,
      subjectProductId: input.subjectProductId,
      subjectVariantId: input.subjectVariantId,
      subjectCompetitorId: input.subjectCompetitorId,
      estimatedImpact: input.estimatedImpact,
      impactCurrency: input.impactCurrency ?? "EUR",
      impactWindowDays: input.impactWindowDays ?? 180,
      metadata: input.metadata ?? {},
      assignedToUserId: input.assignedToUserId,
    },
  });

  publishAlert(
    alertChannel(input.companyId, input.audience),
    JSON.stringify(alert),
  );

  return alert;
}
