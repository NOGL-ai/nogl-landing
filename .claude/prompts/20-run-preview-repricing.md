# Wire up the "Run Preview" button on Repricing rules + implement rollback

## Goal

Currently the "Run Preview" button on `/en/repricing/auto-rules` rule cards does **nothing** (just `console.log("Run preview for rule:", id)` in `src/components/organisms/RepricingRules.tsx` line 108). Wire it to actually simulate the rule against current competitor prices and show a **dry-run modal** with projected changes — without touching any real prices. Also add the Apply and Rollback actions.

## Full design spec

Read this first: `.claude/research/run-preview-example.md` — it has the concrete example flow, projected-impact cards, per-row table format, and implementation sketch. Replicate that UX.

## Data model additions

Add to `prisma/schema.prisma`:

```prisma
model RepricingJob {
  id                    String   @id @default(cuid())
  ruleId                String
  tenantCompanyId       String
  status                String   // "SIMULATED" | "APPLIED" | "ROLLED_BACK" | "FAILED"
  kind                  String   // "PREVIEW" (server-side dry run) | "APPLY"
  simulatedAt           DateTime @default(now())
  appliedAt             DateTime?
  rolledBackAt          DateTime?
  initiatedByUserId     String?

  // The snapshot of prices BEFORE we changed anything.
  // Used for rollback. Shape: [{ skuId, oldPrice, newPrice, deltaPct, status, blockedBy? }, ...]
  changes               Json

  // Projected 30-day impact (units, revenue, margin delta) for UI display.
  projectedImpact       Json?

  rule                  RepricingRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  @@index([ruleId, simulatedAt])
  @@index([tenantCompanyId, status])
  @@schema("repricing")
}
```

## Server actions

Create `src/actions/repricing/preview.ts`:

