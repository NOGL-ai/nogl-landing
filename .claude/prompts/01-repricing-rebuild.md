# Build the full repricing engine (Pricefy-style rules + guardrails + scheduled runs)

## Goal

Upgrade the existing `/en/repricing/*` pages from their current demo state to a production-grade repricing engine that matches (and in places exceeds) Pricefy, Prisync, and Omnia. The demo rules currently shown are static UI — this prompt replaces them with a real engine.

**Depends on:** prompt `20-run-preview-repricing.md` for the Preview/Apply/Rollback flow. Build that first if not already merged, or build both in this branch.

## Reference material

Read these first:
- `.claude/research/pricefy-features.md` — public feature inventory of Pricefy + Prisync + Omnia + RepricerExpress.
- `.claude/research/run-preview-example.md` — the Preview flow with a concrete example.

## What this prompt covers

- Full `RepricingRule` data model — scope, strategy, guardrails, schedule.
- Rule-authoring wizard (Step 1–4.5 flow the UI already exists at `/en/repricing/manage`).
- Guardrail evaluation engine.
- Scheduled execution (cron).
- Rule priority + conflict resolution.
- History + rollback (depends on prompt 20).

## Data model

Replace or extend the existing `RepricingRule` model:

```prisma
model RepricingRule {
  id                String            @id @default(cuid())
  tenantCompanyId   String
  name              String
  description       String?
  status            RuleStatus        @default(DRAFT)
  priority          Int               @default(0)       // lower = higher priority on conflicts

  // SCOPE — which SKUs this rule applies to
  scope             Json              // { categoryIds?, brandIds?, skuIds?, tagIds?, isSet? }

  // STRATEGY — what to compute
  strategy          Strategy          // MATCH_CHEAPEST | BEAT_CHEAPEST | MATCH_AVG | BEAT_AVG | MATCH_HIGHEST | CUSTOM
  offsetType        OffsetType        // ABSOLUTE | PERCENT
  offsetValue       Float             // e.g. 1 for 1%, or 0.50 for 50 cents

  // COMPETITORS — which competitors' prices to reference
  competitorIds     String[]          // Company.ids to include (empty = all tracked)

  // GUARDRAILS
  guardrails        Json              // Guardrail[] — see below

  // SCHEDULE
  scheduleType      ScheduleType      // MANUAL | HOURLY | DAILY | WEEKLY
  scheduleHour      Int?              // 0-23, when DAILY
  scheduleDayOfWeek Int?              // 0-6, when WEEKLY
  autoApply         Boolean           @default(false)   // Autopilot mode

  // STOP CONDITION (Step 4 in wizard)
  stopCondition     Json?             // { type: "NEW_PRICE" | "MIN_MAX", ... }

  lastRunAt         DateTime?
  nextRunAt         DateTime?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  jobs              RepricingJob[]

  @@index([tenantCompanyId, status])
  @@index([nextRunAt])
  @@schema("repricing")
}

enum RuleStatus {
  DRAFT
  ACTIVE
  PAUSED
  ARCHIVED
  @@schema("repricing")
}

enum Strategy {
  MATCH_CHEAPEST
  BEAT_CHEAPEST
  MATCH_AVG
  BEAT_AVG
  MATCH_HIGHEST
  CUSTOM
  @@schema("repricing")
}

enum OffsetType {
  ABSOLUTE
  PERCENT
  @@schema("repricing")
}

enum ScheduleType {
  MANUAL
  HOURLY
  DAILY
  WEEKLY
  @@schema("repricing")
}
```

Guardrails are a discriminated union stored as JSON:

```typescript
type Guardrail =
  | { type: "ABS_MIN"; value: number }             // never below €X
  | { type: "ABS_MAX"; value: number }             // never above €X
  | { type: "MARGIN_MIN_PCT_OF_COST"; value: number }  // margin >= X% above COGS
  | { type: "MAX_DISCOUNT_PCT"; value: number };   // no more than X% off MSRP
```

## Server actions

`src/actions/repricing/rules.ts`:

```typescript
export async function listRules(tenantCompanyId: string, status?: RuleStatus): Promise<RepricingRule[]>
export async function getRule(id: string): Promise<RepricingRule>
export async function createRule(input: CreateRuleInput): Promise<RepricingRule>
export async function updateRule(id: string, patch: Partial<CreateRuleInput>): Promise<RepricingRule>
export async function duplicateRule(id: string): Promise<RepricingRule>
export async function archiveRule(id: string): Promise<void>
export async function activateRule(id: string): Promise<void>    // DRAFT → ACTIVE
export async function pauseRule(id: string): Promise<void>       // ACTIVE → PAUSED
export async function reorderRules(orderedIds: string[]): Promise<void>  // priority
```

