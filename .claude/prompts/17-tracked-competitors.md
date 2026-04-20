# Seed the 5 existing competitor companies as Calumet's tracked competitors + build Add Competitor UI

## Goal

Currently `/en/companies/competitor` (Tracked Competitors page) shows "0 competitors tracked yet" — but 5 real competitors already exist in the `Company` table (Foto Erhardt, Fotokoch, Foto Leistenschneider, Kamera Express, Teltec). **Auto-mark all 5 as tracked competitors of Calumet**, then build the **Add Competitor** UI to let the operator track more in future.

## Context

- Repo: Next.js 14 App Router + Prisma + Postgres (`nogl` + `public` + `forecast` schemas)
- Calumet Company ID: `cmnw4qqo10000ltccgauemneu`, slug `calumet-de`
- Existing page: `src/app/(site)/[lang]/(app)/companies/competitor/page.tsx` (currently empty)
- Read `CLAUDE.md` at repo root for build/style conventions.

## Step 1 — Prisma schema addition

Add a new join table to track the `Calumet tenant → tracked competitor` relationship. Edit `prisma/schema.prisma`:

```prisma
model TrackedCompetitor {
  id              String   @id @default(cuid())
  tenantCompanyId String   // Calumet's Company.id
  competitorId    String   // the competitor's Company.id
  status          TrackedCompetitorStatus @default(ACTIVE)
  priority        Int      @default(0)       // UI sort order (lower = higher priority)
  nickname        String?  // optional operator-set label
  addedAt         DateTime @default(now())
  addedByUserId   String?
  pausedAt        DateTime?
  pauseReason     String?
  notes           String?  @db.Text

  tenant          Company  @relation("TenantCompetitors", fields: [tenantCompanyId], references: [id], onDelete: Cascade)
  competitor      Company  @relation("CompetitorOf", fields: [competitorId], references: [id], onDelete: Cascade)

  @@unique([tenantCompanyId, competitorId])
  @@index([tenantCompanyId, status])
  @@schema("nogl")
}

enum TrackedCompetitorStatus {
  ACTIVE
  PAUSED
  ARCHIVED
  @@schema("nogl")
}
```

Update `Company` model to add the reverse relations:

```prisma
model Company {
  // ... existing fields ...
  trackedCompetitors TrackedCompetitor[] @relation("TenantCompetitors")
  trackedByTenants   TrackedCompetitor[] @relation("CompetitorOf")
}
```

Run:
```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

## Step 2 — Seed script

Create `scripts/seed-tracked-competitors.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CALUMET_COMPANY_ID = "cmnw4qqo10000ltccgauemneu";

const DEFAULT_COMPETITOR_SLUGS = [
  "foto-erhardt",
  "fotokoch",
  "foto-leistenschneider",
  "kamera-express",
  "teltec",
];

async function main() {
  // Find the competitor company IDs
  const competitors = await prisma.company.findMany({
    where: { slug: { in: DEFAULT_COMPETITOR_SLUGS } },
    select: { id: true, slug: true, name: true },
  });

  console.log(`Found ${competitors.length} competitor companies to track.`);

  // Upsert each as a tracked competitor of Calumet
  for (const [i, competitor] of competitors.entries()) {
    await prisma.trackedCompetitor.upsert({
      where: {
        tenantCompanyId_competitorId: {
          tenantCompanyId: CALUMET_COMPANY_ID,
          competitorId: competitor.id,
        },
      },
      create: {
        tenantCompanyId: CALUMET_COMPANY_ID,
        competitorId: competitor.id,
        priority: i,
        status: "ACTIVE",
      },
      update: { status: "ACTIVE" },
    });
    console.log(`  ✓ Tracking ${competitor.name}`);
  }
}

main().finally(() => prisma.$disconnect());
```

Add to `package.json`:
```json
"seed:tracked-competitors": "node --env-file=.env --import tsx scripts/seed-tracked-competitors.ts"
```

Run it:
```bash
npm run seed:tracked-competitors
```

## Step 3 — Server actions

Create `src/actions/trackedCompetitors.ts`:

```typescript
"use server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { TrackedCompetitorStatus } from "@prisma/client";

