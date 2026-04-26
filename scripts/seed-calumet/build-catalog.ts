/* eslint-disable no-console */
/**
 * Build the ForecastProduct + ForecastVariant catalog from hero SKUs, Amazon
 * data, and Instax data, then return a VariantContext[] for downstream steps.
 */

import { type PrismaClient } from "@prisma/client";
import type { InstaxRow } from "./load-instax";
import type { AmazonRow } from "./load-amazon";
import { HERO_SKUS, type HeroSku } from "./hero-skus";

export interface VariantContext {
  productId: string;
  variantId: string;
  rrpEur: number;
  category: string;
  brand: string;
  isHero: boolean;
  story?: HeroSku["story"];
  oosWindow?: HeroSku["oosWindow"];
  launchDate?: string;
  preferredChannels?: string[];
  amazonPurchasedLastMonth?: number;
}

// ─── Category classification ─────────────────────────────────────────────────

function classifyCategory(title: string): string {
  const t = title.toLowerCase();
  if (/camera|mirrorless|dslr|body|gehäuse|x100|r5|alpha|eos|sony|fujifilm/.test(t))
    return "cameras";
  if (/lens|objektiv|mm\s*f\/|35mm|50mm|85mm|sigma|tamron|zeiss/.test(t))
    return "lenses";
  if (/flash|speedlight|strobe|softbox|godox|profoto|aputure|licht|bowens/.test(t))
    return "lighting";
  if (/tripod|monopod|stativ|manfrotto|gitzo|benro/.test(t))
    return "tripods";
  return "accessories";
}

// ─── Brand normalization ─────────────────────────────────────────────────────

const BRAND_NORM: Record<string, string> = {
  CANON: "Canon",
  canon: "Canon",
  "fuji film": "Fujifilm",
  fuji: "Fujifilm",
  FUJIFILM: "Fujifilm",
  SONY: "Sony",
  sony: "Sony",
  NIKON: "Nikon",
  nikon: "Nikon",
  SIGMA: "Sigma",
  sigma: "Sigma",
  GODOX: "Godox",
  godox: "Godox",
  MANFROTTO: "Manfrotto",
  manfrotto: "Manfrotto",
  SANDISK: "SanDisk",
  sandisk: "SanDisk",
  TAMRON: "Tamron",
  tamron: "Tamron",
  PANASONIC: "Panasonic",
  panasonic: "Panasonic",
  OLYMPUS: "Olympus",
  olympus: "Olympus",
};

function normalizeBrand(raw: string): string {
  const trimmed = raw.trim();
  return BRAND_NORM[trimmed] ?? trimmed;
}

function extractBrandFromTitle(title: string): string {
  const brands = [
    "Fujifilm",
    "Canon",
    "Sony",
    "Nikon",
    "Sigma",
    "Godox",
    "Manfrotto",
    "SanDisk",
    "Tamron",
    "Panasonic",
    "Olympus",
    "Leica",
    "DJI",
    "GoPro",
    "Profoto",
    "Aputure",
    "Gitzo",
    "Benro",
    "Peak Design",
  ];
  for (const b of brands) {
    if (title.toLowerCase().includes(b.toLowerCase())) return b;
  }
  // Fall back to first word
  return title.split(/\s+/)[0] ?? "Unknown";
}

// ─── USD → EUR with German VAT ───────────────────────────────────────────────

function usdToEur(usd: number): number {
  // USD → EUR @ 0.92, then +19% German VAT
  return Math.round(usd * 0.92 * 1.19 * 100) / 100;
}

