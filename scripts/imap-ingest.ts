/* eslint-disable no-console */
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImapFlow } from "imapflow";
import { simpleParser, type ParsedMail } from "mailparser";

import { prisma } from "@/lib/prismaDb";
import { getCalumetTenantId } from "@/lib/tenant";
import { putObject } from "@/lib/storage/r2";
import { stripTracking } from "@/lib/email/strip-tracking";
import { parseDiscount } from "@/lib/email/parse-discount";
import { getQueue, QUEUE_NAMES } from "@/lib/queue";

type AliasMap = Record<string, string>;

function loadAliases(): AliasMap {
	try {
		const raw = readFileSync(
			join(process.cwd(), "src", "data", "brand-email-aliases.json"),
			"utf8",
		);
		const json = JSON.parse(raw) as { aliases?: AliasMap };
		return json.aliases ?? {};
	} catch {
		return {};
	}
}

function domainFrom(address: string): string {
	return address.split("@")[1]?.toLowerCase() ?? "";
}

async function resolveBrandId(fromAddress: string, aliases: AliasMap): Promise<string | null> {
	const domain = domainFrom(fromAddress);
	const slug = aliases[domain];
	if (slug) {
		const row = await prisma.company.findUnique({ where: { slug }, select: { id: true } });
		if (row) return row.id;
	}
	// Fallback: exact domain match in Company.domain
	const byDomain = await prisma.company.findFirst({
		where: { domain: { contains: domain, mode: "insensitive" } },
		select: { id: true },
	});
	return byDomain?.id ?? null;
}

async function handleMessage(
	raw: Buffer,
	aliases: AliasMap,
	tenantId: string,
): Promise<void> {
	const parsed: ParsedMail = await simpleParser(raw);
	const from = parsed.from?.value?.[0]?.address ?? "";
	const brandId = await resolveBrandId(from, aliases);
	if (!brandId) {
		console.warn(`[imap] no brand match for ${from}`);
		return;
	}

	const subject = parsed.subject ?? "";
	const bodyHtml = parsed.html ? stripTracking(parsed.html) : "";
	const bodyText = parsed.text ?? "";
	const discount = parseDiscount(`${subject}\n${bodyText}`);

	const stableId =
		parsed.messageId ??
		crypto.createHash("sha256").update(`${from}:${subject}:${parsed.date?.toISOString() ?? ""}`).digest("hex");

	const contentHash = crypto
		.createHash("sha256")
		.update(`EMAIL:IMAP_SELF_HOSTED:${brandId}:${stableId}`)
		.digest("hex");

	const emlKey = `marketing-assets/emails/${brandId}/${contentHash}.eml`;
	await putObject({ key: emlKey, body: raw, contentType: "message/rfc822" });

	await prisma.marketingAsset.upsert({
		where: { contentHash },
		create: {
			tenantId,
			brandId,
			assetType: "EMAIL",
			source: "IMAP_SELF_HOSTED",
			capturedAt: parsed.date ?? new Date(),
			sourceUrl: null,
			title: subject,
			bodyText,
			language: null,
			region: null,
			mediaUrls: [emlKey],
			contentHash,
			payload: {
				from,
				to: parsed.to ? String(parsed.to) : undefined,
				subject,
				bodyHtml,
				messageId: parsed.messageId,
				discount,
				hasDiscount: !!discount,
			},
		},
		update: {
			title: subject,
			bodyText,
			payload: {
				from,
				subject,
				bodyHtml,
				discount,
				hasDiscount: !!discount,
			},
		},
	});

	const proxyQ = getQueue(QUEUE_NAMES.computeProxies);
	await proxyQ.add("compute", { contentHash });
}

async function main(): Promise<void> {
	const host = process.env.IMAP_HOST;
	const port = Number(process.env.IMAP_PORT ?? 993);
	const user = process.env.IMAP_USER;
	const pass = process.env.IMAP_PASSWORD;
	const mailbox = process.env.IMAP_INBOX ?? "INBOX";

	if (!host || !user || !pass) {
		console.error("[imap] IMAP_HOST / IMAP_USER / IMAP_PASSWORD required");
		process.exit(1);
	}

	const aliases = loadAliases();
	const tenantId = await getCalumetTenantId();
	const client = new ImapFlow({ host, port, secure: true, auth: { user, pass }, logger: false });

	await client.connect();
	const lock = await client.getMailboxLock(mailbox);
	console.log(`[imap] connected to ${host}, watching ${mailbox}`);

	client.on("exists", async () => {
		try {
			for await (const msg of client.fetch(
				{ seen: false },
				{ source: true, envelope: true },
			)) {
				if (!msg.source) continue;
				await handleMessage(msg.source, aliases, tenantId);
				if (typeof msg.seq === "number") {
					await client.messageFlagsAdd(String(msg.seq), ["\\Seen"]);
				}
			}
		} catch (err) {
			console.error("[imap] fetch error", err);
		}
	});

	process.on("SIGTERM", async () => {
		lock.release();
		await client.logout();
		process.exit(0);
	});

	// Keep the process alive; imapflow IDLEs automatically when idle
	await new Promise(() => undefined);
}

main().catch((err) => {
	console.error("[imap] fatal", err);
	process.exit(1);
});
