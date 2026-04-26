/* eslint-disable no-console */
/**
 * Load and parse the Amazon Electronics 2025 CSV, filtering to Cameras only.
 *
 * CSV columns (17):
 *   product_title, product_rating, total_reviews, purchased_last_month,
 *   discounted_price, original_price, is_best_seller, is_sponsored,
 *   has_coupon, buy_box_availability, delivery_date, sustainability_tags,
 *   product_image_url, product_page_url, data_collected_at,
 *   product_category, discount_percentage
 */

import fs from "fs";
import { parse } from "csv-parse/sync";

export interface AmazonRow {
  productTitle: string;
  rating: number | null;
  reviewCount: number;
  purchasedLastMonth: number; // demand-velocity proxy
  discountedPriceUsd: number;
  originalPriceUsd: number | null;
  isBestSeller: boolean;
  category: string;
  imageUrl: string | null;
  productPageUrl: string;
}

/**
 * Parse USD price strings like "$1,299.99" or "1299.99".
 * Returns null on empty/unparseable input.
 */
function parseUsd(s: string | null | undefined): number | null {
  if (!s || s.trim() === "" || s.trim() === "N/A") return null;
  const cleaned = s.trim().replace(/^\$/, "").replace(/,/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse "purchased_last_month" strings:
 *   "1K+ bought" → 1000
 *   "500+ bought" → 500
 *   "100+ bought" → 100
 *   "50+ bought"  → 50
 *   plain number  → parseInt
 *   fallback      → 50
 */
function parsePurchasedLastMonth(s: string | null | undefined): number {
  if (!s || s.trim() === "") return 50;
  const clean = s.trim().toLowerCase();

  const kMatch = clean.match(/^([\d.]+)k\+?\s*bought/);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);

  const numMatch = clean.match(/^(\d+)\+?\s*bought/);
  if (numMatch) return parseInt(numMatch[1], 10);

  const plain = parseInt(clean, 10);
  if (Number.isFinite(plain) && plain > 0) return plain;

  return 50;
}

function parseBool(s: string | null | undefined): boolean {
  const v = (s ?? "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export function loadAmazon(path: string): AmazonRow[] {
  if (!fs.existsSync(path)) {
    console.warn(`[load-amazon] CSV not found at ${path} — returning [] (hero SKUs only)`);
    return [];
  }
  const raw = fs.readFileSync(path);
  // Strip BOM
  const content = raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf
    ? raw.slice(3).toString("utf8")
    : raw.toString("utf8");

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const rows: AmazonRow[] = [];
  let total = 0;
  let filtered = 0;

  for (const rec of records) {
    total++;
    const category = (rec["product_category"] ?? "").trim();

    // Filter to Cameras only
    if (category !== "Cameras") {
      filtered++;
      continue;
    }

    const title = (rec["product_title"] ?? "").trim();
    if (!title) continue;

    const discountedPrice = parseUsd(rec["discounted_price"]);
    if (discountedPrice === null || discountedPrice <= 0) continue;

    const ratingStr = (rec["product_rating"] ?? "").trim();
    const rating = ratingStr && ratingStr !== "N/A"
      ? (parseFloat(ratingStr) || null)
      : null;

    const reviewStr = (rec["total_reviews"] ?? "").replace(/,/g, "").trim();
    const reviewCount = parseInt(reviewStr, 10) || 0;

    const pageUrl = (rec["product_page_url"] ?? "").trim();
    const imageUrl = (rec["product_image_url"] ?? "").trim() || null;

    rows.push({
      productTitle: title,
      rating: rating !== null && Number.isFinite(rating) ? rating : null,
      reviewCount,
      purchasedLastMonth: parsePurchasedLastMonth(rec["purchased_last_month"]),
      discountedPriceUsd: discountedPrice,
      originalPriceUsd: parseUsd(rec["original_price"]),
      isBestSeller: parseBool(rec["is_best_seller"]),
      category,
      imageUrl,
      productPageUrl: pageUrl,
    });
  }

  console.log(
    `[load-amazon] Total rows: ${total}, filtered out (non-Cameras): ${filtered}, loaded: ${rows.length}`,
  );
  return rows;
}