// ─── Slugify for deduplication ───────────────────────────────────────────────

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function buildCatalog(
  prisma: PrismaClient,
  tenantId: string,
  instax: InstaxRow[],
  amazon: AmazonRow[],
  heroSkus: HeroSku[] = HERO_SKUS,
): Promise<VariantContext[]> {
  const results: VariantContext[] = [];
  const seenSlugs = new Set<string>();

  // ── 1. Hero SKUs ────────────────────────────────────────────────────────────
  console.log(`[build-catalog] Inserting ${heroSkus.length} hero SKUs…`);

  for (const hero of heroSkus) {
    const slug = `hero:${slugify(hero.productTitle)}`;

    let product = await prisma.forecastProduct.findFirst({
      where: { tenantId, externalId: slug },
    });
    if (!product) {
      product = await prisma.forecastProduct.create({
        data: {
          tenantId,
          externalId: slug,
          productTitle: hero.productTitle,
          brand: hero.brand,
          category: hero.category,
          isSet: false,
        },
      });
    } else {
      product = await prisma.forecastProduct.update({
        where: { id: product.id },
        data: {
          productTitle: hero.productTitle,
          brand: hero.brand,
          category: hero.category,
        },
      });
    }

    let variant = await prisma.forecastVariant.findFirst({
      where: { productId: product.id, variantTitle: hero.productTitle },
    });
    if (!variant) {
      variant = await prisma.forecastVariant.create({
        data: {
          productId: product.id,
          variantTitle: hero.productTitle,
          rrp: hero.rrpEur,
          currency: "EUR",
          isActive: true,
        },
      });
    } else {
      variant = await prisma.forecastVariant.update({
        where: { id: variant.id },
        data: { rrp: hero.rrpEur },
      });
    }

    seenSlugs.add(slug);
    results.push({
      productId: product.id,
      variantId: variant.id,
      rrpEur: hero.rrpEur,
      category: hero.category,
      brand: hero.brand,
      isHero: true,
      story: hero.story,
      oosWindow: hero.oosWindow,
      launchDate: hero.launchDate,
      preferredChannels: hero.preferredChannels,
    });
  }

  // ── 2. Amazon-derived products ──────────────────────────────────────────────
  console.log(`[build-catalog] Processing ${amazon.length} Amazon rows…`);

  // Deduplicate by title slug
  const amazonDeduped = new Map<string, AmazonRow>();
  for (const row of amazon) {
    const slug = slugify(row.productTitle);
    const existing = amazonDeduped.get(slug);
    // Keep the one with more reviews (better signal)
    if (!existing || row.reviewCount > existing.reviewCount) {
      amazonDeduped.set(slug, row);
    }
  }

  let amazonInserted = 0;
  for (const [slug, row] of amazonDeduped) {
    const externalId = `amazon:${slug}`;
    if (seenSlugs.has(externalId)) continue;
    // Check against hero slugs too
    const heroSlug = `hero:${slug}`;
    if (seenSlugs.has(heroSlug)) continue;

    const category = classifyCategory(row.productTitle);
    const brand = normalizeBrand(extractBrandFromTitle(row.productTitle));
    const rrpEur = usdToEur(row.discountedPriceUsd);

    let product = await prisma.forecastProduct.findFirst({
      where: { tenantId, externalId },
    });
    if (!product) {
      product = await prisma.forecastProduct.create({
        data: {
          tenantId,
          externalId,
          productTitle: row.productTitle,
          brand,
          category,
          isSet: false,
        },
      });
      amazonInserted++;
    }

    let variant = await prisma.forecastVariant.findFirst({
      where: { productId: product.id, variantTitle: row.productTitle },
    });
    if (!variant) {
      variant = await prisma.forecastVariant.create({
        data: {
          productId: product.id,
          variantTitle: row.productTitle,
          rrp: rrpEur,
          currency: "EUR",
          isActive: true,
        },
      });
    }

    seenSlugs.add(externalId);
    results.push({
      productId: product.id,
      variantId: variant.id,
      rrpEur,
      category,
      brand,
      isHero: false,
      amazonPurchasedLastMonth: row.purchasedLastMonth,
    });
  }

  console.log(`[build-catalog]   Amazon: ${amazonInserted} new products inserted`);

  // ── 3. Instax-derived products ──────────────────────────────────────────────
  console.log(`[build-catalog] Processing Instax products…`);

  // Deduplicate by product name
  const instaxNames = new Map<string, InstaxRow>();
  for (const row of instax) {
    const slug = slugify(row.productName);
    if (!instaxNames.has(slug)) {
      instaxNames.set(slug, row);
    }
  }

  let instaxInserted = 0;
  for (const [slug, row] of instaxNames) {
    const externalId = `instax:${slug}`;
    if (seenSlugs.has(externalId)) continue;
    // Skip if already inserted from Amazon
    const amazonId = `amazon:${slug}`;
    if (seenSlugs.has(amazonId)) continue;

    const category = classifyCategory(row.productName);
    const brand = normalizeBrand(extractBrandFromTitle(row.productName));
    // Convert IDR → EUR: IDR * 0.000058 (per forecast.ts constant)
    const rrpEur = Math.max(1, Math.round(row.unitPriceIdr * 0.000058 * 100) / 100);

    let product = await prisma.forecastProduct.findFirst({
      where: { tenantId, externalId },
    });
    if (!product) {
      product = await prisma.forecastProduct.create({
        data: {
          tenantId,
          externalId,
          productTitle: row.productName,
          brand,
          category,
          isSet: false,
        },
      });
      instaxInserted++;
    }

    let variant = await prisma.forecastVariant.findFirst({
      where: { productId: product.id, variantTitle: row.productName },
    });
    if (!variant) {
      variant = await prisma.forecastVariant.create({
        data: {
          productId: product.id,
          variantTitle: row.productName,
          rrp: rrpEur,
          currency: "EUR",
          isActive: true,
        },
      });
    }

    seenSlugs.add(externalId);
    results.push({
      productId: product.id,
      variantId: variant.id,
      rrpEur,
      category,
      brand,
      isHero: false,
    });
  }

  console.log(`[build-catalog]   Instax: ${instaxInserted} new products inserted`);
  console.log(`[build-catalog] Total variants in catalog: ${results.length}`);

  return results;
}
