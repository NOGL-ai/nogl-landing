# Repricing "Run Preview" — Example Flow

_Concrete walkthrough of what the Run Preview button does and what the user sees. Written for the founder so they can compare against real-world tools (Pricefy, Prisync, Omnia) before we build._

---

## What the button does (one line)

**Run Preview simulates the rule against right-now competitor prices and shows a diff — no actual price changes are made.**

This is the "dry run" pattern from every serious pricing tool — Pricefy calls it the Simulator, Omnia calls it the "Strategy Tree Preview", Prisync shows a "Multiple Rules Compare". None of them push a single price until the operator approves.

---

## The real-life example

Calumet has a repricing rule set up:

```
Name:      "Match Foto Erhardt — Sony bodies"
Scope:     Category = Cameras, Brand = Sony
Strategy:  BEAT_CHEAPEST  (undercut the cheapest competitor)
Offset:    -1%
Guardrails:
  • Floor: COGS × 1.10      (never below 10% margin)
  • Max discount: 15% off MSRP
Competitors:  [Foto Erhardt, Fotokoch, MediaMarkt]
Schedule:     Daily 03:00 UTC
Status:       DRAFT
```

Operator clicks **"Run Preview"**. What happens:

### Step 1: Simulation runs server-side (~3–10 s)

For every SKU in scope (say 47 Sony camera bodies), the server:

1. Looks up the current price in our DB.
2. Looks up the latest competitor prices (Foto Erhardt + Fotokoch + MediaMarkt) from `PriceObservation`.
3. Computes `cheapest_competitor_price = min(competitor_prices)`.
4. Applies strategy: `suggested = cheapest_competitor_price × (1 − 0.01)`.
5. Applies guardrails:
   - If `suggested < COGS × 1.10` → clamp up to floor, flag `"blocked_by_margin_floor"`.
   - If `suggested > MSRP × 0.85` → clamp down to max-discount ceiling, flag `"blocked_by_max_discount"`.
6. Returns a `SimulationResult` with `{ sku, current, suggested, delta_pct, status, blocked_by?, competitor_snapshot }`.

No DB writes. No Shopify pushes. Zero side effects.

### Step 2: User sees a modal

```
╔══════════════════════════════════════════════════════════════════════╗
║ Run Preview — "Match Foto Erhardt — Sony bodies"                      ║
║                                                                        ║
║ 47 products in scope.                                                  ║
║ ├─  32 would change price   (avg −3.2%)                                ║
║ ├─  11 blocked by guardrails (9 margin-floor, 2 max-discount)          ║
║ └─   4 no change needed (already at optimal price)                     ║
║                                                                        ║
║ Projected impact (next 30 d est.):                                     ║
║ ├─ Revenue:  +€18,420  (+2.1%)   based on category elasticity          ║
║ ├─ Margin:   −€1,340   (−0.4%)   price cut on pinned SKUs              ║
║ └─ Win rate: 29 SKUs become cheapest in comp set (was 12)              ║
║                                                                        ║
║ ────────────────────────────────────────────────────────────────────── ║
║                                                                        ║
║ SKU            Current    Suggested    Δ       Status         Action   ║
║ A7IV-BODY      €2,499     €2,429      −2.8%   ✓ will apply    [✓]     ║
║ A7CII-BODY     €2,199     €2,178      −1.0%   ✓ will apply    [✓]     ║
║ A7RV-BODY      €3,899     €3,861      −1.0%   ✓ will apply    [✓]     ║
║ A9III-BODY     €6,499     €6,100      −6.1%   ⚠ margin floor   [—]     ║
║ ZV-E10-II      €779       €771        −1.0%   ✓ will apply    [✓]     ║
║ A6700-BODY     €1,499     €1,499       0%     — no change      [—]     ║
║ RX100VII       €1,299     €1,100      −15.3%  ⚠ max discount   [—]     ║
║ ... (40 more)                                                          ║
║                                                                        ║
║ [Filter: All / Will apply / Blocked / No change]                       ║
║ [Export CSV]                                                           ║
║                                                                        ║
║      [Cancel]    [Approve selected]    [Approve all & Apply]           ║
╚══════════════════════════════════════════════════════════════════════╝
```

Key design decisions:

- **Top summary** shows counts first, detail table second. Operators care about "how many change / blocked / no-change" before any individual SKU.
- **Projected impact** uses our elasticity model (category-level, per `ShapingScenario` research). Confidence is conservative — wrap it in a "est." label.
- **Per-row checkbox** lets the operator exclude individual SKUs from the apply step. Standard Pricefy-style.
- **Blocked rows are read-only** — can't check them. The guardrail reason shows inline. Operator has to edit the rule if they want to override.
- **Expand a row** → inline mini-chart showing each competitor's price + our current + suggested on a horizontal axis, plus 30-day history. Lets operator sanity-check before approving.
- **"Approve selected" vs. "Approve all & Apply"** — two buttons for explicit intent. Approve-selected writes only the checked rows; Apply-all is the one-click path for operators who trust the rule.

### Step 3: On Approve

When operator clicks Approve:
1. Create a `RepricingJob` row with `previousPriceSnapshot` (for rollback).
2. Update `Product.price` for the approved SKUs.
3. If a Shopify/Woo/etc. integration is connected, push new prices via that API.
4. Log the change history in `PriceObservation` with `source: 'REPRICING_RULE'` and the rule ID.
5. Fire off an alert if the change is >5% (the `PRICE_CHANGE_APPLIED` alert type).
6. Show a confirmation toast: _"Repriced 29 SKUs. 2 pending platform sync. [Rollback]"_.
7. The **Rollback** button restores the previous price snapshot in one click (stored in the `RepricingJob`).

