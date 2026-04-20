import type {
  Notification,
  NotificationStatus,
  NotificationType,
} from "@prisma/client";

export type { Notification, NotificationStatus, NotificationType };

export type NotificationTab = "all" | "mentions" | "system" | "archive";

export type NotificationWithActor = Notification & {
  actor: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
};

export type CreateNotificationInput = {
  recipientId: string;
  tenantId?: string | null;
  type: NotificationType;
  title: string;
  description?: string | null;
  actionUrl?: string | null;
  actorId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ListNotificationsParams = {
  status?: NotificationStatus;
  types?: NotificationType[];
  tab?: NotificationTab;
  page?: number;
  pageSize?: number;
};

export type ListNotificationsResult = {
  items: NotificationWithActor[];
  total: number;
  unreadCount: number;
};

export type AggregateUnread = {
  notifications: number;
  alerts: number;
  total: number;
};

export const MENTION_TYPES: NotificationType[] = ["MENTION"];

export const SYSTEM_TYPES: NotificationType[] = [
  "SYSTEM_ANNOUNCEMENT",
  "BILLING_PAYMENT_FAILED",
  "BILLING_INVOICE_READY",
  "BILLING_CARD_EXPIRING",
  "EXPORT_READY",
  "INVITE_ACCEPTED",
  "INVITE_DECLINED",
  "SHARE_INVITE",
];