```typescript
"use server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyStrategy, applyGuardrails } from "@/lib/repricing/strategies";
import { estimate30DayImpact } from "@/lib/repricing/elasticity";

export interface SimulationRow {
  skuId: string;
  skuName: string;
  skuImage?: string;
  cogs: number;
  msrp: number;
  currentPrice: number;
  suggestedPrice: number;
  deltaPct: number;
  deltaAbs: number;
  status: "WILL_APPLY" | "BLOCKED" | "NO_CHANGE";
  blockedBy?: "MARGIN_FLOOR" | "MAX_DISCOUNT" | "ABS_MIN" | "ABS_MAX";
  competitorSnapshot: { companyId: string; companyName: string; price: number | null; observedAt: Date }[];
}

export interface SimulationResult {
  ruleId: string;
  simulatedAt: Date;
  rows: SimulationRow[];
  summary: {
    total: number;
    willApply: number;
    blocked: number;
    noChange: number;
    avgDeltaPct: number;
  };
  projectedImpact: {
    revenueDelta: number;
    marginDelta: number;
    winCountDelta: number;  // how many more SKUs become cheapest in comp set
    currency: string;
    horizonDays: number;
    confidence: "low" | "medium" | "high";
  };
}

export async function simulateRule(ruleId: string): Promise<SimulationResult> {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const rule = await prisma.repricingRule.findUnique({
    where: { id: ruleId },
    include: { competitors: true },
  });
  if (!rule) throw new Error("Rule not found");

  // 1. Find all SKUs in the rule's scope.
  const skus = await findSkusInScope(rule.tenantCompanyId, rule.scope);

  // 2. Latest competitor prices (cached 5 min in Redis).
  const snapshot = await latestCompetitorPrices(skus.map((s) => s.id), rule.competitorIds);

  // 3. Per-SKU compute suggested price + guardrail check.
  const rows: SimulationRow[] = skus.map((sku) => {
    const compPrices = snapshot[sku.id]?.filter((o) => o.price != null).map((o) => o.price!) ?? [];
    const strategyResult = applyStrategy(rule.strategy, rule.offsetValue, rule.offsetType, compPrices);
    const guardResult = applyGuardrails(strategyResult, rule.guardrails, sku);

    let status: SimulationRow["status"] = "WILL_APPLY";
    if (guardResult.price === sku.price) status = "NO_CHANGE";
    if (guardResult.blockedBy) status = "BLOCKED";

    return {
      skuId: sku.id,
      skuName: sku.title,
      skuImage: sku.imageUrl,
      cogs: sku.cogs,
      msrp: sku.msrp,
      currentPrice: sku.price,
      suggestedPrice: guardResult.price,
      deltaPct: (guardResult.price - sku.price) / sku.price,
      deltaAbs: guardResult.price - sku.price,
      status,
      blockedBy: guardResult.blockedBy,
      competitorSnapshot: snapshot[sku.id] ?? [],
    };
  });

  const summary = {
    total: rows.length,
    willApply: rows.filter((r) => r.status === "WILL_APPLY").length,
    blocked: rows.filter((r) => r.status === "BLOCKED").length,
    noChange: rows.filter((r) => r.status === "NO_CHANGE").length,
    avgDeltaPct: rows.filter((r) => r.status === "WILL_APPLY")
      .reduce((sum, r) => sum + r.deltaPct, 0) / Math.max(1, rows.filter((r) => r.status === "WILL_APPLY").length),
  };

  const projectedImpact = estimate30DayImpact(rows);

  // Persist this preview so we can reference it if the user clicks Apply later.
  await prisma.repricingJob.create({
    data: {
      ruleId,
      tenantCompanyId: rule.tenantCompanyId,
      status: "SIMULATED",
      kind: "PREVIEW",
      initiatedByUserId: session.user.id,
      changes: rows as any,
      projectedImpact: projectedImpact as any,
    },
  });

  return { ruleId, simulatedAt: new Date(), rows, summary, projectedImpact };
}

export async function applyRule(ruleId: string, approvedSkuIds: string[]) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  // Re-simulate to get fresh prices (the preview may be minutes old)
  const fresh = await simulateRule(ruleId);
  const toApply = fresh.rows.filter(
    (r) => approvedSkuIds.includes(r.skuId) && r.status === "WILL_APPLY"
  );

  const job = await prisma.repricingJob.create({
    data: {
      ruleId,
      tenantCompanyId: fresh.rows[0]?.skuId ? (await prisma.repricingRule.findUnique({ where: { id: ruleId } }))!.tenantCompanyId : "",
      status: "APPLIED",
      kind: "APPLY",
      initiatedByUserId: session.user.id,
      changes: toApply as any,
      projectedImpact: fresh.projectedImpact as any,
      appliedAt: new Date(),
    },
  });

  // Apply in a transaction + write PriceObservation history
  await prisma.$transaction(async (tx) => {
    for (const row of toApply) {
      await tx.product.update({
        where: { id: row.skuId },
        data: { price: row.suggestedPrice },
      });
      await tx.priceObservation.create({
        data: {
          productId: row.skuId,
          price: row.suggestedPrice,
          observedAt: new Date(),
          source: "REPRICING_RULE",
          sourceRef: ruleId,
        },
      });
    }
  });

  // TODO: push to e-commerce platform (Shopify/Woo) — out of scope for this prompt; emit
  // a `REPRICING_APPLIED` alert for the platform-sync worker to pick up.

  return { jobId: job.id, appliedCount: toApply.length };
}

export async function rollbackJob(jobId: string) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const job = await prisma.repricingJob.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "APPLIED") throw new Error("Job not rolled-backable");

  const changes = job.changes as SimulationRow[];
  await prisma.$transaction(async (tx) => {
    for (const row of changes) {
      await tx.product.update({
        where: { id: row.skuId },
        data: { price: row.currentPrice }, // restore to pre-change price
      });
      await tx.priceObservation.create({
        data: {
          productId: row.skuId,
          price: row.currentPrice,
          observedAt: new Date(),
          source: "REPRICING_ROLLBACK",
          sourceRef: jobId,
        },
      });
    }
    await tx.repricingJob.update({
      where: { id: jobId },
      data: { status: "ROLLED_BACK", rolledBackAt: new Date() },
    });
  });
}
```

Utility helpers go in `src/lib/repricing/strategies.ts`:

```typescript
export function applyStrategy(
  strategy: string,
  offsetValue: number,
  offsetType: "absolute" | "percent",
  compPrices: number[],
): number {
  if (compPrices.length === 0) return NaN;  // no data, treat as NO_CHANGE
  const target =
    strategy === "MATCH_CHEAPEST" || strategy === "BEAT_CHEAPEST" ? Math.min(...compPrices)
    : strategy === "MATCH_HIGHEST" ? Math.max(...compPrices)
    : compPrices.reduce((a, b) => a + b, 0) / compPrices.length; // AVG
  const signedOffset = strategy.startsWith("BEAT_") ? -Math.abs(offsetValue) : offsetValue;
  return offsetType === "percent" ? target * (1 + signedOffset / 100) : target + signedOffset;
}

export function applyGuardrails(
  price: number,
  guardrails: Guardrail[],
  sku: { cogs: number; msrp: number },
): { price: number; blockedBy?: string } {
  for (const g of guardrails) {
    if (g.type === "MARGIN_MIN_PCT_OF_COST") {
      const floor = sku.cogs * (1 + g.value / 100);
      if (price < floor) return { price: floor, blockedBy: "MARGIN_FLOOR" };
    }
    if (g.type === "MAX_DISCOUNT_PCT") {
      const ceiling = sku.msrp * (1 - g.value / 100);
      if (price < ceiling) return { price: ceiling, blockedBy: "MAX_DISCOUNT" };
    }
    if (g.type === "ABS_MIN" && price < g.value) return { price: g.value, blockedBy: "ABS_MIN" };
    if (g.type === "ABS_MAX" && price > g.value) return { price: g.value, blockedBy: "ABS_MAX" };
  }
  return { price };
}
```

