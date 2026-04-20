import crypto from "node:crypto";
import { prisma } from "@/lib/prismaDb";
import type { MetaAd } from "./scraper";
import { getQueue, QUEUE_NAMES } from "@/lib/queue";

export type MetaAdJobMeta = {
	tenantId: string;
	brandId: string;
	searchQuery: string;
	country: string;
	pageId?: string;
	locale?: string;
};

export async function upsertMetaAdToDb(ad: MetaAd, meta: MetaAdJobMeta): Promise<string> {
	const stableId = ad.adId ?? `${ad.pageName ?? ""}:${(ad.adContent ?? "").substring(0, 80)}`;
	const contentHash = crypto
		.createHash("sha256")
		.update(`META_AD:PLAYWRIGHT_SELF_HOSTED:${meta.brandId}:${stableId}`)
		.digest("hex");

	const capturedAt = ad.scrapedAt ? new Date(ad.scrapedAt) : new Date();
	const mediaUrls: string[] = [];
	if (typeof ad.adCreative === "object" && ad.adCreative !== null) {
		const creative = ad.adCreative as {
			images?: string[];
			cards?: Array<{
				resized_image_url?: string;
				original_image_url?: string;
				video_sd_url?: string | null;
				video_hd_url?: string | null;
				video_preview_image_url?: string | null;
			}>;
			image_url?: string;
			video_sd_url?: string | null;
			video_hd_url?: string | null;
		};
		if (creative.images?.length) mediaUrls.push(...creative.images.filter(Boolean));
		if (creative.cards?.length) {
			for (const card of creative.cards) {
				const url =
					card.resized_image_url ||
					card.original_image_url ||
					card.video_preview_image_url ||
					card.video_sd_url ||
					card.video_hd_url;
				if (url) mediaUrls.push(url);
			}
		}
		if (creative.image_url) mediaUrls.push(creative.image_url);
		if (!mediaUrls.length) {
			if (creative.video_sd_url) mediaUrls.push(creative.video_sd_url);
			else if (creative.video_hd_url) mediaUrls.push(creative.video_hd_url);
		}
	}

	await prisma.marketingAsset.upsert({
		where: { contentHash },
		create: {
			tenantId: meta.tenantId,
			brandId: meta.brandId,
			assetType: "META_AD",
			source: "PLAYWRIGHT_SELF_HOSTED",
			capturedAt,
			sourceUrl: `https://www.facebook.com/ads/library/?id=${ad.adId ?? ""}`,
			title: (ad.adContent ?? "").substring(0, 160) || `${ad.pageName ?? "Meta Ad"}`,
			bodyText: ad.adContent ?? null,
			language: null,
			region: meta.country,
			mediaUrls,
			contentHash,
			payload: {
				...(ad as unknown as Record<string, unknown>),
				searchQuery: meta.searchQuery,
			},
		},
		update: {
			capturedAt,
			title: (ad.adContent ?? "").substring(0, 160) || `${ad.pageName ?? "Meta Ad"}`,
			bodyText: ad.adContent ?? null,
			mediaUrls,
			payload: {
				...(ad as unknown as Record<string, unknown>),
				searchQuery: meta.searchQuery,
			},
		},
	});

	const proxyQ = getQueue(QUEUE_NAMES.computeProxies);
	await proxyQ.add("compute", { contentHash });
	if (mediaUrls[0]) {
		const aestheticQ = getQueue(QUEUE_NAMES.scoreAesthetic);
		await aestheticQ.add("score", { contentHash, mediaUrl: mediaUrls[0] });
	}

	return contentHash;
}
