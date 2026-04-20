/**
 * Seed 15 demo notifications across every NotificationType for the
 * /en/notifications inbox. Idempotent: deletes the recipient's existing
 * notifications before inserting fresh ones.
 *
 * Usage:
 *   npx tsx prisma/seed-notifications.ts [recipientEmail]
 *
 * If no email is passed, uses the first user in the DB.
 */
import { PrismaClient, type NotificationType } from "@prisma/client";

const prisma = new PrismaClient();

type Seed = {
	type: NotificationType;
	title: string;
	description?: string;
	actionUrl?: string;
	minutesAgo: number;
	status?: "UNREAD" | "READ";
};

const SEEDS: Seed[] = [
	{
		type: "MENTION",
		title: 'Alex mentioned you in "Q2 pricing strategy"',
		description:
			'"@you can we tighten the guardrails on the Foto Erhardt match rule before Friday?"',
		actionUrl: "/en/repricing/auto-rules",
		minutesAgo: 5,
	},
	{
		type: "MENTION",
		title: "Mira mentioned you on proposal RPJ-2041",
		description:
			'"Looks good — @you the Pilgrim SKUs look like a win."',
		actionUrl: "/en/repricing/auto-history",
		minutesAgo: 42,
	},
	{
		type: "BILLING_PAYMENT_FAILED",
		title: "Payment failed for invoice INV-3319",
		description:
			"Your Visa ending in 4242 was declined. Update your billing method to avoid service interruption.",
		actionUrl: "/en/settings/billing",
		minutesAgo: 90,
	},
	{
		type: "BILLING_INVOICE_READY",
		title: "April invoice is ready",
		description: "€1,240.00 due May 1. Paid automatically by card on file.",
		actionUrl: "/en/settings/billing",
		minutesAgo: 60 * 3,
	},
	{
		type: "BILLING_CARD_EXPIRING",
		title: "Card ending 4242 expires next month",
		description: "Replace it before April 30 to keep auto-pay active.",
		actionUrl: "/en/settings/billing",
		minutesAgo: 60 * 6,
		status: "READ",
	},
	{
		type: "INVITE_ACCEPTED",
		title: "Sam Patel joined your workspace",
		description: "They now have Editor access to all dashboards.",
		actionUrl: "/en/settings/members",
		minutesAgo: 60 * 8,
	},
	{
		type: "INVITE_DECLINED",
		title: "Jamie Lee declined your invite",
		description: "Ping them if you still want to collaborate.",
		actionUrl: "/en/settings/members",
		minutesAgo: 60 * 12,
		status: "READ",
	},
	{
		type: "SHARE_INVITE",
		title: "Taylor shared \"Competitor pricing — Q2\" with you",
		description: "You can view and comment on this dashboard.",
		actionUrl: "/en/dashboard",
		minutesAgo: 60 * 14,
	},
	{
		type: "EXPORT_READY",
		title: "Your sales-history import is ready",
		description: "3,214 rows processed, 12 skipped. Review and finalize.",
		actionUrl: "/en/repricing/manage",
		minutesAgo: 60 * 20,
	},
	{
		type: "EXPORT_READY",
		title: "CSV export is ready to download",
		description: "Repricing job RPJ-2041 • 128 rows.",
		actionUrl: "/en/repricing/auto-history",
		minutesAgo: 60 * 26,
		status: "READ",
	},
	{
		type: "SYSTEM_ANNOUNCEMENT",
		title: "New: rule templates for seasonal pricing",
		description:
			"Pre-baked rules for EOSS, Black Friday, and Q4 now available from the rule builder.",
		actionUrl: "/en/repricing/auto-rules",
		minutesAgo: 60 * 30,
	},
	{
		type: "SYSTEM_ANNOUNCEMENT",
		title: "Scheduled maintenance Sunday 02:00–03:00 UTC",
		description: "Dashboards may be briefly unavailable.",
		minutesAgo: 60 * 40,
		status: "READ",
	},
	{
		type: "MENTION",
		title: "Yuki mentioned you on SKU PG-6712",
		description:
			'"@you this one still looks mispriced — can you double-check the MAP?"',
		actionUrl: "/en/product-explorer",
		minutesAgo: 60 * 48,
		status: "READ",
	},
	{
		type: "BILLING_INVOICE_READY",
		title: "March invoice paid",
		description: "€1,100.00 paid via Visa •••• 4242.",
		actionUrl: "/en/settings/billing",
		minutesAgo: 60 * 24 * 15,
		status: "READ",
	},
	{
		type: "SHARE_INVITE",
		title: 'Priya shared "Pilgrim competitor deep-dive" with you',
		description: "Includes access to the underlying data source.",
		actionUrl: "/en/companies",
		minutesAgo: 60 * 24 * 21,
		status: "READ",
	},
];

async function main() {
	const emailArg = process.argv[2];

	const recipient = emailArg
		? await prisma.user.findUnique({ where: { email: emailArg } })
		: await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });

	if (!recipient) {
		throw new Error(
			emailArg
				? `No user found with email ${emailArg}`
				: "No users in DB. Seed users first.",
		);
	}

	// Pick up to 3 actors from other users for MENTION/INVITE-style rows.
	const actors = await prisma.user.findMany({
		where: { id: { not: recipient.id } },
		take: 3,
		orderBy: { createdAt: "asc" },
	});
	const pickActor = (idx: number) =>
		actors.length > 0 ? actors[idx % actors.length].id : null;

	console.log(
		`Seeding ${SEEDS.length} notifications for ${recipient.email} (${recipient.id})`,
	);

	const deleted = await prisma.notification.deleteMany({
		where: { recipientId: recipient.id },
	});
	console.log(`  → cleared ${deleted.count} existing notifications`);

	const now = Date.now();
	let created = 0;
	for (let i = 0; i < SEEDS.length; i++) {
		const s = SEEDS[i];
		const createdAt = new Date(now - s.minutesAgo * 60 * 1000);
		const status = s.status ?? "UNREAD";
		const useActor =
			s.type === "MENTION" ||
			s.type === "INVITE_ACCEPTED" ||
			s.type === "INVITE_DECLINED" ||
			s.type === "SHARE_INVITE";

		await prisma.notification.create({
			data: {
				recipientId: recipient.id,
				type: s.type,
				status,
				title: s.title,
				description: s.description ?? null,
				actionUrl: s.actionUrl ?? null,
				actorId: useActor ? pickActor(i) : null,
				createdAt,
				readAt: status === "READ" ? createdAt : null,
				metadata: { seed: true, idx: i },
			},
		});
		created++;
	}

	console.log(`  → created ${created} notifications`);
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
