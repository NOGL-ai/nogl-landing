# Expand Marketing Asset Library — scrape emails + homepages + YouTube + TikTok + Instagram + existing Meta ads

## Goal

Replace `/en/marketing-assets` stub with a full Particl-style Marketing Asset Library that surfaces everything tracked-competitors are publishing, across 6 asset types, in a unified gallery with source-filter chips and engagement proxies. **No fake CTR predictions** — only observed truths (see §10).

## Reference material — READ FIRST

- `.claude/research/marketing-asset-scrapers.md` — per-type scorecards + orchestration recommendation.
- `.claude/research/marketing-assets-ctr-expansion-analysis.md` — **why CTR prediction is cut from v1** and what engagement proxies replace it.
- `.claude/research/marketing-assets-ctr-research.md` — preserved for `21-creative-quality-score.md` (v3, future).
- `.claude/research/decisions-log.md` → "Assets tab" and "Events tab" (timeline excludes price changes — those are alerts).
- Existing Meta Ads scraper: `.claude/research/meta-ads-scraper/` (code reference — already deployed via Apify).

## Asset types to ship

| # | Type | Source | Ship target | Coverage expected |
|---|---|---|---|---|
| 1 | **Email newsletters** | Self-hosted IMAP (Fastmail catch-all + `imapflow`) | Week 1-2 | High per tracked brand |
| 2 | **Homepage** (desktop) | Self-hosted Playwright + pHash/pixelmatch | Week 1-2 | 100% |
| 3 | **Homepage mobile** | Same pipeline, mobile viewport | Week 1-2 | 100% |
| 4 | **Meta ads** | Existing `tuhinmallick/meta-ads-library-scraper` Apify actor | Already live | High |
| 5 | **YouTube / Google ads** | Apify `xtech/google-ad-transparency-scraper` | Week 3 | Medium-high for DE |
| 6 | **TikTok ads** | Apify `brilliant_gum/tiktok-ads-library-scraper` (EU DSA) | Week 3 | Low-medium (label "Emerging") |
| 7 | **Instagram organic** | Apify Instagram scraper actor (already integrated) | Already partial | Medium |
| — | SMS | **CUT from v1** — see research doc §5 | Later | N/A |

## Prisma additions — unified polymorphic model

Add to `prisma/schema.prisma` under a new `assets` schema:

```prisma
enum AssetType {
  EMAIL
  HOMEPAGE
  HOMEPAGE_MOBILE
  INSTAGRAM
  META_AD
  YOUTUBE_AD
  TIKTOK_AD

  @@schema("assets")
}

enum AssetSource {
  APIFY_META
  APIFY_YOUTUBE
  APIFY_TIKTOK
  APIFY_INSTAGRAM
  IMAP_SELF_HOSTED
  PLAYWRIGHT_SELF_HOSTED

  @@schema("assets")
}

model MarketingAsset {
  id             String       @id @default(cuid())
  tenantId       String       // Calumet Company.id
  brandId        String       // the tracked competitor's Company.id
  assetType      AssetType
  source         AssetSource
  capturedAt     DateTime
  sourceUrl      String?      // deep link to original
  title          String?      // email subject, ad headline, etc.
  bodyText       String?      @db.Text
  language       String?      // "de", "en"
  region         String?      // ISO country code (DE/AT/CH)
  mediaUrls      String[]     // R2/S3 keys for images/videos/screenshots
  contentHash    String       // for dedup + change-detection (sha256)
  payload        Json         // type-specific fields (see §3)
  proxies        Json?        // 9 engagement-proxy columns (see §10) — computed post-capture
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  tenant         Company      @relation("TenantAssets", fields: [tenantId], references: [id])
  brand          Company      @relation("BrandAssets", fields: [brandId], references: [id], onDelete: Cascade)

  @@unique([contentHash])
  @@index([tenantId, brandId, assetType, capturedAt])
  @@index([tenantId, assetType, capturedAt])
  @@index([brandId, capturedAt])
  @@schema("assets")
}

model AssetCaptureRun {
  id            String      @id @default(cuid())
  tenantId      String
  brandId       String
  assetType     AssetType
  source        AssetSource
  status        String      // QUEUED | RUNNING | COMPLETED | FAILED
  startedAt     DateTime    @default(now())
  completedAt   DateTime?
  itemCount     Int         @default(0)
  error         String?     @db.Text
  metadata      Json?       // Apify run ID, IMAP mailbox, etc.

  @@index([tenantId, brandId, startedAt])
  @@schema("assets")
}
```

