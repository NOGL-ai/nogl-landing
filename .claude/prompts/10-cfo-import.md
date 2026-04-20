# Build /en/fractional-cfo/import — CSV+Excel wizard + Shopware/Amazon connectors (v2)

## Goal

Replace "Coming soon" stub with a real import wizard. MVP is a drag-drop CSV/Excel flow covering 7 data kinds with column mapping + validation preview + error reports. Connectors (Shopware 6, Amazon SP-API, DATEV file import) ship in v2. Airbyte explicitly RULED OUT.

## Reference material — READ FIRST

`.claude/research/import-data-strategy.md` — full 33-option scorecard, ruthless cut list, wizard UX flow, Prisma model sketches, DE-specific deep dive on Shopware/DATEV/JTL-Wawi, and open questions.

## Ship order

### MVP (weeks 1-2) — THIS PROMPT
- 5-step drag-drop wizard (choose kind → upload → map columns → preview → confirm)
- CSV (Papa Parse streaming) + Excel (ExcelJS) + Google Sheets (via paste-link API)
- 7 data kinds with downloadable templates: sales history, inventory snapshots, product catalog, suppliers, purchase orders, returns, customers
- Saved `FieldMapping` for repeat imports
- Zod validation + inline row-level errors
- BullMQ worker on existing Redis

### v2 (separate future prompts)
- Shopware 6 OAuth connector (the most common DE e-commerce platform)
- Amazon SP-API connector (LWA auth, regulated dev program)
- Inbound webhook receiver (generic per-source HMAC-signed)
- Public REST + API keys (let power users script their own imports)

### v3+ (defer)
- DATEV (file import only, no API)
- JTL-Wawi (cloud REST + on-prem Windows agent)
- Shopify, WooCommerce, Magento — ON-DEMAND only

### Ruled out
- Airbyte (no Google-Trends-style source connector, wrong tool for Puppeteer-based scrapers — same reasoning applies to any custom non-REST source)
- Fivetran / Stitch — MAR pricing kills SMB unit economics

## Prisma additions

```prisma
enum ImportKind {
  SALES_HISTORY
  INVENTORY_SNAPSHOT
  PRODUCT_CATALOG
  SUPPLIERS
  PURCHASE_ORDERS
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

model ImportSource {
  id           String           @id @default(cuid())
  tenantId     String
  sourceType   ImportSourceType
  connector    String?          // "shopware_6" | "amazon_sp_api" | null for FILE
  name         String
  config       Json             // connector-specific creds/config
  fieldMapping Json?            // persisted auto-map for repeats
  isActive     Boolean          @default(true)
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  runs         ImportRun[]

  @@index([tenantId])
  @@schema("imports")
}

model ImportRun {
  id                String          @id @default(cuid())
  tenantId          String
  sourceId          String
  kind              ImportKind
  status            ImportRunStatus
  startedAt         DateTime        @default(now())
  completedAt       DateTime?
  totalRows         Int             @default(0)
  successRows       Int             @default(0)
  errorRows         Int             @default(0)
  idempotencyKey    String?         @unique
  sourceFingerprint String?         // hash of source file for repeat detection
  revertOfRunId     String?

  source            ImportSource    @relation(fields: [sourceId], references: [id])
  errors            ImportError[]

  @@index([tenantId, kind, startedAt])
  @@schema("imports")
}

model ImportError {
  id        String    @id @default(cuid())
  runId     String
  rowNumber Int
  field     String?
  errorCode String    // "INVALID_DATE" | "DUPLICATE_SKU" | ...
  message   String
  rawRow    Json

  run       ImportRun @relation(fields: [runId], references: [id], onDelete: Cascade)

  @@index([runId])
  @@schema("imports")
}

model FieldMapping {
  id        String     @id @default(cuid())
  tenantId  String
  sourceId  String
  kind      ImportKind
  mapping   Json       // { "Artikelnummer": "sku", "Bestand": "stock", ... }
  createdAt DateTime   @default(now())

  @@unique([sourceId, kind])
  @@schema("imports")
}
```

## 5-step wizard UX

### Step 1 — Choose kind

Grid of 7 big cards, each:
- Icon + kind name + short description
- "Download template" button (CSV, pre-filled with 3 example rows matching the expected shape)

### Step 2 — Upload

- Drag-drop zone (hero)
- "Choose file" button
- File preview: detected encoding, delimiter (DE Excel defaults to `;` + Windows-1252), row count

Libraries:
- **Papa Parse** for CSV (streaming, handles 100MB+)
- **ExcelJS** for `.xlsx` (Apache license — prefer over SheetJS)

### Step 3 — Map columns

- Left col: detected source headers
- Right col: expected target fields (from Zod schema per kind)
- **Auto-map** using Levenshtein + German alias dictionary:
  - `Artikelnummer` → `sku`
  - `Lagerbestand` / `Bestand` → `stock`
  - `Einkaufspreis` → `cogs`
  - `VK` / `Verkaufspreis` → `price`
  - `Lieferant` → `supplier_name`
  - `Bestelldatum` → `order_date`
