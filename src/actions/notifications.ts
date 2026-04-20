"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prismaDb";
import { getAuthSession } from "@/lib/auth";
import { channelForUser, publish } from "@/lib/notifications/bus";
import { createNotification } from "@/lib/notifications/emit";
import {
  MENTION_TYPES,
  SYSTEM_TYPES,
  type AggregateUnread,
  type CreateNotificationInput,
  type ListNotificationsParams,
  type ListNotificationsResult,
  type NotificationTab,
} from "@/lib/notifications/types";

async function requireUserId(): Promise<string> {
  const session = await getAuthSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

function tabToWhere(
  tab: NotificationTab | undefined,
  recipientId: string,
): Prisma.NotificationWhereInput {
  const base: Prisma.NotificationWhereInput = { recipientId };
  switch (tab) {
    case "mentions":
      return { ...base, type: { in: MENTION_TYPES }, status: { not: "ARCHIVED" } };
    case "system":
      return { ...base, type: { in: SYSTEM_TYPES }, status: { not: "ARCHIVED" } };
    case "archive":
      return { ...base, status: "ARCHIVED" };
    case "all":
    default:
      return { ...base, status: { not: "ARCHIVED" } };
  }
}

export async function listNotifications(
  params: ListNotificationsParams = {},
): Promise<ListNotificationsResult> {
  const recipientId = await requireUserId();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

  let where: Prisma.NotificationWhereInput;
  if (params.tab) {
    where = tabToWhere(params.tab, recipientId);
  } else {
    where = { recipientId };
    if (params.status) where.status = params.status;
    if (params.types?.length) where.type = { in: params.types };
  }

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        actor: { select: { id: true, name: true, image: true } },
      },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { recipientId, status: "UNREAD" },
    }),
  ]);

  return { items, total, unreadCount };
}

export async function markRead(id: string): Promise<void> {
  const recipientId = await requireUserId();
  await prisma.notification.updateMany({
    where: { id, recipientId, status: "UNREAD" },
    data: { status: "READ", readAt: new Date() },
  });
  publish(channelForUser(recipientId), { kind: "notification.read", id });
}

export async function markAllRead(): Promise<{ count: number }> {
  const recipientId = await requireUserId();
  const res = await prisma.notification.updateMany({
    where: { recipientId, status: "UNREAD" },
    data: { status: "READ", readAt: new Date() },
  });
  publish(channelForUser(recipientId), { kind: "notification.allRead" });
  return { count: res.count };
}

export async function archive(id: string): Promise<void> {
  const recipientId = await requireUserId();
  await prisma.notification.updateMany({
    where: { id, recipientId },
    data: { status: "ARCHIVED" },
  });
  publish(channelForUser(recipientId), { kind: "notification.archived", id });
}

export async function getUnreadCount(): Promise<number> {
  const recipientId = await requireUserId();
  return prisma.notification.count({
    where: { recipientId, status: "UNREAD" },
  });
}

/**
 * Aggregate unread count across all inbox-like surfaces:
 * - notifications (cross-cutting inbox)
 * - alerts (repricing domain alerts — Alert.readAt is null)
 *
 * CFO alerts would be added here when that surface ships.
 */
export async function getAggregateUnread(): Promise<AggregateUnread> {
  const recipientId = await requireUserId();

  const [notifications, alerts] = await Promise.all([
    prisma.notification.count({
      where: { recipientId, status: "UNREAD" },
    }),
    prisma.repricingAlert.count({ where: { readAt: null } }),
  ]);

  return {
    notifications,
    alerts,
    total: notifications + alerts,
  };
}

/**
 * Exposed so API routes can create notifications too. UI code should
 * call the type-safe helper in `src/lib/notifications/emit.ts` directly.
 */
export async function emit(input: CreateNotificationInput) {
  return createNotification(input);
}
