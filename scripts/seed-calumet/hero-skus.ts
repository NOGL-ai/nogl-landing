/**
 * Hero SKU definitions for the Calumet realistic seed.
 * Each hero has a narrative story that drives special generation logic in
 * generate-history.ts and generate-quantiles.ts.
 */

export interface HeroSku {
  productTitle: string;
  brand: string;
  category: "cameras" | "lenses" | "accessories" | "lighting" | "tripods";
  rrpEur: number;
  story:
    | "oos_hero"
    | "launch_hero"
    | "steady_baseline"
    | "lens_companion"
    | "high_volume_low_aov"
    | "christmas_spike"
    | "commodity_volume";
  oosWindow?: { start: string; end: string };
  launchDate?: string;
  preferredChannels: string[];
}

export const HERO_SKUS: HeroSku[] = [
  {
    productTitle: "Fujifilm X100VI",
    brand: "Fujifilm",
    category: "cameras",
    rrpEur: 1599,
    story: "oos_hero",
    oosWindow: { start: "2025-08-12", end: "2025-09-28" },
    preferredChannels: ["shopify", "amazon"],
  },
  {
    productTitle: "Canon EOS R5 Mark II",
    brand: "Canon",
    category: "cameras",
    rrpEur: 4299,
    story: "launch_hero",
    launchDate: "2025-07-17",
    preferredChannels: ["b2b", "shopify", "offline"],
  },
  {
    productTitle: "Sony Alpha 7 IV",
    brand: "Sony",
    category: "cameras",
    rrpEur: 2499,
    story: "steady_baseline",
    preferredChannels: ["shopify", "amazon", "b2b"],
  },
  {
    productTitle: "Sigma 35mm f/1.4 DG DN Art (E-mount)",
    brand: "Sigma",
    category: "lenses",
    rrpEur: 899,
    story: "lens_companion",
    preferredChannels: ["shopify", "b2b"],
  },
  {
    productTitle: "Godox V1 Pro (Canon)",
    brand: "Godox",
    category: "lighting",
    rrpEur: 329,
    story: "high_volume_low_aov",
    preferredChannels: ["amazon", "shopify"],
  },
  {
    productTitle: "Manfrotto 055XPRO3 Aluminium Tripod",
    brand: "Manfrotto",
    category: "tripods",
    rrpEur: 279,
    story: "christmas_spike",
    preferredChannels: ["shopify", "offline"],
  },
  {
    productTitle: "SanDisk Extreme PRO 256GB CFexpress Type B",
    brand: "SanDisk",
    category: "accessories",
    rrpEur: 189,
    story: "commodity_volume",
    preferredChannels: ["amazon", "marketplace"],
  },
];
