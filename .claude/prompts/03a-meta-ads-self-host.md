# Port the existing Meta Ads scraper from Apify actor into self-hosted BullMQ worker (with Apify as fallback)

## Goal

The `tuhinmallick/meta-ads-library-scraper` repo (`.claude/research/meta-ads-scraper/` — already cloned and committed as a read-only snapshot) is production-grade code. It already has stealth, GraphQL interception, session health monitoring, SQLite state, raw-payload cache, shard support, and a dual-path router (Official Graph API + browser scrape).

**Goal**: port this code into `nogl-landing/workers/meta-ads/` so it runs as a self-hosted BullMQ worker writing directly to Postgres — keeping the Apify-deployed copy as a fallback circuit-breaker for when primary fails.

## Non-goals

- Do NOT rewrite the scraper logic. Port, don't rewrite.
- Do NOT add residential proxies. At 5 competitors × daily, the existing stealth + GraphQL interception + single-IP approach is sufficient. Proxies are added later if the health monitor emits `session_dead` more than 10× per day.
- Do NOT build a new Apify actor. The existing one stays as-is on apify.com as the fallback.

## Source code to port

Files in `.claude/research/meta-ads-scraper/src/` — all written by you, all tested:

| File | Lines | What to do |
|---|---|---|
| `main.js` | 926 | **Split**: keep `MetaAdsLibraryScraperV2` class + `ModernAntiDetection` class verbatim; replace the Apify `Actor.main` wrapper with a BullMQ job handler |
| `state.js` | 118 | Copy verbatim — SQLite state store, no Apify deps |
| `health.js` | 92 | Copy verbatim — pure functions, no Apify deps |
| `rawCache.js` | 111 | Copy verbatim — pure functions, no Apify deps |
| `shard.js` | 21 | Copy verbatim |
| `cursor.js` | 51 | Copy verbatim |
| `officialApi.js` | 152 | Copy verbatim — uses `fetch`, no Apify deps |
| `utils/helpers.js` | ~50 | Copy verbatim — DataProcessor normalizer |
| Tests `tests/*.test.js` | 7 files | Copy verbatim, adjust imports to new paths |

## New file layout in nogl-landing

```
nogl-landing/
├── workers/
│   └── meta-ads/
│       ├── index.ts               # BullMQ worker entry point (NEW)
│       ├── scraper.ts             # MetaAdsLibraryScraperV2 class (ported from main.js)
│       ├── stealth.ts             # ModernAntiDetection class (ported from main.js)
│       ├── state.ts               # StateStore (ported from state.js)
│       ├── health.ts              # HealthMonitor (ported from health.js)
│       ├── rawCache.ts            # RawCache (ported from rawCache.js)
│       ├── shard.ts               # applyShard (ported from shard.js)
│       ├── cursor.ts              # extractPageInfo (ported from cursor.js)
│       ├── officialApi.ts         # OfficialApiClient (ported from officialApi.js)
│       ├── dataProcessor.ts       # DataProcessor (ported from utils/helpers.js)
│       ├── fallback.ts            # Apify actor invocation on primary failure (NEW)
│       ├── writeToDb.ts           # Prisma upsert wrapper (NEW)
│       └── __tests__/*            # all 7 test files, adjusted imports
│
├── src/app/api/ingest/apify/route.ts   # already scoped in prompt 03 — webhook receiver for fallback results
└── scripts/
    └── run-meta-ads-worker.ts           # standalone script to run the worker (NEW)
```

## Required code changes (not additions — changes to the Apify-specific bits)

### 1. Replace `Actor.main` wrapper with BullMQ job handler

**Before (`main.js:635`):**
```javascript
Actor.main(async () => {
    const input = await Actor.getInput();
    // ... scraper work ...
    await Actor.pushData(ad);
});
```

