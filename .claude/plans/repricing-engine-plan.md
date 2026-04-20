# Repricing Engine — Implementation Plan

**Branch:** `feature/repricing-engine` (current: `claude/elastic-jemison-e9180a`)
**Reference:** [.claude/research/pricefy-reverse-engineered.md](../research/pricefy-reverse-engineered.md)
**Prompts:** build this prompt + prompt 20 (preview/apply) in the same PR — prompt 20 has not been merged, so we fold it in.

---

## 1. Goal (one paragraph)

Turn `/en/repricing/*` from a UI mock backed by `mockCompetitors` and `TODO` comments into a real engine that (a) persists rules to Postgres, (b) computes target prices with guardrails, (c) runs on Vercel Cron, (d) lets the operator preview → approve → apply → rollback, and (e) fires in-app alerts on large price moves. The engine matches Pricefy/Prisync feature parity on our own-store use case.

---

## 2. Current state snapshot

### 2.1 What already ships (don't rewrite — wire up)

**UI — pages** (`src/app/(site)/[lang]/(app)/repricing/`):

| Route | File | State |
|---|---|---|
| `/repricing/auto-rules` | `auto-rules/page.tsx` → `RepricingRules.tsx` | Hardcoded sample rules, toggles, action buttons |
| `/repricing/manage` | `manage/page.tsx` → `ManageRepricingRule.tsx` | Full 9-step form, mock save, navigates on success |
| `/repricing/auto-overview` | `auto-overview/page.tsx` → `RepricingPreview.tsx` | Placeholder preview component |
| `/repricing/auto-history` | `auto-history/page.tsx` | Placeholder history page |

**UI — wizard steps** (`src/components/molecules/repricing/`):
`RuleNameStep`, `RepricingConfigStep`, `SelectCompetitorsStep`, `StopConditionStep`, `MinMaxValuesStep`, `ApplyToProductsStep`, `RepricingMethodStep`, `OptionsStep`, `ExportSettingsStep`, `CompetitorCard`, `MinMaxMethodCard`, `DisabledOverlay`.

**Types** (`src/types/repricing-rule.ts`):
- `RepricingRule`, `RepricingRuleFormData`, `PricingConfig`, `StopCondition`, `MinMaxPrice`, `ProductSelection`, `Automations`, `RuleOptions`, `ExportSettings`, plus enums.
- **We keep this shape.** The Prisma model mirrors it exactly so no form refactor is needed.

**Competitor data** (`prisma/schema.prisma`):
- `CompetitorPriceComparison` — per-SKU competitor price snapshots (has `competitorPrice`, `myPrice`, `priceDate`, `isWinning`). This is what the engine reads.
- `CompetitorPriceHistory` — daily min/avg/max rollups.

**Design system:**
- Tailwind with Untitled-UI tokens in `tailwind.config.ts`: `bg-brand*`, `bg-success-solid*`, `bg-warning-solid*`, `text-primary`, `text-secondary`, `border-primary`, `bg-bg-secondary`, `bg-background`.
- OKLCH palette in `src/styles/theme.css` with `.dark` variants.
- shadcn/ui primitives in `src/components/ui/`: `button`, `card`, `badge`, `tabs`, `alert`, `tooltip`, `popover`, `dropdown-menu`, `checkbox`, `input`, `select`, `dialog`-equivalent, `toggle`.
- Custom base components in `src/components/base/` (Buttons/Inputs/etc.) — wizard already uses these.
- `DataTable` molecule + `tables/DataTable/` organism already support sortable columns, filters, pagination.

### 2.2 What's missing (build fresh)

- **Prisma models**: `RepricingRule`, `RepricingJob`, `RepricingProposal`, `Alert`. None exist.
- **Server actions**: `src/actions/repricing/*` — none exist.
- **API routes**: `src/app/api/repricing/*`, `src/app/api/cron/repricing/route.ts` — none exist.
- **Stepper/Wizard chrome**: the wizard steps render sequentially with no step indicator. Pricefy's form is long-form too, so we **keep the current long-form layout** and just add section anchors.
- **Research docs** that the original prompt referenced didn't exist; we've now created `.claude/research/pricefy-reverse-engineered.md` to serve that role.

---

## 3. Target architecture