async function assertAuth() {
  const s = await getAuthSession();
  if (!s) throw new Error("Unauthorized");
  return s;
}

export async function listTrackedCompetitors(tenantCompanyId: string) {
  await assertAuth();
  return prisma.trackedCompetitor.findMany({
    where: { tenantCompanyId, status: { not: "ARCHIVED" } },
    include: {
      competitor: {
        select: {
          id: true, name: true, slug: true, domain: true, country: true, logoUrl: true,
          _count: { select: { products: true } },
        },
      },
    },
    orderBy: [{ status: "asc" }, { priority: "asc" }],
  });
}

export async function addTrackedCompetitor(input: {
  tenantCompanyId: string;
  competitorId: string;
  nickname?: string;
}) {
  const session = await assertAuth();
  const existing = await prisma.trackedCompetitor.findUnique({
    where: {
      tenantCompanyId_competitorId: {
        tenantCompanyId: input.tenantCompanyId,
        competitorId: input.competitorId,
      },
    },
  });
  if (existing && existing.status === "ACTIVE") {
    throw new Error("Already tracking this competitor");
  }
  const result = await prisma.trackedCompetitor.upsert({
    where: {
      tenantCompanyId_competitorId: {
        tenantCompanyId: input.tenantCompanyId,
        competitorId: input.competitorId,
      },
    },
    create: {
      tenantCompanyId: input.tenantCompanyId,
      competitorId: input.competitorId,
      nickname: input.nickname,
      addedByUserId: session.user.id,
      status: "ACTIVE",
    },
    update: {
      status: "ACTIVE",
      pausedAt: null,
      pauseReason: null,
      nickname: input.nickname,
    },
  });
  revalidatePath("/en/companies/competitor");
  return result;
}

export async function removeTrackedCompetitor(id: string) {
  await assertAuth();
  await prisma.trackedCompetitor.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
  revalidatePath("/en/companies/competitor");
}

export async function pauseTrackedCompetitor(id: string, reason?: string) {
  await assertAuth();
  await prisma.trackedCompetitor.update({
    where: { id },
    data: { status: "PAUSED", pausedAt: new Date(), pauseReason: reason },
  });
  revalidatePath("/en/companies/competitor");
}

export async function resumeTrackedCompetitor(id: string) {
  await assertAuth();
  await prisma.trackedCompetitor.update({
    where: { id },
    data: { status: "ACTIVE", pausedAt: null, pauseReason: null },
  });
  revalidatePath("/en/companies/competitor");
}

export async function reorderTrackedCompetitors(orderedIds: string[]) {
  await assertAuth();
  await Promise.all(
    orderedIds.map((id, priority) =>
      prisma.trackedCompetitor.update({ where: { id }, data: { priority } })
    )
  );
  revalidatePath("/en/companies/competitor");
}

