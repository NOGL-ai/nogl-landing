import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CALUMET_COMPANY_ID = "cmnw4qqo10000ltccgauemneu";

const DEFAULT_COMPETITOR_SLUGS = [
  "foto-erhardt-de",
  "fotokoch-de",
  "foto-leistenschneider-de",
  "kamera-express-de",
  "teltec-de",
];

async function main() {
  // Verify the tenant company exists before seeding
  const calumet = await prisma.company.findUnique({
    where: { id: CALUMET_COMPANY_ID },
    select: { id: true, name: true },
  });
  if (!calumet) {
    console.error(
      `Calumet company (${CALUMET_COMPANY_ID}) not found in the database. ` +
      `Run the companies seed first or verify the CALUMET_COMPANY_ID constant.`
    );
    process.exit(1);
  }
  console.log(`Tenant: ${calumet.name} (${calumet.id})`);

  const competitors = await prisma.company.findMany({
    where: { slug: { in: DEFAULT_COMPETITOR_SLUGS } },
    select: { id: true, slug: true, name: true },
  });

  if (competitors.length === 0) {
    console.error(
      "No competitor companies found. Run seed-companies-from-competitors.ts first."
    );
    process.exit(1);
  }

  console.log(`Found ${competitors.length} competitor companies to track.`);

  for (const [i, competitor] of competitors.entries()) {
    await prisma.trackedCompetitor.upsert({
      where: {
        tenantCompanyId_competitorId: {
          tenantCompanyId: CALUMET_COMPANY_ID,
          competitorId: competitor.id,
        },
      },
      create: {
        tenantCompanyId: CALUMET_COMPANY_ID,
        competitorId: competitor.id,
        priority: i,
        status: "ACTIVE",
      },
      update: { status: "ACTIVE" },
    });
    console.log(`  ✓ Tracking ${competitor.name} (slug: ${competitor.slug})`);
  }

  console.log("\nDone. Seeded tracked competitors for Calumet.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
