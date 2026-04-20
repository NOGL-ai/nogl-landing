# Testing & Data Approach — Shared guidance for all feature prompts

_Every prompt in this directory should reference this file under "Testing requirements". Paste this link: `see .claude/prompts/_TESTING_AND_DATA_APPROACH.md`._

---

## TL;DR

**Every feature must ship with:**
1. **Realistic seed data** (from founder-provided CSV OR synthesized from Calumet's existing 160k scraped products)
2. **Unit tests** for pure business logic (elasticity calculations, guardrail evaluation, simulation math)
3. **Integration tests** for server actions (with Prisma + a test Postgres)
4. **E2E tests** for the primary user flow (Playwright, already installed)
5. **Manual acceptance checklist** per feature in the prompt itself

No feature ships on "it compiles and the page renders". Every path must be proven to work against realistic data.

---

## 1. Testing stack (already installed)

- **Jest** + `@testing-library/react` + `msw` — unit + component tests
- **Playwright** — E2E tests, existing CI job at `tests/e2e/`
- **jest-mock-extended** — Prisma mocking for unit tests
- **Supertest** — HTTP handler testing (API routes)
- Test DB: Postgres in CI, spun up per-job via `actions/services/postgres`

Per-prompt test scaffold:

```
src/
  actions/
    <feature>.ts
    <feature>.test.ts            ← unit: business logic only
tests/
  integration/
    <feature>.integration.test.ts  ← hits real Prisma/test DB
  e2e/
    <feature>.e2e.spec.ts          ← full Playwright browser test
  fixtures/
    <feature>/
      sample-input.csv
      expected-output.json
      seed.ts                      ← spins up realistic DB state
```

---

## 2. Realistic data — SOURCE hierarchy

Prefer options higher on this list. A feature must use at least option **(a)** or **(b)** — never option (d) alone.

### (a) Founder-provided REAL data (best)

The founder has direct access to real Calumet-tenant data. Ask for these concrete datasets when building a feature:

| Feature | Ask the founder for |
|---|---|
| **Repricing** | 50-200 real SKUs with: SKU, title, current price, COGS, MSRP, category, brand. PLUS 2-4 weeks of competitor price observations for those SKUs. |
| **Demand Shaping** | 12 months of daily sales history per SKU per channel (web/marketplace/B2B). PLUS promotional calendar (what promos ran when with what discount). |
| **Replenishment** | Current stock levels per warehouse, supplier list with lead times, recent POs. |
| **Alerts (CFO)** | Real stockout events (even 5-10) from the last 90 days. |
| **Trends (internal)** | Nothing needed — uses already-scraped competitor data. |
| **Trends (external)** | List of 50-100 search keywords relevant to Calumet's category tree. |
| **Marketing Assets** | 3-5 sample competitor newsletter screenshots, 10-20 Meta Ads, 3-5 homepage screenshots per competitor. |
| **Import Data** | 3-5 real CSV/Excel exports from Calumet's existing systems (anonymized if needed). |
| **Repricing Rules** | The 3-5 rules Calumet uses today (described in plain English). |

**If the founder can provide**, place in `tests/fixtures/<feature>/real-data/` (gitignored) and commit only a smaller anonymized subset.

### (b) Synthesized from existing scraped data

NOGL already has:
- 160k+ real products in `public.products` across 6 competitor companies
- 17,928 Calumet products specifically
- Price observations (if the scraper ran) in `PriceObservation`

For most features, a seed script that **selects real scraped rows and synthesizes derivatives** (fake sales history based on category distributions, fake forecasts, fake alerts tied to real SKUs) is enough to demo every flow convincingly.

Pattern: pick ~500 real products → generate 12 months of synthetic history with realistic seasonality + noise → generate forecasts from that history → generate alerts against the forecast.

### (c) Generated but plausible (faker + category-aware distributions)

Use **`@faker-js/faker`** to generate user accounts, company names, SKU numbers, etc. when no real analog exists. Always wrap with category-aware distributions so a "tripod" doesn't cost €5,000 and a "Canon RF 400mm" doesn't cost €99.

### (d) Plain random (last resort — NEVER ship this as the only seed)

Only acceptable for unit test fixtures where the value doesn't matter.

---

## 3. Unit test patterns

```typescript
// src/lib/repricing/strategies.test.ts
import { applyStrategy, applyGuardrails } from "./strategies";

describe("applyStrategy", () => {
  it("BEAT_CHEAPEST with 1% offset produces 99% of cheapest competitor price", () => {
    const result = applyStrategy("BEAT_CHEAPEST", 1, "PERCENT", [100, 120, 150]);
    expect(result).toBeCloseTo(99, 2);
  });

  it("MATCH_AVG with 0 offset produces the mean of competitor prices", () => {
    const result = applyStrategy("MATCH_AVG", 0, "ABSOLUTE", [100, 120, 150]);
    expect(result).toBeCloseTo(123.33, 2);
  });

  it("returns NaN when no competitor prices available", () => {
    const result = applyStrategy("BEAT_CHEAPEST", 1, "PERCENT", []);
    expect(Number.isNaN(result)).toBe(true);
  });
});

describe("applyGuardrails", () => {
  const sku = { cogs: 100, msrp: 200 };

  it("clamps price up to margin floor when violated", () => {
    const g = [{ type: "MARGIN_MIN_PCT_OF_COST", value: 15 }];
    const { price, blockedBy } = applyGuardrails(105, g, sku);
    expect(price).toBe(115);
    expect(blockedBy).toBe("MARGIN_FLOOR");
  });

  it("clamps price up to max-discount ceiling when violated", () => {
    const g = [{ type: "MAX_DISCOUNT_PCT", value: 20 }];
    const { price, blockedBy } = applyGuardrails(140, g, sku);
    expect(price).toBe(160);
    expect(blockedBy).toBe("MAX_DISCOUNT");
  });
});
```

## 4. Integration test patterns

Use **jest-mock-extended** for fast mocks OR a dedicated test Postgres for full integration. Prefer the test DB for server actions — it catches relation/cascade/constraint bugs that mocks miss.

```typescript
// tests/integration/repricing.integration.test.ts
import { prisma } from "@/lib/prisma";
import { simulateRule } from "@/actions/repricing/preview";
import { seedCalumetRepricingFixture } from "../fixtures/repricing/seed";

describe("simulateRule", () => {
  let ruleId: string;

  beforeAll(async () => {
    ruleId = await seedCalumetRepricingFixture(); // ← returns a seeded rule ID
  });

  afterAll(() => prisma.$disconnect());

  it("returns WILL_APPLY rows with correct suggested prices", async () => {
    const result = await simulateRule(ruleId);
    expect(result.summary.total).toBeGreaterThan(0);
    expect(result.summary.willApply).toBeGreaterThan(0);

    const first = result.rows.find((r) => r.status === "WILL_APPLY")!;
    // Verify the suggested price matches strategy applied to comp prices
    const expected = Math.min(...first.competitorSnapshot.map((c) => c.price!)) * 0.99;
    expect(first.suggestedPrice).toBeCloseTo(expected, 2);
  });

  it("clamps blocked rows to the margin floor", async () => {
    const result = await simulateRule(ruleId);
    const blocked = result.rows.filter((r) => r.blockedBy === "MARGIN_FLOOR");
    for (const row of blocked) {
      expect(row.suggestedPrice).toBeGreaterThanOrEqual(row.cogs * 1.10);
    }
  });
});
```

## 5. E2E test patterns (Playwright)

```typescript
// tests/e2e/repricing-preview.e2e.spec.ts
import { test, expect } from "@playwright/test";

test("Run Preview button opens modal with simulation results", async ({ page }) => {
  await page.goto("/en/repricing/auto-rules");

  // Find the first rule card and click Run Preview
  await page.getByTestId("rule-card").first().getByRole("button", { name: /Run Preview/i }).click();

  // Wait for the modal
  await expect(page.getByRole("dialog", { name: /Run Preview/i })).toBeVisible({ timeout: 10_000 });

  // Summary row shows counts
  await expect(page.getByText(/\d+ will apply/)).toBeVisible();
  await expect(page.getByText(/\d+ blocked/)).toBeVisible();

  // Table has at least one row
  await expect(page.getByTestId("preview-row")).not.toHaveCount(0);

  // Approve all button is enabled
  await expect(page.getByRole("button", { name: /Approve all/i })).toBeEnabled();
});

test("Approve and rollback round-trip preserves original prices", async ({ page }) => {
  // ... full flow
});
```

## 6. Seed scripts (per-feature)

Each feature prompt must include a `scripts/seed-<feature>-demo.ts` that:
- Is **idempotent** (`upsert`, never `create` if repeat-safe)
- Ties to real Calumet product IDs where possible
- Writes ≥ 20 rows per entity so UI looks populated
- Has a **`--real-only` flag** that uses real data only (skips synthesis) — for demos to the founder
- Has a **`--wipe` flag** that clears the feature's tables before seeding

Example:
```bash
npm run seed:repricing-demo -- --real-only     # only real Calumet SKUs
npm run seed:repricing-demo -- --wipe           # reset then reseed
npm run seed:repricing-demo                     # default: real + synthesized
```

## 7. Manual acceptance — checklist format

Every prompt ends with an **Acceptance criteria** section as a literal checklist the reviewer ticks:

```markdown
## Acceptance criteria

- [ ] `npx prisma db push` runs without errors
- [ ] `npm run seed:<feature>-demo` creates >20 rows
- [ ] `/en/<route>` loads in <3s and shows real data
- [ ] <key interaction> works end-to-end (describe the exact flow)
- [ ] Dark mode renders correctly
- [ ] Mobile viewport (375px) doesn't break layout
- [ ] `npm run typecheck`, `npm run check-lint`, `npm run build` all pass
- [ ] Unit test coverage for pure business logic >80%
- [ ] At least 1 Playwright E2E test covers the primary user flow
```

## 8. What to ask the founder per feature

When building a feature, ask for:

**Repricing (prompts 01, 20):**
- [ ] 5-10 real repricing rules Calumet uses today (plain English is fine — "Match Foto Erhardt within 2% on Sony bodies, never below 10% margin")
- [ ] Sample of 50 SKUs with real current + competitor prices + COGS + MSRP
- [ ] Your actual margin floors and max-discount ceilings by category

**Demand Shaping (prompt 07):**
- [ ] 12 months of daily sales per SKU per channel (or monthly if daily not available)
- [ ] Historical promo calendar (what promos, what depth, what windows)
- [ ] Bundle definitions currently active (if any)
- [ ] Category-level elasticities you believe in (or use literature defaults)

**Alerts (prompt 06):**
- [ ] List of 5-10 alert types that would actually be useful (confirm the set from decisions-log)
- [ ] Sample stockout events from last 90 days
- [ ] Who gets alerts (which users, which roles)

**Trends (prompt 02):**
- [ ] Confirm MVP = internal Particl-style only (Google Trends in Phase 2)
- [ ] 50-100 keywords to track externally (Phase 2)

**Marketing Assets (prompt 03, 14, 16):**
- [ ] 10 tracked competitors for Calumet (beyond the seeded 5)
- [ ] Fastmail / Google Workspace credentials for newsletter catch-all
- [ ] Any Meta Ads Library access token already registered
- [ ] Budget ceiling for Apify + screenshot services

**Dashboards (prompt 04):**
- [ ] Screenshots of 2-3 dashboards Calumet builds today (Excel? Tableau? Looker?)
- [ ] 3-5 KPIs they check every morning
- [ ] Copilot opt-in preference

**Import (prompt 10):**
- [ ] 1 real CSV export per data kind (sales, inventory, products, suppliers)
- [ ] Which platforms Calumet uses today (Shopware? JTL-Wawi? Something else?)
- [ ] Nightly SFTP drop possible?

**Settings/Notifications/Profile (prompts 11, 12, 13):**
- [ ] Multi-workspace per user? Y/N
- [ ] Seat billing vs flat?
- [ ] SSO on roadmap?
- [ ] Email-only for v1 notifications or Slack/Teams too?

---

## 9. When "real data" isn't available

If the founder can't provide real data for a feature, the prompt should fall back to `scripts/seed-<feature>-demo.ts` with:

1. **500 products sampled from `public.products`** where `company_id` matches Calumet
2. Synthesized derivatives (history, forecasts, alerts) using:
   - Category-aware price ranges (cameras €300-€15k, accessories €5-€500)
   - Seasonality (Q4 × 1.5, summer × 1.1)
   - Weekday/weekend factors for B2B vs web
   - Realistic noise via `faker` + normal distributions

That way every prompt's acceptance criteria stay green even without founder data — the UI still demos correctly.

---

## 10. CI integration

The CI (`test.yml`) runs:
- `npm run typecheck`
- `npm run check-lint`
- `npm run test:ci` (Jest)
- `npm run test:e2e` (Playwright)

**All four must pass** for any feature PR to merge. No `--skip-ci` or `continue-on-error` on feature tests (security/perf jobs are separately marked non-blocking by design).

Per-feature PR also runs the matching seed script in CI to verify the seed itself doesn't crash.