Elasticity helper in `src/lib/repricing/elasticity.ts` uses category defaults from `.claude/research/demand-shaping-calumet-spec.md` §2.

## UI modal

Build `src/components/repricing/RunPreviewModal.tsx`:

Follows the exact layout in `.claude/research/run-preview-example.md` §"Step 2". Key components:

- **Top summary row** — 4 stat cards (Total, Will apply, Blocked, No change) + avg delta badge.
- **Projected impact card** — Δ Revenue / Δ Margin / Win-rate change, with confidence band label ("est.").
- **Table** (use `@tanstack/react-table`, already installed):
  - Columns: checkbox, SKU (thumbnail + name), Current, Suggested, Δ%, Status pill, Action.
  - Filter chips: All | Will apply | Blocked | No change.
  - Expandable rows — click SKU row to see competitor-price horizontal bar + 30-day mini-chart.
  - Sort by Δ% by default.
- **Bottom action bar**:
  - `Cancel` (closes modal)
  - `Export CSV` (downloads rows)
  - `Approve selected` (disabled until ≥1 row checked)
  - `Approve all & Apply` (primary)

On Apply, close modal, show toast "Repriced 29 SKUs — [Rollback]" linking to `/en/repricing/history/<jobId>`.

## History page

New route `src/app/(site)/[lang]/(app)/repricing/history/page.tsx`:

- Table of past `RepricingJob` rows (APPLY kind).
- Columns: When, Rule name, # SKUs affected, Δ revenue projected, Status (Applied / Rolled back), Actions (View detail / Rollback).
- Click row → `history/[jobId]/page.tsx` showing the full change list + Rollback button.

Rollback button → confirmation dialog → calls `rollbackJob()` → toast → row status updates.

## Wire it up

In `src/components/organisms/RepricingRules.tsx` line 107–110, replace:

```tsx
const handleRunPreview = (id: string) => {
  console.log("Run preview for rule:", id);
};
```

with:

```tsx
const [previewOpen, setPreviewOpen] = useState<string | null>(null);

const handleRunPreview = (id: string) => setPreviewOpen(id);

// ...later in JSX
{previewOpen && (
  <RunPreviewModal
    ruleId={previewOpen}
    open={!!previewOpen}
    onClose={() => setPreviewOpen(null)}
  />
)}
```

## Acceptance criteria

- [ ] `npx prisma db push` creates `RepricingJob` table.
- [ ] Clicking "Run Preview" on any rule card opens the modal within 5s.
- [ ] Modal shows correct counts: total in scope, will-apply, blocked, no-change.
- [ ] Per-row Δ% matches manually computed value.
- [ ] "Approve all & Apply" updates `Product.price` + writes `PriceObservation` + creates `RepricingJob` with status APPLIED.
- [ ] History page lists all applied jobs with rollback button.
- [ ] Rollback reverts `Product.price` for all SKUs in the job, writes reverse `PriceObservation`, marks job ROLLED_BACK.
- [ ] Same Product cannot be rolled back twice (button disabled).
- [ ] Projected impact numbers render with reasonable magnitudes (sanity-check against 5 manually computed rows).
- [ ] `npm run typecheck` + `npm run build` pass.

## Out of scope

- Pushing prices to Shopify / Woo / external platforms (emit an alert for a future sync worker).
- Competitor price fresh-scrape on demand (use last cached observation).
- Multi-rule conflict resolution (what if two rules target the same SKU) — separate prompt.
- Auto-schedule execution (cron) — separate prompt.
- MMM-level impact forecasting — the 30-day estimate uses simple category-level elasticity.

## Branch + commits

```bash
git checkout -b feature/run-preview
```

1. `feat(repricing): add RepricingJob Prisma model`
2. `feat(repricing): add simulateRule, applyRule, rollbackJob server actions`
3. `feat(repricing): add strategy + guardrail utility functions`
4. `feat(repricing): build RunPreviewModal component`
5. `feat(repricing): add history page + rollback flow`
6. `feat(repricing): wire Run Preview button on rule cards`

## Reference files in the repo

- Broken handler: `src/components/organisms/RepricingRules.tsx` lines 107–110
- Rule schema: `prisma/schema.prisma` → `RepricingRule` model
- Manage page: `src/app/(site)/[lang]/(app)/repricing/manage/page.tsx` (exists, works)
- Auth: `src/lib/auth.ts`
- Research: `.claude/research/run-preview-example.md` (full flow spec)
- Research: `.claude/research/pricefy-features.md` (competitive reference)
