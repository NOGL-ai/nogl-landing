# NOGL Prompts — Master Index

_Reading order + dependency graph + status for every prompt in this folder. Start here when picking up a new Claude Code session._

## How to use

1. Read this index to find a prompt that's **implementable** (no unmet deps).
2. Read `_TESTING_AND_DATA_APPROACH.md` — the shared testing spec every prompt references.
3. Open the prompt file — it's self-contained with context, Prisma schema, server actions, UI spec, acceptance criteria.
4. Read `.claude/research/*.md` files the prompt references for deeper background.
5. Run the prompt in a fresh Claude Code session with `claude` command.
6. Upon implementation: branch the name the prompt suggests, commit per the sequence, open a PR.

## Global rules (read first)

- `../CLAUDE.md` — data safety + multi-session coordination rules. **Especially the 10 HARD rules on DB schema operations.** Follow without exception.
- `_TESTING_AND_DATA_APPROACH.md` — how every feature ships with unit + integration + E2E tests + realistic seed data.

## Prompts by phase

### 📦 Foundation (already shipped / mostly done)
| # | Prompt | Status | PR / Branch |
|---|---|---|---|
| 17 | `17-tracked-competitors.md` | ✅ Deployed on CT 504 | merged into `crazy-archimedes-ed12d8` |
| 01 | `01-repricing-rebuild.md` | ✅ Deployed on CT 504 | merged into `crazy-archimedes-ed12d8` |
| 20 | `20-run-preview-repricing.md` | ✅ Via 01 | merged |
| 04 | `04-analytics-dashboards.md` | ✅ Shipped by parallel session | on branch |
| 02 | `02-trends.md` | 🟡 Partially shipped | branch `claude/funny-goodall-9b130b` — needs MV migration applied |
| 06 | `06-alerts-cmo-and-cfo.md` | 🟡 PR #33 open | `claude/priceless-haibt-085760` |

### 🚧 Core features (specs ready, not yet built)
| # | Prompt | Priority | Depends on |
|---|---|---|---|
| 07 | `07-demand-shaping.md` | HIGH — founder's demand-shaping pain point | None (forecast data from 18 helps) |
| 18 | `18-seed-forecast.md` | HIGH — unblocks demand page demo | None |
| 11 | `11-settings.md` | HIGH — gating deployment | 03 (for integrations tab) |
| 13 | `13-notifications.md` | MEDIUM — unifies bell icon | 06 (alerts hookup) |
| 10 | `10-cfo-import.md` | MEDIUM — onboarding win | 11 (settings for API keys) |
| 03 | `03-marketing-assets-expand.md` | MEDIUM | 14, 16 read from same MarketingAsset table |
| 14 | `14-events-scrapers.md` | MEDIUM | 03 (feeds events from MarketingAsset rows) |
| 15 | `15-events-timeline-ui.md` | MEDIUM | 14 (data source) |
| 16 | `16-assets-tab-expansion.md` | MEDIUM | 03 (shared components) |
| 09 | `09-cfo-docs.md` | LOW — polish | None |
| 19 | `19-hydration-title-fix.md` | LOW — polish | None |

## Dependency graph

```
                    ┌─────────────────────────────────────┐
                    │ 11 Settings (6 sections, v1)        │
                    └────────┬────────────────────────────┘
                             │
                    ┌────────▼────────────────────────────┐
                    │ 13 Notifications inbox              │
                    └────────┬────────────────────────────┘
                             │
                    ┌────────▼────────────────────────────┐
                    │ 06 Alerts CMO+CFO (real-time SSE)   │ ←── already PR #33
                    └─────────────────────────────────────┘

                    ┌─────────────────────────────────────┐
                    │ 03 Marketing Assets expand          │
                    │   (emails + homepages +             │
                    │    YouTube + TikTok + IG)           │
                    └────────┬────────────────────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
           ┌────────┐  ┌────────┐  ┌────────────────┐
           │ 14     │  │ 16     │  │ (already built │
           │ Events │  │ Assets │  │  Meta ads via  │
           │ scr.   │  │ tab    │  │  Apify actor)  │
           └───┬────┘  │ expand │  └────────────────┘
               │       └────────┘
               ▼
           ┌────────┐
           │ 15     │
           │ Events │
           │ timeln │
           └────────┘

                    ┌─────────────────────────────────────┐
                    │ 18 Seed forecast demo data          │
                    │   (Fujifilm Instax + Amazon Elec)   │
                    └────────┬────────────────────────────┘
                             │
                    ┌────────▼────────────────────────────┐
                    │ 07 Demand shaping                   │
                    │   (slider simulator + scenarios)    │
                    └─────────────────────────────────────┘

                    ┌─────────────────────────────────────┐
                    │ 10 Import Data wizard               │
                    │   (CSV + Excel, Shopware v2)        │
                    └─────────────────────────────────────┘

                    ┌─────────────────────────────────────┐
                    │ 09 Docs (Fumadocs MDX)              │
                    │ 19 Hydration/title fix              │
                    └─────────────────────────────────────┘
                             (independent polish)
```

