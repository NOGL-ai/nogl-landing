# Expand Assets tab to unified gallery (Instagram + Meta ads + YouTube + TikTok + emails + homepages + product imagery)

## Goal

The Assets tab at `/en/companies/[slug]/assets` currently shows only Instagram posts + stats ("0 Instagram followers"). Expand to a unified gallery grid showing **all asset types** (Instagram, Meta Ads, YouTube Ads, TikTok Ads, Email screenshots, Landing page snapshots, Product imagery) with source-filter chips — mirroring Particl's `/dashboard/assets/*` UI.

This is the **company-detail counterpart** to `/en/marketing-assets` (prompt 03). Both read from the same `MarketingAsset` table. **Use the SAME `<AssetCard>` component + detail modal** — don't duplicate.

## Reference material — READ FIRST

- `.claude/prompts/03-marketing-assets-expand.md` — full MarketingAsset model + scraper orchestration
- `.claude/research/marketing-asset-scrapers.md` — per-type details
- `.claude/research/decisions-log.md` → "Assets tab" decision (all types + source-filter chips)
- Existing `AssetsTab.tsx` — only has Instagram; needs expansion

## Scope

When a user is on a competitor's detail page (e.g. `/en/companies/foto-erhardt-de/assets`), show ALL that competitor's marketing assets regardless of type, in one gallery, with source-filter chips at the top to narrow.

## UI spec

### Header stats row
Replace the Instagram-only stats with aggregate stats across asset types:

```
┌───────────────────────────────────────────────────────────────┐
│  Foto Erhardt — Assets                                         │
│                                                                 │
│  📧 312 emails   📘 47 Meta ads   ▶️ 12 YouTube   🎵 3 TikTok   │
│  📸 1,240 IG posts   🏠 90 homepages   🖼 14,665 products       │
│                                                                 │
│  Last 90 days · Refresh every 24h                               │
└───────────────────────────────────────────────────────────────┘
```

Each stat clickable — navigates to the full Marketing Assets Library (`/en/marketing-assets`) pre-filtered to that brand + asset type.

### Source-filter chips (horizontal scroll on mobile)

```
[All] [📧 Emails] [📘 Meta ads] [▶️ YouTube] [🎵 TikTok] [📸 Instagram] [🏠 Homepages] [🖼 Products]
```

Click → filters the gallery grid below to that type. Chip shows count badge.

### Date range + preset filters

Secondary filter row:
- Date range (default: last 90 days)
- Presets (same as Marketing Assets Library): Discount emails, Restock alerts, Luggage companies, etc.

### Gallery grid

Reuses `<AssetCard>` from prompt 03 — 3-4 col responsive grid:

Each card:
- Hero image/video thumbnail
- Type icon + timestamp overlay
- Title + brand name (brand is known from context but shown for consistency)
- Engagement proxies row: longevity · iteration rate · aesthetic score

### Detail modal

Click card → opens shared `<AssetDetailDialog>` from prompt 03. Same component, same fields.

### Empty state

When this brand has no assets of the selected type: illustration + "No {type} captured for {brand} yet. Asset collection runs daily — check back tomorrow, or [trigger manual capture] if you're an admin."

### "Trigger manual capture" (admin-only)

Button sends POST to `/api/marketing-assets/capture` with `{ brandId, assetType }`. Enqueues a BullMQ job (for self-hosted captures like homepage/email) or triggers an Apify task manually (for ad-library captures).

## Integration with existing AssetsTab

Modify `src/components/companies/tabs/AssetsTab.tsx`:

1. Keep the `<StatsBar>` component but expand it to show all 7 asset-type stats
2. Replace the Instagram-only grid with the multi-type gallery
3. Add source-filter chips component
4. Wire up the shared `<AssetCard>` + `<AssetDetailDialog>` from prompt 03

## Server actions

Reuse from prompt 03:

- `listMarketingAssets({ tenantId, brandId, assetTypes, dateRange, search, sortBy, page })` — add `brandId` filter when on company page
- `getAssetStats(tenantId)` returns per-type counts — we need a brand-scoped variant: `getAssetStatsByBrand(brandId)`

No new server actions. Just filter existing ones by brandId.

## Acceptance criteria

- [ ] `/en/companies/calumet-de/assets` shows ALL asset types (not just Instagram)
- [ ] Source-filter chips work (single-select + "All")
- [ ] Stats row shows real counts per type
- [ ] Empty state rendered correctly when no assets of selected type
- [ ] Click card → same detail modal as `/en/marketing-assets` (shared component)
- [ ] Admin trigger-manual-capture button enqueues a job + shows progress
- [ ] Mobile: chips horizontal-scroll, cards single-column
- [ ] Typecheck+lint+build pass

## Out of scope

- New scraping logic (that's prompt 03)
- Event detection (that's prompt 14/15)
- Cross-brand asset comparison ("vs all competitors")
- Asset performance predictions (v3, see CTR expansion analysis)

## Branch + commits

```bash
git checkout -b feature/assets-tab-expansion
```

1. `feat(assets-tab): expand StatsBar to 7 asset types`
2. `feat(assets-tab): add source-filter chips row`
3. `feat(assets-tab): replace single-type grid with multi-type gallery using shared AssetCard`
4. `feat(assets-tab): admin trigger-manual-capture flow`
5. `feat(assets-tab): update empty states per source`

## Reference files

- Main prompt (all the scraping + data model): `.claude/prompts/03-marketing-assets-expand.md`
- Existing tab: `src/components/companies/tabs/AssetsTab.tsx`
- Research: `.claude/research/marketing-asset-scrapers.md`
- Decisions: `.claude/research/decisions-log.md`
- Testing: `.claude/prompts/_TESTING_AND_DATA_APPROACH.md`
