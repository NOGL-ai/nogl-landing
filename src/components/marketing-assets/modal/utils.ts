"use client";

import type { MarketingAssetDetail } from "@/types/marketing-asset";

export type MetaAdModalData = {
	adLibraryUrl: string | null;
	linkedUrl: string | null;
	runningFrom: string | null;
	runningTo: string | null;
	platformCount: number;
	adsLaunched: number | null;
	metaBody: string | null;
};

export function resolveMedia(key: string | undefined): string | null {
	if (!key) return null;
	if (key.startsWith("http")) return key;
	return `/api/marketing-assets/media/${encodeURIComponent(key)}`;
}

function toObject(value: unknown): Record<string, unknown> {
	if (value && typeof value === "object") return value as Record<string, unknown>;
	return {};
}

function toStringOrNull(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const clean = value.trim();
	return clean ? clean : null;
}

function toStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function firstLink(value: unknown): string | null {
	if (!Array.isArray(value)) return null;
	for (const item of value) {
		if (typeof item === "string" && item.trim()) return item.trim();
		if (item && typeof item === "object") {
			const obj = item as Record<string, unknown>;
			const candidate =
				toStringOrNull(obj.url) ??
				toStringOrNull(obj.href) ??
				toStringOrNull(obj.link_url);
			if (candidate) return candidate;
		}
	}
	return null;
}

export function getMetaAdModalData(detail: MarketingAssetDetail | null): MetaAdModalData {
	if (!detail) {
		return {
			adLibraryUrl: null,
			linkedUrl: null,
			runningFrom: null,
			runningTo: null,
			platformCount: 0,
			adsLaunched: null,
			metaBody: null,
		};
	}

	const payload = toObject(detail.payload);
	const creative = toObject(payload.adCreative);
	const pageId = toStringOrNull(payload.pageId);
	const adLibraryUrl = pageId
		? `https://www.facebook.com/ads/library/?view_all_page_id=${pageId}&ad_type=all`
		: null;

	return {
		adLibraryUrl,
		linkedUrl: toStringOrNull(creative.link_url) ?? firstLink(creative.extra_links) ?? null,
		runningFrom: toStringOrNull(payload.startDate),
		runningTo: toStringOrNull(payload.endDate),
		platformCount: toStringArray(payload.platforms).length,
		adsLaunched: typeof payload.collationCount === "number" ? payload.collationCount : null,
		metaBody: detail.bodyText ?? toStringOrNull(payload.adContent),
	};
}
