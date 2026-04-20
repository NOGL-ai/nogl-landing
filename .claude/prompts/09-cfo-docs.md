# Build /en/fractional-cfo/docs — in-repo MDX docs with Fumadocs

## Goal

Replace `/en/fractional-cfo/docs` "Coming soon" stub with a real in-app help center covering forecasting, replenishment, demand shaping, repricing, alerts, trends, and assets. Non-engineers (ops, support) should be able to edit docs without a PR.

## Recommendation: Fumadocs + MDX in-repo

Chosen after evaluating 13 options (MDX, Nextra, Docusaurus, Mintlify, GitBook, ReadMe, Fern, Notion-as-CMS, Sanity, Payload, Intercom, Algolia DocSearch, Kapa.ai).

**Why Fumadocs wins for this stack:**
- Next.js 14 App Router native (we're already on it)
- Tailwind + shadcn/ui compatible
- `next-intl` integration works out of the box (EN + DE)
- MDX lets ops write in plain markdown with React components sprinkled in
- Search works offline (no Algolia tax unless we want it)
- Deploys with the app — no separate deploy target
- Migration path to Mintlify/Docusaurus later is a simple export

Install:
```bash
npm install fumadocs-core fumadocs-ui fumadocs-mdx
npm install --save-dev @next/mdx gray-matter
```

## Route structure

```
src/app/(site)/[lang]/(app)/fractional-cfo/docs/
├── layout.tsx                   Fumadocs layout wrapper
├── page.tsx                     Landing: category cards
└── [...slug]/page.tsx           Dynamic page loader

content/docs/
├── meta.json                    nav + category structure
├── getting-started/
│   ├── meta.json
│   ├── welcome.mdx
│   ├── first-week.mdx
│   └── workspace-setup.mdx
├── core-features/
│   ├── meta.json
│   ├── forecasting.mdx
│   ├── replenishment.mdx
│   ├── repricing-rules.mdx
│   ├── demand-shaping.mdx
│   ├── competitor-tracking.mdx
│   ├── alerts.mdx
│   └── assets.mdx
├── admin-integrations/
│   ├── meta.json
│   ├── catalog-import.mdx
│   └── exports-webhooks.mdx
└── reference/
    ├── meta.json
    ├── faq.mdx
    ├── release-notes.mdx
    └── glossary.mdx       (EN + DE terms: MAP, UVP, Absatzplanung, Dispositionsvorschlag)
```

## MDX components

Register in `mdx-components.tsx`:

- `<Screenshot src="..." alt="..." />` — responsive image with shadcn Card wrapper
- `<VideoLoom id="..." />` — Loom embed
- `<Callout type="info|warning|success">`
- `<Steps>` numbered list
- `<ApiRef path="/api/..." method="POST">` — inline API reference

## Non-eng editing workflow

- `content/docs/**/*.mdx` lives in-repo, editable on GitHub via web UI
- Ops doesn't need to pull, run, or install anything — they edit in `github.com/NOGL-ai/nogl-landing/edit/main/content/docs/...mdx`, hit "Propose change", CI previews on Vercel, one-click merge
- Add `.github/CODEOWNERS` entry so doc changes auto-route to the ops@ GitHub team

## Search

Fumadocs ships a built-in keyword search using a Flexsearch index built at build time. Sufficient for <200 pages.

When docs grow >200 pages or multilingual search is critical, swap to Algolia DocSearch (free for open-source, $80/mo for us).

## AI help — future, not v1

Kapa.ai integration requires a public docs URL, which we'll have once this ships. Leave a placeholder hook `<AiHelpButton />` that renders nothing for v1 but can be upgraded later.

## Acceptance criteria

- [ ] `npm install` picks up fumadocs deps
- [ ] `content/docs/` contains at least 12 MDX pages per the outline
- [ ] `/en/fractional-cfo/docs` loads landing page with category cards
- [ ] `/en/fractional-cfo/docs/core-features/forecasting` renders the forecasting MDX page
- [ ] Search input filters results as user types
- [ ] EN/DE language switcher works (same MDX, different `[lang]`)
- [ ] "Was this helpful?" thumbs record to Postgres (`DocFeedback` table)
- [ ] Dark mode, mobile, typecheck+lint+build all pass

## Doc content outline (write these during implementation)

**Getting started**
- Welcome — who uses NOGL, tour of the 4 modules
- First week — checklist for a new customer (connect store, add competitors, set first rule, read first forecast)
- Workspace & users — invite teammates, set roles

**Core features**
- Forecasting — what `/en/demand` does, how to read quantile bands, what drives the numbers
- Replenishment — the Kanban board, PO lifecycle, stockout alerts hookup
- Repricing rules — 4-step wizard, strategies, guardrails, Run Preview, rollback
- Demand shaping — sliders, scenarios, waterfall decomposition
- Competitor tracking & trends — add competitors, Particl-style Internal Trends, external Google Trends (v2)
- Alerts — CMO vs CFO inboxes, subscription prefs, SSE real-time
- Assets & media — gallery, source chips, engagement proxies (not CTR)

**Admin & integrations**
- Catalog import — CSV + Excel + Shopware + Amazon SP-API
- Exports & webhooks (stub for v2)

**Reference**
- FAQ — 10 most-asked questions from support
- Release notes — dated entries, newest first
- Glossary — EN/DE retail-pricing terms (MAP, UVP, Absatzplanung, Dispositionsvorschlag, etc.)

## Out of scope

- External hosted docs (Mintlify, GitBook) — revisit at 120+ pages
- Full-text semantic search (Kapa, Inkeep) — v2
- API reference auto-generation from OpenAPI — v2

## Reference files

- Research: `.claude/research/settings-notifications-profile.md` §"Docs research" (if present)
- Testing: `.claude/prompts/_TESTING_AND_DATA_APPROACH.md`
- Existing `src/app/(site)/[lang]/(app)/fractional-cfo/docs/page.tsx` stub
- i18n: `src/i18n/` + `next-intl` config