```
┌──────────────────────────────────────────────────────────────┐
│  UI  (existing long-form wizard + 3 new pages)              │
│  manage  │  auto-rules  │  auto-overview  │  auto-history   │
└──────┬──────────┬──────────────┬──────────────┬──────────────┘
       │ form     │ list/toggle  │ simulate     │ audit/rollback
       ▼          ▼              ▼              ▼
┌──────────────────────────────────────────────────────────────┐
│  Server actions  (src/actions/repricing/*)                  │
│  rules.ts · execution.ts · conflicts.ts                     │
└──────┬────────────────────────┬──────────────────────────────┘
       │                        │
       ▼                        ▼
┌──────────────────┐   ┌───────────────────────────────────────┐
│  Repricing engine│   │  API routes                           │
│  (pure TS lib)   │   │  /api/repricing/*                     │
│  src/lib/        │   │  /api/cron/repricing  ← Vercel Cron   │
│   repricing/     │   └───────────────────────────────────────┘
│   - compute.ts   │
│   - guardrails.ts│
│   - strategy.ts  │
│   - conflict.ts  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  Prisma (schema "public" + new enums)                       │
│  RepricingRule · RepricingJob · RepricingProposal · Alert   │
│  reads: CompetitorPriceComparison, product_*                │
└──────────────────────────────────────────────────────────────┘
```

Two reasons the engine lives in `src/lib/repricing/` (not inside server actions):
1. **Testable in Jest** without Next.js / DB mocks — pure functions over plain objects.
2. Same code path for preview (simulate), cron (auto-apply), and manual apply.

---

## 4. Data model

We add models to the existing `public` schema (the codebase uses `nogl` + `public`; keeping everything in `public` avoids a new schema migration). The original prompt proposed a `repricing` schema — we skip that to match what's already in the repo.

```prisma
// prisma/schema.prisma — append at end

model RepricingRule {
  id              String        @id @default(cuid())
  name            String
  description     String?
  status          RuleStatus    @default(DRAFT)
  priority        Int           @default(0)             // lower wins on conflicts

  // --- SCOPE ---
  scopeType       ScopeType     @default(ALL)           // ALL | CATEGORIES | SPECIFIC
  categoryIds     String[]      @default([])
  productIds      String[]      @default([])

  // --- STRATEGY (mirrors src/types/repricing-rule.ts PricingConfig) ---
  setPrice         Float        @default(0)
  priceDirection  PriceDir      @default(PERCENTAGE)    // PLUS | MINUS | PERCENTAGE | FIXED
  comparisonSource CmpSource    @default(CHEAPEST)      // MY_PRICE | CHEAPEST | AVERAGE | SPECIFIC
  comparisonLogic  CmpLogic     @default(BELOW)         // EQUAL | ABOVE | BELOW
  specificCompetitorId String?                          // only when source=SPECIFIC

  competitorIds   String[]      @default([])            // which competitors participate

  // --- GUARDRAILS (JSON — see union type in src/lib/repricing/types.ts) ---
  guardrails      Json          @default("[]")

  // --- MIN/MAX ---
  minMaxType      MinMaxType    @default(MANUAL)
  minMax          Json          @default("{}")

  // --- OPTIONS (rounding, adjust calculated price) ---
  options         Json          @default("{}")

  // --- SCHEDULE ---
  scheduleType    ScheduleType  @default(MANUAL)
  scheduleHour    Int?
  scheduleDow     Int?
  autoApply       Boolean       @default(false)
  lastRunAt       DateTime?
  nextRunAt       DateTime?

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  createdById     String?

  jobs            RepricingJob[]

  @@index([status, nextRunAt])
  @@schema("public")
}

model RepricingJob {
  id              String           @id @default(cuid())
  ruleId          String
  rule            RepricingRule    @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  status          JobStatus        @default(SIMULATED)     // SIMULATED | APPLIED | ROLLED_BACK | FAILED
  trigger         JobTrigger       @default(MANUAL)        // MANUAL | SCHEDULED | APPLY_ACTION
  productsAnalyzed Int             @default(0)
  productsChanged  Int             @default(0)
  productsBlocked  Int             @default(0)
  totalImpact     Decimal?         @db.Decimal(12, 2)      // sum of |delta| in € across changed SKUs
  startedAt       DateTime         @default(now())
  finishedAt      DateTime?
  triggeredById   String?
  rolledBackAt    DateTime?
  rolledBackById  String?
  rollbackOfId    String?                                 // self-link for rollback jobs
  error           String?
  proposals       RepricingProposal[]

  @@index([ruleId, startedAt])
  @@index([status])
  @@schema("public")
}

model RepricingProposal {
  id              String           @id @default(cuid())
  jobId           String
  job             RepricingJob     @relation(fields: [jobId], references: [id], onDelete: Cascade)
  productId       String
  productSku      String
  currentPrice    Decimal          @db.Decimal(10, 2)
  proposedPrice   Decimal?         @db.Decimal(10, 2)
  appliedPrice    Decimal?         @db.Decimal(10, 2)
  costAtRun       Decimal?         @db.Decimal(10, 2)
  cheapestCompetitorPrice Decimal? @db.Decimal(10, 2)
  highestCompetitorPrice  Decimal? @db.Decimal(10, 2)
  avgCompetitorPrice      Decimal? @db.Decimal(10, 2)
  minGuardrail    Decimal?         @db.Decimal(10, 2)
  maxGuardrail    Decimal?         @db.Decimal(10, 2)
  status          ProposalStatus   @default(WILL_APPLY)    // WILL_APPLY | BLOCKED | NO_CHANGE | APPLIED | REJECTED | ROLLED_BACK
  blockedReason   String?                                  // e.g. "below ABS_MIN", "margin < 10%"
  decidedById     String?
  decidedAt       DateTime?

  @@index([jobId, status])
  @@index([productId])
  @@schema("public")
}

model Alert {
  id          String     @id @default(cuid())
  kind        AlertKind                                     // PRICE_CHANGE_APPLIED | RULE_RUN_FAILED | GUARDRAIL_BLOCK_SPIKE
  severity    AlertSev   @default(INFO)                    // INFO | WARN | CRITICAL
  title       String
  message     String
  metadata    Json       @default("{}")
  readAt      DateTime?
  createdAt   DateTime   @default(now())
  productId   String?
  ruleId      String?
  jobId       String?

  @@index([readAt, createdAt])
  @@schema("public")
}

enum RuleStatus        { DRAFT ACTIVE PAUSED ARCHIVED    @@schema("public") }
enum ScopeType         { ALL CATEGORIES SPECIFIC         @@schema("public") }
enum PriceDir          { PLUS MINUS PERCENTAGE FIXED     @@schema("public") }
enum CmpSource         { MY_PRICE CHEAPEST AVERAGE SPECIFIC @@schema("public") }
enum CmpLogic          { EQUAL ABOVE BELOW               @@schema("public") }
enum MinMaxType        { MANUAL GROSS_MARGIN COST PRICE MAP @@schema("public") }
enum ScheduleType      { MANUAL HOURLY DAILY WEEKLY      @@schema("public") }
enum JobStatus         { SIMULATED APPLIED ROLLED_BACK FAILED @@schema("public") }
enum JobTrigger        { MANUAL SCHEDULED APPLY_ACTION   @@schema("public") }
enum ProposalStatus    { WILL_APPLY BLOCKED NO_CHANGE APPLIED REJECTED ROLLED_BACK @@schema("public") }
enum AlertKind         { PRICE_CHANGE_APPLIED RULE_RUN_FAILED GUARDRAIL_BLOCK_SPIKE @@schema("public") }
enum AlertSev          { INFO WARN CRITICAL              @@schema("public") }
```