`src/actions/repricing/execution.ts` — reuse from prompt 20 (`simulateRule`, `applyRule`, `rollbackJob`).

## Conflict resolution

When multiple rules cover the same SKU:

1. Only `ACTIVE` rules participate.
2. Lower `priority` wins (operator-controlled order).
3. If an SKU appears in 2+ rules, show a `⚠ Conflict` badge on the affected rule cards with a tooltip listing the overlapping rule names.
4. In Preview, each row shows which rule "won" that SKU.
5. Operator can change priority via drag-to-reorder in the rules list.

## Scheduled execution

New route `src/app/api/cron/repricing/route.ts` (Vercel Cron target):

```typescript
// Runs every hour at minute 0.
// Finds rules with nextRunAt <= now() and status=ACTIVE.
// For each: run simulateRule → if autoApply then applyRule(all WILL_APPLY).
// Emit alerts for applied changes > 5% (AD hook into alerts system from prompt 06).

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return new Response("Unauthorized", { status: 401 });

  const now = new Date();
  const due = await prisma.repricingRule.findMany({
    where: { status: "ACTIVE", nextRunAt: { lte: now } },
  });

  for (const rule of due) {
    await runScheduledRule(rule);
  }

  return Response.json({ ranCount: due.length });
}
```

`runScheduledRule(rule)`:
1. Call `simulateRule(rule.id)`.
2. If `rule.autoApply` is `true`, auto-approve all `WILL_APPLY` rows and call `applyRule`.
3. Else, write the simulation as a pending `RepricingJob` with status `SIMULATED` and notify the operator.
4. Update `rule.lastRunAt` and compute `nextRunAt` based on schedule.
5. Emit a `PRICE_CHANGE_APPLIED` alert per SKU with delta > 5% (write to `Alert` table — integrates with prompt 06).

Add Vercel Cron config in `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/repricing", "schedule": "0 * * * *" }
  ]
}
```

## Wizard (existing, needs backend wiring)

The UI at `/en/repricing/manage` already renders the 4-step wizard (Rule name, Repricing action, Competitors, Stop condition, Min/Max). Task: wire its Save + Save&Preview buttons to the new server actions.

Save → `createRule` or `updateRule` + redirect to `/en/repricing/auto-rules`.
Save&Preview → `updateRule` then `simulateRule` then open `<RunPreviewModal>` inline.

## Acceptance criteria

- [ ] Prisma model matches spec + `prisma db push` runs.
- [ ] Creating a rule via UI writes correct row; fields persist.
- [ ] Pricefy-style presets work: "Cheaper than cheapest by 1%" (BEAT_CHEAPEST + PERCENT + 1), "Match cheapest" (MATCH_CHEAPEST + ABSOLUTE + 0), "Match market average" (MATCH_AVG + ABSOLUTE + 0).
- [ ] Guardrails evaluate in order and block changes that would violate them.
- [ ] Conflict badge shows when two ACTIVE rules overlap on an SKU.
- [ ] Reorder (drag) rules updates `priority`.
- [ ] Vercel Cron calls `/api/cron/repricing` hourly; only rules with `nextRunAt <= now` run.
- [ ] AutoApply=true rules push price changes automatically; AutoApply=false leaves a pending `RepricingJob` for operator review.
- [ ] Alerts fire for price changes > 5%.
- [ ] `typecheck`, `lint`, `build` pass.

## Out of scope

- Multi-rule compare mode (Prisync's "5 rules per product" feature) — v2.
- Date-windowed promotional rules — v2.
- Seller-feedback or marketplace-specific conditions (Amazon Buy Box) — we're own-store first.
- Pushing prices to Shopify/Woo/Amazon — emit alerts for a future platform-sync worker.
- Email/Slack notifications on rule runs — in-app alert only (per decisions-log).

## Branch + commits

```bash
git checkout -b feature/repricing-engine
```

1. `feat(repricing): add full Prisma schema with scope/strategy/guardrails`
2. `feat(repricing): add CRUD server actions for rules`
3. `feat(repricing): implement conflict resolution via priority`
4. `feat(repricing): add Vercel Cron hourly scheduler`
5. `feat(repricing): wire wizard UI to new actions`
6. `feat(repricing): emit alerts on large price changes`

## Reference files

- UI already exists: `src/app/(site)/[lang]/(app)/repricing/*`
- Component: `src/components/organisms/RepricingRules.tsx`
- Alerts integration: prompt `06-alerts-cmo-and-cfo.md` + the `createAlert` helper it defines
- Preview flow: prompt `20-run-preview-repricing.md`
- Research: `.claude/research/pricefy-features.md`, `.claude/research/run-preview-example.md`
- Decisions: `.claude/research/decisions-log.md`
