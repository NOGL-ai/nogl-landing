# Scraper & Ingestion Architecture — honest answer to "Scrapy or not? How to run this?"

_Consolidated decision doc after the founder's deep-dive questions on scraper stack, queue separation, and running newsletter signup + inbox polling._

---

## TL;DR — the decisions

1. **Do NOT use Scrapy** for this project. Use **Apify actors + Playwright + BullMQ** instead.
2. **Split into TWO queues** with **separate worker containers**:
   - `browser_intensive` — newsletter signup, homepage diff, ad-library scraping (runs on browser-capable VM)
   - `ingest_light` — IMAP polling, MIME parsing, Postgres upserts, LLM classification (runs on standard Node worker CT)
3. **State machines live in Postgres**, not in Scrapy queue state. Never couple business state to a scraper.
4. **Three repo boundaries** (not monorepo sprawl):
   - `nogl-landing` (this repo) — Next.js app + server actions + BullMQ workers (ingest)
   - `actor-google-trends-scraper` — Apify actor, already migrated to v3 per parallel session
   - `meta-ads-library-scraper` — Apify actor, already modernized per parallel session
   - Future: one repo per scraper kind that needs custom logic

---

## Why not Scrapy

Scrapy is excellent at **recursive HTML crawling of a content tree** (news sites, docs, wikis). Our actual use case is **state-machine ingestion** across many sources — Scrapy fights you here:

| Our reality | Why Scrapy is wrong for it |
|---|---|
| Competitor emails arrive irregularly via IMAP | Scrapy has no IMAP primitive |
| Meta Ads Library uses GraphQL XHR interception | Scrapy pipelines don't natively intercept browser XHRs |
| TikTok DSA library requires persistent Playwright sessions across challenges | Scrapy's response cycle is stateless — fights you |
| Homepage diff needs per-domain cookie-consent selectors + pixelmatch | Scrapy's spider-per-domain model multiplies code |
| Newsletter signup is a long-lived state machine (candidate → attempted → confirmed → receiving) | Scrapy has no persistent task state |
| Business logic (promo detection, event emission) is heavily DB-driven | Scrapy pipelines pull you AWAY from DB-first logic |

Scrapy remains useful for **one thing only in our world**: scraping *public newsletter archive sites* (Milled, EmailTuna) as a read-only backfill source. If we ever need that, a one-off Scrapy project in a separate repo is fine. For everything else: **Apify + Playwright + BullMQ wins**.

---

