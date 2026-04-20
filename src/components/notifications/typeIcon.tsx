"use client";

import React from "react";
import {
  AtSign,
  Archive,
  CreditCard01,
  Download01,
  FileCheck02,
  Announcement01,
  Share01,
  UserPlus01,
  UserX01,
  Bell01,
} from "@untitledui/icons";
import type { NotificationType } from "@prisma/client";

const ICON_MAP: Record<
  NotificationType,
  { Icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  MENTION: { Icon: AtSign, tone: "text-blue-600 bg-blue-100 dark:bg-blue-950/40" },
  INVITE_ACCEPTED: {
    Icon: UserPlus01,
    tone: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40",
  },
  INVITE_DECLINED: {
    Icon: UserX01,
    tone: "text-rose-600 bg-rose-100 dark:bg-rose-950/40",
  },
  BILLING_PAYMENT_FAILED: {
    Icon: CreditCard01,
    tone: "text-rose-600 bg-rose-100 dark:bg-rose-950/40",
  },
  BILLING_INVOICE_READY: {
    Icon: FileCheck02,
    tone: "text-blue-600 bg-blue-100 dark:bg-blue-950/40",
  },
  BILLING_CARD_EXPIRING: {
    Icon: CreditCard01,
    tone: "text-amber-600 bg-amber-100 dark:bg-amber-950/40",
  },
  SYSTEM_ANNOUNCEMENT: {
    Icon: Announcement01,
    tone: "text-violet-600 bg-violet-100 dark:bg-violet-950/40",
  },
  SHARE_INVITE: {
    Icon: Share01,
    tone: "text-indigo-600 bg-indigo-100 dark:bg-indigo-950/40",
  },
  EXPORT_READY: {
    Icon: Download01,
    tone: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40",
  },
};

const FALLBACK = {
  Icon: Bell01,
  tone: "text-neutral-600 bg-neutral-100 dark:bg-neutral-800",
};

export function TypeIcon({
  type,
  className = "",
}: {
  type: NotificationType;
  className?: string;
}) {
  const { Icon, tone } = ICON_MAP[type] ?? FALLBACK;
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone} ${className}`}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}

export { Archive };
