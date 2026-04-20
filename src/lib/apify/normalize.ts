import crypto from "node:crypto";
import type { AssetSource, AssetType } from "@prisma/client";

export type NormalizedAsset = {
	assetType: AssetType;
	source: AssetSource;
	capturedAt: Date;
	sourceUrl?: string;
	title?: string;
	bodyText?: string;
	language?: string;
	region?: string;
	mediaUrls: string[];
	contentHash: string;
	payload: Record<string, unknown>;
	stableIdentifier: string;
};

export type ApifyActorKind = "meta" | "google_youtube" | "tiktok" | "instagram";

export function detectActorKind(actorId: string): ApifyActorKind | null {
	const id = actorId.toLowerCase();
	if (id.includes("meta") || id.includes("facebook")) return "meta";
	if (id.includes("google") || id.includes("youtube")) return "google_youtube";
	if (id.includes("tiktok")) return "tiktok";
	if (id.includes("instagram")) return "instagram";
	return null;
}

function contentHash(parts: string[]): string {
	return crypto.createHash("sha256").update(parts.join(":")).digest("hex");
}

function toDate(v: unknown): Date {
	if (v instanceof Date) return v;
	if (typeof v === "string" || typeof v === "number") {
		const d = new Date(v);
		if (!Number.isNaN(d.getTime())) return d;
	}
	return new Date();
}

function str(v: unknown): string | undefined {
	return typeof v === "string" && v.length > 0 ? v : undefined;
}

function arr(v: unknown): string[] {
	if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
	return [];
}

export function normalizeMetaAd(item: Record<string, unknown>, brandId: string): NormalizedAsset {
	const adId = str(item.adId) ?? str(item.ad_archive_id) ?? str(item.id) ?? crypto.randomUUID();
	const creative = (item.adCreative ?? {}) as Record<string, unknown>;
	const mediaUrls = [
		...arr(creative.images),
		...arr(creative.videos),
		...arr(item.mediaUrls),
	].filter(Boolean);

	return {
		assetType: "META_AD",
		source: "APIFY_META",
		capturedAt: toDate(item.scrapedAt ?? item.capturedAt),
		sourceUrl: str(item.url) ?? str(creative.link_url),
		title: str(item.pageName) ?? str(item.adTitle),
		bodyText: str(item.adContent) ?? str(item.creative_body),
		language: str(item.language),
		region: str(item.country) ?? "DE",
		mediaUrls,
		stableIdentifier: adId,
		contentHash: contentHash(["META_AD", "APIFY_META", brandId, adId]),
		payload: {
			...item,
			mediaType: mediaUrls.some((u) => /\.(mp4|webm|mov)(\?|$)/i.test(u)) ? "video" : "image",
		},
	};
}

export function normalizeGoogleAd(
	item: Record<string, unknown>,
	brandId: string,
): NormalizedAsset {
	const adId = str(item.adId) ?? str(item.creativeId) ?? str(item.id) ?? crypto.randomUUID();
	const mediaUrls = [
		...arr(item.imageUrls),
		...arr(item.videoUrls),
		...(str(item.thumbnailUrl) ? [str(item.thumbnailUrl)!] : []),
	];

	return {
		assetType: "YOUTUBE_AD",
		source: "APIFY_YOUTUBE",
		capturedAt: toDate(item.scrapedAt),
		sourceUrl: str(item.url) ?? str(item.landingPageUrl),
		title: str(item.advertiser) ?? str(item.title),
		bodyText: str(item.description) ?? str(item.creativeBody),
		region: str(item.region) ?? "DE",
		mediaUrls,
		stableIdentifier: adId,
		contentHash: contentHash(["YOUTUBE_AD", "APIFY_YOUTUBE", brandId, adId]),
		payload: { ...item, mediaType: mediaUrls.some((u) => /\.(mp4|webm)/i.test(u)) ? "video" : "image" },
	};
}

export function normalizeTikTokAd(
	item: Record<string, unknown>,
	brandId: string,
): NormalizedAsset {
	const adId = str(item.adId) ?? str(item.id) ?? crypto.randomUUID();
	const mediaUrls = [...arr(item.videos), ...arr(item.images)];

	return {
		assetType: "TIKTOK_AD",
		source: "APIFY_TIKTOK",
		capturedAt: toDate(item.scrapedAt),
		sourceUrl: str(item.url),
		title: str(item.advertiserName),
		bodyText: str(item.adText) ?? str(item.description),
		region: str(item.region) ?? "DE",
		mediaUrls,
		stableIdentifier: adId,
		contentHash: contentHash(["TIKTOK_AD", "APIFY_TIKTOK", brandId, adId]),
		payload: { ...item, mediaType: "video" },
	};
}

export function normalizeInstagramPost(
	item: Record<string, unknown>,
	brandId: string,
): NormalizedAsset {
	const postId = str(item.shortCode) ?? str(item.id) ?? crypto.randomUUID();
	const mediaUrls = [
		...(str(item.displayUrl) ? [str(item.displayUrl)!] : []),
		...arr(item.images),
		...arr(item.videoUrl ? [item.videoUrl] : []),
	];

	return {
		assetType: "INSTAGRAM",
		source: "APIFY_INSTAGRAM",
		capturedAt: toDate(item.timestamp ?? item.takenAtTimestamp),
		sourceUrl: str(item.url) ?? (postId ? `https://www.instagram.com/p/${postId}/` : undefined),
		title: str(item.ownerUsername),
		bodyText: str(item.caption),
		region: str(item.locationCountry),
		mediaUrls,
		stableIdentifier: postId,
		contentHash: contentHash(["INSTAGRAM", "APIFY_INSTAGRAM", brandId, postId]),
		payload: {
			...item,
			publicEngagement: {
				likes: typeof item.likesCount === "number" ? item.likesCount : 0,
				comments: typeof item.commentsCount === "number" ? item.commentsCount : 0,
			},
			mediaType: typeof item.videoUrl === "string" ? "video" : "image",
		},
	};
}

export function normalizeItem(
	kind: ApifyActorKind,
	item: Record<string, unknown>,
	brandId: string,
): NormalizedAsset {
	switch (kind) {
		case "meta":
			return normalizeMetaAd(item, brandId);
		case "google_youtube":
			return normalizeGoogleAd(item, brandId);
		case "tiktok":
			return normalizeTikTokAd(item, brandId);
		case "instagram":
			return normalizeInstagramPost(item, brandId);
	}
}
