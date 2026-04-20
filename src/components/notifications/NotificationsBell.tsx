"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell01 } from "@untitledui/icons";
import { usePathname } from "next/navigation";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { TypeIcon } from "./typeIcon";
import {
	getAggregateUnread,
	listNotifications,
	markRead,
} from "@/actions/notifications";
import { useNotificationsStream } from "@/hooks/useNotificationsStream";
import type {
	AggregateUnread,
	NotificationWithActor,
} from "@/lib/notifications/types";

const POLL_INTERVAL_MS = 60_000;
const PREVIEW_LIMIT = 10;

function localePrefix(pathname: string | null) {
	const segments = (pathname ?? "").split("/").filter(Boolean);
	return segments[0] ? `/${segments[0]}` : "/en";
}

export function NotificationsBell({
	className = "",
}: {
	className?: string;
}) {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [aggregate, setAggregate] = useState<AggregateUnread>({
		notifications: 0,
		alerts: 0,
		total: 0,
	});
	const [items, setItems] = useState<NotificationWithActor[]>([]);
	const [loading, setLoading] = useState(false);

	const refreshCount = useCallback(async () => {
		try {
			const next = await getAggregateUnread();
			setAggregate(next);
		} catch {
			/* user may be unauthenticated; silently ignore */
		}
	}, []);

	const loadPreview = useCallback(async () => {
		setLoading(true);
		try {
			const res = await listNotifications({
				tab: "all",
				page: 1,
				pageSize: PREVIEW_LIMIT,
			});
			setItems(res.items);
			setAggregate((prev) => ({ ...prev, notifications: res.unreadCount }));
		} catch {
			/* ignore */
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		refreshCount();
		const id = setInterval(refreshCount, POLL_INTERVAL_MS);
		return () => clearInterval(id);
	}, [refreshCount]);

	useNotificationsStream(() => {
		refreshCount();
		if (open) loadPreview();
	});

	useEffect(() => {
		if (open) loadPreview();
	}, [open, loadPreview]);

	const handleRowClick = async (item: NotificationWithActor) => {
		if (item.status === "UNREAD") {
			await markRead(item.id);
			refreshCount();
		}
		setOpen(false);
	};

	const badgeLabel = aggregate.total > 99 ? "99+" : String(aggregate.total);
	const locale = localePrefix(pathname);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label={
						aggregate.total
							? `Notifications, ${aggregate.total} unread`
							: "Notifications"
					}
					className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-secondary ring-1 ring-border transition-colors hover:bg-primary_hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${className}`}
				>
					<Bell01 className="h-5 w-5" />
					{aggregate.total > 0 && (
						<span
							aria-hidden="true"
							className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-background"
						>
							{badgeLabel}
						</span>
					)}
				</button>
			</PopoverTrigger>

			<PopoverContent align="end" className="w-[360px] max-w-[92vw] p-0">
				<div className="flex items-center justify-between border-b border-border px-4 py-3">
					<p className="text-sm font-semibold text-primary">Notifications</p>
					{aggregate.total > 0 && (
						<span className="text-xs text-tertiary">
							{aggregate.notifications} inbox
							{aggregate.alerts > 0 ? ` · ${aggregate.alerts} alerts` : ""}
						</span>
					)}
				</div>

				<div className="max-h-[420px] overflow-y-auto">
					{loading && items.length === 0 ? (
						<div className="px-4 py-6 text-center text-xs text-tertiary">
							Loading…
						</div>
					) : items.length === 0 ? (
						<div className="px-4 py-8 text-center">
							<p className="text-sm font-medium text-primary">
								You&rsquo;re all caught up.
							</p>
							<p className="mt-1 text-xs text-tertiary">
								No new notifications.
							</p>
						</div>
					) : (
						<ul className="divide-y divide-border/60">
							{items.map((item) => (
								<li key={item.id}>
									{item.actionUrl ? (
										<Link
											href={item.actionUrl}
											onClick={() => handleRowClick(item)}
											className={`flex gap-3 px-4 py-3 transition-colors hover:bg-primary_hover ${
												item.status === "UNREAD" ? "bg-secondary_bg/30" : ""
											}`}
										>
											<RowBody item={item} />
										</Link>
									) : (
										<button
											type="button"
											onClick={() => handleRowClick(item)}
											className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-primary_hover ${
												item.status === "UNREAD" ? "bg-secondary_bg/30" : ""
											}`}
										>
											<RowBody item={item} />
										</button>
									)}
								</li>
							))}
						</ul>
					)}
				</div>

				<div className="border-t border-border px-4 py-2.5">
					<Link
						href={`${locale}/notifications`}
						onClick={() => setOpen(false)}
						className="block text-center text-xs font-medium text-brand-secondary hover:text-brand-secondary_hover"
					>
						See all notifications
					</Link>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function RowBody({ item }: { item: NotificationWithActor }) {
	return (
		<>
			<TypeIcon type={item.type} className="h-8 w-8" />
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-primary">
					{item.title}
				</p>
				{item.description && (
					<p className="line-clamp-1 text-xs text-tertiary">
						{item.description}
					</p>
				)}
				<p className="mt-0.5 text-[11px] text-quaternary">
					{formatDistanceToNow(item.createdAt, { addSuffix: true })}
				</p>
			</div>
			{item.status === "UNREAD" && (
				<span
					aria-hidden="true"
					className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-brand-solid"
				/>
			)}
		</>
	);
}