### Payload shapes per `assetType`

```typescript
// EMAIL
{ sender: string; senderDomain: string; esp?: string;   // Klaviyo | Mailchimp | Brevo (from List-Unsubscribe-Post header)
  hasDiscount: boolean; discountPct?: number;
  hasCountdown: boolean;                                  // "24 hours only"
  imageCount: number; linkCount: number;
  rawMimeR2Key: string; }                                 // for reprocessing later

// HOMEPAGE / HOMEPAGE_MOBILE
{ viewport: "desktop" | "mobile"; statusCode: number;
  screenshotR2Key: string; htmlR2Key: string;
  pHash: string; pixelDiffRatio?: number;                 // vs previous snapshot
  changeType?: "major" | "minor" | "no-change"; }

// META_AD
{ adArchiveId: string; pageId: string; pageName: string;
  spendLowerBound?: number; spendUpperBound?: number;     // political only
  impressionsLowerBound?: number; impressionsUpperBound?: number;
  platforms: string[];                                    // ["facebook", "instagram"]
  startDate: string; endDate?: string;
  mediaType: "image" | "video" | "carousel"; }

// YOUTUBE_AD
{ creativeId: string; advertiserVerifiedId?: string; advertiserDomain?: string;
  creativeType: "video" | "image" | "text";
  videoUrl?: string; thumbnailUrl?: string;
  regionsServed: string[]; firstSeen: string; lastSeen: string; }

// TIKTOK_AD
{ adId: string; adPaidForBy?: string;
  targetAgeGroups?: string[]; targetGender?: "male" | "female" | "all";
  targetInterests?: string[]; videoUrl: string; }

// INSTAGRAM
{ postId: string; postUrl: string; postType: "image" | "video" | "reel" | "carousel";
  likeCount?: number; commentCount?: number;              // these ARE public
  hashtags: string[]; mentions: string[]; }
```

## Scraper orchestration

Follow the recommendation in `marketing-asset-scrapers.md` §7: **BullMQ on existing Redis for self-hosted, Apify's own scheduler for Apify-hosted actors.**

### Three workers to build

1. **`workers/ingest-apify-webhook.ts`** — Next.js API route `/api/ingest/apify`. Apify actors run on their own schedule, POST dataset items to this endpoint on completion. Verify HMAC, upsert to `MarketingAsset` (by `contentHash`), create `AssetCaptureRun` row with Apify run ID in metadata.

2. **`workers/scrape-homepages.ts`** — BullMQ worker. Job shape: `{ brandId, homepageUrl, viewport: "desktop"|"mobile" }`. Plays back:
   - Launch Playwright headless Chromium with stealth plugins
   - Dismiss cookie consent via per-domain selector dictionary (curated for DE retailers)
   - Capture full-page screenshot + `page.content()` HTML
   - Compute pHash via `sharp`
   - If pHash Hamming distance vs last snapshot > threshold, run pixelmatch for diff image
   - Store all artifacts in R2, write `MarketingAsset` + `AssetCaptureRun`
   - Scheduled via BullMQ repeatable jobs — daily per brand × 2 viewports = 2 jobs/brand/day.

3. **`workers/ingest-emails.ts`** — Long-running Node service (NOT serverless). Connects to Fastmail business IMAP via `imapflow` with IDLE mode:
   - One connection per tenant inbox
   - IDLE notification → fetch message → parse MIME via `mailparser` → extract sender/subject/HTML/images
   - Match `From` address to a tracked brand (domain match or operator-configured alias mapping)
   - Detect discounts via regex on subject/body (`\d+\s*%\s*(off|rabatt|aus|reduziert)`)
   - Store raw MIME in R2 for replay, strip tracking pixels
   - Write `MarketingAsset` with assetType=EMAIL + payload

### Apify webhook contract

```
POST /api/ingest/apify
Headers:
  X-Apify-Signature: <hmac-sha256>
  X-Apify-Actor-Run-Id: <run-id>
Body (JSON from dataset):
  { actorId, datasetId, items: [...] }  // actor-specific shape

Response: 202 Accepted (within 100ms)
Processing: enqueue BullMQ job to process items
```

Per-actor config in env:
- `APIFY_META_ADS_TASK_ID=...`
- `APIFY_GOOGLE_ADS_TASK_ID=...`
- `APIFY_TIKTOK_ADS_TASK_ID=...`
- `APIFY_INSTAGRAM_TASK_ID=...`
- `APIFY_WEBHOOK_SECRET=...` (shared HMAC key for all incoming webhooks)

