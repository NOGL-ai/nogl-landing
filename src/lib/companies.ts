import "server-only";

import { SCRAPER_SOURCES } from "@/lib/constants/scraperSources";
import { prisma } from "@/lib/prismaDb";
import { isScraperAvailable, scraperPool } from "@/lib/scraperPool";

export interface CompanyRecord {
  key: string;
  name: string;
  domain: string;
  website: string;
  productCount: number;
  lastSeenAt: string | null;
  trackedCompetitorId: string | null;
  trackedCompetitorName: string | null;
}

function matchesSearch(company: Pick<CompanyRecord, "name" | "domain">, term?: string): boolean {
  if (!term) {
    return true;
  }

  return (
    company.name.toLowerCase().includes(term) ||
    company.domain.toLowerCase().includes(term)
  );
}

function normalizeDomain(value: string): string {
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "");
}

function inferWebsite(source: string, website?: string | null): string {
  if (website) {
    return /^https?:\/\//i.test(website) ? website : `https://${website}`;
  }

  const domain = normalizeDomain(source);
  return domain.includes(".") ? `https://${domain}` : `https://${domain}.com`;
}

function toCompanyRecord(competitor: {
  id: string;
  name: string;
  domain: string;
  website: string | null;
  productCount: number;
  lastScrapedAt: Date | null;
}): CompanyRecord {
  return {
    key: competitor.id,
    name: competitor.name,
    domain: normalizeDomain(competitor.website || competitor.domain),
    website: inferWebsite(competitor.domain, competitor.website),
    productCount: competitor.productCount,
    lastSeenAt: competitor.lastScrapedAt?.toISOString() ?? null,
    trackedCompetitorId: competitor.id,
    trackedCompetitorName: competitor.name,
  };
}

export async function listCompanies(search?: string): Promise<CompanyRecord[]> {
  const trackedCompetitors = await prisma.competitor.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      domain: true,
      website: true,
      productCount: true,
      lastScrapedAt: true,
    },
    orderBy: [{ productCount: "desc" }, { name: "asc" }],
  });

  const term = search?.trim().toLowerCase();
  const trackedByDomain = new Map<string, (typeof trackedCompetitors)[number]>();

  for (const competitor of trackedCompetitors) {
    trackedByDomain.set(competitor.domain.toLowerCase(), competitor);
    trackedByDomain.set(
      normalizeDomain(competitor.website || competitor.domain).toLowerCase(),
      competitor
    );
  }

  const trackedFallback = trackedCompetitors
    .map(toCompanyRecord)
    .filter((company) => matchesSearch(company, term));

  if (!isScraperAvailable || !scraperPool) {
    return trackedFallback;
  }

  const queryParams: unknown[] = [];
  let whereSearch = "";

  if (term) {
    queryParams.push(`%${term}%`);
    whereSearch = `
      AND (
        LOWER(source) LIKE $1
        OR LOWER(COALESCE(payload->>'brand', '')) LIKE $1
        OR LOWER(COALESCE(payload->>'title', '')) LIKE $1
        OR LOWER(COALESCE(url, '')) LIKE $1
      )
    `;
  }

  try {
    const result = await scraperPool.query<{
      source: string;
      product_count: number;
      last_seen_at: Date | null;
      sample_name: string | null;
    }>(
      `
        SELECT
          source,
          COUNT(*)::int AS product_count,
          MAX(updated_at) AS last_seen_at,
          MAX(NULLIF(payload->>'brand', '')) AS sample_name
        FROM scraping.scraped_items
        WHERE item_type = 'product'
          AND source != 'test'
          ${whereSearch}
        GROUP BY source
        ORDER BY COUNT(*) DESC, source ASC
        LIMIT 120
      `,
      queryParams
    );

    const companies = result.rows.map((row) => {
      const sourceMeta = SCRAPER_SOURCES[row.source as keyof typeof SCRAPER_SOURCES];
      const tracked =
        trackedByDomain.get(row.source.toLowerCase()) ??
        trackedByDomain.get(normalizeDomain(row.source).toLowerCase()) ??
        null;
      const website = inferWebsite(row.source, tracked?.website || sourceMeta?.website);

      return {
        key: tracked?.id ?? row.source,
        name: tracked?.name || sourceMeta?.name || row.sample_name || row.source,
        domain: normalizeDomain(website),
        website,
        productCount: tracked?.productCount ?? row.product_count,
        lastSeenAt:
          tracked?.lastScrapedAt?.toISOString() ?? row.last_seen_at?.toISOString() ?? null,
        trackedCompetitorId: tracked?.id ?? null,
        trackedCompetitorName: tracked?.name ?? null,
      } satisfies CompanyRecord;
    });

    const seenDomains = new Set(companies.map((company) => company.domain.toLowerCase()));

    for (const competitor of trackedCompetitors) {
      const company = toCompanyRecord(competitor);

      if (seenDomains.has(company.domain.toLowerCase())) {
        continue;
      }

      if (!matchesSearch(company, term)) {
        continue;
      }

      companies.push(company);
    }

    return companies.sort(
      (left, right) =>
        right.productCount - left.productCount || left.name.localeCompare(right.name)
    );
  } catch (error) {
    console.error("[companies] falling back to tracked competitors:", error);
    return trackedFallback;
  }
}
