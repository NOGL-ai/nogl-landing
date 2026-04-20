# Build the Demand Shaping simulator (hybrid slider + scenario tree)

## Goal

Replace `/en/fractional-cfo/demand-shaping` "COMING SOON" with a working demand-shaping workspace — a slider-based simulator for quick what-ifs (Causal.app / Pigment style) + a scenario tree to save, compare, and commit (Anaplan / Pigment style). Bundling, promos, and pricing are **drivers inside ONE simulator**, not sibling features.

## Reference material — READ FIRST

`.claude/research/demand-shaping-calumet-spec.md` — complete 3,500-word spec covering:
- Exec summary (unified architecture justification)
- 12 drivers grouped by family (pricing, promo, assortment, bundling, marketing, constraints)
- Hybrid UX (slider simulator + scenario tree) with wireframe
- Bundling as first-class demand objects (FP-growth discovery, cannibalization, rebundling)
- Marketing attribution realistic for Calumet size (last-click + platform ROAS + time-decay, NOT MMM)
- MVP scope (drivers 1, 3, 5, 9, 10 first)
- Prisma model sketches
- 8 open questions for founder

This prompt implements **MVP scope only** (5 drivers, no marketing, no full MMM). Bundling discovery + marketing drivers are in follow-up prompts.

## MVP driver set (this prompt)

1. **Price change %** — per category or SKU.
2. **Promo discount % + window** — time-boxed depth cut.
3. **Bundle on/off** — toggle an existing bundle's effect.
4. **Inventory cap** — "we can only get N units" hard constraint.
5. **Season/event overlay** — read-only driver (per spec).

## Prisma additions

```prisma
model ShapingScenario {
  id              String          @id @default(cuid())
  tenantId        String
  name            String
  description     String?
  ownerId         String
  scopeCategories String[]
  scopeChannels   String[]        // ["web", "marketplace", "b2b"]
  horizonWeeks    Int             // 4 | 8 | 12 | 26
  status          String          @default("DRAFT")   // DRAFT | COMMITTED | EXPIRED
  expiresAt       DateTime?
  driverOverrides Json            // { priceChangePct, promoDiscountPct, promoWindow, bundleToggles, inventoryCaps, seasonOverrides }
  resultSummary   Json?           // { dUnits, dRevenue, dMargin, dWorkingCapital, stockoutSkus[] }
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([tenantId, status])
  @@schema("shaping")
}

model Bundle {
  id                String            @id @default(cuid())
  tenantId          String
  name              String
  description       String?
  anchorVariantId   String?           // the "hero" SKU
  listPrice         Float
  bundleDiscount    Float             // % off sum of component prices
  status            String            @default("ACTIVE")
  startsAt          DateTime?
  endsAt            DateTime?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  components        BundleComponent[]

  @@index([tenantId, status])
  @@schema("shaping")
}

model BundleComponent {
  id          String   @id @default(cuid())
  bundleId    String
  variantId   String
  quantity    Int      @default(1)
  role        String   // "anchor" | "core" | "accessory"

  bundle      Bundle   @relation(fields: [bundleId], references: [id], onDelete: Cascade)

  @@schema("shaping")
}

model Elasticity {
  id                String   @id @default(cuid())
  tenantId          String
  scope             String   // "category" | "variant"
  scopeId           String   // category name or variant id
  value             Float    // e.g. -0.8 for cameras
  rSquared          Float?
  observationCount  Int      @default(0)
  lastFittedAt      DateTime?

  @@unique([tenantId, scope, scopeId])
  @@schema("shaping")
}
```

Seed default elasticities per the strategy spec:
- cameras: -1.0, lenses: -0.75, lighting: -1.3, tripods: -1.5, accessories: -1.8, studio: -1.0, sets: -0.8

## Server actions

`src/actions/shaping/simulate.ts`:

```typescript
export async function runShapingSimulation(params: {
  tenantId: string;
  scope: { categories: string[]; channels: string[]; horizonWeeks: number };
  drivers: DriverOverrides;
}): Promise<SimulationResult> {
  // 1. Fetch baseline forecast (ForecastQuantile) for scope
  // 2. For each driver, apply its transform in topological order:
  //    price → promo → bundle → assortment → inventory → channel_mix
  // 3. Compute projected KPIs (units, revenue, margin, working capital, stockout risk)
  // 4. Compute waterfall decomposition — Δ per driver
  // 5. Return { baselineSeries, scenarioSeries, kpis, waterfall }
  // NO WRITES — this is a pure function, called on every slider change.
}

export async function saveScenario(input: SaveScenarioInput): Promise<ShapingScenario>;
export async function listScenarios(tenantId: string): Promise<ShapingScenario[]>;
export async function compareScenarios(id1: string, id2: string): Promise<ComparisonResult>;
export async function commitScenario(id: string): Promise<void>;
export async function expireScenario(id: string): Promise<void>;
```

## UX — two surfaces

### Surface A: `/en/demand/shape` (Simulator, default)

Layout per strategy doc §3:

