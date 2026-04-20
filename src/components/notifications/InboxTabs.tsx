"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { markAllRead } from "@/actions/notifications";
import { useNotificationsStream } from "@/hooks/useNotificationsStream";
import { NotificationRow } from "./NotificationRow";
import type {
  ListNotificationsResult,
  NotificationTab,
} from "@/lib/notifications/types";
import type { Route } from 'next';

const TABS: { value: NotificationTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mentions", label: "Mentions" },
  { value: "system", label: "System" },
  { value: "archive", label: "Archive" },
];

export function InboxTabs({
  tab,
  result,
  unreadCount,
}: {
  tab: NotificationTab;
  result: ListNotificationsResult;
  unreadCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [localUnread, setLocalUnread] = useState(unreadCount);

  useEffect(() => setLocalUnread(unreadCount), [unreadCount]);

  useNotificationsStream((kind) => {
    if (
      kind === "notification.created" ||
      kind === "notification.read" ||
      kind === "notification.allRead" ||
      kind === "notification.archived"
    ) {
      router.refresh();
    }
  });

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}` as Route);
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const res = await markAllRead();
      setLocalUnread(Math.max(0, unreadCount - res.count));
      router.refresh();
    });
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-primary sm:text-3xl">
            Notifications
          </h1>
          {localUnread > 0 && (
            <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-brand-solid px-2 text-xs font-semibold text-white">
              {localUnread}
            </span>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={isPending || localUnread === 0}
        >
          Mark all read
        </Button>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value} className="mt-4">
            {t.value === tab && (
              <>
                {result.items.length === 0 ? (
                  <EmptyState tab={tab} />
                ) : (
                  <ul className="flex flex-col gap-2">
                    {result.items.map((item) => (
                      <li key={item.id}>
                        <NotificationRow item={item} />
                      </li>
                    ))}
                  </ul>
                )}
                {result.total > result.items.length && (
                  <p className="mt-4 text-center text-xs text-tertiary">
                    Showing {result.items.length} of {result.total}
                  </p>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function EmptyState({ tab }: { tab: NotificationTab }) {
  const copy: Record<NotificationTab, { title: string; body: string }> = {
    all: {
      title: "You're all caught up.",
      body: "New mentions, invites, billing events, and exports will show up here.",
    },
    mentions: {
      title: "No mentions yet.",
      body: "When a teammate @-mentions you in a comment, you'll see it here.",
    },
    system: {
      title: "No system notifications.",
      body: "Billing events, exports, share invites, and announcements land here.",
    },
    archive: {
      title: "Archive is empty.",
      body: "Archive notifications to move them out of your main inbox.",
    },
  };

  const { title, body } = copy[tab];
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <p className="text-sm font-medium text-primary">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-tertiary">{body}</p>
    </div>
  );
}