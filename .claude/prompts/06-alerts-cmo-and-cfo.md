# Build the Alerts system — two pages (CMO + CFO), shared UI, real-time, in-app inbox only

## What you're building

Two alert inbox pages in the NOGL Next.js app that share the **exact same UI component** but pull from different data sources and surface different alert types.

1. **`/en/alerts`** — CMO-flavor alerts (competitive/marketing signals)
   - Alert types: `PRICE_DROP`, `COMPETITOR_NEW_PRODUCT`, `PROMO_START`, `AD_CREATIVE_CHANGE`, `STOCK_OUT` (competitor's stock status)
   - Lives under the **Fractional CMO** nav section (add nav entry if missing)
   - Also add entry under the **Pricing Tools** accordion as "Price Alerts"

2. **`/en/fractional-cfo/alerts`** — CFO-flavor alerts (inventory/supply-chain signals)
   - Alert types: `STOCK_OUT_IMMINENT`, `LOW_INVENTORY`, `REORDER_POINT_HIT`, `OVERSTOCK`, `STOCKOUT_ACTIVE`, `LEAD_TIME_BREACH`
   - Already exists as a "Coming Soon" stub in nav — replace the stub with this
   - Also needs a "Notifications" sub-route (`/en/fractional-cfo/alerts/notifications`) that shows user preferences for which events to subscribe to

The reference UI is a tool called **Voids** — 56 screenshots live in `C:\Users\tuhin.mallick\Downloads\ALTERS PAGE CFO\Demo_Video_hero_Page_001.png` through `_056.png`. **Read those first before writing code.**

## UI spec (derived from Voids screenshots)

### Header area
- Page title "Alert Overview" (left)
- Right-side action buttons: column-config, "Export", primary action (e.g. "Create Rule" or "Settings")

### Severity tabs (horizontal scroll if overflow)
- Counts in parens — `All (141) | Hot (21) | Warm (44) | Cold (138) | Assigned | Cold Buffers | Cold Stockouts`
- Active tab: brand-colored underline + bold
- CMO variant: `All | Critical | Warning | Info | Assigned to me | Resolved`
- CFO variant: `All | Hot (stockout imminent) | Warm (reorder soon) | Cold (overstock) | Assigned to me`

### Filter row below tabs
- Filter chips: "Expired last X days", "Brand", "Category", "Warehouse" (CFO) or "Competitor" (CMO)
- "Filter" dropdown button (opens full filter panel on right sheet)
- Group-by selector: "Compact | No Grouping | By Product | By Competitor"
- Sort selector

### Bulk action bar (appears only when rows selected)
- "X selected | Resolve | Snooze | Assign to | Create Draft Order (CFO only) | Bulk Edit"

### Table columns

| Column | CMO version | CFO version |
|---|---|---|
| 1. Checkbox | ✓ | ✓ |
| 2. Product | image + title + SKU pill | image + title + SKU pill |
| 3. Issue | color-coded pill like "Price dropped -12%" or "New variant launched" | pill like "Stockout in 3d", "Reorder now", "2,700 units low" |
| 4. Signal bars | horizontal bars showing competitor prices vs. yours | horizontal bars showing stock levels across warehouses |
| 5. My price / stock | "€149.99" (CMO) | "45,200 units" (CFO) |
| 6. Context snippet | "Canon dropped price 2nd time this week" | "Supplier lead time 30d, reorder by Apr 25" |
| 7. Estimated impact | "€9,460 next 6 months" (lost revenue) | "€9,460 next 6 months" (stockout cost) |
| 8. Resolve | green checkmark button | green checkmark button |

### Issue-badge colors
- Red = `Hot` / critical / stockout-active
- Orange = `Warm` / reorder-soon / price-dropped-significantly
- Yellow = warning / watch
- Blue = info / resolved
- Grey = snoozed / dismissed

### Row click → side panel
- Opens a **right drawer** (shadcn/ui Sheet, 480px width)
- Shows detail specific to alert type:
  - **CFO stockout alert**: draft purchase order form — supplier list, variants, units, total cost, "Save N Orders" primary CTA (see Voids screenshot page 15). When saved, redirects to Replenishment Kanban with the new PO pre-filled.
  - **CMO price-drop alert**: competitor snapshot — price history chart, link to competitor product, "Create Repricing Rule" CTA that opens the rule wizard pre-filled with this product + competitor.

### Chart icon in row → modal
- Full inventory chart modal (see Voids page 40/45):
  - Line chart with Inventory, Safety Buffer, Reorder Reminder, Reorder Threshold, Overstock Threshold over time
  - Warehouse tabs at top
  - Toggle: "Show History" / "Show Unfulfilled Preorders"
  - Left sidebar: product info (SKU, COGS, lead time, supplier)
  - Below chart: "Out of Stock events" list (date range, units, lost revenue)

- For **CMO version**, same modal structure but:
  - Chart shows competitor prices over time instead of inventory
  - Tabs: "Price History" / "Stock History" / "Ad Creative Timeline"
  - Below: "Events" list (promo starts, ad creative swaps, new variant launches)

## Data model (Prisma additions)

Add these to `prisma/schema.prisma` under a new `alerts` schema (extend `schemas = ["nogl", "public", "forecast", "alerts"]`):

```prisma
// ─── Alerts schema ──────────────────────────────────────────────────────────

enum AlertSeverity {
  HOT        // critical, block action needed now
  WARM       // soon, action needed this week
  COLD       // monitoring, informational
  SNOOZED
  RESOLVED
}

enum AlertStatus {
  OPEN
  SNOOZED
  RESOLVED
  DISMISSED
}

enum AlertType {
  // CMO types
  PRICE_DROP
  PRICE_INCREASE
  COMPETITOR_NEW_PRODUCT
  COMPETITOR_STOCKOUT
  PROMO_START
  PROMO_END
  AD_CREATIVE_CHANGE
  NEWSLETTER_RECEIVED
  // CFO types
  STOCKOUT_IMMINENT
  LOW_INVENTORY
  REORDER_POINT_HIT
  OVERSTOCK
  STOCKOUT_ACTIVE
  LEAD_TIME_BREACH
  SUPPLIER_DELAY
}

enum AlertAudience {
  CMO
  CFO
}

model Alert {
  id                String          @id @default(cuid())
  companyId         String          // the user's company (e.g. Calumet)
  audience          AlertAudience   // CMO or CFO (determines which page shows it)
  type              AlertType
  severity          AlertSeverity
  status            AlertStatus     @default(OPEN)
  title             String          // "Price dropped 12%"
  description       String?         // full markdown
  subjectProductId  String?         // ForecastProduct.id or equivalent
  subjectVariantId  String?
  subjectCompetitorId String?       // Company.id for CMO alerts
  estimatedImpact   Float?          // monetary impact
  impactCurrency    String          @default("EUR")
  impactWindowDays  Int             @default(180)   // "next 6 months"
  metadata          Json            // type-specific payload (price delta, stock level, etc.)
  assignedToUserId  String?
  snoozeUntil       DateTime?
  resolvedAt        DateTime?
  resolvedByUserId  String?
  triggeredAt       DateTime        @default(now())
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([companyId, audience, status, severity, triggeredAt])
  @@index([subjectProductId])
  @@index([type])
  @@schema("alerts")
}

model AlertSubscription {
  id            String       @id @default(cuid())
  userId        String
  companyId     String
  audience      AlertAudience
  alertType     AlertType
  enabled       Boolean      @default(true)
  // Future-ready for digest mode — but MVP uses real-time only
  digestMode    String       @default("REALTIME")  // REALTIME | DAILY | WEEKLY
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@unique([userId, companyId, audience, alertType])
  @@schema("alerts")
}
```

Also create the schema in Postgres:
```bash
node -e "const {Pool}=require('pg'); const p=new Pool({connectionString: process.env.DATABASE_URL}); p.query('CREATE SCHEMA IF NOT EXISTS alerts').then(()=>{console.log('ok');p.end();});"
npx prisma db push --accept-data-loss
npx prisma generate
```

## Server actions

Create `src/actions/alerts.ts` following the pattern of `src/actions/forecast.ts` (NextAuth guard + Prisma + Redis cache):

```typescript
"use server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AlertAudience, AlertSeverity, AlertStatus, AlertType } from "@prisma/client";

export async function listAlerts(params: {
  companyId: string;
  audience: AlertAudience;
  severity?: AlertSeverity[];
  status?: AlertStatus[];
  type?: AlertType[];
  search?: string;
  page?: number;
  pageSize?: number;
}) { /* returns paginated alerts */ }

export async function getAlertCounts(params: {
  companyId: string;
  audience: AlertAudience;
}): Promise<Record<AlertSeverity, number> & { total: number; assigned: number }> {
  /* for severity tabs */
}

export async function resolveAlert(id: string): Promise<void>;
export async function snoozeAlert(id: string, until: Date): Promise<void>;
export async function bulkResolveAlerts(ids: string[]): Promise<void>;
export async function bulkAssignAlerts(ids: string[], userId: string): Promise<void>;
export async function createDraftOrderFromAlert(alertId: string): Promise<{ poId: string }>;  // redirects to /en/replenishment?newPO=<id>
```

## Real-time delivery via Server-Sent Events

User requirement is **real-time in-app inbox only — NOT email, NOT Slack, NOT digest**.

- Create `src/app/api/alerts/stream/route.ts` as a Next.js SSE route
- Client subscribes with `EventSource` in a TanStack Query layer
- Server pushes new alerts via Redis pub/sub (channel: `alerts:${companyId}:${audience}`)
- Writer side: whenever any backend job (price scraper, inventory computation, ad-creative watcher) creates an `Alert` row, it also publishes to Redis so all connected clients see it instantly

Reference: [Next.js Server-Sent Events App Router pattern](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming). Use the `ReadableStream` pattern.

The SSE handler should:
1. Call `getAuthSession()` — reject if no session
2. Subscribe to Redis channel `alerts:${session.user.companyId}:${audience}`
3. On each Redis message, write a `data: ${JSON.stringify(alert)}\n\n` chunk
4. Send `:heartbeat\n\n` every 20 s
5. Clean up on client disconnect

## Alert generation (producers)

Alerts are _written_ by existing background jobs — you're not writing those jobs in this prompt. You are writing ONE helper the producer jobs will call:

```typescript
// src/lib/alerts/createAlert.ts
export async function createAlert(input: AlertCreateInput): Promise<Alert> {
  const alert = await prisma.alert.create({ data: input });
  await getRedisClient().publish(
    `alerts:${input.companyId}:${input.audience}`,
    JSON.stringify(alert),
  );
  return alert;
}
```

The scrapers, repricing runs, replenishment cron — all call this helper when they detect a triggerable condition. The subscription table is consulted first: if the user has disabled that `alertType` the alert is NOT created. That's the only filter — real-time is the only mode.

## UI component reuse

Build a **single component** `<AlertInbox audience="CMO|CFO" companyId={...} />` used by both pages. It accepts:
- `audience` prop (CMO or CFO)
- `companyId` prop (current Calumet ID in dev: `cmnw4qqo10000ltccgauemneu`)
- `variantLabels` prop — maps `AlertType` enum to the friendly column/tab labels for that audience

The two pages are thin wrappers:

```tsx
// src/app/(site)/[lang]/(app)/alerts/page.tsx
export default async function Page() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");
  return <AlertInbox audience="CMO" companyId={CALUMET_COMPANY_ID} />;
}

// src/app/(site)/[lang]/(app)/fractional-cfo/alerts/page.tsx
export default async function Page() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/signin");
  return <AlertInbox audience="CFO" companyId={CALUMET_COMPANY_ID} />;
}
```

Nav entries to add in `src/data/navigationItemsV2.tsx`:
- Under **Fractional CMO** section → insert **Price Alerts** entry at top of `Pricing Tools` accordion, href `/en/alerts`, icon `NotificationBox`, badge showing unresolved count
- Under **Fractional CFO** section → existing Alerts entry already points at `/en/fractional-cfo/alerts` — leave as is

## Notifications sub-route (CFO only, per nav structure)

`/en/fractional-cfo/alerts/notifications` is a **subscription preferences page**:

- Toggle list of every `AlertType` grouped by category (CFO types only)
- "Enable all" / "Disable all" bulk toggles per category
- Future-ready `digestMode` dropdown per type (REALTIME | DAILY | WEEKLY) but only REALTIME works in MVP
- "Save preferences" writes to `AlertSubscription`

## Seed data so the page isn't empty

Create `scripts/seed-alerts-demo.ts` that inserts ~40 synthetic alerts for the Calumet tenant:
- 15 CFO alerts across all 6 CFO types, spread across 14 real ForecastVariants, mixed severities
- 25 CMO alerts across all 8 CMO types, referencing real Calumet products + competitor company IDs (Foto Erhardt, Fotokoch, etc.)
- Mix severity: ~15% HOT, 40% WARM, 45% COLD
- Mix status: 80% OPEN, 10% SNOOZED, 10% RESOLVED
- Estimated impact: random between €500 and €25,000

Add to `package.json`:
```json
"seed:alerts-demo": "node --env-file=.env --import tsx scripts/seed-alerts-demo.ts"
```

## Acceptance criteria

- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] `npx prisma db push` creates the `alerts` schema + 2 tables
- [ ] `npm run seed:alerts-demo` creates ~40 demo alerts
- [ ] `/en/alerts` loads and shows CMO alerts (all 8 types represented)
- [ ] `/en/fractional-cfo/alerts` loads and shows CFO alerts (all 6 types represented)
- [ ] Severity tabs filter correctly with accurate counts
- [ ] Bulk-select + "Resolve" works, rows disappear from `OPEN` tab
- [ ] Row click opens side sheet with alert-type-specific detail
- [ ] "Create Draft Order" button on CFO stockout alert creates a `ReplenishmentPurchaseOrder` and redirects to `/en/replenishment?newPO=<id>`
- [ ] Chart icon opens modal with recharts line chart
- [ ] Open two browser tabs on `/en/alerts` → insert a row via `prisma studio` → both tabs show the new alert within 2 s (SSE working)
- [ ] User can toggle subscriptions at `/en/fractional-cfo/alerts/notifications` and new alerts of a disabled type are NOT created

