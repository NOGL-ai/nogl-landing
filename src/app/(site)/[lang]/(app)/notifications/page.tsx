import type { Metadata } from "next";
import { listNotifications } from "@/actions/notifications";
import { InboxTabs } from "@/components/notifications/InboxTabs";
import type { NotificationTab } from "@/lib/notifications/types";

export const metadata: Metadata = {
	title: "Notifications | Nogl",
	description:
		"Cross-cutting inbox for mentions, invites, billing events, and system messages.",
};

export const dynamic = "force-dynamic";

const VALID_TABS: NotificationTab[] = ["all", "mentions", "system", "archive"];

function resolveTab(raw: string | string[] | undefined): NotificationTab {
	const value = Array.isArray(raw) ? raw[0] : raw;
	return (VALID_TABS as string[]).includes(value ?? "")
		? (value as NotificationTab)
		: "all";
}

export default async function NotificationsPage({
	searchParams,
}: {
	searchParams: Promise<{ tab?: string }>;
}) {
	const params = await searchParams;
	const tab = resolveTab(params.tab);

	const result = await listNotifications({ tab, pageSize: 50 });

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
			<InboxTabs tab={tab} result={result} unreadCount={result.unreadCount} />
		</div>
	);
}
