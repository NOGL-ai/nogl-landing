const { Prisma, PrismaClient } = require("@prisma/client");

type CompetitorRow = {
  id: string;
  name: string;
  domain: string;
  slug: string | null;
  country_code: string | null;
  locale: string | null;
  website: string | null;
};

function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

function normalizeWebsite(website: string): string {
  return website.trim().replace(/\/+$/, "");
}

function extractHostname(value: string): string | null {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  try {
    return new URL(normalizedValue).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    const normalizedDomain = normalizeDomain(normalizedValue);
    return normalizedDomain || null;
  }
}

function isShortKey(value: string): boolean {
  return !value.includes(".");
}

// Keep this logic aligned with src/lib/companies/helpers.ts
function slugify(domain: string): string {
  return normalizeDomain(domain)
    .replace(/\./g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// Keep this logic aligned with src/lib/companies/helpers.ts
function deriveCountryFromDomain(domain: string): string {
  const normalized = normalizeDomain(domain);

  if (normalized.endsWith(".co.uk")) return "GB";
  if (normalized.endsWith(".de")) return "DE";
  if (normalized.endsWith(".fr")) return "FR";
  if (normalized.endsWith(".at")) return "AT";
  if (normalized.endsWith(".ch")) return "CH";
  if (normalized.endsWith(".nl")) return "NL";
  if (normalized.endsWith(".pl")) return "PL";
  if (normalized.endsWith(".it")) return "IT";
  if (normalized.endsWith(".es")) return "ES";
  if (normalized.endsWith(".com")) return "US";

  return "US";
}

async function main() {
  const prisma = new PrismaClient();

  try {
    const competitors = (await prisma.$queryRaw(Prisma.sql`
      SELECT
        id,
        name,
        domain,
        slug,
        country_code,
        locale,
        website
      FROM nogl."Competitor"
      WHERE "deletedAt" IS NULL
      ORDER BY name ASC
    `)) as CompetitorRow[];

    for (const competitor of competitors) {
      const resolvedWebsite =
        competitor.website && competitor.website.trim().length > 0
          ? normalizeWebsite(competitor.website)
          : `https://${normalizeDomain(competitor.domain)}`;
      const websiteHostname = competitor.website ? extractHostname(competitor.website) : null;
      const domain = websiteHostname ?? competitor.domain.trim().toLowerCase();
      const slug = isShortKey(domain)
        ? competitor.slug ?? slugify(domain)
        : slugify(domain);
      const countryCode = competitor.country_code ?? deriveCountryFromDomain(domain);
      const sourceKey = competitor.slug ?? competitor.id;

      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO nogl."Company" (
          id,
          slug,
          name,
          domain,
          country_code,
          locale,
          website,
          source_key,
          industry,
          product_types,
          dataset_quality_score,
          tracking_status,
          tracked_competitor_id,
          wm_key,
          arango_id,
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${competitor.id},
          ${slug},
          ${competitor.name},
          ${domain},
          ${countryCode},
          ${competitor.locale},
          ${resolvedWebsite},
          ${sourceKey},
          NULL,
          ARRAY[]::text[],
          NULL,
          ${Prisma.sql`'TRACKED'::nogl."CompanyTrackingStatus"`},
          ${competitor.id},
          NULL,
          NULL,
          NOW(),
          NOW()
        )
        ON CONFLICT (domain) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          country_code = EXCLUDED.country_code,
          locale = EXCLUDED.locale,
          website = EXCLUDED.website,
          source_key = EXCLUDED.source_key,
          industry = EXCLUDED.industry,
          product_types = EXCLUDED.product_types,
          dataset_quality_score = EXCLUDED.dataset_quality_score,
          tracking_status = EXCLUDED.tracking_status,
          tracked_competitor_id = EXCLUDED.tracked_competitor_id,
          wm_key = EXCLUDED.wm_key,
          arango_id = EXCLUDED.arango_id,
          "updatedAt" = NOW()
      `);
    }

    console.log(`Seeded ${competitors.length} companies`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(async (error: unknown) => {
  console.error(error);
  process.exit(1);
});
