/**
 * Pure helpers for Product Matrix (URL parsing, category depth, dimension whitelist).
 */

export const MATRIX_DIMENSIONS = [
  "company",
  "category",
  "brand",
  "price_bucket",
  "discount_tier",
] as const;

export type MatrixDimension = (typeof MATRIX_DIMENSIONS)[number];

export function isMatrixDimension(value: string | null): value is MatrixDimension {
  return !!value && (MATRIX_DIMENSIONS as readonly string[]).includes(value);
}

/** Split a retailer category path into segments (>, |, /). */
export function normalizeCategorySegments(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const trimmed = raw.replace(/\s+/g, " ").trim();
  if (!trimmed) return [];
  return trimmed
    .split(/\s*[>|/]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Minimum path segments required (1–5) for taxonomy depth filter. */
export function categorySegmentCount(raw: string | null | undefined): number {
  const parts = normalizeCategorySegments(raw);
  return parts.length > 0 ? parts.length : raw?.trim() ? 1 : 0;
}

export function parseSlugList(param: string | null, max = 32): string[] {
  if (!param || param === "all" || param === "*") return [];
  return param
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, max);
}

export const CAMERA_QUICK_FILTERS = [
  { id: "lens", label: "Lenses", terms: ["lens", "objektiv", "optik"] },
  { id: "body", label: "Camera bodies", terms: ["body", "gehäuse", "spiegelreflex", "dslr", "mirrorless"] },
  { id: "flash", label: "Lighting / flash", terms: ["blitz", "flash", "licht"] },
  { id: "tripod", label: "Tripods & support", terms: ["stativ", "tripod", "einbein"] },
  { id: "memory", label: "Memory & storage", terms: ["speicherkarte", "memory card", "cfexpress", "sd-karte"] },
  { id: "bag", label: "Bags & cases", terms: ["tasche", "koffer", "rucksack", "case"] },
] as const;