## The three-layer architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 1 — ACQUISITION                                                │
│                                                                       │
│ Apify actors (hosted)       Playwright workers (self-hosted)         │
│ ─────────────────────       ───────────────────────────────          │
│ • Meta Ads Library          • Homepage daily screenshot + pHash      │
│ • YouTube/Google Ads        • Cookie-consent dismissal per domain    │
│ • TikTok DSA Library        • Newsletter signup flows                │
│ • Instagram posts           • Captcha / challenge detection          │
│ • Google Trends (phase 2)                                             │
│                                                                       │
│ Output: all three converge on a standard JSON record posted via      │
│         HMAC-signed webhooks to /api/ingest/*                         │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 2 — INGEST & PERSISTENCE                                       │
│                                                                       │
│ BullMQ queues on existing Redis (10.10.10.214)                       │
│ ────────────────────────────────────────────────                     │
│ browser_intensive              ingest_light                          │
│   • playwright-home-snapshot     • apify-webhook-process             │
│   • newsletter-signup            • imap-idle-stream                  │
│   • newsletter-confirm           • parse-mime                        │
│                                  • dedupe-and-upsert                 │
│                                  • compute-engagement-proxies        │
│                                  • emit-events                       │
│                                                                       │
│ Workers:                                                              │
│   browser_intensive: Playwright-capable node (VM or CT with Chrome)  │
│   ingest_light:      Standard Node CT, no browser deps               │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 3 — INTELLIGENCE & SURFACING                                   │
│                                                                       │
│ Postgres source of truth:                                             │
│   • MarketingAsset      (prompt 03)                                  │
│   • CompetitorEvent     (prompt 14)                                  │
│   • Alert               (prompt 06)                                  │
│   • ForecastQuantile    (prompt 18)                                  │
│                                                                       │
│ LLM classification (optional, on-demand via /api/classify):          │
│   • event-narrative-writer      (Claude — turns raw events into      │
│     Particl-style AI commentary tying event to sales data)           │
│   • promo-detector              (Claude — more robust than regex)    │
│   • aesthetic-scorer            (Qwen2-VL / LLaVA — 0-10 on creative)│
│                                                                       │
│ UI consumes from Postgres only (no queue awareness in /en/*)         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Queue separation rationale

**Never mix browser jobs and data jobs in the same worker pool.** Browser jobs:
- Use 300+ MB RAM each (Playwright Chromium)
- Have variable latency (30s – 5 min per job)
- Can hang indefinitely on challenges / captchas
- Don't parallelize well per container (1-2 concurrent browser jobs max)

Data jobs:
- Use <50 MB each
- Are predictable (10ms – 5s)
- Never hang (bounded by IMAP / DB timeouts)
- Scale horizontally (50+ concurrent no problem)

If you mix them in one pool, **data jobs starve** whenever a browser job gets stuck. Two pools = browser jobs can't block anything else.

### Concrete deployment

| Component | Location | Concurrency | Notes |
|---|---|---|---|
| Redis (BullMQ backend) | CT 214 | — | Existing |
| Postgres | CT 213 | — | Existing |
| Next.js app + BullMQ producer | CT 504 (`/root/nogl-landing`) | — | Existing |
| `ingest_light` worker | New CT or same CT 504 separate PM2 process | 10-50 concurrent | Reuses app's `node_modules` |
| `browser_intensive` worker | New browser-capable VM (Playwright deps pre-installed) | 2-4 concurrent | Separate container, can be killed/restarted without affecting other services |
| Apify actors | Apify cloud | Apify-managed | Webhook → `/api/ingest/apify` |

---

## Newsletter-specific architecture

Per the founder's deep question: newsletter ingestion is a **state machine**, not a scrape loop.

### State diagram

```
candidate_brand
      │  operator adds competitor to tracking list
      ▼
signup_attempted       ← Playwright fills form, submits
      │  form succeeds
      ▼
pending_confirmation   ← waiting for double-opt-in email
      │  confirmation link clicked (headless)
      ▼
confirmed              ← IMAP IDLE subscribed to the alias
      │  first email arrives
      ▼
receiving              ← normal operating state
      │  optional: no email for 30 days
      ▼
dormant                ← flag for operator review
```

### Prisma model

```prisma
enum NewsletterSubscriptionStatus {
  CANDIDATE
  SIGNUP_ATTEMPTED
  PENDING_CONFIRMATION
  CONFIRMED
  RECEIVING
  DORMANT
  FAILED
  @@schema("assets")
}

model NewsletterSubscription {
  id              String                       @id @default(cuid())
  tenantId        String
  brandId         String
  alias           String                       @unique  // e.g. nogl-calumet-foto-erhardt@yourdomain.de
  signupUrl       String?                      // if discovered via Scrapy archive
  status          NewsletterSubscriptionStatus @default(CANDIDATE)
  lastEmailAt     DateTime?
  signupAttemptedAt DateTime?
  confirmedAt     DateTime?
  failureReason   String?
  metadata        Json?

  brand           Company                      @relation(fields: [brandId], references: [id])

  @@index([tenantId, status])
  @@index([brandId])
  @@schema("assets")
}
```

### Worker breakdown

1. **`browser_intensive` queue**:
   - `newsletter-signup` — Playwright opens competitor homepage, finds subscribe form, submits with alias, transitions status to `PENDING_CONFIRMATION`
   - `newsletter-confirm` — Playwright opens confirmation link from IMAP, transitions status to `CONFIRMED`
   - `newsletter-signup-retry` — re-attempt failed signups with different form-detection heuristics

2. **`ingest_light` queue**:
   - `imap-idle-stream` — long-running IMAP IDLE connection per tenant inbox. Receives push notifications from Fastmail, transitions subscriptions from `CONFIRMED` → `RECEIVING` on first email, creates `MarketingAsset` rows, emits `NEWSLETTER_SENT` events.
   - `parse-mime` — extract headers, HTML, images, promo detection via regex
   - `dedupe-and-upsert` — contentHash-based dedup

### NOT Scrapy

Signup + confirm MUST NOT run as Scrapy spiders. They're request-response state transitions, not recursive crawls. Trying to bend Scrapy around this = misery.

---

## Answer to: "Do you think scrapy?"

No. Scrapy is the wrong paradigm for this entire platform. Here's the rationale you can reuse for future scraper decisions:

| Scrapy is right when... | Our case? |
|---|---|
| Target is a public HTML tree to crawl recursively | ✗ (our targets are APIs + emails + browser-rendered apps) |
| You need >10 concurrent requests per spider | ✗ (single-digit concurrency to avoid bans) |
| You want middleware-style request pipelines | ✗ (we want BullMQ job pipelines, which are more flexible) |
| You deploy to Scrapy Cloud or Scrapyd | ✗ (we deploy to Apify + self-host Playwright) |
| Output is dominated by parsed HTML items | ✗ (our output is multimodal — emails, images, JSON APIs, MIME) |

Scrapy has exactly one valid niche in our world: **scraping public email-archive sites** (Milled, EmailTuna) as a read-only backfill. If/when we need that, one isolated Scrapy project in its own repo. Never imported into the main app.

---

## Answer to: "Where to run it?"

**Newsletter signup runner** → browser-capable VM (new or existing Playwright host). Register a BullMQ worker with `concurrency: 2`, listening only on `browser_intensive` queue.

**Inbox IMAP + parse worker** → standard Node CT. Register a BullMQ worker with `concurrency: 20`, listening only on `ingest_light` queue.

**Scheduling** → BullMQ repeatable jobs or `node-cron` inside the ingest worker (e.g. daily homepage snapshot triggers every day at 03:00 UTC, which enqueues 10 × `playwright-home-snapshot` jobs to `browser_intensive`).

---

## Repo boundaries

**In nogl-landing (this repo):**
- BullMQ workers (in `workers/` directory)
- API webhook receivers (`/api/ingest/*`)
- Server actions that query Postgres (UI-facing)

**In separate repos (each its own deploy):**
- `actor-google-trends-scraper` — Apify actor
- `meta-ads-library-scraper` — Apify actor
- Future `homepage-diff-worker` — Playwright worker (if we outgrow running it inside nogl-landing)
- Future `newsletter-signup-worker` — Playwright worker (ditto)

**Don't**:
- Put scraper code inside `nogl-landing/src/` — it leaks browser deps into the Next.js build
- Import Apify SDK types into Next.js server actions — use the webhook payload JSON schema instead
- Run scrapers in Vercel serverless — 15-min timeout, no persistent IMAP

---

## "But Scrapy is already in the company's stack"

The founder mentioned an existing Scrapy setup (`scraping.scraped_items` table with 160k+ rows). That's fine to keep for its current job (e-commerce product catalog scraping from `calumet.de`, `foto-erhardt.de`, etc.). It's NOT the right choice for new capabilities we're building here (newsletter capture, ad-library intercept, homepage diff).

**Don't rip out the existing Scrapy.** Don't expand it either. Let it do what it does, run the new scrapers in the new architecture described above, and use Postgres as the join point between the two worlds.

---

## Key takeaways for any future session

- ✅ Apify for hosted scraper-as-a-service (Meta, YouTube, TikTok, Instagram ads)
- ✅ Playwright + BullMQ for self-hosted browser workloads (homepage, newsletter signup)
- ✅ IMAP + `imapflow` + BullMQ for inbox capture
- ✅ Two queues: `browser_intensive` (2-4 concurrent) + `ingest_light` (10-50 concurrent)
- ✅ State machines in Postgres, not in Scrapy
- ✅ One repo per scraper domain; don't sprawl nogl-landing
- ❌ Scrapy for new capabilities
- ❌ Mixing browser and data jobs in one worker pool
- ❌ Vercel serverless for long-running IMAP / Playwright

---

## Open questions for the founder

1. **Browser host** — is there an existing Playwright-capable VM (e.g. nogl-dev CT 504 already has Chromium installed for existing flows), or do we spin up a new one?
2. **Inbox hosting** — Fastmail business (~$7/user/mo) vs. using existing workspace email — decided in prompt 03.
3. **Apify budget** — one combined team plan (~$200/mo) covers all current + future actors?
4. **When to split `nogl-landing` into sub-repos** — my vote: at 50+ tenants or when deploy times exceed 5 min.