**After (`workers/meta-ads/index.ts`):**
```typescript
import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { MetaAdsLibraryScraperV2 } from "./scraper";
import { StateStore } from "./state";
import { RawCache } from "./rawCache";
import { HealthMonitor, SessionDeadError } from "./health";
import { OfficialApiClient } from "./officialApi";
import { triggerApifyFallback } from "./fallback";
import { upsertMetaAdToDb } from "./writeToDb";

interface MetaAdsJobData {
  tenantId: string;
  brandId: string;
  searchQuery: string;
  country?: string;
  adType?: string;
  maxAds?: number;
  accessToken?: string;  // optional for official API path
  shard?: { index: number; total: number };
}

const connection = new IORedis(process.env.REDIS_URL!);

export const metaAdsWorker = new Worker<MetaAdsJobData>(
  "meta-ads-scrape",
  async (job: Job<MetaAdsJobData>) => {
    const state = new StateStore({ dbPath: `storage/state-${job.id}.db`, runId: job.id });
    const rawCache = new RawCache({ dir: "storage/raw", maxBytes: 500 * 1024 * 1024 });

    try {
      // Primary: self-hosted browser or official API
      if (OfficialApiClient.canHandle({ accessToken: job.data.accessToken, adType: job.data.adType })) {
        const client = new OfficialApiClient({ accessToken: job.data.accessToken! });
        for await (const row of client.iterate(job.data)) {
          await upsertMetaAdToDb(row, job.data);
          if (await shouldStop(state, job.data.maxAds)) break;
        }
      } else {
        const scraper = new MetaAdsLibraryScraperV2(job.data, { state, rawCache });
        await scraper.run(async (ad) => upsertMetaAdToDb(ad, job.data));
      }

      return { status: "primary_success", seen: state.stats().seen };
    } catch (err) {
      state.logError("primary_failed", String(err));

      // Circuit breaker: if this is the 3rd consecutive failure, trigger Apify fallback
      const consecutiveFailures = await getConsecutiveFailures(job.data.brandId);
      if (consecutiveFailures >= 3 || err instanceof SessionDeadError) {
        console.warn(`Primary failed (${err}), falling back to Apify actor`);
        await triggerApifyFallback(job.data);
        return { status: "fallback_triggered", reason: String(err) };
      }

      throw err;  // let BullMQ retry with backoff
    } finally {
      state.close();
    }
  },
  { connection, concurrency: 2 }  // max 2 concurrent browser sessions
);
```

### 2. Replace Apify Dataset writes with Prisma upserts

Create `workers/meta-ads/writeToDb.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function upsertMetaAdToDb(ad: any, jobData: { tenantId: string; brandId: string }) {
  const contentHash = crypto.createHash("sha256")
    .update(ad.adArchiveId || ad.adId || JSON.stringify(ad))
    .digest("hex");

  await prisma.marketingAsset.upsert({
    where: { contentHash },
    update: { capturedAt: new Date() },  // refresh on re-encounter
    create: {
      tenantId: jobData.tenantId,
      brandId: jobData.brandId,
      assetType: "META_AD",
      source: "PLAYWRIGHT_SELF_HOSTED",  // or APIFY_META via fallback
      capturedAt: new Date(),
      sourceUrl: `https://www.facebook.com/ads/library/?id=${ad.adArchiveId}`,
      title: ad.adContent?.slice(0, 200),
      bodyText: ad.adContent,
      region: ad.country || "DE",
      mediaUrls: ad.adCreative?.images ?? [],
      contentHash,
      payload: {
        adArchiveId: ad.adArchiveId,
        pageId: ad.pageId,
        pageName: ad.pageName,
        startDate: ad.startDate,
        endDate: ad.endDate,
        platforms: ad.platforms ?? [],
        spendLowerBound: ad.spend?.lower_bound,
        spendUpperBound: ad.spend?.upper_bound,
        mediaType: ad.adCreative?.videos?.length > 0 ? "video" : "image",
      },
    },
  });
}
```

### 3. Replace Apify proxy configuration with native Playwright

**Before (`main.js:906-910`):**
```javascript
proxyConfiguration: await Actor.createProxyConfiguration({
  groups: config.proxyConfiguration.apifyProxyGroups || ['RESIDENTIAL'],
  countryCode: config.country !== 'ALL' ? config.country : undefined
})
```

**After:**
```typescript
// In scraper.ts — just delete the proxyConfiguration entirely.
// Self-host runs from CT 504's direct IP.
// Playwright + stealth + GraphQL interception is sufficient at 5-competitor scale.
```

If you later need proxies (health monitor hitting `session_dead` >10×/day), revisit with a cheap datacenter proxy or Smartproxy.

### 4. Rename Apify `Dataset.pushData` batches

**Before:**
```javascript
const batchSize = 5;
for (let i = 0; i < newAds.length; i += batchSize) {
  await Dataset.pushData(newAds.slice(i, i + batchSize));
}
```

**After:** remove batching — Prisma upserts are fast enough, and single-row upserts give you accurate per-row failure handling:
```typescript
for (const ad of newAds) {
  try {
    await upsertMetaAdToDb(ad, jobData);
  } catch (err) {
    state.logError("db_write_failed", String(err), ad.adArchiveId);
  }
}
```

## Fallback implementation (`fallback.ts`)

```typescript
import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL!);
const fallbackQueue = new Queue("meta-ads-fallback", { connection });

