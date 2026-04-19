import { prisma } from "@/lib/prismaDb";
import { makeWorker, QUEUE_NAMES } from "@/lib/queue";
import { fleschDe } from "@/lib/text/flesch-de";
import type { AssetProxies } from "@/types/marketing-asset";

export type ComputeProxiesJob = { contentHash: string };

const WINDOW_MS = 28 * 86400_000;

type RecentRow = {
	assetType: string;
	contentHash: string;
	payload: unknown;
	region: string | null;
};

export async function computeProxies(data: ComputeProxiesJob): Promise<AssetProxies> {
	const asset = await prisma.marketingAsset.findUnique({
		where: { contentHash: data.contentHash },
	});
	if (!asset) return {};

	const since = new Date(Date.now() - WINDOW_MS);
	const payload = (asset.payload as Record<string, unknown>) ?? {};

	const longevityDays = (() => {
		const start = payload.startDate ?? payload.ad_delivery_start_time;
		if (!start) return undefined;
		const d = new Date(String(start));
		if (Number.isNaN(d.getTime())) return undefined;
		return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400_000));
	})();

	const recent = (await prisma.marketingAsset.findMany({
		where: { brandId: asset.brandId, capturedAt: { gte: since } },
		select: { assetType: true, contentHash: true, payload: true, region: true },
	})) as RecentRow[];

	const iterationRate28d = new Set(recent.map((r: RecentRow) => r.contentHash)).size;

	const formatMixCounts = new Map<string, number>();
	for (const r of recent) {
		const mt = ((r.payload as Record<string, unknown> | null)?.mediaType as string) ?? "unknown";
		formatMixCounts.set(mt, (formatMixCounts.get(mt) ?? 0) + 1);
	}
	const total = Array.from(formatMixCounts.values()).reduce((a, b) => a + b, 0) || 1;
	const formatMix: Record<string, number> = {};
	for (const [k, v] of formatMixCounts) formatMix[k] = Math.round((v / total) * 100) / 100;

	const platforms = new Set(
		recent.flatMap((r: RecentRow) => {
			const p = (r.payload as Record<string, unknown> | null)?.platforms;
			if (Array.isArray(p)) return p as string[];
			if (typeof p === "string") return p.split(",").map((s) => s.trim());
			return [];
		}),
	);

	const regions = new Set(recent.map((r: RecentRow) => r.region).filter(Boolean) as string[]);

	const bodyText = asset.bodyText ?? "";
	const copyReadability = bodyText ? fleschDe(bodyText).score : undefined;

	const peRaw = payload.publicEngagement as { likes?: number; comments?: number } | undefined;
	const publicEngagement =
		peRaw && typeof peRaw.likes === "number" && typeof peRaw.comments === "number"
			? { likes: peRaw.likes, comments: peRaw.comments }
			: undefined;

	const proxies: AssetProxies = {
		...((asset.proxies as AssetProxies | null) ?? {}),
		longevityDays,
		iterationRate28d,
		platformBreadth: platforms.size,
		geographicBreadth: regions.size,
		formatMix,
		copyReadability,
		publicEngagement,
	};

	await prisma.marketingAsset.update({
		where: { contentHash: data.contentHash },
		data: { proxies },
	});

	return proxies;
}

export function startComputeProxiesWorker() {
	return makeWorker<ComputeProxiesJob>(QUEUE_NAMES.computeProxies, async (job) =>
		computeProxies(job.data),
	);
}
