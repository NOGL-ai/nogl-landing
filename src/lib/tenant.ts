import { prisma } from "@/lib/prismaDb";

const CACHE_TTL_MS = 5 * 60 * 1000;

let cached: { id: string; expiresAt: number } | null = null;

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
		const linkedTenant = await prisma.tenant.findFirst({
			where: { companyId: existing.id },
			select: { id: true },
		});
		if (linkedTenant) {
			cached = { id: linkedTenant.id, expiresAt: now + CACHE_TTL_MS };
			return linkedTenant.id;
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

	const linkedCreatedTenant = await prisma.tenant.findFirst({
		where: { companyId: created.id },
		select: { id: true },
	});
	if (linkedCreatedTenant) {
		cached = { id: linkedCreatedTenant.id, expiresAt: now + CACHE_TTL_MS };
		return linkedCreatedTenant.id;
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
}