- Show confidence per auto-match
- Dropdown per source header to override target field
- "Save this mapping" toggle → persists `FieldMapping`

### Step 4 — Preview & validate

- First 20 rows displayed with per-column values
- Inline error chips: "Invalid date", "Duplicate SKU", "Unknown supplier"
- Filter bar: All / With errors / No errors
- Dedupe prompt: "12 SKUs already exist. Skip / Overwrite / Merge?"

### Step 5 — Confirm & import

- Progress bar via SSE (`/api/ingest/import/progress/[runId]`)
- "Cancel" button during first 60s (BullMQ `Job.remove()`)
- Row counter: "1,245 / 12,000 processed"
- Error report download (CSV of failed rows + reasons) at end

## Server actions + API

```typescript
// src/actions/import.ts
export async function listRecentImports(tenantId: string): Promise<ImportRun[]>;
export async function createImportRun(input): Promise<{ runId: string }>;
export async function cancelImportRun(runId: string): Promise<void>;
export async function downloadErrorReport(runId: string): Promise<string>;

// src/app/api/ingest/import/upload/route.ts — multipart streaming upload
// src/app/api/ingest/import/progress/[runId]/route.ts — SSE progress stream
```

## Worker

`workers/process-import.ts` (BullMQ on existing Redis):

```typescript
export default async function processImport(job: Job<ImportJobData>) {
  const { runId, fileR2Key, kind, mapping } = job.data;
  const stream = await downloadFromR2(fileR2Key);

  for await (const row of streamRows(stream, kind)) {
    try {
      const normalized = applyMapping(row, mapping);
      const validated = ImportSchemas[kind].parse(normalized);
      await writeTargetRow(validated, kind, tenantId);
      await incrementCounter(runId, 'successRows');
    } catch (e) {
      await prisma.importError.create({ data: { runId, ...extractError(e, row) } });
      await incrementCounter(runId, 'errorRows');
    }

    // Publish progress to Redis for SSE
    if (rowNumber % 100 === 0) await redis.publish(`import:${runId}`, JSON.stringify({ rowNumber }));
  }

  await prisma.importRun.update({ where: { id: runId }, data: { status: 'COMPLETED', completedAt: new Date() } });
}
```

**Important:** don't run on Vercel serverless (15-min timeout). Use a separate worker service (Railway/Fly) pointed at the same BullMQ queue.

## Target-field schemas (per kind)

Zod schemas in `src/lib/import/schemas.ts`:

- `SalesHistorySchema` — `{ saleDate, sku, quantity, revenue, channel }`
- `InventorySnapshotSchema` — `{ snapshotAt, sku, warehouseCode, onHandQty }`
- `ProductCatalogSchema` — `{ sku, title, brand, cogs, msrp, category }`
- `SupplierSchema` — `{ code, name, leadTimeDays, paymentTerms }`
- `PurchaseOrderSchema` — `{ poNumber, supplierCode, orderDate, etaDate, lines: [...] }`
- `ReturnSchema` — `{ returnDate, sku, qty, reason }`
- `CustomerSchema` — `{ email, firstName, lastName, country }` (privacy-sensitive, gated behind ADMIN)

## Acceptance criteria

- [ ] `prisma db push` creates `imports` schema + 4 tables + 3 enums
- [ ] `/en/fractional-cfo/import` loads 5-step wizard
- [ ] Each of 7 data kinds has a working template download
- [ ] Upload a sample CSV → auto-map → preview → import → row count matches expected
- [ ] Persisted mapping: re-import same file format → auto-map uses saved rules
- [ ] DE encoding (Windows-1252) + `;` delimiter detected correctly
- [ ] Error rows downloadable as CSV at end
- [ ] Cancel within 60s rolls back any written rows
- [ ] Typecheck+lint+build pass

## Out of scope (v2+)

- Shopware 6 OAuth connector — separate prompt
- Amazon SP-API — separate prompt
- DATEV file import — separate prompt (v3)
- JTL-Wawi — v3
- Public REST API + API keys — v2
- Webhook ingestion endpoint — v2 (same pattern as Apify webhook)

## Branch + commits

```bash
git checkout -b feature/import-data
```

1. `feat(import): Prisma schema + 3 enums`
2. `feat(import): Zod schemas per data kind`
3. `feat(import): 5-step wizard UI with drag-drop`
4. `feat(import): auto-mapping with Levenshtein + DE aliases`
5. `feat(import): preview + validation + error report`
6. `feat(import): BullMQ worker + SSE progress`
7. `feat(import): cancel + rollback flows`

## Reference files

- Research: `.claude/research/import-data-strategy.md`
- Testing: `.claude/prompts/_TESTING_AND_DATA_APPROACH.md`
- Existing Apify webhook pattern (reuse HMAC signing): `.claude/prompts/03-marketing-assets-expand.md`
- Stub page: `src/app/(site)/[lang]/(app)/fractional-cfo/import/page.tsx`
