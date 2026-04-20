# Forecast / Demand — migration + seed runbook

This feature adds 6 new Prisma models (`ForecastTenant`, `ForecastSaleChannel`,
`ForecastProduct`, `ForecastVariant`, `ForecastHistoricalSale`,
`ForecastQuantile`) plus a back-relation on `Company`. No existing column is
altered and no data is destroyed — the migration is pure additive DDL
(`CREATE TABLE`, `CREATE INDEX`, `ADD CONSTRAINT`).

Run these steps on a machine with `DATABASE_URL` and `DIRECT_URL` populated
(the worktree shell used to build this slice has neither; that is why the
migration is shipped as code, not as a generated SQL file).

## 1. Inspect what will change before applying

```bash
# Compare the working schema against the live DB without writing anything:
npm run db:migrate:reset -- --dry-run    # DO NOT run this — shown only to name the dangerous one
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --script > /tmp/forecast.sql

# Read the SQL before applying:
less /tmp/forecast.sql
```

Expected content: `CREATE TABLE "public"."ForecastTenant"`, `CREATE TABLE
"public"."ForecastProduct"`, etc., plus their indexes and FKs. No `DROP`,
`ALTER`, or `TRUNCATE` statements should appear. If any do, stop and
investigate — the schema block was not written to be destructive.

## 2. Create the migration file (review-only)

```bash
npx prisma migrate dev --create-only --name add_forecast_models
```

`--create-only` generates `prisma/migrations/<ts>_add_forecast_models/migration.sql`
without applying it. Diff the generated SQL against `/tmp/forecast.sql` from
step 1; they should match.

## 3. Apply on dev

```bash
npx prisma migrate dev
npx prisma generate
```

## 4. Apply on prod

```bash
npx prisma migrate deploy
```

## 5. Download the demo dataset

See [`scripts/data/README.md`](../scripts/data/README.md). The seed requires
`scripts/data/fujifilm-instax.csv` and will fail fast with a pointer to the
README if missing.

## 6. Seed demo data

```bash
npm run seed:forecast-demo          # idempotent — re-runnable
npm run seed:forecast-demo:wipe     # tenant-scoped wipe, then re-seed
```

`--wipe` only deletes rows where `tenantId` matches the Calumet demo tenant.
It never issues `DROP TABLE` or `TRUNCATE`.

## 7. Sanity check counts

```bash
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();Promise.all([p.forecastProduct.count(),p.forecastVariant.count(),p.forecastHistoricalSale.count(),p.forecastQuantile.count()]).then(r=>console.log({products:r[0],variants:r[1],historical:r[2],quantiles:r[3]})).finally(()=>p.\$disconnect())"
```

## 8. Open the page

Start the dev server (`npm run dev`) and visit `http://localhost:3000/en/demand`.
The sidebar now has a **Demand Forecast** entry under the `(app)` layout.

## Rollback

If something goes wrong after step 3, the schema block is isolated: no
existing model was modified. To roll back:

```bash
# Manual DROP in order, on a dev DB only:
DROP TABLE "public"."ForecastQuantile" CASCADE;
DROP TABLE "public"."ForecastHistoricalSale" CASCADE;
DROP TABLE "public"."ForecastVariant" CASCADE;
DROP TABLE "public"."ForecastProduct" CASCADE;
DROP TABLE "public"."ForecastSaleChannel" CASCADE;
DROP TABLE "public"."ForecastTenant" CASCADE;
-- then:
npx prisma migrate resolve --rolled-back add_forecast_models
```

Never run those DROPs on prod without a backup and a reason.
