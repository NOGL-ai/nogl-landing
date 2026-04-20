import { prisma } from "@/lib/prismaDb";
import { makeWorker, QUEUE_NAMES } from "@/lib/queue";
import { scoreAesthetic } from "@/lib/vlm/openai-vision";
import { signedGetUrl, publicUrl } from "@/lib/storage/r2";
import type { AssetProxies } from "@/types/marketing-asset";

export type ScoreAestheticJob = { contentHash: string; mediaUrl: string };

function isHttpUrl(u: string): boolean {
	return /^https?:\/\//i.test(u);
}

export async function runScoreAesthetic(data: ScoreAestheticJob): Promise<void> {
	if (!process.env.OPENAI_API_KEY) return; // silent no-op when disabled

	const asset = await prisma.marketingAsset.findUnique({
		where: { contentHash: data.contentHash },
	});
	if (!asset) return;

	const sourceUrl = isHttpUrl(data.mediaUrl)
		? data.mediaUrl
		: (await resolveMediaUrl(data.mediaUrl));
	if (!sourceUrl) return;

	const { score, reason } = await scoreAesthetic(sourceUrl);

	const existing = (asset.proxies as AssetProxies | null) ?? {};
	const payload = (asset.payload as Record<string, unknown>) ?? {};

	await prisma.marketingAsset.update({
		where: { contentHash: data.contentHash },
		data: {
			proxies: { ...existing, aestheticScore: score },
			payload: { ...payload, aestheticReason: reason },
		},
	});
}

async function resolveMediaUrl(key: string): Promise<string | null> {
	if (process.env.R2_PUBLIC_URL) return publicUrl(key);
	try {
		return await signedGetUrl(key, 3600);
	} catch {
		return null;
	}
}

export function startScoreAestheticWorker() {
	return makeWorker<ScoreAestheticJob>(QUEUE_NAMES.scoreAesthetic, async (job) =>
		runScoreAesthetic(job.data),
	);
}
