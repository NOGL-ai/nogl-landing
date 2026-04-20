# Trends Feature — Strategy & Scraper Assessment

_Analysis of (1) the Google Trends scraper repo, (2) Particl's `/dashboard/trends` page, and (3) the recommended architecture for NOGL's `/en/trends` feature._

---

## TL;DR

**Particl's "Trends" page is NOT Google Trends.** It shows companies and product types that are growing fastest **inside Particl's own scraped retail dataset** — not external search volume. This is an important distinction: the two surfaces answer different questions.

| Surface | Question it answers | Data source |
|---|---|---|
| **Google Trends style** | "What are people searching for right now in the DE photo market?" | External signal — Google search volume |
| **Particl style** | "Which competitors and categories in my tracked dataset are growing fastest?" | Internal signal — our own scraped prices, new-product events, stock movements |

**Recommendation:** Build **both**, as two tabs on one page, in this order:
1. **Phase 1 — "What's trending in our dataset" (Particl-style)** — ships in ~1 week using data we already have. High operator value. No Apify dependency.
2. **Phase 2 — "External search trends" (Google Trends overlay)** — adds context to the internal signal. Use the existing scraper but migrate OFF Apify to a lighter orchestrator.

---

## 1. The scraper repo — analysis

Repo: [`tuhinmallick/actor-google-trends-scraper`](https://github.com/tuhinmallick/actor-google-trends-scraper) (fork of `emastra/actor-google-trends-scraper`, modernized in branch `claude/analyze-codebase-XNSk7` and merged to `master`).

### What it does

1. Accepts `{ searchTerms: string[], timeRange, geo, category, customTimeRange }` input OR a Google Sheet ID.
2. Spawns a `PuppeteerCrawler` (crawlee v3), loads `https://trends.google.com/trends/explore?q=<term>` per search term.
3. **Intercepts the internal `/trends/api/widgetdata/multiline` XHR response** before navigation (via `preNavigationHooks`) — this is the smartest thing in the code; it avoids the race where the chart renders before you attach a listener.
4. Parses the JSON (stripping Google's XSSI protection prefix `)]}'`), extracts `timelineData`, and writes one dataset row per search term with `{ searchTerm, [date1]: value, [date2]: value, ... }`.
5. Handles 429s, session-pool retirement, "no-data" widget state, extendOutputFunction for custom per-row enrichment.
6. Requires Apify residential proxies (enforced via `proxyConfiguration()` throwing if absent).

### Quality assessment

| Aspect | Rating | Notes |
|---|---|---|
| Modernization | ✅ Good | apify v3, crawlee v3, puppeteer ^22, Node 20 — all current |
| Error handling | ✅ Good | XHR interception, 429 recovery, no-data detection, timeout race |
| Testing | ❌ None | `package.json` test script literally says "oops, the actor has no tests yet, sad!" |
| Deduplication | ❌ None | Runs fresh every invocation |
| Caching | ❌ None | Same keyword re-runs re-scrape |
| Rate-limiting | ⚠️ Depends on Apify | No app-level rate limit beyond Apify session pool |
| Documentation | ✅ Solid | README covers every input option |
| Apify lock-in | ⚠️ High | `Actor.main`, `Actor.getInput`, `Actor.pushData`, `Actor.call('lukaskrivka/google-sheets')` for sheets import. Can't run outside Apify without refactoring. |

### Does it work right now?

From the code alone, yes — the 2021-11 fixes for SDK 2.1.0 + the 2026-04 migration to v3/crawlee look clean. **But Google changes trends.google.com's internal API periodically**, so "works on the day it was pushed" is not the same as "works in 6 months". A CI job should smoke-test it weekly against 2–3 fixed keywords.

### What it would cost to run for NOGL

Per the README: ~$0.80 per 1,000 keywords when batched. NOGL's realistic need:
- ~50 category-level keywords (camera body, mirrorless, lens adapter, etc.) × daily refresh = 1,500/month → **~$1.20/mo Apify**
- ~200 brand keywords (Canon EOS R5, Sony A7IV, etc.) × daily = 6,000/month → **~$4.80/mo**
- Plus Apify subscription (~$49/mo Starter tier to get residential proxies reliably)

**Bottom line: ~$50/mo on Apify for this. Cheap but adds a vendor dependency.**

---

## 2. Particl's `/dashboard/trends` — what it actually shows

Scraped from the live page (user is logged in). Page structure:

### Header
- "Platform Report" title
- Sub: "Explore trend charts across Particl to gain insight into the evolution of competitors, product types, and more."
- CTAs: "Stay Updated with Exploding Retail Trends", "Sign up for Emails", "Manage newsletter preferences"

### Filter / scope
- Date range selector (current: "Mar 15, 2026 and Apr 11, 2026" = 4 weeks)
- Entity-type filter: `All products` (default)
- Result count: "338 All products"

### Two main sections — each a card grid

**Section A: "Company"**
Trending companies ranked by growth in Particl's tracked product dataset. Each card:
- Company name (Yankee Candle, United By Blue, Archipelago, Hat Attack, Turtleson, XTRATUF, Coop Home Goods, …)
- A sparkline-style mini chart
- A growth number (119, 318, 188, 652, 999, …) — looks like % growth or rank-jump, not absolute count
- Optional "Extreme growth" badge for outliers

**Section B: "Product Type"**
Same card grid but for product categories: Knee High Boots (103), Dietary Supplements (107), Travel Pillows (285), Drilling Tool Accessories (247), …

### DOM signals (captured via JS console)
- **98 SVGs** — most are the per-card sparklines (21 canvas elements for higher-resolution chart rendering, 77 SVGs for icons/badges)
- **0 recharts wrappers** — Particl rolls their own chart primitive, likely Victory or D3 directly
- **17 buttons, 32 links** — minimal interactivity; each card is likely a link to a detail page

### What this is NOT
- It is NOT Google Trends. There's no "search volume over time" anywhere.
- It is NOT a generic industry trend report. It's specifically trends **within Particl's tracked product dataset** — so a trend reflects "this brand added X new products and their products moved Y in their catalog".
- It is NOT about user search behavior. It's about merchandising / catalog activity.

### What it IS
An **internal intelligence feed** — "look at what your tracked retailers are doing". For a NOGL equivalent, the data is already in our database: `scraping.scraped_items`, `public.products`, our ForecastProduct/Variant tables. We just need to compute period-over-period deltas and rank them.

---

## 3. The decision: which "Trends" does Calumet need?

Both, but for different reasons and at different timelines. Below are concrete use cases per surface.

### Particl-style ("Internal Trends") — what it's for at Calumet

- **"Which competitors launched the most new products last 4 weeks?"** → rank companies by new-product-count delta.
- **"Which categories are our competitors pricing up/down the hardest?"** → rank product-types by median price change.
- **"Which SKUs did Foto Erhardt add that we don't carry?"** → assortment-gap opportunities.
- **"Which brands are trending across my tracked set?"** → merchandising signal, bundle candidates, ad-targeting hints.

This is **the feed Calumet's pricing/category managers will open every morning**. It's high-frequency, high-value, and entirely derived from data we already scrape. **Build this first.**

### Google-Trends style ("External Trends") — what it's for at Calumet

- **"Is 'mirrorless camera' search volume rising or falling?"** — macro-category signal.
- **"Did the Sony A7V launch generate more search interest than the Canon R5 II?"** — brand momentum.
- **"What's the search-volume curve for 'gimbal stabilizer' in Germany vs. EU?"** — geo + category overlay.
- **"Which rising queries does Google show for 'camera drone'?"** — emerging-trend discovery.

This is **not a daily-use surface** — operators look at it weekly/monthly for planning. It's a **context overlay** to anchor the internal signal. **Build this second.**

### Combined as a single page

Layout for `/en/trends`:

```
┌──────────────────────────────────────────────────────────────────┐
│ Trends                                                            │
│ ─────────────────────────────────────────────────────────────────│
│ [Internal ▾] [External ▾] (tabs)                                  │
│ ─────────────────────────────────────────────────────────────────│
│ Internal tab (default):                                           │
│   Period: [Last 4 weeks ▾]   Scope: [Calumet + 5 competitors ▾]  │
│                                                                    │
│   🏢 Companies (Fastest growing)    🏷 Product types (Fastest)    │
│   ┌────────────────┐ ┌──────────┐   ┌────────────────┐ ┌────────┐│
│   │ Foto Erhardt   │ │ Fotokoch │   │ Mirrorless Body│ │ Lenses ││
│   │ +23 new SKUs ▲ │ │ +12 ▲    │   │ +18 new ▲      │ │ +11 ▲  ││
│   │ ▁▂▃▄▅▆▇        │ │ ▁▂▂▃▅    │   │ ▁▁▃▄▅▇         │ │ ▂▃▄▅   ││
│   └────────────────┘ └──────────┘   └────────────────┘ └────────┘│
│                                                                    │
│ External tab:                                                      │
│   Google search volume, related queries, regional breakdowns      │
│   (powered by the Apify scraper — takes ~30s on demand)           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Architecture recommendation

### Phase 1: Internal Trends (ships this sprint)

**Data source:** existing Postgres. Add one materialized view or a nightly job:

```sql
-- Materialized view: company_trends_4w
CREATE MATERIALIZED VIEW company_trends_4w AS
SELECT
  c.id as company_id,
  c.name,
  c.slug,
  COUNT(*) FILTER (WHERE p.created_at > NOW() - INTERVAL '4 weeks') as new_products_4w,
  COUNT(*) FILTER (WHERE p.created_at > NOW() - INTERVAL '8 weeks'
                   AND p.created_at <= NOW() - INTERVAL '4 weeks') as new_products_prev_4w,
  AVG(po.price_change_pct) FILTER (WHERE po.observed_at > NOW() - INTERVAL '4 weeks') as avg_price_change_4w,
  ...
FROM nogl."Company" c
LEFT JOIN public.products p ON p.company_id = c.id
LEFT JOIN public.price_observations po ON po.product_id = p.id
GROUP BY c.id, c.name, c.slug;

REFRESH MATERIALIZED VIEW CONCURRENTLY company_trends_4w;  -- run every 4 hours via cron
```

**Server action:** `listInternalTrends(scope: 'company' | 'category', period: '4w' | '12w' | '52w')` returning ranked cards with sparkline data.

**UI:** shadcn/ui card grid; Recharts `<Sparkline>` component; click-through to the existing company/product detail pages. ~3-5 days of focused work.

### Phase 2: External Trends overlay (next sprint)

The scraper repo stays as-is, but we **migrate off Apify** for cost, vendor-independence, and operability reasons. See the sibling research doc `trends-orchestration-options.md` (being generated in background) for a scored comparison.

**Preliminary call:** the strongest options are:
- **Option A (pragmatic):** Keep using the Apify Actor via their REST API (run our own cron → call Apify → webhook writes results into our Postgres `TrendObservation` table). Low effort, predictable cost. Recommended for v1.
- **Option B (ship-proof):** Replace with **SerpAPI Google Trends** or **DataForSEO Trends API** — managed APIs, no scraping, no proxy headaches. ~$75–125/mo. Better reliability but pay-per-query.
- **Option C (DIY):** Self-host the Puppeteer scraper with **BullMQ + Redis** inside the existing Next.js app (we already have Redis). Cheapest, most brittle.

**Ruled out immediately:**
- **Airbyte** — not a fit. Airbyte connectors are for structured SaaS APIs (Stripe, Hubspot, Shopify, Postgres CDC). No official Google Trends connector exists, and the ecosystem's `airbyte-ci` tooling assumes a typed API, not Puppeteer. Building a custom Airbyte source for a Puppeteer scraper is a 2-3 week project with no ongoing benefit over a plain cron job.
- **Airflow** — technically works but massive overkill for one scrape-and-store job. Self-hosted Airflow is a multi-hour-per-month ops burden that buys you nothing at this scale.

**Wait for the orchestration research agent** (running in background, expected in 5-10 min) for the full scored comparison before committing.

### Schema additions (Phase 2 only)

```prisma
model TrendsKeyword {
  id              String              @id @default(cuid())
  companyId       String              // tenant-scoped
  term            String
  geo             String              @default("DE")
  category        String?             // Google Trends category code
  isActive        Boolean             @default(true)
  lastScrapedAt   DateTime?
  createdAt       DateTime            @default(now())

  observations    TrendsObservation[]

  @@unique([companyId, term, geo, category])
  @@schema("trends")
}

model TrendsObservation {
  id            String        @id @default(cuid())
  keywordId     String
  observedAt    DateTime      @db.Date    // date of the data point
  scrapedAt     DateTime      @default(now())  // when we fetched it
  value         Int           // 0-100 relative volume
  source        String        @default("GOOGLE_TRENDS")
  geo           String

  keyword       TrendsKeyword @relation(fields: [keywordId], references: [id], onDelete: Cascade)

  @@unique([keywordId, observedAt, geo])
  @@index([keywordId, observedAt])
  @@schema("trends")
}
```

### Concrete first-5-days for an engineer

1. Create the `trends` schema + `TrendsKeyword` / `TrendsObservation` + `company_trends_4w` materialized view migration.
2. Create `/en/trends` page with two tabs (Internal / External).
3. Build `InternalTrendsClient.tsx` — fetches from `listInternalTrends` server action, renders card grid with sparklines.
4. Write a nightly cron (`scripts/refresh-trends-mv.ts`) that refreshes the MV.
5. Seed ~80 keywords for Calumet (camera bodies, top lenses, top brands, key categories) as `TrendsKeyword` rows.

Phase 2 adds: Apify API integration (or SerpAPI), TrendsObservation ingest route, External tab UI with recharts line chart + related-queries list.

---

## 5. Open questions for the founder

1. **Budget for external trends.** $50/mo Apify vs. $125/mo SerpAPI vs. $0 self-hosted-and-fragile. Which tier are you on?
2. **Refresh cadence for external trends.** Daily is enough for macro signal; is there a tracker-style use case that needs hourly?
3. **Keyword list origin.** Do you want operators to add/remove keywords via UI, or should the keyword list auto-derive from tracked products (category + brand + title)?
4. **Geo split.** Always `DE`, or should we support multi-geo (AT, CH) out of the box?
5. **Alert integration.** Should a "trending up >50% week-over-week" keyword auto-create an Alert (CMO-type)? If yes, prompt 06 already has the hook.
6. **Email/digest of trends.** Particl has "Sign up for emails" CTA on this page. You said **real-time in-app inbox only** earlier for alerts — does that apply to trends too, or is a weekly email of top movers in scope?

---

## 6. Files produced by this analysis

- `.claude/research/trends-strategy.md` — this doc.
- `.claude/research/trendscraper/` — cloned repo for code review.
- `.claude/research/trends-orchestration-options.md` — pending (background agent running).

## 7. Next step for the founder

Reply with **one of these three paths** so I can write the final `02-trends.md` prompt file:

- **A) Internal-first (Particl-style) only** — fastest value, ships in 5 days, uses existing data. Add external later.
- **B) External-first (Google Trends) only** — keeps the existing scraper investment, but needs orchestration + keyword-management UI. ~2 weeks.
- **C) Both at once, two tabs** — 2-3 weeks but is the complete picture. Recommended if you have a team of 2.

My recommendation: **A now, B in 2 sprints** — the internal view is a daily-use tool, the external view is a weekly planning surface.
