/* eslint-disable no-console */
import type { MetaAdJobMeta } from "./writeToDb";

export type MetaAdsFallbackInput = MetaAdJobMeta & {
	searchQuery: string;
	country: string;
	maxAds?: number;
};

export async function triggerApifyFallback(input: MetaAdsFallbackInput): Promise<{ runId: string } | null> {
	const token = process.env.APIFY_TOKEN;
	const taskId = process.env.APIFY_META_ADS_TASK_ID;
	const publicUrl = process.env.PUBLIC_URL;
	if (!token || !taskId) {
		console.warn("[meta-ads] APIFY_TOKEN / APIFY_META_ADS_TASK_ID not configured; fallback skipped");
		return null;
	}

	const body = {
		searchQuery: input.searchQuery,
		country: input.country,
		maxAds: input.maxAds ?? 100,
		...(input.pageId ? { pageId: input.pageId } : {}),
		...(publicUrl
			? {
					webhookUrl: `${publicUrl}/api/ingest/apify`,
					webhookPayload: {
						tenantId: input.tenantId,
						brandId: input.brandId,
					},
			  }
			: {}),
	};

	const endpoint = `https://api.apify.com/v2/actor-tasks/${taskId}/runs?token=${token}`;
	const res = await fetch(endpoint, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Apify fallback failed: ${res.status} ${text}`);
	}
	const json = (await res.json()) as { data?: { id?: string } };
	const runId = json.data?.id ?? "";
	console.log(`[meta-ads] triggered Apify fallback run=${runId}`);
	return { runId };
}