```
┌──── Scope bar ─────────────────────────────────────────┐
│ [Category ▾] [Channel ▾] [Horizon ▾]                    │
├── DRIVERS (left column) ──┬── OUTCOME (right column) ───┤
│                           │                              │
│ Pricing                   │ Tabs: Units / Revenue /      │
│  • Price change  [──●──]  │ Margin                       │
│                           │                              │
│ Promo                     │ [Recharts line chart]        │
│  • Discount %    [──●──]  │  baseline (dashed)           │
│  • Window [date range]    │  scenario (solid) + p10-p90  │
│                           │                              │
│ Assortment                │ KPI Strip                    │
│  • Bundle: [ON/OFF]       │  Δ Units / Δ Revenue /       │
│                           │  Δ Margin / Δ WC / Stockouts│
│ Supply                    │                              │
│  • Cap: Canon R5II [40]   │ Waterfall: decomposition     │
│                           │  of Δ revenue by driver      │
│ [Reset]  [Save Scenario]  │                              │
└───────────────────────────┴─────────────────────────────┘
```

Sliders are a shared `<DriverSlider>` component — label, value, min/max, step, unit, "reset to baseline" inline button. Debounced recompute (300ms) via `runShapingSimulation`.

### Surface B: `/en/demand/shape/scenarios`

Table listing saved scenarios with Name, Owner, Horizon, Δ Rev, Δ Margin, Δ WC, Status (Draft/Committed/Expired). Click to open.

Detail view: compare side-by-side with baseline or another scenario. "Commit" button writes driver overrides into the live forecast store for the scoped entities.

## Waterfall chart

Custom component in `src/components/shaping/WaterfallChart.tsx`. Horizontal bars: one per driver family, showing its contribution to Δ revenue / Δ margin. Starts at baseline, ends at scenario. Color code: green=positive, red=negative, grey=no-effect.

## Integration with existing `/en/demand`

On the existing forecast page:
- Add a **"Shape this forecast"** CTA top-right → navigates to `/en/demand/shape` with scope pre-filled.
- If a committed scenario exists for the displayed variants/channels/horizon, show a banner: _"Scenario 'Q3 Black Friday Plan' active until 2026-11-30"_ with unlink button.

## Acceptance criteria

- [ ] `prisma db push` creates shaping schema + 4 models.
- [ ] `seed:elasticities` inserts 7 category-level elasticities.
- [ ] `/en/demand/shape` loads, shows 5-driver panel + chart + KPI strip + waterfall.
- [ ] Moving any slider recomputes within 500ms with no page reload.
- [ ] Waterfall decomposes correctly (sum of bar values = Δ revenue).
- [ ] Save Scenario creates a row; it appears on `/en/demand/shape/scenarios`.
- [ ] Compare 2 scenarios side-by-side works.
- [ ] Commit Scenario writes overrides into forecast store (a new `ForecastOverride` row or similar).
- [ ] Dark mode OK.
- [ ] `typecheck`, `lint`, `build` pass.

## Out of scope (explicit)

- **Marketing spend driver** (channel-level paid-media saturation) — v2, needs GA4/Ads API integration.
- **Attribution-model toggle** — v2.
- **Bundle discovery via FP-growth** — v2, separate prompt.
- **Rebundling UI + A/B test framework** — v2.
- **Nested-logit cannibalization** — MVP uses flat `cannib_rate = 0.3` per category.
- **Full MMM (Robyn/Meridian)** — v3 only, and only if customer has >€5M/yr paid spend.
- **Promo mechanic differentiation** (BOGO vs %-off) — v2.
- **Return-rate driver** — v2.
- **Channel-mix shift driver** — v2.

## Open questions to answer before starting (from strategy doc)

See `.claude/research/demand-shaping-calumet-spec.md` §8. The 3 blocking ones:
1. Commit semantics — override live forecast directly, or advisory?
2. Elasticity source — use seeded defaults, or fit from Calumet's price history?
3. Risk tolerance — autonomous apply mode, or human-in-the-loop only?

## Branch + commits

```bash
git checkout -b feature/demand-shaping
```

1. `feat(shaping): add Prisma schema (ShapingScenario, Bundle, BundleComponent, Elasticity)`
2. `feat(shaping): seed default category elasticities`
3. `feat(shaping): add runShapingSimulation pure server action`
4. `feat(shaping): add scenario CRUD + commit action`
5. `feat(shaping): build slider simulator UI + chart + KPI strip + waterfall`
6. `feat(shaping): add scenarios list + compare view`
7. `feat(shaping): integrate with /en/demand via "Shape this forecast" CTA`

## Reference files

- Research: `.claude/research/demand-shaping-calumet-spec.md` (READ FIRST)
- Stub page: `src/app/(site)/[lang]/(app)/fractional-cfo/demand-shaping/page.tsx`
- Forecast page (to integrate with): `src/app/(site)/[lang]/(app)/demand/`
- Forecast actions: `src/actions/forecast.ts` (pattern to follow)
- Chart lib: `recharts` (already installed)
- Icons: `@untitledui/icons`
- Decisions: `.claude/research/decisions-log.md`
