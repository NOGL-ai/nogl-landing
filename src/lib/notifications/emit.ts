import { prisma } from "@/lib/prismaDb";
import { channelForUser, publish } from "./bus";
import type { CreateNotificationInput } from "./types";

/**
 * Check if the recipient has opted in to this notification type.
 * Preferences live at /en/settings/notifications (see prompt 11).
 * Default: all types enabled until the prefs surface ships.
 */
async function isTypeEnabled(
  _recipientId: string,
  _type: CreateNotificationInput["type"],
): Promise<boolean> {
  return true;
}

/**
 * Create an in-app notification row and publish it to the recipient's
 * real-time channel. Called from any backend code that needs to notify
 * a user of a cross-cutting event.
 *
 * Returns null if the recipient has disabled this notification type
 * (no row is written, no real-time event is published).
 */
export async function createNotification(input: CreateNotificationInput) {
  const enabled = await isTypeEnabled(input.recipientId, input.type);
  if (!enabled) return null;

  const notification = await prisma.notification.create({
    data: {
      recipientId: input.recipientId,
      tenantId: input.tenantId ?? null,
      type: input.type,
      title: input.title,
      description: input.description ?? null,
      actionUrl: input.actionUrl ?? null,
      actorId: input.actorId ?? null,
      metadata: input.metadata ?? {},
    },
    include: {
      actor: { select: { id: true, name: true, image: true } },
    },
  });

  publish(channelForUser(input.recipientId), {
    kind: "notification.created",
    notification,
  });

  return notification;
}