**Reconciliation with `src/types/repricing-rule.ts`:** the existing type system uses lowercase string literals (`'plus' | 'minus' | ...`). We add a thin adapter in `src/lib/repricing/adapter.ts` that maps `RepricingRuleFormData` ↔ Prisma `RepricingRule` so the wizard UI needs **zero** changes.

---

## 5. Repricing engine (`src/lib/repricing/`)

Pure TypeScript library — no Next.js, no Prisma imports (except for types).

```
src/lib/repricing/
├─ types.ts            # Guardrail union, engine input/output DTOs
├─ adapter.ts          # RepricingRuleFormData ↔ Prisma model
├─ strategy.ts         # computeTargetPrice(rule, { cost, myPrice, competitors })
├─ guardrails.ts       # evaluateGuardrails(proposed, ctx) → { pass, reason?, clampedTo? }
├─ minmax.ts           # resolveMinMax(rule, { cost, myPrice, msrp })
├─ conflict.ts         # resolveConflicts(rules, productId) → winning rule
├─ engine.ts           # top-level simulate(rule, productsBatch) → Proposal[]
└─ __tests__/          # Jest tests per file
```

### 5.1 `strategy.ts` — target price math

Pseudocode:

```ts
function computeTargetPrice(rule, { cost, myPrice, competitorPrices }): number | null {
  // 1. pick reference price based on rule.comparisonSource
  const ref =
    rule.comparisonSource === "CHEAPEST" ? min(competitorPrices) :
    rule.comparisonSource === "AVERAGE"  ? avg(competitorPrices) :
    rule.comparisonSource === "HIGHEST"  ? max(competitorPrices) :
    rule.comparisonSource === "SPECIFIC" ? competitorPrices[rule.specificCompetitorId] :
    myPrice;                                     // MY_PRICE

  if (ref == null) return null;                  // no competitor data → skip

  // 2. apply direction + setPrice (offset)
  const offset =
    rule.priceDirection === "PERCENTAGE" ? ref * (rule.setPrice / 100) :
    rule.priceDirection === "FIXED"      ? rule.setPrice :
    0;

  const target =
    rule.comparisonLogic === "BELOW" ? ref - offset :
    rule.comparisonLogic === "ABOVE" ? ref + offset :
    ref;                                         // EQUAL

  return roundHalfUp(target, 2);
}
```