## Engagement proxies (replaces fake CTR — see CTR analysis doc)

After each capture, compute a `proxies` JSON blob per asset:

```typescript
{
  longevityDays?: number;            // ad: now - startDate. email/homepage: undefined.
  iterationRate28d?: number;         // variants of this offer in last 28 days
  platformBreadth?: number;          // distinct platforms the ad runs on
  geographicBreadth?: number;        // distinct regions
  repeatCampaignScore?: number;      // 0-100, NLP-clustered similarity to prior offers
  formatMix?: Record<string, number>; // { "video": 0.6, "image": 0.4 } for the brand's 28d creative mix
  publicEngagement?: {               // only for IG + public comments
    likes?: number; comments?: number; shares?: number;
  };
  aestheticScore?: number;           // 0-10, from a lightweight VLM (optional, see §11)
  copyReadability?: {                // German-aware Flesch-Kincaid
    fleschKincaidGrade?: number;
    sentimentPolarity?: number;      // -1..+1
  };
}
```

These 9 fields are **observed truths**, not predictions. Surface them as sortable columns in the Asset Library. Never call any of these "predicted CTR" in the UI.

## Server actions

`src/actions/marketing-assets.ts`:

```typescript
export async function listMarketingAssets(params: {
  tenantId: string;
  assetTypes?: AssetType[];
  brandIds?: string[];
  dateRange?: { from: Date; to: Date };
  search?: string;                    // matches title/body
  sortBy?: "capturedAt" | "longevityDays" | "iterationRate28d" | "aestheticScore";
  page?: number;
  pageSize?: number;
}): Promise<{ items: MarketingAsset[]; total: number }>;

export async function getAssetDetail(id: string): Promise<MarketingAssetWithRelations>;
export async function getAssetStats(tenantId: string): Promise<AssetStatsByType>;
export async function getCaptureRuns(tenantId: string, limit: number): Promise<AssetCaptureRun[]>;
export async function manuallyTriggerCapture(brandId: string, assetType: AssetType): Promise<{ runId: string }>;
```

## UI — `/en/marketing-assets`

Layout matches Particl's `/dashboard/assets/emails` (screenshots already analyzed — see `.claude/research/marketing-asset-scrapers.md`).

### Header
- "Marketing Asset Library" title
- Stats row: `{totalAssets} assets across {brandCount} brands, last {N} days` + "Manage sources" link to admin settings
- Right side: "Date range" picker (default last 28 days), "Filters" button, search

### Sidebar left rail — Asset type tabs

```
📧 Emails (N)
🏠 Homepages (N)
📱 Mobile Homepages (N)
📸 Instagram (N)
📘 Meta Ads (N)
▶️ YouTube Ads (N)
🎵 TikTok Ads (N)
```

Each counts unread-since-last-visit. Click → filters gallery to that type.

### Presets (top chips, horizontally scrollable)

Match Particl's "Presets" row:
- "Discount Emails" (`payload.hasDiscount=true`)
- "Warehouse Sales" (subject regex)
- "Restock Alerts" (NLP-cluster)
- "Canon Products" (brand filter)
- "Exclude Cart Emails" (payload NOT matching cart-reminder patterns)
- "+ New preset" → opens preset builder

### Filter panel (right sheet, "Filters" button)

- Date range
- Asset type (multi-select)
- Brand / competitor (multi-select, scrollable list of tracked competitors)
- Title contains
- Body contains
- Company vertical (photo / general retail)
- Language (de / en)
- Region (DE / AT / CH / global)
- Format (image / video / text / carousel)
- Has discount (yes/no/any)
- Sort: Most recent | Longest-running | Highest aesthetic score | Most iterated

### Gallery grid

- Cards in 3-4 col grid. Each card:
  - Hero image/video thumbnail
  - Overlay: asset-type icon + source-chip (e.g. "META AD • vetsak®")
  - Title (email subject / ad headline)
  - Metadata row: captured-date, engagement proxies
  - Badge: "Extreme longevity" (>60 days), "High iteration" (>5 variants/28d)
- Click card → detail modal

### Detail modal

- Full-size creative (image/video/homepage screenshot with hover-zoom)
- Metadata table (brand, type, captured-at, source, language, region)
- Engagement proxies as a card grid (longevity, iterations, platforms, aesthetic score)
- Body text + highlighted entities (prices, discounts, brand mentions)
- Source URL with "Open in Meta Ad Library" / "Open email" external link
- "Similar assets" rail at bottom — pHash-nearest or NLP-nearest

