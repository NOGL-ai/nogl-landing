export type ScraperSource = { name: string; website: string };

export const SCRAPER_SOURCES = {
  calumet: {
    name: "Calumet Photographic",
    website: "https://www.calumet.de",
  },
  teltec: {
    name: "Teltec",
    website: "https://www.teltec.de",
  },
  foto_erhardt: {
    name: "Foto Erhardt",
    website: "https://www.foto-erhardt.de",
  },
  foto_leistenschneider: {
    name: "Foto Leistenschneider",
    website: "https://www.foto-leistenschneider.de",
  },
  fotokoch: {
    name: "Fotokoch",
    website: "https://www.fotokoch.de",
  },
} as const satisfies Record<string, ScraperSource>;

export function getScrapeSourceName(key: string): string {
  return SCRAPER_SOURCES[key as keyof typeof SCRAPER_SOURCES]?.name ?? key;
}
