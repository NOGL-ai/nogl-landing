# Import Data Strategy — Full Research

_Compiled from background research agent output. Final recommendation: ruthless MVP (CSV + Excel + wizard), 3 targeted connectors in v2, strategic cuts._

---

## Executive summary — brutal skip list up front

**Skip entirely:**
- **Fivetran / Stitch** — MAR pricing kills unit economics at SMB scale
- **Kafka / Debezium** — Series-B infra, overkill
- **SAP Business One direct** — accept DATEV exports instead
- **PrestaShop / Magento 2 / BigCommerce / Odoo** — on-demand only (do it when a customer asks)
- **Idealo / Geizhals** — wrong direction (you're the one pricing to them, not ingesting from them)
- **Carrier APIs (DHL/DPD/Hermes/GLS)** — go via WMS integration, not direct
- **Zapier custom app** — ship public REST + API keys and let power users wire Zapier themselves

---

## Ship order

### MVP (weeks 1-2)

- CSV + Excel drag-drop wizard with **7 data-kind templates** (sales history, inventory snapshot, product catalog, supplier list, purchase orders, returns, customer list)
- BullMQ workers on existing Redis for async processing
- Saved `FieldMapping` per tenant per source → subsequent imports auto-map
- Error drawer with per-row validation errors
- Streaming Papa Parse + encoding auto-detect (DE Windows-1252 / `;` delimiter)

### v2 (months 2-3)

- **Shopware 6** (most popular German e-commerce platform, 8-12 days)
- **Amazon SP-API** (marketplaces critical for German retailers, 10 days + Meta Ads Library style auth)
- **Inbound webhook receiver** (`POST /api/ingest/webhook/:tenantId/:source` with HMAC)
- **Public REST + API keys** (let ops teams push from their own scripts)
- **SFTP drop** (enterprise operators with existing nightly feeds)

### v3 (month 4+)

- **DATEV** file ingestion (accept CSV exports, not direct API — 4-6 days)
- **JTL-Wawi** (widely used German WMS — cloud REST 10-12d, on-prem Windows agent +10d)
- **Pixi WMS** (SOAP under NDA, 15-20d, enterprise only)
- **Shopify** (when first Shopify customer signs)
- **Google Sheets** (on-demand)
- **S3 signed-URL upload** (large files >500MB)

### v4+

On-demand only: Magento 2, BigCommerce, PrestaShop, Odoo, WooCommerce.

---

## Per-integration scorecards

Legend: scores 1-5 on Reach (% of DE photo retail stack coverage) / Build-days / Op-setup-effort / Maint / Cost / Scale / TOS-risk. Verdict: BUILD-MVP / BUILD-v2 / BUILD-v3 / ON-DEMAND / SKIP.

### File-based

| # | Option | Reach | Days | Op-setup | Maint | Cost | Scale | TOS | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 1 | CSV drag-drop | 5 | 3 | 5 | 5 | 5 | 4 | 5 | **BUILD-MVP** |
| 2 | Excel (.xlsx) | 5 | 2 | 5 | 5 | 5 | 3 | 5 | **BUILD-MVP** |
| 3 | Google Sheets | 3 | 3 | 3 | 3 | 5 | 4 | 4 | BUILD-v3 |
| 4 | FTP / SFTP drop | 2 | 4 | 2 | 4 | 4 | 5 | 5 | BUILD-v2 |
| 5 | S3 signed URL | 1 | 2 | 1 | 5 | 4 | 5 | 5 | BUILD-v3 |

### E-commerce connectors

| # | Option | Reach | Days | Op-setup | Maint | Cost | Scale | TOS | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 6 | **Shopware 6** (DE) | 4 | 10 | 3 | 3 | 3 | 5 | 4 | **BUILD-v2** |
| 7 | Shopify | 2 | 4 | 4 | 4 | 3 | 5 | 4 | BUILD-v3 |
| 8 | WooCommerce | 1 | 5 | 3 | 3 | 4 | 3 | 4 | ON-DEMAND |
| 9 | Magento 2 | 1 | 8 | 2 | 2 | 3 | 4 | 4 | ON-DEMAND |
| 10 | BigCommerce | 1 | 4 | 3 | 4 | 3 | 4 | 4 | ON-DEMAND |
| 11 | PrestaShop | 2 | 6 | 2 | 2 | 4 | 3 | 4 | ON-DEMAND |

### Marketplace connectors

| # | Option | Reach | Days | Op-setup | Maint | Cost | Scale | TOS | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 12 | **Amazon SP-API** | 4 | 12 | 2 | 3 | 3 | 5 | 3 | **BUILD-v2** |
| 13 | eBay Sell API | 2 | 5 | 3 | 3 | 4 | 4 | 4 | BUILD-v3 |
| 14 | Idealo / Geizhals | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **SKIP** (wrong direction) |

### ERP / Accounting

| # | Option | Reach | Days | Op-setup | Maint | Cost | Scale | TOS | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 15 | SAP B1 / ByDesign | 2 | 15 | 1 | 2 | 2 | 4 | 3 | **SKIP** (accept exports) |
| 16 | MS Dynamics 365 BC | 1 | 10 | 2 | 3 | 3 | 5 | 4 | ON-DEMAND |
| 17 | **DATEV** (DE) | 3 | 6 | 3 | 4 | 5 | 4 | 5 | **BUILD-v3 (accept exports, no API)** |
| 18 | Xero / QuickBooks | 1 | 5 | 4 | 4 | 4 | 4 | 4 | SKIP (not DE-relevant) |
| 19 | Odoo | 1 | 7 | 3 | 2 | 4 | 4 | 4 | ON-DEMAND |

### Logistics / 3PL

| # | Option | Reach | Days | Op-setup | Maint | Cost | Scale | TOS | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 20 | DHL/DPD/Hermes/GLS | 1 | 10 | 2 | 2 | 3 | 4 | 4 | **SKIP** (via WMS) |
| 21 | ShipStation / ShipHero | 1 | 4 | 3 | 4 | 3 | 4 | 4 | ON-DEMAND |
| 22 | **JTL-Wawi** (DE) | 3 | 12 | 2 | 2 | 4 | 5 | 4 | **BUILD-v3** |
| — | Pixi | 2 | 18 | 1 | 2 | 2 | 5 | 3 | BUILD-v3 (enterprise only) |

### Managed ingestion platforms

| # | Option | Reach | Days | Op-setup | Maint | Cost | Scale | TOS | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 23 | **Airbyte** | 4 | 15 (self-host) | 3 | 3 | 4 | 5 | 5 | **DEFER until 50+ tenants** |
| 24 | Fivetran | 3 | 5 | 5 | 5 | 1 | 5 | 5 | **SKIP** (MAR pricing) |
| 25 | Stitch Data | 3 | 5 | 4 | 4 | 2 | 4 | 4 | SKIP |
| 26 | Hevo Data | 3 | 5 | 4 | 4 | 3 | 4 | 4 | ON-DEMAND |
| 27 | Meltano / Singer taps | 2 | 10 | 2 | 2 | 5 | 4 | 5 | SKIP (copy philosophy) |

### Programmatic / API

| # | Option | Reach | Days | Op-setup | Maint | Cost | Scale | TOS | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 28 | **Webhooks (inbound)** | 4 | 4 | 3 | 4 | 5 | 5 | 5 | **BUILD-v2** |
| 29 | **Public REST + API keys** | 4 | 5 | 3 | 5 | 5 | 5 | 5 | **BUILD-v2** |
| 30 | GraphQL bulk mutations | 2 | 7 | 2 | 4 | 5 | 4 | 5 | ON-DEMAND |
| 31 | Zapier custom app | 2 | 10 | 4 | 3 | 3 | 4 | 4 | **SKIP** (let power users wire) |

### Streaming / CDC

| # | Option | Reach | Days | Op-setup | Maint | Cost | Scale | TOS | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 32 | Postgres logical replication | 1 | 10 | 1 | 3 | 4 | 5 | 3 | SKIP (customer won't allow) |
| 33 | Kafka / Debezium | 1 | 20 | 1 | 2 | 2 | 5 | 5 | **SKIP** (Series-B infra) |

---

## 5-step wizard UX

Copies the pattern from Stripe Dashboard / HubSpot / Shopify admin / Linear / Airtable:

```
Step 1: Choose data kind
┌─────────────────────────────────────────────────────────┐
│  What are you importing?                                 │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐ │
│  │  Sales    │ │ Inventory │ │ Products  │ │Suppliers │ │
│  │  history  │ │ snapshots │ │ catalog   │ │          │ │
│  │ [Download │ │ [Download │ │ [Download │ │[Download │ │
│  │ template] │ │ template] │ │ template] │ │template] │ │
│  └───────────┘ └───────────┘ └───────────┘ └──────────┘ │
│  ┌───────────┐ ┌───────────┐ ┌──────────────────────┐  │
│  │ Purchase  │ │ Returns   │ │  Customer list       │  │
│  │ orders    │ │           │ │  (privacy sensitive) │  │
│  └───────────┘ └───────────┘ └──────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Step 2: Upload**
- Drag-drop zone (hero) + "Choose file" button
- Streaming **Papa Parse** for CSV (handles 100MB+ files)
- **ExcelJS** for .xlsx (not SheetJS — Apache license + supply-chain concerns)
- Encoding + delimiter auto-detection (DE Windows-1252 / `;` delimiter are the default in German Excel)
- File preview: first 3 rows + column count

**Step 3: Map columns**
- Left column: detected source headers
- Right column: expected target fields
- Auto-map using:
  - Levenshtein distance
  - **German alias dictionary**: Artikelnummer → sku, Lagerbestand → stock, Einkaufspreis → cogs, Bestand → inventory, etc.
- Confidence indicator per auto-match
- "Save this mapping" toggle → persists `FieldMapping` for future imports
- Dropdown per source field to change target

**Step 4: Preview & validate**
- Show first 20 rows with inline validation
- Error chips in-row: "Invalid date", "Duplicate SKU", "Unknown supplier reference"
- Filter bar: All / With errors / Warnings only
- Dedupe prompt: "5 SKUs already exist. Skip / Overwrite / Merge?"

**Step 5: Confirm & import**
- Progress bar via SSE
- Row counter: "1,245 / 12,000 processed"
- "Undo" button during first 60s (BullMQ-level cancel)
- Email on completion if >30s
- Error report download (CSV of failed rows + reasons)

---

## Prisma data model

```prisma
model ImportSource {
  id               String          @id @default(cuid())
  tenantId         String
  sourceType       ImportSourceType // FILE | WEBHOOK | API | PULL
  connector        String?          // "shopware_6" | "amazon_sp_api" | null for FILE
  name             String           // operator-set label
  config           Json             // connector-specific creds/config
  fieldMapping     Json?            // persisted auto-map for repeats
  isActive         Boolean          @default(true)
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  runs             ImportRun[]

  @@schema("imports")
}

model ImportRun {
  id                  String        @id @default(cuid())
  tenantId            String
  sourceId            String
  kind                ImportKind    // SALES | INVENTORY | PRODUCTS | SUPPLIERS | POS | RETURNS | CUSTOMERS
  status              ImportRunStatus // QUEUED | RUNNING | COMPLETED | FAILED | CANCELLED | ROLLED_BACK
  startedAt           DateTime      @default(now())
  completedAt         DateTime?
  totalRows           Int           @default(0)
  successRows         Int           @default(0)
  errorRows           Int           @default(0)
  idempotencyKey      String?       @unique
  sourceFingerprint   String?       // hash of source file for "same file?" detect
  revertOfRunId       String?       // set when this is a rollback of another run

  source              ImportSource  @relation(fields: [sourceId], references: [id])
  errors              ImportError[]

  @@index([tenantId, kind, startedAt])
  @@schema("imports")
}

model ImportError {
  id              String     @id @default(cuid())
  runId           String
  rowNumber       Int
  field           String?
  errorCode       String     // "INVALID_DATE" | "DUPLICATE_SKU" | "UNKNOWN_REFERENCE"
  message         String
  rawRow          Json

  run             ImportRun  @relation(fields: [runId], references: [id], onDelete: Cascade)

  @@index([runId])
  @@schema("imports")
}

model FieldMapping {
  id              String   @id @default(cuid())
  tenantId        String
  sourceId        String
  kind            ImportKind
  mapping         Json     // { sourceHeader: targetField }
  createdAt       DateTime @default(now())

  @@unique([sourceId, kind])
  @@schema("imports")
}

enum ImportKind {
  SALES
  INVENTORY
  PRODUCTS
  SUPPLIERS
  POS
  RETURNS
  CUSTOMERS
  @@schema("imports")
}

enum ImportSourceType {
  FILE
  WEBHOOK
  API
  PULL
  @@schema("imports")
}

enum ImportRunStatus {
  QUEUED
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
  ROLLED_BACK
  @@schema("imports")
}
```

---

## Library picks

- **CSV**: **Papa Parse** (streaming, best in class)
- **Excel**: **ExcelJS** (Apache license, actively maintained) — NOT SheetJS (supply-chain concerns)
- **Validation**: **Zod** + `zod-to-json-schema` (export schemas for API consumers)
- **Queue**: **BullMQ** on existing Redis
- **Large imports (>10M rows)**: `pg-copy-streams` with Postgres COPY
- **Worker**: NOT Vercel serverless (15-min timeout). Use a separate Railway/Fly worker service pointed at the same BullMQ queue.

---

## Airbyte-specific call

**Self-hosted Airbyte — defer until 50+ tenants AND 3+ long-tail connectors needed.**

What to do NOW: **copy Airbyte's connector interface philosophy** (`check` / `discover` / `read` / `write`) in your own `ImportSource` abstraction. Your `ImportSource.connector` enum is the Airbyte "source type" pattern; `config` is their JSON config. If you ever adopt Airbyte later, your data model is already compatible.

**Never Fivetran** — MAR (Monthly Active Rows) pricing kills unit economics for SMB SaaS.

---

## Webhook ingestion pattern

```
POST /api/ingest/webhook/:tenantId/:source
Headers:
  X-Nogl-Signature: <HMAC-SHA256 of body>
  X-Idempotency-Key: <uuid>

Flow:
  1. Verify HMAC (per-source secret, not shared)
  2. Check idempotency (Redis SET NX EX 30d)
  3. Return 202 within 100ms (ack only)
  4. Enqueue BullMQ job for actual processing
  5. Log raw payload to S3 for replay
  6. On processing: upsert to Prisma, emit alert on errors

Retry behavior (for outbound webhooks, TBD):
  Svix-style curve: 10s, 30s, 2m, 5m, 30m, 2h, 5h, 10h, 14h
  Stop after 3 days
```

**Hard rules:**
- Never shared secret across sources (per-source HMAC key)
- Always 202 + enqueue (don't process inline)
- Raw payload to S3 for replay
- 30-day idempotency window

---

## DE deep dive — the 3 integrations that matter

### Shopware 6 (BUILD-v2)

- OAuth client credentials flow
- Custom-field mapping is unavoidable (every Shopware instance has custom product attributes)
- Use `shopware-api-client` npm package or raw `fetch` against the Admin API
- 8-12 days implementation

### DATEV (BUILD-v3 as file import)

- **Skip the DATEV API** — requires DATEV partnership + code signing
- Instead: **accept DATEV export files** (Windows-1252 encoded, `;` delimited)
- Standard DATEV Buchungsstapel format documented publicly
- 4-6 days to build CSV importer with DATEV-specific column mapping

### JTL-Wawi (BUILD-v3)

- **Cloud REST** (JTL Wawi Cloud) — 10-12d
- **On-prem Windows** — need a Windows agent service the customer installs on their JTL server. +10d. Avoid unless enterprise demands it.

---

## Progressive disclosure

**90% of retailers will just upload a CSV. Make that one path excellent; hide connectors behind "Advanced sources."**

Hero UI:
```
┌──────────────────────────────────────────────────┐
│ Drop your CSV or Excel file here                  │
│ [Select file]  or  [Download templates]           │
│                                                    │
│ What data are you importing? [Sales history ▾]   │
└──────────────────────────────────────────────────┘

[+ Advanced sources] (collapsed drawer)
  └─ Shopware · Amazon · Webhooks · SFTP · API keys
```

Fight for the drop zone. Every pixel spent on connector chrome slows down the 90% path.

---

## Open questions for the founder

1. **Customer mix.** What % are expected to use CSV vs. connector? If >70% CSV, don't bother with Shopware v2.
2. **Real data volumes.** Rows/import for sales history? 1M? 10M? 100M? Determines worker sizing.
3. **Self-serve vs CSM-led onboarding.** If CSM-led, connectors matter less (CSM can help with CSV).
4. **GoBD / audit compliance.** Do imports need to be tamper-evident for German audit law? If yes, `ImportRun` gets a crypto-sign.
5. **Tenant isolation.** Can data from Shopware instance X accidentally land in tenant Y? Build-time prevention or runtime check?
6. **Pricing model.** Are connectors a paid upgrade? Affects v2 priority.
7. **Undo semantics.** Does rollback un-do subsequent forecasts, too? Or just raw data rows?
8. **Year-2 integrations staffing.** Who maintains Shopware 6 when they push a breaking change? In-house or vendor-owned?

## Sources

- [Papa Parse](https://www.papaparse.com/)
- [ExcelJS](https://github.com/exceljs/exceljs)
- [BullMQ docs](https://docs.bullmq.io/)
- [Shopware 6 Admin API](https://developer.shopware.com/docs/resources/references/core-reference/admin-api-reference)
- [Amazon SP-API](https://developer-docs.amazon.com/sp-api/)
- [DATEV Format](https://developer.datev.de/en/datev-api-platform/documentation)
- [JTL-Wawi](https://jtl-software.com/jtl-wawi)
- [Airbyte connector SDK](https://docs.airbyte.com/connector-development/)
- [pg-copy-streams](https://github.com/brianc/node-pg-copy-streams)
