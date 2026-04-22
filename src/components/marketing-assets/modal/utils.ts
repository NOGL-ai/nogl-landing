"use client";

import type { MarketingAssetDetail } from "@/types/marketing-asset";
import { buildProductExplorerResearchHref } from "@/lib/product-explorer-search";

export type MetaAdModalData = {
	adLibraryUrl: string | null;
	linkedUrl: string | null;
	runningFrom: string | null;
	runningTo: string | null;
	platformCount: number;
	adsLaunched: number | null;
	metaBody: string | null;
};

function asCleanString(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const clean = value.trim();
	return clean.length > 0 ? clean : null;
}

function getProductSearchTerms(detail: MarketingAssetDetail): string[] {
	const payload = detail.payload as Record<string, unknown>;
	// TODO: Replace this fallback heuristic with real product-identification mapping from CV/search indexing.
	const candidates: Array<unknown> = [
		payload.searchQuery,
		detail.title,
		detail.brandName,
		detail.bodyText,
	];
	const terms = candidates
		.map(asCleanString)
		.filter((value): value is string => Boolean(value))
		.map((value) => value.slice(0, 120));
	return terms.length > 0 ? terms.slice(0, 1) : [];
}

export function getProductExplorerHref(detail: MarketingAssetDetail | null, lang: string): string {
	if (!detail) return `/${lang}/product-explorer`;
	const terms = getProductSearchTerms(detail);
	if (terms.length === 0) return `/${lang}/product-explorer`;
	return buildProductExplorerResearchHref(lang, terms);
}

export function resolveMedia(key: string | undefined): string | null {
	if (!key) return null;
	if (key.startsWith("http")) return key;
	return `/api/marketing-assets/media/${encodeURIComponent(key)}`;
}

export function isVideoMediaUrl(url: string | null | undefined): boolean {
	if (!url) return false;
	return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
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