## Do NOT scope-creep into this prompt

- ❌ Email/Slack delivery (explicitly out — real-time in-app only)
- ❌ Digest mode UI (placeholder field only)
- ❌ Actually writing the scrapers/producer jobs (separate prompts 14, 15)
- ❌ Repricing rule wizard improvements (prompt 01)
- ❌ Ad-creative detection logic (prompt 14)

## Reference files in the repo

- Prisma base: `prisma/schema.prisma` (forecast schema is the pattern to clone)
- Server-action pattern: `src/actions/forecast.ts`, `src/actions/replenishment.ts`
- Auth: `src/lib/auth.ts` (`getAuthSession` supports dev bypass)
- Redis client: `src/lib/redis.ts`
- Tab page pattern: `src/app/(site)/[lang]/(app)/replenishment/page.tsx`
- Drawer/Sheet component: look for shadcn/ui `<Sheet>` in `src/components/ui/`
- Table pattern: `src/components/replenishment/*Kanban*` and `@tanstack/react-table` (already installed)
- Icons: `@untitledui/icons` (NotificationBox, AlertTriangle, CheckCircle, etc.)
- Reference screenshots: `C:\Users\tuhin.mallick\Downloads\ALTERS PAGE CFO\Demo_Video_hero_Page_*.png` — read pages 1, 5, 10, 15, 20, 25, 30, 40, 45 first

## Branch + commits

```bash
git checkout -b feature/alerts-inbox
```

Commit sequence:
1. `feat(alerts): add Prisma schema + seed script`
2. `feat(alerts): add server actions + Redis pub/sub helper`
3. `feat(alerts): add SSE route + client hook`
4. `feat(alerts): build AlertInbox component (table, tabs, bulk actions)`
5. `feat(alerts): build row detail side sheet + inventory chart modal`
6. `feat(alerts): wire CMO and CFO pages + nav entries`
7. `feat(alerts): add subscription preferences page`
8. `fix(alerts): typecheck/lint cleanup`

Open a PR targeting `main` with a 3-paragraph description referencing this prompt file.
