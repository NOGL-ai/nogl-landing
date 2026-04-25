# Founder Decisions Log

_Running log of explicit founder decisions during the planning session. These are pinned into future prompt files verbatim so implementers don't re-ask._

---

## Alerts (`/en/alerts` + `/en/fractional-cfo/alerts`)

- **Two pages**, shared UI component.
- Alert types (CMO): `PRICE_DROP`, `STOCK_OUT` (competitor's), `COMPETITOR_NEW_PRODUCT`, `PROMO_START`, `AD_CREATIVE_CHANGE`.
- Alert types (CFO): `STOCKOUT_IMMINENT`, `LOW_INVENTORY`, `REORDER_POINT_HIT`, `OVERSTOCK`, `STOCKOUT_ACTIVE`, `LEAD_TIME_BREACH`.
- Delivery: **in-app inbox only**. No email, no Slack.
- Frequency: **real-time** (not digest).
- Reference UI: Voids screenshots at `C:\Users\tuhin.mallick\Downloads\ALTERS PAGE CFO\`.

## Tracked Competitors

- Calumet Photographic = **the tenant's own company**.
- The other 5 in the DB (Foto Erhardt, Fotokoch, Foto Leistenschneider, Kamera Express, Teltec) = **auto-tracked as Calumet's competitors by default**.
- "Add Competitor" UI is **in scope** of that prompt.
- Seed on first-load: ensure those 5 are marked `isTracked=true` for the Calumet tenant.

## Events Tab (company detail page)

- Timeline shows: `{promo launch, new product, ad creative, newsletter sent}` events.
- **NOT** included: price changes (those are alerts, not events).
- Each event clickable to detail view with source screenshot/snippet.

## Assets Tab (company detail page)

- Expand from Instagram-only to **all asset types**:
  - Instagram posts
  - Ad creatives (Meta + TikTok)
  - Email screenshots (from newsletter scraper)
  - Landing-page snapshots (desktop + mobile homepages)
  - Product imagery
- Single gallery grid view with **source-filter chips** (chips let user filter to one or multiple sources).

## Repricing — "Run Preview" button behavior

- Button **simulates** the rule against current competitor prices (does NOT execute).
- Shows a modal with:
  - Summary: "X products would change price by Y% on average"
  - Table: per-SKU `current price → suggested price → delta %` rows
  - Margin check column (does each row violate the margin floor?)
  - Approve-all / Reject-all / approve-per-row actions
- See `.claude/research/run-preview-example.md` for the full example flow the founder requested.

## Trends

- Build **both** flavors eventually, but MVP-first = **Particl-style (internal dataset trends)** — 5-day ship using existing scraped data.
- Google Trends overlay = phase 2. Keep existing `tuhinmallick/actor-google-trends-scraper` Apify actor.
- Orchestration: **Apify Actor + Vercel Cron + webhook → Postgres** (Airbyte ruled out — see `trends-orchestration-options.md`).

## Analytics Dashboards

- Grid library: **`react-grid-layout`** (classic, still the right answer in 2026).
- Widgets: Top Table, Stat Card, Line Chart, Bar Chart, Pie/Donut, Sparkline, Heatmap, Text/Markdown.
- **Copilot** (AI-assist) — LLM-generated widget config from natural language prompt, user edits + confirms.
- Auto-save, dashboard-level filters, per-widget toolbar (expand/edit/delete/clone).

## Demand Shaping

- **One unified feature**, not three (pricing/promo + bundling + marketing attribution are driver families inside ONE simulator).
- Hybrid UX: slider simulator for exploration + scenario tree for save/compare/commit.
- MVP drivers (ship first): price change %, promo discount % + window, bundle on/off, inventory cap, season/event overlay.
- Waterfall decomposition chart is the single most important visual.

## Still Open — need founder decision

- **Import scope prioritization** — currently researching "every kind" (CSV + Excel + Shopify/Woo/Magento/Amazon/SP-API + DE-specific like Shopware/DATEV/JTL-Wawi). Final MVP scope TBD.
- **Docs approach** — currently researching in-repo MDX vs. external hosted. Will recommend Fumadocs.
- **Settings scope** — checklist not yet answered (profile, team, API keys, billing, integrations, locale).
- **Notifications scope** — inbox view vs. user-preference page vs. both.
- **Profile scope** — minimal vs. richer.
- **Newsletter inbox access** — IMAP host/user/app-password or set up fresh.
- **Meta Ads Library access token** — already registered with Meta, or to-do.
- **TikTok credentials** — have API access, or scrape Creative Center (public)?
- **Finance Analytics reference** — which product (Triple Whale / Glew / Lifetimely)?
- **Demand Shaping 8 open questions** — see `.claude/research/demand-shaping-calumet-spec.md` §8.