## Integration with existing Assets tab on company detail page

The current `/en/companies/[slug]/assets` tab (prompt `16-assets-tab-expansion.md`) reads from the same `MarketingAsset` table with `brandId = slug's company ID`. **Same `AssetCard` component**, same detail modal. Don't duplicate.

## CTR is explicitly NOT in scope

Do NOT implement any of:
- `VQS` / `TAS` from CAIG paper formula
- TabSyn synthetic CTR projection
- Any "predicted CTR" or "CQS score" column
- Any Reinforcement Learning / VLM fine-tuning

A lightweight VLM aesthetic score (0-10, Qwen2-VL or LLaVA on downloaded creatives) IS in scope — but it's labeled "Aesthetic score" in UI, NOT "CTR prediction". Mechanics:

- Downstream of every capture, enqueue a BullMQ `score-aesthetic` job
- Worker loads creative → runs through VLM → stores 0-10 score in `proxies.aestheticScore`
- Runtime: ~2 s per creative on a CPU. Batch of 100 in under 4 min.
- No training data dependency. Pure zero-shot VLM judgment.
- Explicitly disclaim: "Aesthetic scores are subjective model outputs, not performance predictions."

## Seed data

Create `scripts/seed-marketing-assets-demo.ts`:
- Generates 300-500 synthetic assets across all 7 types referencing the 5 tracked competitors (Foto Erhardt, Fotokoch, Foto Leistenschneider, Kamera Express, Teltec)
- Uses **faker** + realistic category distributions: 50% emails, 15% homepages × 2 viewports, 10% Instagram, 15% Meta ads, 5% YouTube, 5% TikTok
- Media URLs point to placeholder images (Unsplash camera category) for now
- Mix capture dates across last 90 days with realistic frequency (2-3 emails/week/brand, 1 homepage/day/brand/viewport, etc.)
- Realistic engagement proxies (longevity 1-90 days, iteration rate 0-8, etc.)
- Gitignore R2/S3 keys — demo uses public URLs

Add to `package.json`:
```json
"seed:marketing-assets": "node --env-file=.env --import tsx scripts/seed-marketing-assets-demo.ts"
```

## Testing — see `_TESTING_AND_DATA_APPROACH.md`

Specific to this prompt:

### Unit tests
- `parseEmailForDiscount` — regex extracts `20%`, `20 %`, `20 Prozent`, `20% Rabatt`, handles false-positives like "20% sulfur-free paper" (negatives in fixtures)
- `pHashHammingDistance` — identical images return 0, completely different return 64
- `computeEngagementProxies` — longevityDays calculation handles endDate=null (ongoing) vs explicit end

### Integration tests
- `tests/fixtures/marketing-assets/apify-meta-sample.json` — one sample Apify dataset item
- Mocks Apify webhook → verifies `MarketingAsset` row created with correct payload
- Dedupe: re-POST same item → no duplicate row (contentHash unique)

### E2E (Playwright)
- After seed, `/en/marketing-assets` loads, 500 assets visible
- Click "Emails" tab → shows only emails
- Filter by brand "Foto Erhardt" → count drops to ~100
- Click first card → detail modal opens with media + metadata + engagement proxies
- Search "Canon" → filters to matching assets

### Manual check
- Configure a Fastmail catch-all → subscribe to 1 competitor newsletter → within 24h, email appears in `/en/marketing-assets` with correct parsing
- Run homepage scraper for one competitor → PNG snapshot appears + pHash stored
- Trigger Apify Meta Ads task → ads appear within 5 minutes of task completion (via webhook)

## Data sources to ingest (founder-provided)

Ask the founder for:
1. **Fastmail business account** (or equivalent IMAP-capable with custom domain) — credentials + domain + chosen catch-all alias format
2. **Apify account** — team API token (server-only env var)
3. **List of 5-10 tracked competitor domains** (already have 5 from `decisions-log.md`)
4. **List of 5-10 brand Instagram handles** (for Apify IG scraper)
5. **List of 5-10 brand Meta page URLs** (for Meta Ads Library scraper)
6. **Optional** — Meta for Developers app registered with Ad Library access token (enables the Official API path in the existing meta-ads-scraper)

If not available at prompt time, demo will run on seeded data only. Real data ingestion is triggered by config step — not baked into scrapers.