// For the Add Competitor dropdown — returns companies NOT yet tracked by this tenant
export async function listAvailableCompetitors(tenantCompanyId: string, search?: string) {
  await assertAuth();
  const alreadyTracked = await prisma.trackedCompetitor.findMany({
    where: { tenantCompanyId, status: { not: "ARCHIVED" } },
    select: { competitorId: true },
  });
  const excluded = [...alreadyTracked.map((t) => t.competitorId), tenantCompanyId];

  return prisma.company.findMany({
    where: {
      id: { notIn: excluded },
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { domain: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    },
    select: { id: true, name: true, slug: true, domain: true, country: true, logoUrl: true },
    take: 20,
    orderBy: { name: "asc" },
  });
}
```

## Step 4 — Rebuild the competitor page

Edit `src/app/(site)/[lang]/(app)/companies/competitor/page.tsx` to render a real list + Add Competitor CTA.

The page needs:

1. **Header** — title "Tracked Competitors", description, "Add Competitor" primary button (right).
2. **Tab bar** — `All Tracked | Active | Paused | Archived` with counts.
3. **Table / card grid** of tracked competitors:
   - Logo / country flag, name, domain, slug.
   - Product count (from competitor's `_count.products`).
   - Status pill (Active / Paused / Archived).
   - Tracked since date.
   - Nickname (if set).
   - Row actions: View company, Pause, Resume, Rename, Remove, Drag-to-reorder.
4. **Empty state** — if no tracked competitors, large CTA to add.
5. **Drag-to-reorder** — use `@dnd-kit/sortable` (already installed). Moving a row updates `priority` via `reorderTrackedCompetitors()`.

Put the table in a Client Component `CompetitorListClient.tsx` that receives the initial list as a prop (server-fetched) and manages optimistic updates.

## Step 5 — "Add Competitor" dialog

Create `src/components/tracked-competitors/AddCompetitorDialog.tsx`:

Uses shadcn/ui `<Dialog>` + `<Command>` (combobox) pattern.

- Search field calls `listAvailableCompetitors(tenantCompanyId, search)` as user types (debounced 300ms).
- Results list shows: logo, name, domain, country flag, product count.
- Click a result → pre-fills the nickname with the company name → user can edit → "Track" button calls `addTrackedCompetitor()`.
- Should have an "add by URL/domain" fallback: if the domain doesn't match any known company, offer to create a new `Company` row first (basic validation: valid URL, fetch favicon, guess name from title). Keep this behind a "Company not found?" link; the primary path is picking an existing one.

## Step 6 — Acceptance criteria

- [ ] `npx prisma db push` creates the `TrackedCompetitor` table without data loss.
- [ ] `npm run seed:tracked-competitors` prints "Tracking Foto Erhardt / Fotokoch / Foto Leistenschneider / Kamera Express / Teltec" (5 rows).
- [ ] `/en/companies/competitor` now shows those 5 rows instead of "0 competitors tracked yet".
- [ ] Clicking "Pause" on a row moves it to Paused tab, greys out row, pause reason modal optional.
- [ ] Clicking "Add Competitor" opens dialog, typing "foto" shows no results (all matching ones already tracked), typing a new domain shows "No company matches — create new?".
- [ ] Drag-and-drop reorders rows, and the new order persists after refresh.
- [ ] Dark mode renders correctly (all colors via CSS vars).
- [ ] `npm run typecheck`, `npm run check-lint`, `npm run build` all pass.

## Step 7 — Out of scope (do NOT implement here)

- Bulk "track all from CSV" — add later if needed.
- Auto-discovery of competitors from scraped data — separate feature.
- Competitor groups/tags for repricing rule scoping — that's in the repricing prompt (01).
- Competitor comparison view — covered in the analytics compare page already.

## Step 8 — Branch + commits

```bash
git checkout -b feature/tracked-competitors
```

1. `feat(tracked-competitors): add Prisma model + migration`
2. `feat(tracked-competitors): add seed script for Calumet defaults`
3. `feat(tracked-competitors): add server actions`
4. `feat(tracked-competitors): build competitor page with tabs + table`
5. `feat(tracked-competitors): add "Add Competitor" dialog + reorder`

Open PR targeting `main` referencing this prompt file.

## Reference files in the repo

- Existing page: `src/app/(site)/[lang]/(app)/companies/competitor/page.tsx` (currently stub)
- Auth helper: `src/lib/auth.ts`
- Prisma client: `src/lib/prisma.ts`
- Pattern examples:
  - Server actions: `src/actions/forecast.ts`, `src/actions/replenishment.ts`
  - Client-with-server-action: `src/components/dashboard/*` tabs
- Icons: `@untitledui/icons` (Star01, Pause01, Plus, Building02, XClose)
- Drag-drop: `@dnd-kit/core` + `@dnd-kit/sortable` (already in `package.json`)
- Locked-in decisions: see `.claude/research/decisions-log.md` → "Tracked Competitors" section