### 5.2 `guardrails.ts`

```ts
type Guardrail =
  | { type: "ABS_MIN"; value: number }
  | { type: "ABS_MAX"; value: number }
  | { type: "MARGIN_MIN_PCT_OF_COST"; value: number }
  | { type: "MAX_DISCOUNT_PCT"; value: number; msrp: number };

function evaluateGuardrails(proposed, ctx): Result {
  for (const g of ctx.guardrails) {
    if (g.type === "ABS_MIN" && proposed < g.value)
      return { status: "BLOCKED", reason: `below minimum €${g.value}` };
    if (g.type === "ABS_MAX" && proposed > g.value)
      return { status: "BLOCKED", reason: `above maximum €${g.value}` };
    if (g.type === "MARGIN_MIN_PCT_OF_COST") {
      const minAllowed = ctx.cost * (1 + g.value / 100);
      if (proposed < minAllowed)
        return { status: "BLOCKED", reason: `margin < ${g.value}% of cost` };
    }
    if (g.type === "MAX_DISCOUNT_PCT") {
      const minAllowed = g.msrp * (1 - g.value / 100);
      if (proposed < minAllowed)
        return { status: "BLOCKED", reason: `discount > ${g.value}% off MSRP` };
    }
  }
  return { status: "PASS" };
}
```

**Order matters:** guardrails evaluate in the order stored in the `guardrails` JSON array. The first failure wins. The blocked reason is what shows in the Preview table tooltip.

### 5.3 `conflict.ts`

- Input: all `ACTIVE` rules for the tenant + a productId.
- Match each rule's scope (`ALL`, `CATEGORIES[…]`, `SPECIFIC[…]`) against the product.
- Return the match set. Sort ascending by `priority`. The first wins.
- If multiple rules match → set `conflict: true` and return both — the UI will show a ⚠ badge.

### 5.4 `engine.ts` — the orchestrator

```ts
async function simulate(ruleId, opts) {
  const rule      = await getRule(ruleId);
  const products  = await getProductsInScope(rule);
  const prices    = await getLatestCompetitorPrices(products, rule.competitorIds);
  const proposals: Proposal[] = [];

  for (const p of products) {
    const winner = resolveConflicts(allActiveRules, p.id);
    if (winner.id !== rule.id) continue;                 // another rule owns this SKU

    const target  = computeTargetPrice(rule, { cost: p.cost, myPrice: p.price, competitorPrices: prices[p.id] });
    if (target === null)               { push({ status: "NO_CHANGE", reason: "no competitor data" }); continue; }
    if (Math.abs(target - p.price) < 0.01) { push({ status: "NO_CHANGE" }); continue; }

    const guard = evaluateGuardrails(target, { cost: p.cost, guardrails: rule.guardrails, ... });
    push({
      productId: p.id, proposedPrice: target,
      status: guard.status === "PASS" ? "WILL_APPLY" : "BLOCKED",
      blockedReason: guard.reason,
    });
  }

  return persistJob(ruleId, proposals, "SIMULATED");
}
```

`applyRule(jobId, proposalIds)`:
1. Load job + proposals in `WILL_APPLY`.
2. For each, update `Product.price` in a transaction.
3. Mark proposals `APPLIED` with `appliedPrice`.
4. Mark job `APPLIED`, set `finishedAt`.
5. For each |delta|/price > 5%: emit `PRICE_CHANGE_APPLIED` `Alert`.

`rollbackJob(jobId)`:
1. Load original proposals with status `APPLIED`.
2. For each, write a new `RepricingJob` (trigger `APPLY_ACTION`, rollbackOfId = original) that sets price back to `currentPrice` (the pre-apply value).
3. Mark original job `ROLLED_BACK`.

---

## 6. Server actions

`src/actions/repricing/rules.ts`:

```ts
"use server";
export async function listRules(opts?: { status?: RuleStatus; search?: string }): Promise<RepricingRuleDTO[]>
export async function getRule(id: string): Promise<RepricingRuleDTO>
export async function createRule(input: RepricingRuleFormData): Promise<RepricingRuleDTO>
export async function updateRule(id: string, patch: Partial<RepricingRuleFormData>): Promise<RepricingRuleDTO>
export async function duplicateRule(id: string): Promise<RepricingRuleDTO>
export async function deleteRule(id: string): Promise<void>              // soft → ARCHIVED
export async function activateRule(id: string): Promise<void>
export async function pauseRule(id: string): Promise<void>
export async function reorderRules(orderedIds: string[]): Promise<void>  // writes priority
```

