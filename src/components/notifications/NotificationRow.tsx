"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Archive } from "@untitledui/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TypeIcon } from "./typeIcon";
import { archive, markRead } from "@/actions/notifications";
import type { NotificationWithActor } from "@/lib/notifications/types";
import type { Route } from 'next';

function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function NotificationRow({ item }: { item: NotificationWithActor }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isUnread = item.status === "UNREAD";

  const handleClick = (e: React.MouseEvent) => {
    if (isUnread) {
      startTransition(async () => {
        await markRead(item.id);
        router.refresh();
      });
    }
    if (!item.actionUrl) {
      e.preventDefault();
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await archive(item.id);
      router.refresh();
    });
  };

  const content = (
    <div
      className={`group relative flex gap-3 rounded-lg border border-border/50 p-4 transition-colors ${
        isUnread
          ? "bg-background hover:bg-primary_hover"
          : "bg-secondary_bg/40 hover:bg-secondary_bg"
      } ${isPending ? "opacity-60" : ""}`}
    >
      <TypeIcon type={item.type} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {item.actor && (
                <Avatar className="h-5 w-5">
                  {item.actor.image && <AvatarImage src={item.actor.image} alt="" />}
                  <AvatarFallback className="text-[10px]">
                    {initials(item.actor.name)}
                  </AvatarFallback>
                </Avatar>
              )}
              <p className="truncate text-sm font-medium text-primary">
                {item.title}
              </p>
            </div>
            {item.description && (
              <p className="mt-1 line-clamp-2 text-xs text-tertiary">
                {item.description}
              </p>
            )}
            <p className="mt-1.5 text-xs text-quaternary">
              {formatDistanceToNow(item.createdAt, { addSuffix: true })}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isUnread && (
              <span
                aria-label="Unread"
                className="mt-1 inline-block h-2 w-2 rounded-full bg-brand-solid"
              />
            )}
            {item.status !== "ARCHIVED" && (
              <button
                type="button"
                onClick={handleArchive}
                className="rounded p-1.5 text-tertiary opacity-0 transition-opacity hover:bg-primary_hover hover:text-secondary group-hover:opacity-100 focus:opacity-100"
                aria-label="Archive notification"
                title="Archive"
              >
                <Archive className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (item.actionUrl) {
    return (
      <Link href={item.actionUrl as Route} onClick={handleClick} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} className="block w-full text-left">
      {content}
    </button>
  );
}