## Acceptance criteria

- [ ] `prisma db push` creates `assets` schema + 2 tables + 2 enums
- [ ] `seed:marketing-assets` populates 300-500 synthetic assets
- [ ] `/en/marketing-assets` loads in <3s and shows gallery with 7 tab filters
- [ ] Clicking each tab correctly filters (single source-of-truth count matches)
- [ ] Filter panel: date + brand + type + search all work
- [ ] Presets: at least 3 default presets work (Discount emails, Canon products, Video ads)
- [ ] Detail modal opens on card click, shows media + metadata + proxies + similar rail
- [ ] Apify webhook endpoint accepts signed POST, persists data, rejects unsigned
- [ ] IMAP worker connects and stores 1 test email end-to-end in dev
- [ ] Playwright homepage worker captures 1 competitor homepage end-to-end in dev
- [ ] Dark mode renders correctly
- [ ] `npm run typecheck`, `npm run check-lint`, `npm run build` all pass
- [ ] Unit test coverage for pure business logic >80%
- [ ] 3+ Playwright E2E tests cover primary flows

## Out of scope (explicit — do not implement)

- SMS capture (per research doc §5 — cut from v1)
- CTR prediction / CQS scoring (per CTR-expansion-analysis doc — v3 minimum)
- TabSyn / Bench-CTR / CAIG / RLHF models (v3)
- Real-time asset monitoring websockets (poll every 5 min is fine)
- Video transcription for YouTube/TikTok ads (v2 via Whisper)
- OCR on homepage screenshots for hero-banner text (v2)
- Email template cloning / reverse-engineering (v3)
- Public share links for asset detail (needs DPA + takedown flow first)

## Branch + commits

```bash
git checkout -b feature/marketing-assets-expand
```

1. `feat(assets): Prisma schema + enums (MarketingAsset, AssetCaptureRun, AssetType, AssetSource)`
2. `feat(assets): server actions (list, detail, stats, capture runs)`
3. `feat(assets): Apify webhook endpoint with HMAC verification`
4. `feat(assets): BullMQ homepage scraper worker + cookie-consent dictionary`
5. `feat(assets): IMAP email ingestion service + MIME parser`
6. `feat(assets): engagement-proxy computation pipeline`
7. `feat(assets): optional VLM aesthetic scoring job`
8. `feat(assets): Marketing Asset Library UI (7 tabs + filters + presets + detail)`
9. `feat(assets): seed script + demo fixtures`
10. `test(assets): unit + integration + E2E`

## Reference files in the repo

- Stub page: `src/app/(site)/[lang]/(app)/marketing-assets/page.tsx`
- Meta ads scraper reference: `.claude/research/meta-ads-scraper/src/`
- Research: `.claude/research/marketing-asset-scrapers.md`, `marketing-assets-ctr-research.md`, `marketing-assets-ctr-expansion-analysis.md`
- Decisions: `.claude/research/decisions-log.md`
- Assets tab on company page (shared component): prompt `16-assets-tab-expansion.md`
- Events tab (related — this prompt feeds events): prompts `14-events-scrapers.md`, `15-events-timeline-ui.md`
- Testing: `.claude/prompts/_TESTING_AND_DATA_APPROACH.md`
- Auth: `src/lib/auth.ts`
- Prisma client: `src/lib/prisma.ts`
- Redis: `src/lib/redis.ts`
- R2/S3 client: use existing `@aws-sdk/client-s3` + presigner (already in `package.json`)

## Open questions for the founder (before starting)

1. **R2 vs S3.** Has a Cloudflare R2 bucket been provisioned for asset storage? If not, the prompt will default to S3 (existing AWS creds in `.env`).
2. **Email catch-all domain.** Buy fresh `nogl-insights.de` or use existing? Fresh preferred (avoids ESP blocklists).
3. **VLM budget.** Aesthetic scoring on ~500 new assets/day = ~16k/mo scores. Self-host a local LLaVA (free but GPU on nogl-dev CT) vs Anthropic/OpenAI vision API (~$5/mo at this volume)?
4. **Takedown flow.** Legal-mandated asset removal within 24h on takedown request: email to legal@? Operator button in admin UI? Both?
5. **Historical backfill.** Pull Wayback Machine snapshots for homepage history? (Free but limited to weekly resolution.) Or start from day-one capture?
6. **Instagram organic scope.** Public profile posts (recommended, Apify reliable) or only ads-mode content?