`src/actions/repricing/execution.ts`:

```ts
export async function simulateRule(ruleId: string): Promise<RepricingJobDTO>         // creates SIMULATED job
export async function applyJob(jobId: string, proposalIds?: string[]): Promise<RepricingJobDTO>
export async function rejectProposals(jobId: string, proposalIds: string[]): Promise<void>
export async function rollbackJob(jobId: string): Promise<RepricingJobDTO>
export async function listJobs(opts?: JobFilter): Promise<RepricingJobDTO[]>         // history
export async function getJob(id: string): Promise<JobWithProposals>                  // drill-in
```

All actions authenticate via the existing `auth()` helper and (v1) scope by `userId` until a proper tenant model is introduced. Add a `// TODO(multi-tenant):` marker where we hardcode `userId` as the tenant boundary.

---

## 7. API routes

```
src/app/api/repricing/rules/route.ts            GET (list), POST (create)
src/app/api/repricing/rules/[id]/route.ts       GET, PATCH, DELETE
src/app/api/repricing/rules/[id]/simulate/route.ts  POST
src/app/api/repricing/jobs/[id]/apply/route.ts      POST
src/app/api/repricing/jobs/[id]/rollback/route.ts   POST
src/app/api/repricing/jobs/route.ts             GET (history)
src/app/api/repricing/jobs/[id]/route.ts        GET (drill-in)
src/app/api/cron/repricing/route.ts             GET (Vercel cron)
```

Each route is a thin wrapper over the server actions so they can be called from both server components and any future external integrations.

### 7.1 Cron

`vercel.json` at repo root (or extend if present):

```json
{
  "crons": [
    { "path": "/api/cron/repricing", "schedule": "0 * * * *" }
  ]
}
```

Handler:

```ts
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return new Response("Unauthorized", { status: 401 });

  const due = await prisma.repricingRule.findMany({
    where: { status: "ACTIVE", nextRunAt: { lte: new Date() } },
  });

  const results = await Promise.allSettled(due.map(runScheduledRule));

  return Response.json({ ran: due.length, failures: results.filter(r => r.status === "rejected").length });
}
```

