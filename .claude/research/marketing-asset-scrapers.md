# Marketing Asset Library — Sourcing Strategy

_Research date: 2026-04-19. Scope: 5 new asset types beyond the mature Meta Ads scraper — Emails, Homepage snapshots, YouTube/Google ads, TikTok ads, SMS. Target: Next.js + Prisma + Postgres + Redis SaaS, first tenant Calumet Photographic (German photo retail), ~10 competitors, daily refresh._

---

## Executive summary

Out of the six asset types in the Particl-style UI (Emails, Homepages, Mobile homepages, Instagram, SMS, Meta Ads) plus the founder's YouTube Ads ask, **four are realistic for a small SaaS to ship in v1, one is realistic but unglamorous, and one should almost certainly be cut.** Homepages (desktop + mobile are the same pipeline with two viewports) and YouTube/Google Ads are the cheapest wins: both have mature third-party data providers that cost under $100/mo combined for 10 competitors and need little ongoing maintenance. Emails are a solid v1 but the cost is 2-4 days of human work at subscription time, not technology — there is no magical API that beats running your own IMAP catch-all. Meta Ads is already done. Instagram organic should piggyback on an existing Apify actor. TikTok is shippable via Apify in the EU thanks to the DSA ad library, but data completeness is modest for retail.

**SMS is the outlier and should be deprioritized or cut.** For a German photo retailer, domestic SMS marketing is near-zero — the regulatory environment (TKG, UWG §7, BDSG) requires hard opt-in and makes SMS marketing rare outside a handful of DTC brands. The ROI of sourcing this is poor.

**Honest framing of the Particl advantage:** Particl has been operating a ~5-year panel of burner emails and phone numbers, plus a human-curated newsletter-subscription workflow across thousands of brands. You cannot match their coverage in six months. What you *can* match is **depth on 10-50 competitors with frequent refresh**, which is actually what a retail merchandising team needs. Frame the product as "deep tracking of your competitor set," not "biggest library of creative in the world."

---

## 1. Email newsletter capture

### Path A — Self-hosted IMAP catch-all (RECOMMENDED)

**`imapflow`** by Postal Systems is the right TypeScript library in 2026. Native types, promise-based async/await, **IDLE on by default** — near-realtime push without NOOP gymnastics. Same library powers the commercial EmailEngine product, so well-tested against misbehaving IMAP servers. Pair with **`mailparser`** (same author) for MIME/multipart/base64/quoted-printable.

**Mailbox choice:** **Fastmail business** (~$7/user/mo) gives unlimited aliases under a custom domain (`nogl-calumet-{brand}@yourdomain.de`) plus reliable IMAP. Gmail catch-all works but Google auto-classifies competitor newsletters into Promotions and sometimes flags aliases as spammy. Zoho Mail is cheaper but IMAP throughput is throttled. **Avoid Outlook/365** — Microsoft has been aggressively killing IMAP IDLE in favor of Graph.

