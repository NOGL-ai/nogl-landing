# Google Trends Orchestration Options — Evaluation

_Context: Next.js 14 SaaS (TypeScript, Prisma, Postgres, Redis). Existing Apify Puppeteer actor works. Need scheduled runs, results piped to Postgres, re-trigger on product changes. Volume: 500–5,000 keyword queries / month._

## 1. Comparison table

Scores 1 (poor) – 5 (excellent). "Fit" = fit for Next.js + Prisma + Postgres + Redis + single-container deploy.

| # | Option | Setup | Monthly cost (500–5k q) | Reliability | Fit | Schedule | Observability | Migration | Future-proof |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Apify Actor + Vercel Cron + webhook** | 5 | $5 free → $49 Starter | 4 | 5 | Cron + REST ad-hoc | 4 | 1 (already there) | 4 |
| 2 | **Self-hosted Airflow** | 1 | $10–40 VPS + 8–16h DevOps/mo | 3 | 2 | Cron + sensors | 4 | 2 | 3 |
| 3 | **Airbyte** | n/a | n/a | n/a | 1 | n/a | n/a | n/a | **RULED OUT** — see §5 |
| 4 | **Temporal (self-host or Cloud)** | 2 | Self-host VPS; Cloud ~$200+ floor | 5 | 3 | Workflows + signals | 5 | 3 | 5 |
| 5 | **BullMQ + node-cron in Next.js** | 4 | $0 (reuse Redis) | 3–4 | 5 | Cron + repeatable | 3 | 2–3 | 4 |
| 6 | **SerpAPI / DataForSEO / Bright Data Trends API** | 5 | SerpAPI $75/5k, DataForSEO $3–10/5k, Bright Data ~$1.5/1k | 5 | 5 | Any | 4 | 4 (drop Puppeteer, swap to `fetch`) | 5 |
| 7 | **Glimpse API** | 4 | $99–$299 | 4 | 4 | Any | 3 | 3 | 4 |
| 8 | **Self-hosted Puppeteer on Hetzner/DO + PM2** | 3 | $5–15 VPS + proxies $20–100 | 2 | 3 | Cron | 1–2 | 3 | 2 |