export async function triggerApifyFallback(jobData: MetaAdsJobData) {
  // Option A: call Apify actor via REST
  const response = await fetch(
    `https://api.apify.com/v2/actor-tasks/${process.env.APIFY_META_ADS_TASK_ID}/runs?token=${process.env.APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        searchQuery: jobData.searchQuery,
        country: jobData.country,
        adType: jobData.adType,
        maxAds: jobData.maxAds,
        // Tell Apify where to send results
        webhookUrl: `${process.env.PUBLIC_URL}/api/ingest/apify`,
        webhookPayload: { tenantId: jobData.tenantId, brandId: jobData.brandId },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Apify fallback invocation failed: ${response.status} ${await response.text()}`);
  }

  const { data } = await response.json();
  return { apifyRunId: data.id };
}
```

## BullMQ producer — schedule jobs

In the existing `nogl-landing`, add a repeatable job enqueuer:

```typescript
// scripts/schedule-meta-ads-scrape.ts
import { Queue } from "bullmq";
import { prisma } from "@/lib/prisma";

const queue = new Queue("meta-ads-scrape", { connection });

async function scheduleForAllTrackedCompetitors() {
  const competitors = await prisma.trackedCompetitor.findMany({
    where: { status: "ACTIVE" },
    include: { competitor: true },
  });

  for (const tc of competitors) {
    await queue.add(
      `scrape-${tc.competitor.id}`,
      {
        tenantId: tc.tenantCompanyId,
        brandId: tc.competitor.id,
        searchQuery: tc.competitor.name,
        country: "DE",
        maxAds: 100,
      },
      {
        repeat: { pattern: "0 3 * * *" },  // daily at 03:00 UTC
        jobId: `meta-ads-${tc.competitor.id}`,  // prevents duplicates
      }
    );
  }
}
```

## Deployment on your Proxmox

**Worker needs:**
- Node 20+ (already on CT 504)
- Playwright Chromium (already installed for existing browser flows)
- Redis access (10.10.10.214)
- Postgres access (10.10.10.213)
- Write access to a local `storage/` directory for SQLite state + raw payload cache

**Start script:**
```bash
# Inside nogl-landing on CT 504
npx tsx scripts/run-meta-ads-worker.ts

# Or managed by PM2 for auto-restart:
pm2 start scripts/run-meta-ads-worker.ts --name meta-ads-worker
pm2 save
```

**Env vars needed in `.env`:**
```bash
# Existing
DATABASE_URL=postgresql://...
REDIS_URL=redis://10.10.10.214:6379