**Pitfalls:**
- AMP-email parts must be explicitly ignored or they clobber the HTML body.
- `List-Unsubscribe-Post` headers reveal the ESP (Klaviyo, Mailchimp, Brevo) — store as a field.
- Store raw MIME in R2/S3 so you can reprocess as parsers improve.
- Strip tracking pixels before rendering (don't leak your IP to competitor analytics).
- Double-opt-in confirmations must be clicked manually — budget ~1 hour of human time per 10 brands at setup.

### Path B — Third-party archives

- **Milled.com** — 38M emails, 97k brands, $99/mo Pro tier for search + full archive, **no public API**. Good for one-off competitive research, useless for an automated pipeline.
- **MailCharts** — killed Pro tier; only Enterprise remains, quote-only, several hundred $/mo with sales calls.
- **Panoramata** — most credible MailCharts replacement. Self-serve signup, tiered monthly pricing. No public API — direct competitor, don't build on their rails.
- **ReallyGoodEmails, Email Tuna, Sparktoro, Supermetrics, Singer taps** — none have production email-archive APIs.

**Verdict:** self-hosted IMAP wins decisively. Annual cost: ~$85 (Fastmail) + negligible IMAP traffic.

### Recommended v1 stack

- Mailbox: Fastmail business with custom domain catch-all — ~$85/yr
- Library: `imapflow` + `mailparser` (TypeScript, IDLE push)
- Worker: Node service inside BullMQ on existing Redis
- Storage: Postgres via Prisma + raw MIME to R2
- Implementation: **3 days** engineering + ~4 hours human for initial subscriptions per tenant

---

## 2. Homepage / Landing-page snapshot

**Targets:** 10 competitors × 2 viewports (desktop 1440, mobile iPhone-14) × daily = **600 screenshots/month**, plus full HTML.

### Options

- **Visualping** — mature, self-serve API keys (Q1 2026) + webhooks. $50/mo Personal = 10k checks/200 pages covers 600/mo usage. Visual diff + AI-summarized change reports.
- **ScreenshotOne** — $17/mo for 2k / $79/mo for 10k. Excellent cookie-banner dismissal + full-page capture. Cheapest managed option.
- **Browserless** — managed Playwright, ~$50/mo.
- **Apify "Website Content Change Watcher"** — compute + proxy at daily × 2 viewports × 10 rivals Visualping.
- **Wayback Machine CDX** — free, not daily; useful as historical backfill.
- **Self-hosted Playwright** — one BullMQ worker per job, headless Chromium, full-page PNG + `page.content()` HTML, diff via **pixelmatch** with `maxDiffPixelRatio` ≈ 0.02, store deltas in R2. Cost: ~$0 marginal. Medium fragility — homepage bot-detection far lighter than ad/social; cookie-consent banners solved with per-domain dismiss selectors.

### Change-detection algorithm

Screenshot → perceptual hash (pHash via `sharp`) → compare against last hash. Only if Hamming distance > threshold, run pixelmatch for a precise diff image. Two-stage approach avoids pixelmatching 600/day when 90% of pages are identical. For HTML, normalize (strip timestamps, CSRF tokens, random class suffixes) before hashing.

### Recommended v1 stack

- Playwright self-hosted inside BullMQ — $0 marginal
- `sharp` for pHash, `pixelmatch` for diff image
- Cloudflare R2 for screenshot + HTML blob storage (~$0.015/GB/mo, negligible)
- Fallback: Visualping $50/mo Personal if self-host proves too flaky after 4 weeks
- Implementation: **4 days**

---

## 3. YouTube Ads / Google Ads Transparency Center

**Official API: none for general access.** Google has publicly confirmed there is no API for `adstransparency.google.com`. The Google Ads API's `AdTransparencyService` only exposes *your own* account's ads. Only exception: **EEA-only DSA transparency data** via researcher-gated API, not usable commercially.

### Third-party options

- **SerpApi Google Ads Transparency Center API** — clean JSON, pay-per-search (~$50/mo starter = 5k searches). Fields: advertiser, creative URL, video thumbnail, region list, date-range, ad format. Lowest-friction.
- **SearchApi.io** — same idea, slightly cheaper.
- **Apify actors** — `xtech/google-ad-transparency-scraper`, `automation-lab/google-ads-scraper`, `khadinakbar/google-ads-transparency-scraper`. 15+ fields per ad, regional filtering, 400 ads/min. Per-compute-unit ~$0.25-$2/run; 10 advertisers × daily ≈ $20-40/mo.
- **Bright Data Google Ads Scraper API** — 98%+ success rate, pay-per-record. Overkill at our volume; gold-standard fallback.

**Self-host:** Playwright against adstransparency.google.com works; internal JSON RPC endpoint can be intercepted similarly to Meta scraper. Medium-high fragility — schema rotates more aggressively than Meta, captchas after ~30 req/IP. Use as backup only.

**Fields available:** advertiser name + verified-ID + domain, creative ID, creative type (video/image/text), video URL (YouTube), thumbnail, regions served, first-seen / last-seen dates, ad variations per creative.

### Recommended v1 stack

- Primary: **Apify actor** (`xtech/google-ad-transparency-scraper`), daily per advertiser
- Backup: SerpApi as circuit-breaker fallback
- Cost: ~$30/mo Apify + optional $50/mo SerpApi
- Implementation: **2 days**

---

## 4. TikTok Ads / Creative Center

### Official access

- **TikTok Ad Library (DSA)** — EU/EEA/CH/UK only, per DSA Article 39. No official API; public web UI at `library.tiktok.com`.
- **TikTok Creative Center** — browsable without login for Top Ads / Trending Hashtags / Songs / Creators. Detailed views require TikTok For Business login.

### Third-party options

- **Apify `brilliant_gum/tiktok-ads-library-scraper`** — combines DSA library + Creative Center, dedupes. DSA source EU/EEA/CH/UK. Fields include `adPaidForBy`, `targetAgeGroups`, `targetGender`, `targetInterests`.
- **Apify `parseforge/tiktok-creative-center-top-ads-scraper`** — Creative Center Top Ads: ad copy, video URL, thumbnail, industry, objective, target country, keywords.
- **Apify `doliz/tiktok-creative-center-scraper`** — broader Creative Center (Top Ads, Trending Videos, Creators, Songs).

**Self-host: do not.** Dynamic device fingerprinting, WebGL challenges, Akamai BMP. Full-time job to maintain.

**Honest caveat for Calumet:** TikTok ad value for **German photo retail** is modest. Peers (Foto Erhardt, Foto Koch, Ringfoto, WexPhotoVideo) run limited TikTok paid campaigns. Ship it but label "Trending / Emerging" so empty-state is intentional.

### Recommended v1 stack

- Apify `brilliant_gum/tiktok-ads-library-scraper` (EU-scoped DSA)
- Optional: `parseforge` Creative Center actor for organic trending
- Cost: ~$20-40/mo combined for 10 advertisers × daily
- Implementation: **2 days**

---

## 5. SMS marketing

**Honest recommendation: defer or cut for v1. Ship only if founder has direct evidence competitors run SMS in DACH.**

### Reasons

1. **Low market prevalence in Germany.** UWG §7 and BDSG require explicit written opt-in for marketing SMS, fines up to €300k. Only a handful of DTC brands bother. Photo retail essentially doesn't.
2. **No clean third-party data source.** Particl sources SMS via its own US phone-number panel. MailCharts has a similar panel. No public API.
3. **DIY economics are bad.** Twilio DE long code doesn't support inbound marketing; Twilio DE requires Alphanumeric Sender IDs outbound only. For DE you need local carrier SIMs or an eSIM reseller (€15-30/number/mo). Expected inbound: <20 msgs/mo across 10 competitors.

**If the founder insists:** single pilot number (one Truphone eSIM), subscribe to 3 competitors most likely to run SMS, forward inbound to Twilio via SIM-to-cloud bridge, webhook into BullMQ, parse with regex. **3 days**, ~€30/mo. Ship as "SMS (preview)" with visible coverage-badge.

### Recommended v1 stack

**DO NOT BUILD.** Ship a disabled placeholder tab with "Coming soon — request access" to match the Particl-style UI shape without the cost.

---

## 6. Unified data model

**Use a single `MarketingAsset` table with a discriminator enum and a JSONB payload**, plus shared scalar columns. Do not create 6 sibling tables.

Justification: (a) the UI is a unified Asset Library with cross-type filters (brand, date, region), (b) ~80% of fields overlap, (c) the 20% that differs fits JSONB better than sparse columns, (d) Prisma handles polymorphic via enum + JSON cleanly, and Postgres JSONB GIN indexes make typed filtering fast.

```prisma
enum AssetType { EMAIL HOMEPAGE HOMEPAGE_MOBILE INSTAGRAM META_AD YOUTUBE_AD TIKTOK_AD SMS }

model MarketingAsset {
  id           String     @id @default(cuid())
  tenantId     String
  brandId      String
  assetType    AssetType
  capturedAt   DateTime
  sourceUrl    String?
  title        String?    // subject for email, headline for ad
  bodyText     String?    @db.Text
  language     String?
  region       String?
  mediaUrls    String[]   // R2 keys
  contentHash  String     // dedupe + change-detection
  payload      Json       // type-specific
  createdAt    DateTime   @default(now())

  brand        Brand      @relation(...)
  @@index([tenantId, brandId, assetType, capturedAt])
  @@index([contentHash])
}
```

---

## 7. Orchestration

**Recommendation: BullMQ on your existing Redis for everything except Apify actors, which stay on Apify's scheduler.**

Apify actors ship with built-in scheduler, retry, dataset export, and webhooks — re-orchestrating from BullMQ adds zero value and doubles failure surface. Let Apify run on Apify's cron and POST results to a Next.js API route that upserts to Postgres. For everything *you* own (IMAP IDLE worker, Playwright homepage worker, pHash/pixelmatch diffs), use BullMQ. Revisit Temporal when you exceed ~50 tenants or need cross-service sagas.

---

## 8. Legal / TOS checklist

| Source | TOS risk | GDPR | DSA/DMA |
|---|---|---|---|
| **IMAP catch-all** | Low — you subscribed. | Low — your inbox. Honor unsubscribes. | N/A |
| **Playwright homepages** | Medium. Scraping publicly accessible pages lawful in DE/EU; respect robots.txt, rate-limit <1 rps/domain. | Low for brand pages; avoid login-walled. | N/A |
| **SerpApi / Apify Google Ads Transparency** | Low — provider assumes risk. | Advertiser names = business data. | Google DSA research API gated; third-party work around it — watch TOS. |
| **Apify TikTok Ads Library** | Low — DSA library public. | Targeting fields aggregate, not re-identifying. | DSA-aligned; republishing permitted. |
| **Storing competitor creative** | Copyright — "de minimis / monitoring" under §60d UrhG; do not publicly redistribute. Tenant-only behind auth. | Low — creative rarely contains PII. | N/A |

**Operational requirements:** tenant DPA covering scraped competitor content; creative never exposed outside logged-in tenant; per-asset takedown flow (email to legal@, asset hidden ≤24h).

---

## 9. Prioritized ship order

### MVP (2 weeks)

1. **Homepage snapshots** — cheapest win, self-hosted Playwright. Highest value per engineering hour.
2. **YouTube / Google Ads** — 2-day Apify wrap. Differentiator vs. Particl because Google Ads Transparency covers DE natively.

### Wave 2 (next 2-3 weeks)

3. **Email newsletters** — 3 engineering days + ~1 human day per tenant for subscription setup. Start now so subscriptions double-opt-in and populate the archive.
4. **TikTok (DSA library)** — 2-day Apify wrap, sparse coverage expected. Ship with "Emerging" label.
5. **Instagram organic** — pairs naturally with Meta Ads scraper via Apify Instagram actors.

### Cut or defer

6. **SMS** — defer until (a) tenant explicitly requests with evidence, or (b) US-DTC vertical expansion.

---

## 10. Open questions for the founder

1. **Which 10 competitors for Calumet?** Cost changes drastically at 10 vs 50.
2. **Regions beyond DE?** AT / CH / NL scale Apify cost linearly.
3. **Budget ceiling per tenant/month?** ~$60-100/mo at 10 competitors; ~$300 at 50.
4. **Existing Fastmail / Google Workspace, or buy fresh?** Fresh domain preferred to avoid ESP blocklists.
5. **Retention.** 12 mo × 10 competitors × 2 viewports ≈ 3 GB PNG.
6. **SMS decision.** Hard cut v1, or ghost tab?
7. **Publication policy.** Will any asset be shown outside tenant login?
8. **Tenant-facing disclaimer.** OK with "coverage may be partial for DE/AT brands" badge?

## Sources

- [ImapFlow](https://imapflow.com/) · [imapflow npm](https://www.npmjs.com/package/imapflow)
- [Milled](https://milled.com/) · [MailCharts alternatives](https://www.softwaresuggest.com/mailcharts/alternatives) · [Panoramata](https://www.panoramata.co/track/newsletters)
- [Visualping pricing](https://visualping.io/pricing) · [Visualping Q1 2026](https://visualping.io/blog/q1-2026-release-recap)
- [Best screenshot APIs 2026](https://screenshotapi.to/blog/best-screenshot-apis)
- [Playwright visual snapshots](https://playwright.dev/docs/test-snapshots)
- [SerpApi Google Ads Transparency](https://serpapi.com/google-ads-transparency-center-api)
- [SearchApi Google Ads Transparency](https://www.searchapi.io/google-ads-transparency-center-api)
- [Apify xtech/google-ad-transparency-scraper](https://apify.com/xtech/google-ad-transparency-scraper)
- [Ads Insight Pro — Transparency Center 2026](https://www.adsinsightpro.com/blog/google-ads-transparency-center-guide/)
- [Google Ads API access policy](https://developers.google.com/google-ads/api/docs/api-policy/access-levels)
- [Bright Data Google Ads](https://brightdata.com/products/serp-api/google-search/ads)
- [Apify brilliant_gum/tiktok-ads-library-scraper](https://apify.com/brilliant_gum/tiktok-ads-library-scraper)
- [Apify parseforge/tiktok-creative-center](https://apify.com/parseforge/tiktok-creative-center-top-ads-scraper)
- [Twilio SMS US pricing](https://www.twilio.com/en-us/sms/pricing/us)
