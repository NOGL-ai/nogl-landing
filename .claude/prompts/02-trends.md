# Build the Trends page — Internal (Particl-style) first, Google Trends overlay second

## Goal

Replace the stub at `/en/trends` with a real two-tab Trends page.

- **Tab 1 "Internal"** (ships first, 5 days) — fastest-growing companies + product types within Calumet's tracked dataset, powered entirely by existing Postgres data (no external APIs).
- **Tab 2 "External"** (ships second sprint) — Google search volume for a curated keyword list, powered by the existing `tuhinmallick/actor-google-trends-scraper` Apify actor.

Particl's screen at `app.particl.com/dashboard/trends` is the UX reference. The tl;dr is **it's NOT Google Trends** — it's card grids of internal-dataset movers with sparklines. Read `.claude/research/trends-strategy.md` first for full context.

## Phase 1 — Internal Trends (this prompt scope)

### Data model

Add a materialized view:

```sql
-- prisma/migrations/<timestamp>_create_company_trends_mv/migration.sql
CREATE MATERIALIZED VIEW IF NOT EXISTS nogl."CompanyTrend4w" AS
SELECT
  c.id AS company_id,
  c.name,
  c.slug,
  c.domain,
  c.logo_url,
  -- 4-week product velocity
  COUNT(DISTINCT p.id) FILTER (
    WHERE p.created_at > NOW() - INTERVAL '4 weeks'
  ) AS new_products_4w,
  COUNT(DISTINCT p.id) FILTER (
    WHERE p.created_at > NOW() - INTERVAL '8 weeks'
      AND p.created_at <= NOW() - INTERVAL '4 weeks'
  ) AS new_products_prev_4w,
  -- 4-week avg price change
  AVG(po.price_change_pct) FILTER (
    WHERE po.observed_at > NOW() - INTERVAL '4 weeks'
  ) AS avg_price_change_4w,
  -- Total product count
  COUNT(DISTINCT p.id) AS total_products,
  -- Refresh metadata
  NOW() AS refreshed_at
FROM nogl."Company" c
LEFT JOIN public.products p ON p.company_id = c.id
LEFT JOIN public.price_observations po ON po.product_id = p.id
GROUP BY c.id, c.name, c.slug, c.domain, c.logo_url;

CREATE UNIQUE INDEX IF NOT EXISTS "CompanyTrend4w_company_id_idx"
  ON nogl."CompanyTrend4w" (company_id);
```

Similar MV for `CategoryTrend4w` keyed by `canonical_category_id`.

Add a nightly cron (or manual trigger) that runs:
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY nogl."CompanyTrend4w";
REFRESH MATERIALIZED VIEW CONCURRENTLY nogl."CategoryTrend4w";
```

### Prisma models (read-only views)

```prisma
/// @@view - materialized view, read-only
model CompanyTrend4w {
  companyId            String   @id @map("company_id")
  name                 String
  slug                 String
  domain               String?
  logoUrl              String?  @map("logo_url")
  newProducts4w        Int      @map("new_products_4w")
  newProductsPrev4w    Int      @map("new_products_prev_4w")
  avgPriceChange4w     Float?   @map("avg_price_change_4w")
  totalProducts        Int      @map("total_products")
  refreshedAt          DateTime @map("refreshed_at")

  @@map("CompanyTrend4w")
  @@schema("nogl")
}
```

Use Prisma's `@@view` feature and `prisma db pull` to introspect if generation gives issues.

### Server actions

`src/actions/trends.ts`:

```typescript
"use server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface TrendCard {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  growthMetric: number;      // % growth (new_4w / prev_4w)
  growthLabel: string;       // "+23" (absolute) or "+45%" (relative)
  sparkline: number[];       // 12 weekly data points
  category?: "extreme" | "fast" | "steady";  // for badge
}

