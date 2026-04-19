/* eslint-disable no-console */
import crypto from "node:crypto";
import { faker } from "@faker-js/faker";

import { prisma } from "@/lib/prismaDb";
import { getCalumetTenantId } from "@/lib/tenant";

type AssetTypeName =
	| "EMAIL"
	| "HOMEPAGE"
	| "HOMEPAGE_MOBILE"
	| "INSTAGRAM"
	| "META_AD"
	| "YOUTUBE_AD"
	| "TIKTOK_AD";

const BRANDS: Array<{ slug: string; name: string; domain: string }> = [
	{ slug: "foto-erhardt", name: "Foto Erhardt", domain: "fotoerhardt.de" },
	{ slug: "fotokoch", name: "Fotokoch", domain: "fotokoch.de" },
	{ slug: "foto-leistenschneider", name: "Foto Leistenschneider", domain: "foto-leistenschneider.de" },
	{ slug: "kamera-express", name: "Kamera Express", domain: "kameraexpress.de" },
	{ slug: "teltec", name: "Teltec", domain: "teltec.de" },
];

const PRODUCTS = ["Canon EOS R5", "Sony A7 IV", "Nikon Z6 III", "Fujifilm X-T5", "Canon RF 24-70", "Sony FE 70-200", "DJI RS 4"];

const TYPE_DISTRIBUTION: Array<[AssetTypeName, number]> = [
	["EMAIL", 0.5],
	["HOMEPAGE", 0.15],
	["HOMEPAGE_MOBILE", 0.15],
	["INSTAGRAM", 0.1],
	["META_AD", 0.05],
	["YOUTUBE_AD", 0.03],
	["TIKTOK_AD", 0.02],
];

function pickType(): AssetTypeName {
	const r = Math.random();
	let acc = 0;
	for (const [t, w] of TYPE_DISTRIBUTION) {
		acc += w;
		if (r < acc) return t;
	}
	return "EMAIL";
}

function unsplash(seed: string): string {
	const ids = [
		"1519183071298-a2962feaa4f3",
		"1510127034890-ba27508e9f1c",
		"1491247526200-43a4a2ed82ca",
		"1506748686214-e9df14d4d9d0",
		"1526178613658-3f1622045557",
		"1495707902641-75cac588d2e9",
		"1516035069371-29a1b244cc32",
	];
	const idx = Number.parseInt(crypto.createHash("md5").update(seed).digest("hex").slice(0, 8), 16) % ids.length;
	return `https://images.unsplash.com/photo-${ids[idx]}?q=80&w=1200`;
}

async function ensureBrand(b: (typeof BRANDS)[number]): Promise<string> {
	const row = await prisma.company.upsert({
		where: { slug: b.slug },
		update: {},
		create: {
			slug: b.slug,
			name: b.name,
			domain: b.domain,
		},
		select: { id: true },
	});
	return row.id;
}

async function main() {
	faker.seed(42);
	const tenantId = await getCalumetTenantId();
	console.log(`[seed] tenantId=${tenantId}`);

	const brandMap = new Map<string, string>();
	for (const b of BRANDS) {
		const id = await ensureBrand(b);
		brandMap.set(b.slug, id);
	}
	console.log(`[seed] ensured ${brandMap.size} brands`);

	// Idempotent cleanup
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const assetsTable: any = (prisma as any).marketingAsset;
	await assetsTable.deleteMany({ where: { tenantId, source: "SEED" } });

	const targetCount = 400;
	const now = Date.now();
	const records: unknown[] = [];
	for (let i = 0; i < targetCount; i++) {
		const brand = faker.helpers.arrayElement(BRANDS);
		const brandId = brandMap.get(brand.slug)!;
		const assetType = pickType();
		const product = faker.helpers.arrayElement(PRODUCTS);
		const captureOffsetDays = faker.number.int({ min: 0, max: 90 });
		const capturedAt = new Date(now - captureOffsetDays * 86400_000);
		const discount = faker.number.int({ min: 10, max: 40 });
		const hasDiscount = assetType === "EMAIL" ? faker.datatype.boolean({ probability: 0.55 }) : faker.datatype.boolean({ probability: 0.15 });
		const seedKey = `${brand.slug}:${assetType}:${i}`;
		const contentHash = crypto.createHash("sha256").update(`SEED:${seedKey}`).digest("hex");
		const title = hasDiscount ? `${discount}% Rabatt auf ${product}` : `${product} — neu im Sortiment`;
		const bodyText = hasDiscount
			? `Jetzt ${discount}% Rabatt auf ${product}. Nur für kurze Zeit bei ${brand.name}. Mit dem Code SPAREN${discount} sichern.`
			: `Entdecke die ${product} Serie bei ${brand.name}. Premium-Qualität zum fairen Preis.`;
		const mediaUrls = [unsplash(seedKey)];

		const longevityDays = assetType.endsWith("_AD") ? faker.number.int({ min: 1, max: 120 }) : undefined;
		const iterationRate28d = faker.number.int({ min: 0, max: 10 });
		const platforms: Record<AssetTypeName, number> = {
			EMAIL: 1,
			HOMEPAGE: 1,
			HOMEPAGE_MOBILE: 1,
			INSTAGRAM: 1,
			META_AD: 2,
			YOUTUBE_AD: 1,
			TIKTOK_AD: 1,
		};

		records.push({
			tenantId,
			brandId,
			assetType,
			source: "SEED",
			capturedAt,
			sourceUrl: `https://${brand.domain}/demo/${seedKey}`,
			title,
			bodyText,
			language: "de",
			region: "DE",
			mediaUrls,
			contentHash,
			payload: {
				_seed: true,
				product,
				discount: hasDiscount ? { kind: "percent", value: discount, currency: "EUR" } : null,
				hasDiscount,
				mediaType: assetType.endsWith("_AD") && Math.random() < 0.4 ? "video" : "image",
				platforms: platforms[assetType],
			},
			proxies: {
				longevityDays,
				iterationRate28d,
				platformBreadth: platforms[assetType],
				geographicBreadth: 1,
				copyReadability: faker.number.int({ min: 40, max: 85 }),
				aestheticScore: faker.number.float({ min: 5, max: 9, fractionDigits: 1 }),
			},
		});
	}

	for (let i = 0; i < records.length; i += 100) {
		const batch = records.slice(i, i + 100);
		await assetsTable.createMany({ data: batch, skipDuplicates: true });
		console.log(`[seed] inserted ${Math.min(i + 100, records.length)}/${records.length}`);
	}
	console.log(`[seed] done — ${records.length} assets across ${brandMap.size} brands`);
}

main()
	.catch((e) => {
		console.error("[seed] failed", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