## Recommended ship order

Based on founder priorities + dependency constraints:

### Week 1-2 (already done or in PR)
- ✅ Tracked competitors (17) — deployed
- ✅ Repricing engine (01 + 20) — deployed
- ✅ Dashboards (04) — deployed
- 🟡 Alerts (06) — PR #33, needs review + merge

### Week 3-4 (unblock demos + core features)
- 18 Seed forecast (fast win, unblocks /demand page)
- 07 Demand shaping (founder's ask)
- 11 Settings (needed before billing/team features)
- 13 Notifications (pairs with 06)

### Week 5-6 (expand competitive intelligence)
- 03 Marketing assets (big) + 14 Events scrapers + 15 Events UI + 16 Assets tab (all share code)
- 10 Import (onboarding improvement)

### Week 7+ (polish)
- 02b Trends external (Google Trends via Apify + Vercel Cron)
- 09 Docs (ops can own after)
- 19 Hydration/title fix

## Research docs reference

Each prompt cites specific research. Full list:

| Research doc | Feeds prompts |
|---|---|
| `pricefy-features.md` | 01, 20 |
| `run-preview-example.md` | 20 |
| `demand-shaping-calumet-spec.md` | 07 |
| `trends-strategy.md` + `trends-orchestration-options.md` | 02 |
| `analytics-dashboards-strategy.md` | 04 |
| `marketing-asset-scrapers.md` | 03, 14, 16 |
| `marketing-assets-ctr-research.md` + `marketing-assets-ctr-expansion-analysis.md` | 03 (why CTR is cut from v1) |
| `settings-notifications-profile.md` | 11, 13 |
| `import-data-strategy.md` | 10 |
| `decisions-log.md` | every prompt — founder's locked-in decisions |
| `trendscraper/` + `meta-ads-scraper/` | 02, 03 (reference scraper code) |

## Locked-in founder decisions (summary)

See `../research/decisions-log.md` for the canonical source. Highlights:

- **Alerts**: in-app inbox only, real-time, NOT digest/email/Slack
- **Tracked competitors**: Calumet = tenant, 5 others (Foto Erhardt, Fotokoch, etc.) auto-tracked as competitors
- **Events tab**: promo / product launched / discontinued / ad creative changed / newsletter sent — NO price changes (those are alerts)
- **Assets tab**: all types in one gallery with source-filter chips
- **Run Preview**: simulate (no DB writes) — then approve-selected → applies + rollback on 30-day window
- **Trends**: Particl-style internal first (5-day ship), Google Trends overlay second
- **Dashboards**: react-grid-layout + Copilot AI-assist, auto-save
- **Demand shaping**: unified simulator (pricing + promo + bundling + marketing as drivers), hybrid slider + scenario tree
- **Notifications**: keep `/en/alerts` + `/en/fractional-cfo/alerts` intact, add cross-cutting `/en/notifications` for mentions/invites/billing/system

## Open questions still blocking ship

Per research docs, the founder still needs to answer:

- Settings: multi-workspace per user? Y/N — affects URL structure
- Demand shaping: commit-semantics — does a committed scenario override everyone's forecast, or advisory?
- Marketing assets: Fastmail catch-all credentials? Meta Ad Library API token?
- Alerts: Slack/MS Teams in v2 or hard cut?

## Infrastructure state (CT 504)

Dev server: `http://10.10.10.182:3000` (internal), `https://scripts-helps-nest-ind.trycloudflare.com` (public tunnel)
- Branch: `claude/crazy-archimedes-ed12d8` (this PR)
- Postgres: `10.10.10.213:5432/nogl_landing` (schemas: `nogl`, `public`, `forecast` + runtime-added `imports`, `shaping`, `dashboards`, `alerts`, `events`, `assets`)
- Redis: `10.10.10.214:6379` (BullMQ queues + pub/sub channels)
- Calumet tenant: `cmnw4qqo10000ltccgauemneu`

## Contacts / ownership

- **Founder**: Tuhin Mallick — final call on product decisions
- **Primary tenant**: Calumet Photographic (DE) — first customer
- **Secondary tenants (tracked competitors)**: Foto Erhardt, Fotokoch, Foto Leistenschneider, Kamera Express, Teltec