# New for Apify fallback
APIFY_TOKEN=apify_api_xxx                          # get from apify.com account
APIFY_META_ADS_TASK_ID=xxxxxxxxxxxx                # the task ID of your existing actor
APIFY_WEBHOOK_SECRET=generate-a-random-hmac-key
PUBLIC_URL=https://scripts-helps-nest-ind.trycloudflare.com  # or production domain
```

## Acceptance criteria

- [ ] All 9 source files (+ tests) ported from `.claude/research/meta-ads-scraper/src/` to `nogl-landing/workers/meta-ads/` with equivalent behavior (zero logic rewrites — ports only)
- [ ] `npm test workers/meta-ads/__tests__` passes (7 test files)
- [ ] A BullMQ job with `searchQuery: "Canon"` produces MarketingAsset rows within 60s on CT 504 (no Apify involvement)
- [ ] Trigger 3× consecutive failures → 4th attempt triggers Apify fallback (verify via Apify run log)
- [ ] Apify webhook endpoint writes the same MarketingAsset shape as primary
- [ ] SQLite state.db persists seen_ad_ids across worker restarts
- [ ] Raw cache directory fills up and evicts old entries when hitting 500 MB
- [ ] Health monitor triggers SessionDeadError when fed a `/checkpoint` page
- [ ] `npm run typecheck` passes
- [ ] Worker runs for 72 hours on CT 504 without manual intervention, scraping 5 competitors × daily

## Risk assessment

**What could go wrong (most likely failure modes):**

1. **CT 504 IP gets soft-rate-limited by Meta** — HealthMonitor detects challenge page, SessionDeadError thrown, BullMQ retries 3× with exponential backoff (30s, 2m, 10m). If all fail, Apify fallback fires. Cost of one fallback run: ~$0.10. Budget impact: <$5/mo even at 20% failure rate.
2. **Meta changes their internal GraphQL schema** — `AdLibrarySearchResultsQuery` name might change. We detect via `adsData.edges` being empty despite a 200 response. `cursor.js` already walks multiple known paths as defensive coding.
3. **Storage dir on CT 504 fills up** — `rawCache.js` auto-evicts at 500 MB; SQLite state.db grows ~1 MB per 10k ads. Monitor via `worker.on("completed")` event logging stats.
4. **BullMQ job hangs forever** — set `lockDuration: 600_000` (10 min) and `stalledInterval: 30_000`. A stalled job re-enters the queue for retry.

## Branch + commits

```bash
git checkout -b feature/meta-ads-self-host
```

1. `chore(meta-ads): create workers/meta-ads/ directory + index stub`
2. `feat(meta-ads): port StateStore + RawCache + HealthMonitor + shard + cursor (pure modules, no changes)`
3. `feat(meta-ads): port OfficialApiClient + DataProcessor`
4. `feat(meta-ads): port ModernAntiDetection + MetaAdsLibraryScraperV2 (class only, remove Apify Actor wrapper)`
5. `feat(meta-ads): BullMQ worker entry point + Prisma upsert writer`
6. `feat(meta-ads): Apify fallback client + 3-failure circuit breaker`
7. `feat(meta-ads): producer script for tracked competitors + daily schedule`
8. `test(meta-ads): port 7 test files with updated imports`
9. `chore(meta-ads): add PM2 ecosystem file + .env.example updates`

## Testing on real data

Once deployed:
```bash
# Dry run with a known-good search
BULLMQ_URL=redis://10.10.10.214:6379 npx tsx -e "
  import { Queue } from 'bullmq';
  const q = new Queue('meta-ads-scrape', { connection: { host: '10.10.10.214' } });
  await q.add('manual-test', {
    tenantId: 'cmnw4qqo10000ltccgauemneu',
    brandId: 'cmnw4qr3d0001ltcciyo1j0wb', // Foto Erhardt
    searchQuery: 'Foto Erhardt',
    country: 'DE',
    maxAds: 10
  });
"

# Tail the worker logs
pm2 logs meta-ads-worker --lines 100
```

Expected output: logs showing "Processing: https://www.facebook.com/ads/library?q=Foto%20Erhardt..." → "Intercepted Ads Library GraphQL request" → "Scraped N new ads".

## Reference files

- Source code: `.claude/research/meta-ads-scraper/src/` (all 9 files + 7 tests)
- README: `.claude/research/meta-ads-scraper/README.md` (fantastic explanation of the dual-path + stealth + GraphQL interception design)
- Architecture decision: `.claude/research/scraper-architecture.md`
- MarketingAsset Prisma model: prompt 03-marketing-assets-expand.md
- Apify fallback webhook endpoint: prompt 03 §"Apify webhook contract"
- Existing deployed Apify actor: `tuhinmallick/meta-ads-library-scraper` on apify.com (keep as-is — serves as fallback)

## Next scrapers (coming after this ships)

User will provide code/specs for:
- TikTok ads scraper
- YouTube / Google Ads Transparency scraper
- Instagram organic scraper (already partially integrated via Apify)
- Homepage snapshot (Playwright + pixelmatch) — can write from scratch based on architecture doc

Same pattern will apply: self-hosted primary, Apify fallback if any exists.
