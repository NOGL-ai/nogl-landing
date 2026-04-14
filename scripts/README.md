# NOGL Data Pipeline Scripts

## Flow
scraper (scrapy-boilerplate) -> fashion_rag.scraping.scraped_items
                              ↓ bridge script
nogl_landing.public.products  ↓ snapshot script
nogl.CompanySnapshot          ↓ API routes
/api/companies/[slug]         ↓ UI
/en/companies/[slug] Overview tab

## Scripts

### seed-companies-from-competitors.ts
Bootstraps nogl.Company from nogl.Competitor rows.
Run once after adding new competitors.

```bash
npx ts-node --project tsconfig.json scripts/seed-companies-from-competitors.ts
```

### bridge-scraped-items-to-products.ts
Bridges fresh scrape data from fashion_rag into public.products.
Run after every scrape batch, or on a schedule.

```bash
npx ts-node --project tsconfig.json scripts/bridge-scraped-items-to-products.ts
npx ts-node --project tsconfig.json scripts/bridge-scraped-items-to-products.ts --domain calumet.de
```

### snapshot-companies.ts
Aggregates public.products into nogl.CompanySnapshot.
Run after bridge script completes.

```bash
npx ts-node --project tsconfig.json scripts/snapshot-companies.ts
npx ts-node --project tsconfig.json scripts/snapshot-companies.ts --domain calumet.de
```

## Recommended run order (per scrape batch)
1. `cd scrapy-boilerplate && scrapy crawl universal -a site=calumet`
2. `cd nogl-landing && npx ts-node --project tsconfig.json scripts/bridge-scraped-items-to-products.ts --domain calumet.de`
3. `cd nogl-landing && npx ts-node --project tsconfig.json scripts/snapshot-companies.ts --domain calumet.de`

## Refreshing price_distribution
After updating the snapshot script, re-run for all companies:

```bash
npx ts-node --project tsconfig.json scripts/snapshot-companies.ts
```

Or for a single domain:

```bash
npx ts-node --project tsconfig.json scripts/snapshot-companies.ts --domain calumet.de
```