export async function getTrendingCompanies(params: {
  tenantCompanyId: string;
  period: "4w" | "12w" | "52w";
  limit?: number;
}): Promise<TrendCard[]> {
  await getAuthSession();
  const rows = await prisma.companyTrend4w.findMany({
    orderBy: { newProducts4w: "desc" },
    take: params.limit ?? 20,
  });
  return rows.map((r) => ({
    id: r.companyId,
    name: r.name,
    slug: r.slug,
    logoUrl: r.logoUrl ?? undefined,
    growthMetric: r.newProductsPrev4w > 0
      ? (r.newProducts4w - r.newProductsPrev4w) / r.newProductsPrev4w
      : r.newProducts4w > 0 ? 1 : 0,
    growthLabel: `+${r.newProducts4w} new`,
    sparkline: [],  // TODO: pull 12 weekly counts from a second view
    category: r.newProducts4w > 20 ? "extreme" : r.newProducts4w > 8 ? "fast" : "steady",
  }));
}

export async function getTrendingCategories(params: {
  tenantCompanyId: string;
  period: "4w" | "12w" | "52w";
  limit?: number;
}): Promise<TrendCard[]> {
  // Similar using CategoryTrend4w
}
```

### UI page

`src/app/(site)/[lang]/(app)/trends/page.tsx` (replace current stub):

- Tabs: "Internal" (default) | "External" (grey "Coming soon" badge until Phase 2).
- **Internal tab content:**
  - Header — "Trends", period selector (4w / 12w / 52w), scope selector ("Calumet + 5 competitors" / all / custom).
  - Two columns (grid):
    - Left: "Companies (Fastest Growing)" — 12 cards in a responsive grid.
    - Right: "Product Types (Fastest Growing)" — 12 cards.
  - Card: logo/icon, name, growth metric, sparkline, badge ("Extreme growth" for >50% jump).
  - Click card → company detail page (`/en/companies/<slug>`) or category drill-down (future).

### Empty state

If `CompanyTrend4w` is empty (MV not refreshed), show: _"Trends refresh nightly — your first snapshot will appear tomorrow. Click [Refresh now] to trigger manually."_ with an admin-only button hitting an API that runs `REFRESH MATERIALIZED VIEW`.

### Charts

Use **Recharts** `<LineChart>` for sparklines (inline in cards, no axes, no legend, subtle brand color).

### Acceptance criteria

- [ ] `prisma db push` runs the MV creation SQL.
- [ ] Nightly cron (or manual API `POST /api/cron/refresh-trends`) refreshes the MV.
- [ ] `/en/trends` → Internal tab shows the 6 current companies ranked by new-product velocity, with growth pill.
- [ ] Card click routes to company detail.
- [ ] Dark mode renders correctly.
- [ ] Period selector (4w / 12w / 52w) updates the card metrics (implement alternate MVs).
- [ ] `npm run typecheck` + `build` pass.

---

## Phase 2 — External (Google Trends) — LEAVE STUBBED IN THIS PROMPT

Do NOT build Phase 2 in this prompt. Leave a "Coming soon" tab with an opt-in waitlist input.

The full Phase 2 spec lives in:
- `.claude/research/trends-strategy.md` §4 "Architecture recommendation → Phase 2"
- `.claude/research/trends-orchestration-options.md` (the scored comparison → winner is Apify + Vercel Cron + webhook)

A future prompt (`02b-trends-external.md`) will cover the Apify integration + Webhook endpoint + `TrendsKeyword` / `TrendsObservation` Prisma models. This prompt **does not implement that**.

---

## Out of scope for this prompt

- The external Google Trends tab (Phase 2, separate prompt).
- Keyword-management UI.
- Per-competitor trend drilldowns (future).
- Alert generation from trend movers (will be wired from the alerts prompt #06).

## Branch + commits

```bash
git checkout -b feature/trends-internal
```

1. `feat(trends): create CompanyTrend4w + CategoryTrend4w materialized views`
2. `feat(trends): add server actions for internal trends`
3. `feat(trends): build Trends page with Internal + External tabs`
4. `feat(trends): add nightly MV refresh cron`
5. `feat(trends): stub External tab with waitlist`

## Reference files

- Stub page: `src/app/(site)/[lang]/(app)/trends/page.tsx`
- Research: `.claude/research/trends-strategy.md` (read first)
- Research: `.claude/research/trends-orchestration-options.md` (Phase 2 info)
- Apify scraper repo snapshot: `.claude/research/trendscraper/` (don't call directly yet — Phase 2)
- Auth: `src/lib/auth.ts`
- Prisma pattern: `src/actions/forecast.ts`
- Decisions: `.claude/research/decisions-log.md` → "Trends"
