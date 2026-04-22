import { prisma } from "@/lib/prismaDb";

const CACHE_TTL_MS = 5 * 60 * 1000;

let cached: { id: string; expiresAt: number } | null = null;
let cachedMarketingTenantIds: { ids: string[]; expiresAt: number } | null = null;

/**
 * Resolve the assets.Tenant.id used by Marketing Asset tables.
 *
 * NOTE:
 * - assets.MarketingAsset.tenantId points to assets.Tenant.id (slug-like id),
 *   not nogl.Company.id.
 * - We still anchor to the primary operator Company ("calumet"), then resolve
 *   the linked assets.Tenant row via companyId.
 */
export async function getCalumetTenantId(): Promise<string> {
	const now = Date.now();
	if (cached && cached.expiresAt > now) return cached.id;

	const existing = await prisma.company.findUnique({
		where: { slug: "calumet" },
		select: { id: true },
	});

	if (existing) {
		const linkedTenants = await prisma.tenant.findMany({
			where: { companyId: existing.id },
			select: {
				id: true,
				_count: {
					select: {
						marketingAssets: true,
					},
				},
			},
			orderBy: { createdAt: "asc" },
		});
		if (linkedTenants.length > 0) {
			const tenantWithAssets =
				linkedTenants
					.filter((tenant) => tenant._count.marketingAssets > 0)
					.sort((a, b) => b._count.marketingAssets - a._count.marketingAssets)[0] ??
				linkedTenants[0];

			cached = { id: tenantWithAssets.id, expiresAt: now + CACHE_TTL_MS };
			return tenantWithAssets.id;
		}
	}

	const created = await prisma.company.upsert({
		where: { slug: "calumet" },
		update: {},
		create: {
			slug: "calumet",
			name: "Calumet Photographic",
			domain: "calumetphoto.de",
			country_code: "DE",
			industry: "camera_retail",
			product_types: ["camera", "lens", "accessory"],
			tracking_status: "TRACKED",
		},
		select: { id: true },
	});

	const linkedCreatedTenants = await prisma.tenant.findMany({
		where: { companyId: created.id },
		select: {
			id: true,
			_count: {
				select: {
					marketingAssets: true,
				},
			},
		},
		orderBy: { createdAt: "asc" },
	});
	if (linkedCreatedTenants.length > 0) {
		const tenantWithAssets =
			linkedCreatedTenants
				.filter((tenant) => tenant._count.marketingAssets > 0)
				.sort((a, b) => b._count.marketingAssets - a._count.marketingAssets)[0] ??
			linkedCreatedTenants[0];

		cached = { id: tenantWithAssets.id, expiresAt: now + CACHE_TTL_MS };
		return tenantWithAssets.id;
	}

	// Fallback for single-tenant environments where tenant exists but is not
	// linked to Company.companyId yet.
	const anyTenant = await prisma.tenant.findFirst({
		select: { id: true },
		orderBy: { createdAt: "asc" },
	});
	if (anyTenant) {
		cached = { id: anyTenant.id, expiresAt: now + CACHE_TTL_MS };
		return anyTenant.id;
	}

	// Last resort: create a canonical tenant row linked to Calumet.
	const fallbackTenant = await prisma.tenant.create({
		data: {
			id: "calumet_de",
			name: "Calumet DE",
			companyId: created.id,
		},
		select: { id: true },
	});

	cached = { id: fallbackTenant.id, expiresAt: now + CACHE_TTL_MS };
	return fallbackTenant.id;
}

export function clearTenantCache(): void {
	cached = null;
	cachedMarketingTenantIds = null;
}

/**
 * Resolve the tenant scope used by Marketing Asset read endpoints.
 *
 * We prefer all tenants that currently have marketing assets so the UI
 * reflects the full indexed corpus instead of a single operator tenant.
 */
export async function getMarketingTenantIds(): Promise<string[]> {
	const now = Date.now();
	if (cachedMarketingTenantIds && cachedMarketingTenantIds.expiresAt > now) {
		return cachedMarketingTenantIds.ids;
	}

	const grouped = await prisma.marketingAsset.groupBy({
		by: ["tenantId"],
		_count: { _all: true },
	});

	const ids = grouped
		.filter((row) => row._count._all > 0)
		.map((row) => row.tenantId);

	if (ids.length > 0) {
		cachedMarketingTenantIds = { ids, expiresAt: now + CACHE_TTL_MS };
		return ids;
	}

	const fallback = await getCalumetTenantId();
	cachedMarketingTenantIds = { ids: [fallback], expiresAt: now + CACHE_TTL_MS };
	return [fallback];
}
