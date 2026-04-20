# Meta Ads Library Scraper

Apify Actor for extracting data from Meta's (Facebook) Ad Library.

> **Status:** active. Last major architecture pass documented in
> [`/root/.claude/plans/read-through-the-whole-shiny-treasure.md`][plan]
> (April 2026).

## How it works

The Actor picks one of two paths per run, via an input router:

1. **Official Ad Library API** (`graph.facebook.com/.../ads_archive`) when an
   `accessToken` is supplied and the `adType` is a regulated category
   (political, housing, employment, credit). Stable, cursor-paginated, no
   selector rot.
2. **Browser scrape** (Playwright + Crawlee) when no token is provided or the
   ad type isn't regulated. Uses:
   - Stealth fingerprinting (user-agent rotation, viewport randomization,
     webdriver hiding, plugin/permission/hardware mocks).
   - **GraphQL interception** via Playwright's `page.route` to capture
     `AdLibrary*SearchResultsQuery` response bodies directly.
   - Cursor-aware pagination from the intercepted response
     (`page_info.end_cursor`) — not selector-based scrolling.
   - DOM fallback only when the GraphQL path yields nothing.
   - Persistent browser context + health monitor that rebuilds on
     `/checkpoint` challenge pages.

Both paths normalize into the same record shape and write to the Apify
Dataset. A local SQLite `state.db` provides cross-record deduplication,
resumability, and a structured error log. A gzipped raw-payload cache
(`storage/raw/`) lets you re-parse without re-scraping.

## Input

See [`INPUT_SCHEMA.json`](INPUT_SCHEMA.json) for the full schema. Key fields:

| Field | Type | Notes |
|---|---|---|
| `searchQuery` | string, required | Search term |
| `country` | string | ISO country code, default `ALL` |
| `adType` | enum | `ALL` / `POLITICAL_AND_ISSUE_ADS` / `HOUSING_ADS` / `EMPLOYMENT_ADS` / `CREDIT_ADS` |
| `maxAds` | int | 1–10000, default 100 |
| `accessToken` | string, optional | Meta Graph API token; enables official-API path for regulated ad types |
| `apiVersion` | string, optional | Graph API version, default `v19.0` |
| `extraApiParams` | object, optional | Forwarded verbatim to `ads_archive` (zero-code support for new Meta fields) |
| `shard` | `{index, total}`, optional | Run N actors in parallel covering disjoint ad-ID space |
| `rawCacheMaxBytes` | int | Cap on raw-payload cache, default 500 MB |
| `proxyConfiguration` | object | Apify proxy config; `RESIDENTIAL` recommended |
| `enableGraphQLInterception` | bool | Default true |
| `useAdvancedStealth` | bool | Default true |
| `headlessMode` | bool | Default false (headful is harder to detect) |

If `accessToken` is missing, the Actor silently falls back to the browser
path and logs that choice once per run.

## Output shape

```js
{
  adId, pageId, pageName, adContent,
  startDate, endDate,
  spend: { min, max, currency },
  impressions: { min, max },
  targeting: { ageMin, ageMax, genders, locations },
  platforms: [],                 // facebook / instagram / audience_network
  source: 'official_api' | 'graphql' | 'dom',
  raw: { cacheKey }              // pointer into storage/raw/<key>.json.gz
}
```

## Local development

```bash
npm install
npx playwright install --with-deps chromium
npm run lint
npm start              # runs src/main.js against a local input.json
npm test               # unit tests under tests/
```

## Deployment

This repo is an Apify Actor. The `Dockerfile` uses
`apify/actor-node-playwright-chrome:20` as the base image. Persist
`storage/state.db` (dedup, resume) and `storage/raw/` (payload cache) across
runs if your Apify plan supports a platform-persistent volume; otherwise they
scope to a single run.

## Known limitations

- **DOM-fallback selectors age.** Meta rotates class names frequently.
  Official-API + GraphQL intercept paths reduce how often DOM fallback
  actually fires, but it remains a maintenance surface. The nightly CI
  smoke test is the canary.
- **Official Ad Library API requires identity verification** from Meta.
  Apply at Meta for Developers. Without a token the Actor still works via
  the browser path.
- **Login-based scraping (cookies/auth) is not shipped.** Leaving it as a
  stub; the TOS/bans risk is materially worse than anonymous.

## License

MIT.

[plan]: https://claude.ai/code/session_01JDkb6z4jgniGSLL1X5q2eF