Sources: Apify pricing, [SerpAPI pricing](https://serpapi.com/pricing), [DataForSEO pricing](https://dataforseo.com/apis/pricing), [Bright Data SERP API](https://brightdata.com/pricing/serp-api), [Glimpse API](https://meetglimpse.com/api), [Temporal Cloud](https://temporal.io/pricing), Airflow docs, BullMQ docs, [Airbyte connector catalog](https://docs.airbyte.com/integrations).

## 2. Top-line recommendation

**Keep the Apify actor. Orchestrate from Vercel Cron + a webhook-handling Next.js API route — wire it up in ~4–6 hours.** Budget 1–2 hours to evaluate SerpAPI or DataForSEO as a drop-in replacement once you hit the upper end of 5k queries/month or chase sub-hour freshness; they eliminate a class of Puppeteer maintenance at near-identical cost.

## 3. Concrete next actions (Option 1)

1. In Apify, create an **Actor Task** pinning `actor-google-trends-scraper` inputs (keyword source, geo=DE, timeframe, hl=de). Save Task ID as env var.
2. Add Prisma tables: `TrendSample { id, keyword, geo, timeframe, ts, value, runId, createdAt }` and `TrendRun { id, apifyRunId, status, startedAt, finishedAt, error }`. Migrate.
3. Thin `src/lib/apifyClient.ts`: one `fetch` to `POST /v2/actor-tasks/{taskId}/runs?token=...&webhook=<url>`. Server-side only.
4. Vercel Cron entry in `vercel.json` hitting `src/app/api/cron/trends/route.ts` (daily 03:00 UTC). Batch ≤100 keywords per run.
5. `src/app/api/webhooks/apify/route.ts`: verify signature, stream `dataset/items` from the finished run, `prisma.trendSample.createMany({ skipDuplicates: true })`, mark `TrendRun` done.
6. Product-change hook: server-action edits enqueue a one-off Apify run for just the new keyword(s). Debounce via existing BullMQ/Redis so bursts collapse to one run/keyword/hour.
7. Failure alerts: Apify Actor → "Notify on failed run" → email + Slack webhook. Log non-200 webhook responses to Sentry.
8. Lightweight `/admin/trends` server component listing last 20 `TrendRun` rows (status, duration, item count) — first-month observability.
9. Playwright E2E stubbing the Apify webhook asserting rows land in Postgres; Jest unit test for signature verifier.
10. Document `APIFY_TOKEN`, `APIFY_TASK_ID`, `APIFY_WEBHOOK_SECRET` in `.env.example`; keep the token server-only.

Total: ~4–6 hours. No new infra, no new language, no new container.

## 4. When to reconsider

- **Volume > ~10k queries/month** → switch to Option 6 (SerpAPI/DataForSEO). Apify compute-unit cost starts to lose. Migration is a `fetch` swap behind `apifyClient.ts`; schema unchanged.
- **Sub-hour freshness or real-time product-change triggering at scale** → move scheduling to Option 5 (BullMQ repeatable jobs) on a dedicated worker container; keep whichever data source.
- **>5 distinct data pipelines** (trends + pricing + inventory + reviews + competitor crawls) → adopt Option 4 (Temporal). TS-native, retries/timeouts/signals free. Skip Airflow — Python/DAG overhead not justified for a TS shop with handful of workflows.
- **Regulatory / audit pressure for guaranteed execution history and replay** → Temporal's event-sourced history wins.
- **Product pivots to trend discovery vs. per-SKU tracking** → evaluate Option 7 (Glimpse) as additive signal, not replacement.

Do _not_ reconsider just because Apify "feels like a dependency" — so is every other option. Migration cost to SerpAPI/DataForSEO is small precisely because you isolated it behind one client file.

## 5. Airbyte — explicit call: RULE OUT

Airbyte has **no Google Trends source connector**. The official catalog at [docs.airbyte.com/integrations/sources](https://docs.airbyte.com/integrations/sources/) lists hundreds of sources (Stripe, Salesforce, Google Ads, Google Analytics, Google Search Console, HubSpot…) but no Google Trends connector, and the community registry does not contain one either. No public `pytrends`-backed Airbyte source exists in the Marketplace.

More fundamentally, **Airbyte is an EL tool for structured SaaS APIs and databases**. Its connector SDK assumes a stable, authenticated, paginated REST/GraphQL/DB endpoint. Google Trends has no official API — the community endpoint (`trends.google.com/trends/api/*`) is unstable, throttled, and geo/cookie-sensitive, which is exactly why your Apify Puppeteer actor exists. Building a custom Airbyte source would mean embedding Puppeteer inside a connector container, fighting the SDK's streaming/state model, and still owning every Google-side breakage. You'd gain Airbyte scheduling (worse than plain cron here) and normalization (unnecessary — the actor already returns clean JSON) in exchange for real plumbing work.

**Airbyte IS the right tool** the day you want to pull Stripe, HubSpot, or Google Analytics into the same Postgres — but **not for Google Trends**. Off the shortlist for this workload.

## 6. One-line rationale per option

- **Apify (1):** already working, lowest migration cost, cheapest at current scale, first-class webhooks.
- **Airflow (2):** overbuilt for one DAG; Python tax; self-host pain outweighs benefits.
- **Airbyte (3):** no connector exists and the tool is wrong for Puppeteer scraping.
- **Temporal (4):** best future-proof orchestration — don't adopt for a single workflow.
- **BullMQ (5):** perfect *executor* (pair with Apify or SerpAPI) — not a full scraper replacement.
- **SerpAPI / DataForSEO / Bright Data (6):** the real upgrade path once volume or maintenance pain justifies $10–$125/mo.
- **Glimpse (7):** adjacent product — buy it when the use case is "what's trending in German camera retail" not "timeseries for SKU X".
- **VPS + PM2 (8):** cheapest on paper, most expensive in on-call pages — skip.
