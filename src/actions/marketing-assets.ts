"use server";

import { z } from "zod";

import { AssetType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prismaDb";
import { getAuthSession } from "@/lib/auth";
import { getCalumetTenantId } from "@/lib/tenant";
import { getQueue, QUEUE_NAMES } from "@/lib/queue";
import type {
	AssetCaptureRunDTO,
	AssetStatsByType,
	AssetTypeName,
	MarketingAssetDetail,
	MarketingAssetListItem,
	MarketingAssetListParams,
	MarketingAssetListResponse,
} from "@/types/marketing-asset";

const ALL_ASSET_TYPES: AssetTypeName[] = [
	"EMAIL",
	"HOMEPAGE",
	"HOMEPAGE_MOBILE",
	"INSTAGRAM",
	"META_AD",
	"YOUTUBE_AD",
	"TIKTOK_AD",
];

const listParamsSchema = z.object({
	assetType: z.enum(["ALL", ...ALL_ASSET_TYPES] as [string, ...string[]]).optional(),
	brandSlug: z.string().optional(),
	search: z.string().optional(),
	hasDiscount: z.coerce.boolean().optional(),
	from: z.string().optional(),
	to: z.string().optional(),
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(200).default(48),
	sort: z.enum(["newest", "oldest", "longevity"]).default("newest"),
	preset: z
		.enum([
			"discounts",
			"warehouse-sales",
			"restock-alerts",
			"luggage",
			"exclude-cart-emails",
			"canon",
			"video-ads",
		])
		.optional(),
});

async function requireUser(): Promise<void> {
	const session = await getAuthSession();
	if (!session?.user?.id) throw new Error("Unauthorized");
}

type MarketingAssetRow = {
	id: string;
	tenantId: string;
	brandId: string;
	assetType: string;
	source: string;
	capturedAt: Date;
	sourceUrl: string | null;
	title: string | null;
	bodyText: string | null;
	language: string | null;
	region: string | null;
	mediaUrls: string[];
	contentHash: string;
	proxies: unknown;
	createdAt: Date;
	payload: unknown;
	brand: { name: string; slug: string };
};

function toListItem(row: MarketingAssetRow): MarketingAssetListItem {
	return {
		id: row.id,
		tenantId: row.tenantId,
		brandId: row.brandId,
		brandName: row.brand.name,
		brandSlug: row.brand.slug,
		assetType: row.assetType as AssetTypeName,
		source: row.source as MarketingAssetListItem["source"],
		capturedAt: row.capturedAt.toISOString(),
		sourceUrl: row.sourceUrl,
		title: row.title,
		bodyText: row.bodyText,
		language: row.language,
		region: row.region,
		mediaUrls: row.mediaUrls ?? [],
		contentHash: row.contentHash,
		proxies: (row.proxies as MarketingAssetListItem["proxies"]) ?? null,
		createdAt: row.createdAt.toISOString(),
	};
}

export async function listMarketingAssets(
	params: MarketingAssetListParams,
): Promise<MarketingAssetListResponse> {
	await requireUser();
	const parsed = listParamsSchema.parse(params);
	const tenantId = await getCalumetTenantId();

	const andParts: Prisma.MarketingAssetWhereInput[] = [{ tenantId }];

	const emailLockedPreset =
		parsed.preset === "discounts" ||
		parsed.preset === "warehouse-sales" ||
		parsed.preset === "restock-alerts" ||
		parsed.preset === "exclude-cart-emails";

	if (parsed.preset === "video-ads") {
		andParts.push({ assetType: { in: [AssetType.YOUTUBE_AD, AssetType.TIKTOK_AD] } });
	} else if (emailLockedPreset) {
		andParts.push({ assetType: AssetType.EMAIL });
	} else if (parsed.assetType && parsed.assetType !== "ALL") {
		andParts.push({ assetType: parsed.assetType as AssetType });
	}

	if (parsed.from || parsed.to) {
		andParts.push({
			capturedAt: {
				...(parsed.from ? { gte: new Date(parsed.from) } : {}),
				...(parsed.to ? { lte: new Date(parsed.to) } : {}),
			},
		});
	}

	if (parsed.brandSlug) {
		const brand = await prisma.company.findUnique({
			where: { slug: parsed.brandSlug },
			select: { id: true },
		});
		if (!brand) {
			return { items: [], total: 0, page: parsed.page, pageSize: parsed.pageSize, totalPages: 0 };
		}
		andParts.push({ brandId: brand.id });
	}

	if (parsed.search?.trim()) {
		const term = parsed.search.trim();
		andParts.push({
			OR: [
				{ title: { contains: term, mode: "insensitive" } },
				{ bodyText: { contains: term, mode: "insensitive" } },
			],
		});
	}

	if (parsed.preset === "discounts") {
		andParts.push({
			OR: [
				{ bodyText: { contains: "discount", mode: "insensitive" } },
				{ bodyText: { contains: "rabatt", mode: "insensitive" } },
				{ bodyText: { contains: "sale", mode: "insensitive" } },
				{ title: { contains: "sale", mode: "insensitive" } },
				{ bodyText: { contains: "% off", mode: "insensitive" } },
				{ bodyText: { contains: "save", mode: "insensitive" } },
			],
		});
	}
	if (parsed.preset === "warehouse-sales") {
		andParts.push({
			OR: [
				{ bodyText: { contains: "warehouse", mode: "insensitive" } },
				{ title: { contains: "warehouse", mode: "insensitive" } },
				{ bodyText: { contains: "clearance", mode: "insensitive" } },
				{ bodyText: { contains: "outlet", mode: "insensitive" } },
			],
		});
	}
	if (parsed.preset === "restock-alerts") {
		andParts.push({
			OR: [
				{ bodyText: { contains: "restock", mode: "insensitive" } },
				{ title: { contains: "restock", mode: "insensitive" } },
				{ bodyText: { contains: "back in stock", mode: "insensitive" } },
				{ bodyText: { contains: "wieder verfügbar", mode: "insensitive" } },
				{ bodyText: { contains: "nachschub", mode: "insensitive" } },
			],
		});
	}
	if (parsed.preset === "luggage") {
		andParts.push({
			OR: [
				{ title: { contains: "luggage", mode: "insensitive" } },
				{ bodyText: { contains: "luggage", mode: "insensitive" } },
				{ title: { contains: "suitcase", mode: "insensitive" } },
				{ bodyText: { contains: "suitcase", mode: "insensitive" } },
				{ title: { contains: "koffer", mode: "insensitive" } },
				{ bodyText: { contains: "koffer", mode: "insensitive" } },
			],
		});
	}
	if (parsed.preset === "exclude-cart-emails") {
		andParts.push({
			NOT: {
				OR: [
					{ title: { contains: "abandoned cart", mode: "insensitive" } },
					{ bodyText: { contains: "abandoned cart", mode: "insensitive" } },
					{ title: { contains: "your cart", mode: "insensitive" } },
					{ bodyText: { contains: "your cart", mode: "insensitive" } },
					{ title: { contains: "warenkorb", mode: "insensitive" } },
					{ bodyText: { contains: "warenkorb", mode: "insensitive" } },
				],
			},
		});
	}
	if (parsed.preset === "canon") {
		andParts.push({
			OR: [
				{ title: { contains: "Canon", mode: "insensitive" } },
				{ bodyText: { contains: "Canon", mode: "insensitive" } },
			],
		});
	}
	if (parsed.preset === "video-ads") {
		andParts.push({ assetType: { in: ["YOUTUBE_AD", "TIKTOK_AD"] } });
	}

	if (parsed.hasDiscount) {
		andParts.push({ bodyText: { contains: "%", mode: "insensitive" } });
	}

	const where: Prisma.MarketingAssetWhereInput = { AND: andParts };

	const orderBy =
		parsed.sort === "oldest"
			? { capturedAt: "asc" as const }
			: parsed.sort === "longevity"
				? { createdAt: "desc" as const }
				: { capturedAt: "desc" as const };

	const [total, rows] = await Promise.all([
		prisma.marketingAsset.count({ where }),
		prisma.marketingAsset.findMany({
			where,
			orderBy,
			skip: (parsed.page - 1) * parsed.pageSize,
			take: parsed.pageSize,
			include: { brand: { select: { name: true, slug: true } } },
		}),
	]);

	return {
		items: rows.map(toListItem),
		total,
		page: parsed.page,
		pageSize: parsed.pageSize,
		totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
	};
}

export async function getAssetDetail(id: string): Promise<MarketingAssetDetail | null> {
	await requireUser();
	const tenantId = await getCalumetTenantId();
	const row = await prisma.marketingAsset.findFirst({
		where: { id, tenantId },
		include: { brand: { select: { name: true, slug: true } } },
	});
	if (!row) return null;
	return { ...toListItem(row), payload: (row.payload as Record<string, unknown>) ?? {} };
}

export async function getAssetStats(): Promise<AssetStatsByType> {
	await requireUser();
	const tenantId = await getCalumetTenantId();
	const since = new Date(Date.now() - 28 * 86400_000);

	const [byTypeRows, brandRows, last28d, total] = await Promise.all([
		prisma.marketingAsset.groupBy({
			by: ["assetType"],
			where: { tenantId },
			_count: { _all: true },
		}),
		prisma.marketingAsset.groupBy({
			by: ["brandId"],
			where: { tenantId },
			_count: { _all: true },
			orderBy: { _count: { brandId: "desc" } },
			take: 25,
		}),
		prisma.marketingAsset.count({ where: { tenantId, capturedAt: { gte: since } } }),
		prisma.marketingAsset.count({ where: { tenantId } }),
	]);

	const brands = await prisma.company.findMany({
		where: { id: { in: brandRows.map((r: { brandId: string }) => r.brandId) } },
		select: { id: true, name: true, slug: true },
	});
	type BrandRow = { id: string; name: string; slug: string };
	const brandMap = new Map<string, BrandRow>(brands.map((b: BrandRow) => [b.id, b]));

	const byType = Object.fromEntries(
		ALL_ASSET_TYPES.map((t) => [t, 0]),
	) as Record<AssetTypeName, number>;
	for (const row of byTypeRows) {
		byType[row.assetType as AssetTypeName] = row._count._all;
	}

	return {
		total,
		last28d,
		byType,
		brands: brandRows
			.map((r: { brandId: string; _count: { _all: number } }) => {
				const b = brandMap.get(r.brandId);
				if (!b) return null;
				return { slug: b.slug, name: b.name, count: r._count._all };
			})
			.filter(
				(x: { slug: string; name: string; count: number } | null): x is { slug: string; name: string; count: number } => x !== null,
			),
	};
}

export async function getCaptureRuns(limit = 25): Promise<AssetCaptureRunDTO[]> {
	await requireUser();
	const tenantId = await getCalumetTenantId();
	const rows = await prisma.assetCaptureRun.findMany({
		where: { tenantId },
		orderBy: { startedAt: "desc" },
		take: limit,
	});
	return rows.map((r: {
		id: string; tenantId: string; brandId: string; assetType: string; source: string;
		status: string; startedAt: Date; completedAt: Date | null; itemCount: number; error: string | null;
	}) => ({
		id: r.id,
		tenantId: r.tenantId,
		brandId: r.brandId,
		assetType: r.assetType as AssetTypeName,
		source: r.source as AssetCaptureRunDTO["source"],
		status: r.status,
		startedAt: r.startedAt.toISOString(),
		completedAt: r.completedAt ? r.completedAt.toISOString() : null,
		itemCount: r.itemCount,
		error: r.error,
	}));
}

const triggerSchema = z.object({
	brandSlug: z.string().min(1),
	assetType: z.enum(ALL_ASSET_TYPES as [string, ...string[]]),
});

export async function manuallyTriggerCapture(
	brandSlug: string,
	assetType: AssetTypeName,
): Promise<{ runId: string; jobId: string }> {
	await requireUser();
	const parsed = triggerSchema.parse({ brandSlug, assetType });
	const tenantId = await getCalumetTenantId();

	const brand = await prisma.company.findUnique({ where: { slug: parsed.brandSlug } });
	if (!brand) throw new Error(`Unknown brand slug: ${parsed.brandSlug}`);

	const run = await prisma.assetCaptureRun.create({
		data: {
			tenantId,
			brandId: brand.id,
			assetType: parsed.assetType as any,
			source: parsed.assetType === "META_AD" ? "PLAYWRIGHT_SELF_HOSTED" : "APIFY_META",
			status: "queued",
		},
	});

	const queueName =
		parsed.assetType === "HOMEPAGE" || parsed.assetType === "HOMEPAGE_MOBILE"
			? QUEUE_NAMES.homepageCapture
			: parsed.assetType === "META_AD"
				? QUEUE_NAMES.metaAdsScrape
				: QUEUE_NAMES.apifyIngest;

	const queue = getQueue(queueName);
	const job = await queue.add(`manual-${run.id}`, {
		runId: run.id,
		tenantId,
		brandId: brand.id,
		brandSlug: brand.slug,
		brandName: brand.name,
		brandDomain: brand.domain,
		assetType: parsed.assetType,
		manual: true,
	});

	return { runId: run.id, jobId: String(job.id) };
}
