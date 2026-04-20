import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { getQueue, QUEUE_NAMES } from "@/lib/queue";

/**
 * Apify webhook receiver.
 *
 * Apify's built-in signing uses `APIFY-WEBHOOK-REQUEST-SIGNATURE` (lowercase `apify-webhook-request-signature`).
 * We accept the canonical header but fall back to `x-apify-signature` which some actor tasks send.
 */
function verifySignature(raw: string, header: string | null): boolean {
	const secret = process.env.APIFY_WEBHOOK_SECRET;
	if (!secret) return false;
	if (!header) return false;
	const hmac = crypto.createHmac("sha256", secret).update(raw).digest("hex");
	const a = Buffer.from(hmac, "utf8");
	const b = Buffer.from(header.replace(/^sha256=/, ""), "utf8");
	if (a.length !== b.length) return false;
	return crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
	const raw = await req.text();
	const signature =
		req.headers.get("apify-webhook-request-signature") ??
		req.headers.get("x-apify-signature");

	if (!verifySignature(raw, signature)) {
		return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
	}

	let body: Record<string, unknown>;
	try {
		body = JSON.parse(raw) as Record<string, unknown>;
	} catch {
		return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
	}

	const eventData = (body.eventData ?? {}) as Record<string, unknown>;
	const resource = (body.resource ?? {}) as Record<string, unknown>;
	const userData = (body.userData ?? eventData.userData ?? {}) as Record<string, unknown>;

	const queue = getQueue(QUEUE_NAMES.apifyIngest);
	const job = await queue.add(
		`apify-${(resource.id as string) ?? Date.now()}`,
		{
			eventType: body.eventType,
			actorId: (resource.actorId ?? eventData.actorId) as string | undefined,
			actorTaskId: (resource.actorTaskId ?? eventData.actorTaskId) as string | undefined,
			actorRunId: (resource.id ?? eventData.actorRunId) as string | undefined,
			defaultDatasetId: (resource.defaultDatasetId ?? eventData.defaultDatasetId) as string | undefined,
			userData,
			body,
		},
		{ removeOnComplete: true },
	);

	return NextResponse.json({ accepted: true, jobId: String(job.id) }, { status: 202 });
}
