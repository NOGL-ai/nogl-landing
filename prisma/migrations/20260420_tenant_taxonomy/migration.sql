-- Migration: Add Tenant model with human-readable slug IDs
-- Each Company/Brand becomes its own Tenant with id = slug (e.g. "calumet_de")

-- 1. Create the Tenant table in the assets schema
CREATE TABLE IF NOT EXISTS assets."Tenant" (
  "id"        TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "companyId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_companyId_key" ON assets."Tenant"("companyId");

-- 2. Seed Tenant rows from existing Company records (slug with _ instead of -)
INSERT INTO assets."Tenant" ("id", "name", "companyId")
SELECT
  REPLACE(slug, '-', '_') AS "id",
  name,
  id AS "companyId"
FROM nogl."Company"
ON CONFLICT ("id") DO NOTHING;

-- 3. Drop the old FK from MarketingAsset.tenantId → nogl.Company
ALTER TABLE assets."MarketingAsset" DROP CONSTRAINT IF EXISTS "MarketingAsset_tenantId_fkey";

-- 4. Update each asset's tenantId to the brand's own Tenant slug
--    (brand is its own tenant; each brand's data belongs to its tenant workspace)
UPDATE assets."MarketingAsset" ma
SET "tenantId" = t."id"
FROM assets."Tenant" t
WHERE t."companyId" = ma."brandId";

-- 5. Any remaining assets whose brandId didn't match (shouldn't happen), assign to
--    the tenant whose companyId matches the OLD tenantId
UPDATE assets."MarketingAsset" ma
SET "tenantId" = t."id"
FROM assets."Tenant" t
WHERE t."companyId" = ma."tenantId"
  AND ma."tenantId" != t."id";  -- only rows not yet updated

-- 6. Add FK from MarketingAsset.tenantId → assets.Tenant.id
ALTER TABLE assets."MarketingAsset"
  ADD CONSTRAINT "MarketingAsset_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES assets."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7. Drop the old FK from AssetCaptureRun.tenantId → nogl.Company (if any)
ALTER TABLE assets."AssetCaptureRun" DROP CONSTRAINT IF EXISTS "AssetCaptureRun_tenantId_fkey";

-- 8. Update AssetCaptureRun tenantId the same way
UPDATE assets."AssetCaptureRun" acr
SET "tenantId" = t."id"
FROM assets."Tenant" t
WHERE t."companyId" = acr."brandId";

-- 9. Add FK from AssetCaptureRun.tenantId → assets.Tenant.id
ALTER TABLE assets."AssetCaptureRun"
  ADD CONSTRAINT "AssetCaptureRun_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES assets."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
