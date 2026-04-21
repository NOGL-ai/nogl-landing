export type AssetTypeName =
	| "EMAIL"
	| "HOMEPAGE"
	| "HOMEPAGE_MOBILE"
	| "INSTAGRAM"
	| "META_AD"
	| "YOUTUBE_AD"
	| "TIKTOK_AD";

export type AssetSourceName =
	| "APIFY_META"
	| "APIFY_YOUTUBE"
	| "APIFY_TIKTOK"
	| "APIFY_INSTAGRAM"
	| "IMAP_SELF_HOSTED"
	| "PLAYWRIGHT_SELF_HOSTED"
	| "SEED";

export type AssetProxies = {
	longevityDays?: number;
	iterationRate28d?: number;
	platformBreadth?: number;
	geographicBreadth?: number;
	repeatCampaignScore?: number;
	formatMix?: Record<string, number>;
	publicEngagement?: { likes: number; comments: number };
	aestheticScore?: number;
	copyReadability?: number;
};

export type MarketingAssetListItem = {
	id: string;
	tenantId: string;
	brandId: string;
	brandName: string;
	brandSlug: string;
	assetType: AssetTypeName;
	source: AssetSourceName;
	capturedAt: string;
	sourceUrl: string | null;
	title: string | null;
	bodyText: string | null;
	language: string | null;
	region: string | null;
	mediaUrls: string[];
	contentHash: string;
	proxies: AssetProxies | null;
	createdAt: string;
};

export type MarketingAssetDetail = MarketingAssetListItem & {
	payload: Record<string, unknown>;
};

export type MarketingAssetListParams = {
	assetType?: AssetTypeName | "ALL";
	brandSlug?: string;
	search?: string;
	hasDiscount?: boolean;
	from?: string;
	to?: string;
	page?: number;
	pageSize?: number;
	sort?: "newest" | "oldest" | "longevity";
	preset?:
		| "discounts"
		| "warehouse-sales"
		| "restock-alerts"
		| "luggage"
		| "exclude-cart-emails"
		| "canon"
		| "video-ads";
};

export type MarketingAssetListResponse = {
	items: MarketingAssetListItem[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export type AssetStatsByType = {
	total: number;
	byType: Record<AssetTypeName, number>;
	brands: { slug: string; name: string; count: number }[];
	last28d: number;
};

export type AssetCaptureRunDTO = {
	id: string;
	tenantId: string;
	brandId: string;
	assetType: AssetTypeName;
	source: AssetSourceName;
	status: string;
	startedAt: string;
	completedAt: string | null;
	itemCount: number;
	error: string | null;
};
