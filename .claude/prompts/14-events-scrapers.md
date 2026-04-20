# Events scrapers — detect promo launches, product launches, ad-creative changes, newsletters sent

## Goal

Feed the company Events tab (prompt 15) with a continuous stream of detected events per tracked competitor. **Price changes are EXPLICITLY NOT events** (those are alerts — prompt 06).

**Event types to detect:**
1. `PROMO_LAUNCHED` — a discount/sale campaign goes live
2. `PROMO_ENDED` — a discount/sale campaign ends
3. `PRODUCT_LAUNCHED` — new product appears in catalog
4. `PRODUCT_DISCONTINUED` — product removed from catalog (out of stock + removed from index)
5. `AD_CREATIVE_CHANGED` — Meta/YouTube/TikTok ad swapped or new variant
6. `NEWSLETTER_SENT` — email newsletter received

## Reference material — READ FIRST

- `.claude/research/marketing-asset-scrapers.md` — per-type scraper strategy
- `.claude/prompts/03-marketing-assets-expand.md` — scrapers we already specify
- `.claude/research/decisions-log.md` → "Events tab" decision (no price changes)

## Detection logic (event sources)

### 1. PROMO_LAUNCHED / PROMO_ENDED

**Trigger:** on every `MarketingAsset` insert with `assetType IN (EMAIL, HOMEPAGE, META_AD)`, run a regex pass:

```typescript
const PROMO_REGEX = /\b(\d+)\s*%\s*(off|aus|rabatt|reduziert|save)\b|\bfree\s+\w+\b|\bbuy\s+\d+\s+get\b/i;

function detectPromoInAsset(asset: MarketingAsset): PromoDetectedEvent | null {
  const match = PROMO_REGEX.exec(asset.title + ' ' + asset.bodyText);
  if (!match) return null;
  return {
    type: 'PROMO_LAUNCHED',
    brandId: asset.brandId,
    detectedAt: asset.capturedAt,
    sourceAssetId: asset.id,
    discountPct: match[1] ? parseInt(match[1]) : null,
    excerpt: match[0],
  };
}
```

**Deduplication:** if the same promo text was already detected for this brand within the last 7 days, skip.

**End detection:** nightly cron checks for promos that haven't appeared in a new asset for 3+ days → emit `PROMO_ENDED`.

### 2. PRODUCT_LAUNCHED / PRODUCT_DISCONTINUED

**Trigger:** diff-based. Nightly cron (`/api/cron/detect-product-events`):

```typescript
// For each tracked competitor, compare today's scraped SKUs to yesterday's
const today = await prisma.product.findMany({ where: { companyId: brandId, scrapedAt: { gte: startOfToday } }, select: { productId: true } });
const yesterday = await prisma.product.findMany({ where: { companyId: brandId, scrapedAt: { gte: startOfYesterday, lt: startOfToday } }, select: { productId: true } });

const newSkus = setDiff(today, yesterday);       // launched
const removedSkus = setDiff(yesterday, today);   // potentially discontinued

// For discontinued, require 7-day absence (avoid flagging temp out-of-stock)
for (const sku of removedSkus) {
  const lastSeen = await findLastSeen(sku);
  if (daysSince(lastSeen) >= 7) emit(PRODUCT_DISCONTINUED, { sku, brandId });
}
```

### 3. AD_CREATIVE_CHANGED

**Trigger:** on every `MarketingAsset` insert with `assetType IN (META_AD, YOUTUBE_AD, TIKTOK_AD)` that is NOT already in the `MarketingAsset` table:

```typescript
if (contentHashWasNotSeenBefore(asset.contentHash, asset.brandId)) {
  emit('AD_CREATIVE_CHANGED', { brandId, platform: asset.assetType, sourceAssetId: asset.id });
}
```

Deduplication by `contentHash` (already on `MarketingAsset` model per prompt 03).

### 4. NEWSLETTER_SENT

**Trigger:** on every `MarketingAsset` insert with `assetType === 'EMAIL'`:

```typescript
emit('NEWSLETTER_SENT', { brandId, subject: asset.title, sourceAssetId: asset.id });
```

1-to-1 mapping — each email = one event.

## Prisma additions

