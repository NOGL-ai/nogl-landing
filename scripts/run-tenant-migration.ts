import { prisma } from "@/lib/prismaDb";
import { readFileSync } from "fs";

async function main() {
  // Step 1: Create Tenant table
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS assets."Tenant" (
      "id"        TEXT NOT NULL,
      "name"      TEXT NOT NULL,
      "companyId" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
    )`
  );
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_companyId_key" ON assets."Tenant"("companyId")`
  );
  console.log("created Tenant table");

  // Step 2: Seed from Company
  const inserted = await prisma.$executeRawUnsafe(
    `INSERT INTO assets."Tenant" ("id", "name", "companyId")
     SELECT REPLACE(slug, '-', '_'), name, id FROM nogl."Company"
     ON CONFLICT ("id") DO UPDATE SET name = EXCLUDED.name, "companyId" = EXCLUDED."companyId"`
  );
  console.log("seeded tenants:", inserted);

  const tenants = await prisma.$queryRawUnsafe<Array<{id: string; name: string}>>(
    `SELECT id, name FROM assets."Tenant" ORDER BY id`
  );
  for (const t of tenants) console.log(" ", t.id, "→", t.name);

  // Step 3: Drop old FK
  await prisma.$executeRawUnsafe(
    `ALTER TABLE assets."MarketingAsset" DROP CONSTRAINT IF EXISTS "MarketingAsset_tenantId_fkey"`
  );
  console.log("dropped old MarketingAsset FK");

  // Step 4: Update tenantId = brand's own tenant slug
  const updated = await prisma.$executeRawUnsafe(
    `UPDATE assets."MarketingAsset" ma
     SET "tenantId" = t."id"
     FROM assets."Tenant" t
     WHERE t."companyId" = ma."brandId"`
  );
  console.log("updated MarketingAsset rows:", updated);

  const bad = await prisma.$queryRawUnsafe<Array<{count: string}>>(
    `SELECT COUNT(*)::text AS count FROM assets."MarketingAsset"
     WHERE "tenantId" NOT IN (SELECT id FROM assets."Tenant")`
  );
  console.log("bad tenantId rows remaining:", bad[0]?.count);

  // Step 5: Add new FK
  await prisma.$executeRawUnsafe(
    `ALTER TABLE assets."MarketingAsset"
       ADD CONSTRAINT "MarketingAsset_tenantId_fkey"
       FOREIGN KEY ("tenantId") REFERENCES assets."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE`
  );
  console.log("added new MarketingAsset FK");

  // Step 6: Drop old FK for AssetCaptureRun (if exists)
  await prisma.$executeRawUnsafe(
    `ALTER TABLE assets."AssetCaptureRun" DROP CONSTRAINT IF EXISTS "AssetCaptureRun_tenantId_fkey"`
  );

  // Step 7: Update AssetCaptureRun
  const updatedRuns = await prisma.$executeRawUnsafe(
    `UPDATE assets."AssetCaptureRun" acr
     SET "tenantId" = t."id"
     FROM assets."Tenant" t
     WHERE t."companyId" = acr."brandId"`
  );
  console.log("updated AssetCaptureRun rows:", updatedRuns);

  // Step 8: Add FK for AssetCaptureRun
  await prisma.$executeRawUnsafe(
    `ALTER TABLE assets."AssetCaptureRun"
       ADD CONSTRAINT "AssetCaptureRun_tenantId_fkey"
       FOREIGN KEY ("tenantId") REFERENCES assets."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE`
  );
  console.log("added AssetCaptureRun FK");

  console.log("\nMigration complete!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("MIGRATION FAILED:", e.message);
  process.exit(1);
});
