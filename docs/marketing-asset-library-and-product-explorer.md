# Marketing Asset Library & Product Explorer (2026-04)

## Marketing Asset Library (`/[lang]/marketing-assets`)

- **Main route** now renders the **asset library** (Particl-style workspace): channel tabs, optional capture date range, company filter, title/body search, preset chips, two-column cards, detail modal, and paged **Load more** via `/api/marketing-assets`.
- **Ingestion health** (queues, events chart, creatives strip) moved to **`/[lang]/marketing-assets/pipeline`**. Nav: **Digital Shelf → Ingestion health**.
- **API query params** (fixed): the list endpoint accepts **`assetType`** or legacy **`type`**, and **`brandSlug`** or legacy **`brand`**. The UI sends `assetType` / `brandSlug`.
- **Presets** (server-side `AND` filters): discount emails, warehouse sales, restock alerts, luggage keywords, exclude cart-style emails, Canon products, video ads (YouTube + TikTok). Email-locked presets override the tab’s `assetType` where needed; **video-ads** forces YouTube/TikTok types.
- **SMS tab**: UI placeholder only — `AssetType` in Prisma has no `SMS` yet; no rows are returned until ingestion and schema exist.

## Product Explorer (`/[lang]/product-explorer`)

- **Landing**: suggested keywords, preview grid, **How to use**. Plain **`?q=`** redirects to research with canonical **`searchTerms`** (JSON array, URL-encoded), matching the Particl-style shareable URL pattern.
- **Research** (`/[lang]/product-explorer/research`): requires non-empty `searchTerms` (or `q` → redirect); supports **Load more** with `limit`. **`getScrapedProducts`** accepts a single string or string array (OR across terms).
- **Dashboard search field** navigates to research using `buildProductExplorerResearchHref`.

## Local verification

- `npm run typecheck`
- `npm run test:ci` — Jest is scoped to `src/**` and `tests/unit` / `tests/integration` only; Playwright specs under `tests/e2e` and `tests/performance` must be run with `npx playwright test`.
- `npm run build` — production build (Prisma generate on Windows may warn if `prisma.cmd` is missing; CI should run `prisma generate` explicitly if needed).

## Deploy

Commit and push this repo; production ([app.nogl.tech](https://app.nogl.tech)) updates when your CI/CD deploys the new revision. Protected routes still require sign-in.