`runScheduledRule(rule)`:
1. `simulate(rule.id)`.
2. If `rule.autoApply` → apply all `WILL_APPLY` proposals.
3. Else, leave job as `SIMULATED` and create one `Alert` of kind `RULE_RUN_FAILED`… no, kind `RULE_RUN_PENDING_REVIEW` — add that enum variant. (Decision: I'll collapse it into `PRICE_CHANGE_APPLIED` w/ severity INFO for simplicity; drop `RULE_RUN_PENDING_REVIEW`.)
4. Update `rule.lastRunAt` and recompute `rule.nextRunAt` from `scheduleType`.

---

## 8. UI work package

### 8.1 `manage` wizard — wire up existing form

**File:** `src/components/organisms/ManageRepricingRule.tsx`

Changes:
1. Replace mock competitors fetch with `fetch('/api/competitors?enabled=true')`.
2. Replace `setTimeout` mock save with `createRule` / `updateRule` server actions (imported, not fetch).
3. Replace `setTimeout` mock load with `getRule`.
4. On `Save & Preview` → call `updateRule`, then `simulateRule`, then `router.push('/en/repricing/auto-overview?jobId=...')`.
5. Keep translations dict; move to i18n files once we touch this area again (not this PR).

**Design-system touch-ups:**
- The Save button currently uses `className="bg-success-solid ..."`. That's correct — `Save` is the success action; `Save & Preview` uses `bg-brand-solid`. Leave as-is.
- Loading overlay uses `bg-black/50 backdrop-blur-sm` + `bg-background` + `text-brand-solid` — already on tokens.

### 8.2 `auto-rules` — rules list

**File:** `src/components/organisms/RepricingRules.tsx`

Changes:
1. Replace hardcoded sample data with `listRules()` called from the server component `auto-rules/page.tsx`.
2. Pass the rules into `RepricingRules` as a prop.
3. Add drag-to-reorder (use `@dnd-kit/core` if not already installed; check `package.json`). Drag updates `priority` via `reorderRules`.
4. Add conflict badge: server action precomputes overlaps → returns `rule.conflictsWithRuleIds: string[]`. Render as `<Badge variant="warning">⚠ Conflict</Badge>` using the existing `src/components/ui/badge.tsx`.
5. Toggle (pause/activate) wires to `pauseRule` / `activateRule`.

**Design tokens used:** `bg-bg-secondary` (page), `bg-background` (cards), `border-primary`, `text-primary`, `text-secondary`, `bg-brand-solid`, `bg-warning-solid` for conflict badge, `bg-success-solid` for active pill.

### 8.3 `auto-overview` — preview page (Pricefy Page 2 replica)

**New file:** `src/components/organisms/RepricingPreviewTable.tsx`

Structure — 11 columns per Pricefy spec (§Page 2 in reference doc):

| # | Column | Source | Rendering |
|---|---|---|---|
| 1 | Product | `proposal.productSku + product.name` | Link to product page |
| 2 | Triggered Rule | `rule.name` | Muted text |
| 3 | Price | `currentPrice` | `€X,XXX.XX` |
| 4 | Cost | `costAtRun` | `€X,XXX.XX` |
| 5 | Markup | `currentPrice - costAtRun` | `€X,XXX.XX` |
| 6 | New Price | `proposedPrice` | Delta chip next to it: `+/-1.20 (+0.8%)` |
| 7 | Min / Max | `minGuardrail`, `maxGuardrail` | Stacked |
| 8 | Competitor Prices | 3 badges | Cheap / Avg / High |
| 9 | Status | `proposal.status` | Badge (colors below) |
| 10 | Executed At | `job.finishedAt \|\| startedAt` | Relative time |
| 11 | Actions | Approve / Reject / Override | Row-level Button group |

**Status badge colors** (using existing tokens, no hex):

| Status | Background | Text |
|---|---|---|
| `WILL_APPLY` | `bg-success-secondary` | `text-success-primary` |
| `BLOCKED` | `bg-warning-secondary` | `text-warning-primary` |
| `NO_CHANGE` | `bg-tertiary` | `text-tertiary` |
| `APPLIED` | `bg-brand-secondary` | `text-brand-secondary` |
| `REJECTED` | `bg-error-secondary` | `text-error-primary` |

(Map to actual tokens from `tailwind.config.ts` at implementation time — `bg-success-secondary` etc. may be named slightly differently.)

**Header stats** — three shadcn/ui `Card`s:
- Total SKUs analyzed.
- $ impact (sum |delta|).
- Blocked count.

**Bulk actions bar:** checkbox header + "Approve selected" / "Reject selected" buttons + "Apply all will-apply" CTA → opens `<ConfirmApplyDialog>`.

**Filter drawer:** status, rule, guardrail-blocked only, competitor — uses existing `<DropdownMenu>` / `<Popover>` primitives.

**Reuse:** the existing `src/components/organisms/tables/DataTable/` organism — extend it with the per-row action slot + bulk checkbox.

### 8.4 `auto-history` — audit log (Pricefy Page 3 replica)

**New file:** `src/components/organisms/RepricingHistoryTable.tsx`

Columns: Executed At, Rule Name, Repriced Products, Status, Actions.

**Row expansion (`View Details`):** opens a side drawer (`<Sheet>` from shadcn) showing a sub-table of the proposals for that job — reuses `<RepricingPreviewTable>` in read-only mode.

**Rollback flow:**
1. Button: `<Button variant="destructive">Rollback</Button>`.
2. Opens `<AlertDialog>` with count + impact summary: "This will revert 42 products to their pre-run prices (€1,240.50 total). Continue?"
3. On confirm → `rollbackJob(jobId)` → refresh the row (now showing status `Rolled back`).

**Filters:** date range picker (reuse or install `react-day-picker`), rule multi-select, status.

---

## 9. Design system — explicit token map

Every color used in this feature MUST come from a token. Hex values are banned by `CLAUDE.md`. Canonical tokens to use (verify exact names in `tailwind.config.ts`):

| Purpose | Token | Example |
|---|---|---|
| Page background | `bg-bg-secondary` | `<div class="min-h-screen bg-bg-secondary">` |
| Card background | `bg-background` | `<Card className="bg-background">` |
| Primary CTA | `bg-brand-solid hover:bg-brand-solid_hover` | Save & Preview |
| Success CTA | `bg-success-solid hover:bg-success-solid_hover` | Save / Apply |
| Destructive CTA | `bg-error-solid hover:bg-error-solid_hover` | Rollback, Reject |
| Body text | `text-primary` / `text-secondary` | |
| Muted text | `text-tertiary` | timestamps, "no data" |
| Border | `border-primary` | dividers, card outlines |
| Focus ring | `ring-brand-solid` | form inputs |
| Delta up (bad) | `text-error-primary bg-error-secondary` | row delta chip |
| Delta down (good) | `text-success-primary bg-success-secondary` | |
| Warning badge | `bg-warning-secondary text-warning-primary` | Blocked, ⚠ Conflict |

All 4 pages must render correctly in `.dark` — verified via the existing theme toggler in the layout.

---

## 10. Alerts integration

The original prompt depends on an `Alert` helper from prompt 06 (not present). We build it here:

**File:** `src/actions/alerts.ts`
```ts
export async function createAlert(input: {
  kind: AlertKind;
  severity: AlertSev;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  productId?: string; ruleId?: string; jobId?: string;
}): Promise<Alert>
```

**When repricing triggers alerts:**
- After `applyJob`, for each proposal where `|Δ| / current > 5%` → `PRICE_CHANGE_APPLIED`, severity `INFO`.
- If `|Δ| / current > 20%` → severity `WARN`.
- If a cron run throws → one `RULE_RUN_FAILED` alert with severity `CRITICAL`.
- If > 50% of proposals in a run are `BLOCKED` → `GUARDRAIL_BLOCK_SPIKE`, severity `WARN`.

**Display:** out of scope. The model + helper exist so prompt 06 / future alerts UI can render them.

---

## 11. File-by-file changeset

**Create:**
- `prisma/schema.prisma` — append 4 models + 11 enums (§4).
- `src/lib/repricing/{types,adapter,strategy,guardrails,minmax,conflict,engine}.ts`
- `src/lib/repricing/__tests__/{strategy,guardrails,conflict,engine}.test.ts`
- `src/actions/repricing/{rules,execution}.ts`
- `src/actions/alerts.ts`
- `src/app/api/repricing/rules/route.ts`
- `src/app/api/repricing/rules/[id]/route.ts`
- `src/app/api/repricing/rules/[id]/simulate/route.ts`
- `src/app/api/repricing/jobs/route.ts`
- `src/app/api/repricing/jobs/[id]/route.ts`
- `src/app/api/repricing/jobs/[id]/apply/route.ts`
- `src/app/api/repricing/jobs/[id]/rollback/route.ts`
- `src/app/api/cron/repricing/route.ts`
- `vercel.json` (or extend if exists)
- `src/components/organisms/RepricingPreviewTable.tsx`
- `src/components/organisms/RepricingHistoryTable.tsx`
- `src/components/molecules/repricing/StatusBadge.tsx`
- `src/components/molecules/repricing/DeltaChip.tsx`
- `src/components/molecules/repricing/ConfirmApplyDialog.tsx`

**Modify:**
- `src/components/organisms/ManageRepricingRule.tsx` — wire actions, drop mocks.
- `src/components/organisms/RepricingRules.tsx` — accept rules prop, drag-reorder, conflict badge, toggle actions.
- `src/components/organisms/RepricingPreview.tsx` — now delegates to `RepricingPreviewTable`.
- `src/app/(site)/[lang]/(app)/repricing/auto-rules/page.tsx` — server-fetch rules.
- `src/app/(site)/[lang]/(app)/repricing/auto-overview/page.tsx` — server-fetch job + proposals from `?jobId=`.
- `src/app/(site)/[lang]/(app)/repricing/auto-history/page.tsx` — server-fetch jobs list.

**Untouched:**
- All 12 wizard step components under `src/components/molecules/repricing/`.
- `src/types/repricing-rule.ts` — adapter handles the mapping.

---

## 12. Phases & commits

```bash
git checkout -b feature/repricing-engine
```

1. **`feat(repricing): prisma models + enums`** — schema + `prisma db push` + generated client.
2. **`feat(repricing): pure engine lib with tests`** — `src/lib/repricing/*` + Jest tests. Proves the math works without any UI.
3. **`feat(repricing): server actions for rules CRUD`** — `src/actions/repricing/rules.ts` + unit tests.
4. **`feat(repricing): simulate + apply + rollback`** — `src/actions/repricing/execution.ts`.
5. **`feat(repricing): API routes wrapping the actions`** — thin handlers.
6. **`feat(repricing): wire wizard UI to server actions`** — replaces mocks in `ManageRepricingRule`.
7. **`feat(repricing): rules list with drag-reorder and conflict badges`** — `RepricingRules.tsx`.
8. **`feat(repricing): preview table (11-column Pricefy-parity)`** — `RepricingPreviewTable` + confirm/apply modal.
9. **`feat(repricing): history table with rollback`** — `RepricingHistoryTable`.
10. **`feat(repricing): Vercel Cron hourly scheduler`** — cron route + `vercel.json`.
11. **`feat(alerts): Alert model + createAlert helper + emit on apply`** — alerts integration.
12. **`chore(repricing): e2e happy path test`** — a single Playwright test: create rule → simulate → apply → rollback.

Each commit passes `npm run typecheck` and `npm run check-lint` individually (CI gate).

---

## 13. Testing plan

**Unit (Jest):**
- `strategy.test.ts` — every combination of `comparisonSource × priceDirection × comparisonLogic` against golden numbers.
- `guardrails.test.ts` — each guardrail type blocks/passes correctly; ordering respected.
- `conflict.test.ts` — priority ordering, overlapping scopes.
- `engine.test.ts` — end-to-end simulate over a fixture of 20 products + 3 competitors + 2 rules.

**Integration:**
- `rules.test.ts` — CRUD round-trip through server actions.
- `execution.test.ts` — simulate → apply → rollback round-trip; asserts `Alert` rows.

**E2E (Playwright):**
- `tests/repricing.e2e.spec.ts` — single happy-path: create rule in wizard, land on preview, apply all, land on history, rollback.

**Manual (preview via `preview_start`):**
After each UI PR, verify dark-mode rendering, empty states, loading states, error states.

---

## 14. Decisions I'm making autonomously (per project memory)

1. **Models live in `public` schema**, not a new `repricing` schema — repo convention + avoids extra migration.
2. **`tenantCompanyId` is out of scope** — the codebase has no multi-tenant boundary yet. Scope by `userId` and mark the spot with `// TODO(multi-tenant)`.
3. **Keep the existing 9-step wizard UI unchanged** — reconcile via an adapter instead of rewriting the form. Pricefy's reference is also long-form, so parity is fine.
4. **Long-form layout on the wizard, not a stepped UI** — matches Pricefy. No new `Stepper` primitive needed.
5. **`@dnd-kit/core` for drag-reorder** — industry standard, tree-shakable; install if missing.
6. **Cron hourly, not continuous** — Vercel Cron free tier covers this; sub-hourly schedules use the hourly tick and check `nextRunAt`.
7. **No email/Slack alerts in v1** — in-app `Alert` rows only; UI to render them is out of scope here.
8. **Rollback = inverse job, not in-place edit** — preserves the audit trail.
9. **All colors via tokens** — zero hex literals, as per `CLAUDE.md`.

---

## 15. Acceptance criteria

- [ ] `npm run typecheck` passes.
- [ ] `npm run check-lint` passes.
- [ ] `npm run build` passes.
- [ ] `npm run test` — all new Jest tests green.
- [ ] Prisma migration applies cleanly on dev DB.
- [ ] Can create a rule in the wizard → row appears in `auto-rules` with status `DRAFT`.
- [ ] Activating → status flips to `ACTIVE`, `nextRunAt` is set.
- [ ] "Save & Preview" lands on `auto-overview?jobId=…` showing the 11-column table populated from real data.
- [ ] Guardrails block rows as expected (tested with a `MARGIN_MIN_PCT_OF_COST: 20` rule against a product with thin margin).
- [ ] Conflict badge shows when two `ACTIVE` rules overlap on the same SKU.
- [ ] Drag-reorder in `auto-rules` updates `priority` and survives reload.
- [ ] Apply → `Product.price` is updated; proposals flip to `APPLIED`; `Alert` row written for >5% deltas.
- [ ] Rollback → price reverts; a new inverse `RepricingJob` links via `rollbackOfId`.
- [ ] Cron route responds 401 without `CRON_SECRET`, runs due rules otherwise.
- [ ] Dark mode renders correctly on all 4 pages.

---

## 16. Out of scope (defer)

- Multi-rule compare mode (Prisync's "5 rules per product").
- Date-windowed promotional rules.
- Amazon Buy Box / marketplace-specific conditions.
- Push to Shopify / Woo / Amazon (emits alerts for a future sync worker).
- Email / Slack notifications.
- Alerts UI page (prompt 06 territory).
- Proper multi-tenancy (`tenantCompanyId`).
- Timezone support for `scheduleHour` (assume UTC for v1).

---

## 17. Open questions (non-blocking)

- **Which `priceDate` window defines "cheapest competitor"?** Default: most recent snapshot per competitor, filtered to last 7 days. Flag any stale data in the Preview table.
- **Should `BEAT_CHEAPEST by 1 cent` use `priceDirection=FIXED, setPrice=0.01`?** Yes — that's the cleanest mapping.
- **What currency?** Products have no currency field today; assume EUR. Add `currency` to `RepricingProposal` as nullable so we can backfill.

These are implementation-time decisions, not blockers for starting.
