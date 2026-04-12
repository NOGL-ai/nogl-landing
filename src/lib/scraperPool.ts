import "server-only";

import { Pool } from "pg";

const scraperDatabaseUrl = process.env.SCRAPY_DATABASE_URL;
const missingScraperMessage =
  "SCRAPY_DATABASE_URL environment variable is not set";

if (!scraperDatabaseUrl) {
  console.warn(
    `⚠️ ${missingScraperMessage}. Scraper DB pool disabled; returning empty results where applicable.`,
  );
}

declare global {
  // eslint-disable-next-line no-var
  var scraperPool: Pool | undefined;
}

const globalForScraper = global as typeof global & {
  scraperPool?: Pool;
};

/**
 * Read-only access to scraper DB. Never INSERT/UPDATE/DELETE.
 */
const scraperPoolInstance: Pool | null = scraperDatabaseUrl
  ? globalForScraper.scraperPool ??
    new Pool({
      connectionString: scraperDatabaseUrl,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  : null;

if (scraperDatabaseUrl && process.env.NODE_ENV !== "production" && scraperPoolInstance) {
  globalForScraper.scraperPool = scraperPoolInstance;
}

export const scraperPool = scraperPoolInstance;
export const isScraperAvailable = Boolean(scraperDatabaseUrl);