```prisma
enum EventType {
  PROMO_LAUNCHED
  PROMO_ENDED
  PRODUCT_LAUNCHED
  PRODUCT_DISCONTINUED
  AD_CREATIVE_CHANGED
  NEWSLETTER_SENT

  @@schema("events")
}

model CompetitorEvent {
  id                String    @id @default(cuid())
  tenantId          String
  brandId           String    // the competitor
  type              EventType
  occurredAt        DateTime
  detectedAt        DateTime  @default(now())
  title             String    // "Launched '25% off' promo", "New product: Canon EOS R5 II"
  description       String?   @db.Text
  sourceAssetId     String?   // pointer into MarketingAsset
  sourceProductId   String?   // pointer into Product
  metadata          Json?     // type-specific
  createdAt         DateTime  @default(now())

  @@index([tenantId, brandId, occurredAt])
  @@index([tenantId, type, occurredAt])
  @@index([sourceAssetId])
  @@schema("events")
}
```

## Architecture

### Emitter helper

```typescript
// src/lib/events/emit.ts
export async function emitCompetitorEvent(input: EmitEventInput): Promise<CompetitorEvent> {
  // Check dedupe (same brand + type + similar excerpt in last 24h)
  const recent = await prisma.competitorEvent.findFirst({
    where: {
      tenantId: input.tenantId,
      brandId: input.brandId,
      type: input.type,
      occurredAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) },
    },
  });
  if (recent && looksLikeDuplicate(recent, input)) return recent;

  const event = await prisma.competitorEvent.create({ data: input });

  // Notify via Redis for real-time Events tab
  await redis.publish(`events:${input.tenantId}:${input.brandId}`, JSON.stringify(event));

  return event;
}
```

### Detection jobs

**On-write detection** (runs inside the same BullMQ job that writes a `MarketingAsset`):
- PROMO_LAUNCHED (regex on text)
- AD_CREATIVE_CHANGED (contentHash check)
- NEWSLETTER_SENT (every EMAIL)

**Nightly cron** (`/api/cron/detect-events`):
- PROMO_ENDED (promos not seen in 3+ days)
- PRODUCT_LAUNCHED / PRODUCT_DISCONTINUED (7-day catalog diff)

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/detect-events", "schedule": "0 4 * * *" }
  ]
}
```

## Server actions

`src/actions/events.ts`:

```typescript
export async function listCompetitorEvents(params: {
  tenantId: string;
  brandIds?: string[];
  types?: EventType[];
  dateRange?: { from: Date; to: Date };
  limit?: number;
}): Promise<CompetitorEvent[]>;

export async function getEventDetail(id: string): Promise<EventWithRelations>;
export async function getEventsByBrand(brandId: string): Promise<CompetitorEvent[]>;
```

## Acceptance criteria

- [ ] `prisma db push` creates `events` schema + `CompetitorEvent` table + `EventType` enum
- [ ] Regex-based promo detection extracts `\d+% off`, `X Rabatt`, `free shipping`, etc.
- [ ] Nightly cron detects catalog adds/removes with 7-day delay for removes
- [ ] New ad with unseen contentHash → emits AD_CREATIVE_CHANGED
- [ ] Every new EMAIL asset → emits NEWSLETTER_SENT
- [ ] Dedupe prevents duplicate events within 24h
- [ ] Events flow to Redis pub/sub channel for real-time timeline UI (prompt 15)
- [ ] Seed script creates ~50 demo events across last 30 days for Calumet
- [ ] Typecheck+lint+build pass

## Out of scope

- **Price changes** — those are alerts (prompt 06), NOT events
- Semantic event extraction via LLM (v2 — swap the regex for Claude call)
- Video/image content analysis for ads (v2 — OCR / VLM on creative)
- Cross-competitor event aggregation ("3 competitors launched similar promos")
- Predictive event forecasting ("next promo likely Nov 24")

## Branch + commits

```bash
git checkout -b feature/events-scrapers
```

1. `feat(events): Prisma schema + EventType enum`
2. `feat(events): emitCompetitorEvent helper + Redis pub/sub`
3. `feat(events): on-write detection (promo regex, content-hash, newsletter)`
4. `feat(events): nightly cron for catalog diff + promo-ended`
5. `feat(events): server actions + Redis hookup`
6. `feat(events): seed script with 50 demo events`

## Reference files

- Related UI prompt: `.claude/prompts/15-events-timeline-ui.md`
- Asset capture prompt: `.claude/prompts/03-marketing-assets-expand.md`
- Decisions: `.claude/research/decisions-log.md` → "Events tab"
- Alerts (for contrast): `.claude/prompts/06-alerts-cmo-and-cfo.md`
- Redis: `src/lib/redis.ts`
- Testing: `.claude/prompts/_TESTING_AND_DATA_APPROACH.md`