### Step 4: On the rule card afterwards

The rule card on `/en/repricing/auto-rules` shows:

```
┌───────────────────────────────────────────────────┐
│ Match Foto Erhardt — Sony bodies          [●] ON   │
│                                                     │
│ Scope:  47 products · Cameras > Sony               │
│ Strategy: Beat cheapest by 1%                      │
│ Last run: 2 minutes ago — 29 applied, 11 blocked   │
│ Schedule: Daily 03:00 UTC                          │
│                                                     │
│ [History] [Run Preview] [Edit] [Pause] [Delete]    │
└───────────────────────────────────────────────────┘
```

"History" opens a log of past runs with their diffs, so the operator can see "what did this rule actually do last week?".

---

## What the founder needs to decide

1. **Auto-apply tier.** Pricefy gates "Autopilot" (apply without preview) to their Business tier. Do we have a tier system from day one? Recommend: all v1 rules are **preview-required**. Add Autopilot in v2 once users trust the system.

2. **Cross-rule conflict resolution.** What if two rules overlap on the same SKU? Ideas (pick one):
   - Rule priority (lowest-number rule wins) — Pricefy's approach
   - Latest-edited wins — Omnia's default
   - Block on conflict — safe but annoying
   - Recommend: **priority number on the rule card**, with conflict indicator in Preview.

3. **Rollback window.** How far back can the operator rollback? 7 days? 30? Forever? Recommend: 30 days, with a UI that shows a timeline of all applied changes.

4. **Notification on apply.** Should approving a run trigger an in-app alert? Email? Nothing? Recommend: in-app alert (fits the real-time alerts architecture already scoped), no email.

---

## Competitive reference — how others do this

| Tool | Preview name | Per-row approve? | Per-row impact estimate? | Rollback |
|---|---|---|---|---|
| **Pricefy** | Simulator | ✓ | ✗ (just price delta) | ✓ (1-click) |
| **Prisync** | Dynamic Pricing Preview | ✓ | ✗ | ✗ (need to revert manually) |
| **Omnia** | Strategy Tree Preview | ✓ | ✓ (with decomp explainer) | ✓ |
| **RepricerExpress** | Preview changes | ✓ | Partial (Buy Box probability) | ✓ |
| **Repricer.com** | Test run | ✓ | ✗ | ✗ |

Our design borrows the **best of Omnia** (per-row impact) + **Pricefy's 1-click rollback** + **category-level elasticity explainer** from the demand-shaping research. That combination is not shipped anywhere we've benchmarked.

---

## Implementation sketch

```typescript
// src/actions/repricing.ts
export async function simulateRule(ruleId: string): Promise<SimulationResult> {
  const rule = await prisma.repricingRule.findUnique({ where: { id: ruleId } });
  const skus = await findScopeSkus(rule.scope);
  const competitorPrices = await latestCompetitorPrices(skus, rule.competitorIds);

  const rows = skus.map((sku) => {
    const strategyPrice = applyStrategy(rule.strategy, rule.offset, competitorPrices[sku.id]);
    const guardrailResult = applyGuardrails(strategyPrice, rule.guardrails, sku);
    return {
      sku,
      current: sku.price,
      suggested: guardrailResult.price,
      delta_pct: (guardrailResult.price - sku.price) / sku.price,
      status: guardrailResult.blocked ? 'BLOCKED' : sku.price === guardrailResult.price ? 'NO_CHANGE' : 'WILL_APPLY',
      blocked_by: guardrailResult.blocked,
      competitor_snapshot: competitorPrices[sku.id],
    };
  });

  const impact = estimateImpact(rows, { horizon: 30 });

  return { ruleId, rows, impact, simulatedAt: new Date() };
}

export async function applyRule(ruleId: string, approvedSkuIds: string[]): Promise<{ job: RepricingJob }> {
  const simulation = await simulateRule(ruleId);
  const job = await prisma.repricingJob.create({
    data: {
      ruleId,
      previousPriceSnapshot: await snapshotPrices(approvedSkuIds),
      appliedRows: simulation.rows.filter((r) => approvedSkuIds.includes(r.sku.id)),
      startedAt: new Date(),
    },
  });
  await applyPriceChanges(approvedSkuIds, simulation);
  await prisma.repricingJob.update({ where: { id: job.id }, data: { completedAt: new Date() } });
  return { job };
}

export async function rollbackJob(jobId: string): Promise<void> {
  const job = await prisma.repricingJob.findUnique({ where: { id: jobId } });
  await restorePrices(job.previousPriceSnapshot);
}
```

The Preview button is wired to `simulateRule` → returns to client → renders the modal. Apply hits `applyRule` with the checked SKUs only. Rollback uses the snapshot on the job.

---

## Open questions for the founder

1. **Preview-latency target.** For 5,000 SKUs the simulation might take 30–60 s. Show a skeleton or a progress bar? Cache the latest competitor snapshot so preview is fast on the second click?
2. **Shopify push latency.** Some e-commerce platforms (Shopify) rate-limit API writes. If 3,000 SKU changes, 2 calls/second = 25 min to fully apply. Is that acceptable, or do we need a bulk endpoint?
3. **Partial-failure handling.** If 2,700 of 3,000 pushes succeed and 300 fail, do we rollback everything or accept the partial?
4. **History retention.** 30 days, 90 days, forever? Affects storage cost and legal (price-history audit trail for wholesale/B2B customers).
