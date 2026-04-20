import { prisma } from "@/lib/prismaDb";

const CACHE_TTL_MS = 5 * 60 * 1000;

let cached: { id: string; expiresAt: number } | null = null;

/**
 * Resolve the tenant Company.id for the primary operator (Calumet).
 * In v1 multi-tenancy is flat: a single operator owns all Marketing Assets.
 * The Company row is upserted on demand so local dev / tests don't need seed state.
 */
export async function getCalumetTenantId(): Promise<string> {
	const now = Date.now();
	if (cached && cached.expiresAt > now) return cached.id;

	const existing = await prisma.company.findUnique({
		where: { slug: "calumet" },
		select: { id: true },
	});

	if (existing) {
		cached = { id: existing.id, expiresAt: now + CACHE_TTL_MS };
		return existing.id;
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

	cached = { id: created.id, expiresAt: now + CACHE_TTL_MS };
	return created.id;
}

export function clearTenantCache(): void {
	cached = null;
}
