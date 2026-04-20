# 11 — Settings

_Implementer prompt. Run in a fresh session. Owner: founder. Ship target: 1 engineer-week for v1 (5 sections)._

> **Inputs to fold in:**
> - `.claude/research/settings-notifications-profile.md` (generic benchmark: Linear / Notion / Stripe / Vercel / GitHub / Slack)
> - `.claude/research/pricefy-features.md`, `.claude/research/pricefy-reverse-engineered.md` (Pricefy, our closest competitor)
> - 8 Pricefy HTML snapshots dated 2026-04-19 parsed directly (labels below are verbatim)
> - `.claude/research/decisions-log.md` (locked founder decisions)
> - `.claude/research/import-data-strategy.md` (CSV/Excel wizard — cross-ref with the future `10-cfo-import.md`)
> - `.claude/prompts/_TESTING_AND_DATA_APPROACH.md` (shared testing spec)
> - Existing stub: `src/app/(site)/[lang]/(app)/settings/page.tsx` (currently "coming soon")
> - `prisma/schema.prisma` — `User`, `Account`, `Session`, `ApiKey` models already exist; `UserRole = USER | EXPERT | ADMIN`

---

## 1. Goal

Ship a Settings area at `/en/settings/*` that lets a Calumet user manage their profile, their workspace (company identity + matching preferences), their teammates, their notification preferences, and their API credentials — modelled on Pricefy Settings UI because Pricefy is the incumbent in retail pricing intelligence and our target users already recognize that layout. Delete the "coming soon" stub.

## 2. Pricefy-derived section list (verbatim labels + our mapping)

Pricefy Settings left rail (group header -> item, in render order) from the 8 HTML saves:

```
Settings
  General
    My Store                      -> "My Store" heading, logo/favicon upload + store name + store URL
    Automatch                     -> radio group: "Title/Code | Only Title | Only Code"
    Users                         -> "Invite New User" CTA (list not shown in snapshot)
    Communication Preferences     -> table: Preference x E-mail channel toggles
    Product Feed                  -> (not captured as standalone — shares the /settings root view)
    API Key                       -> "Generate New API Key" + Postman collection link
    Widget                        -> "Pricefy Shield Tracking Code Installation" + script snippet + "Accept Shield Terms and Conditions"
    Migrations  [Beta badge]      -> card grid of competing products (Prisync, Price2Spy, Priceva, Omnia Retail, Mozenda, Sniffie/Pricen, PriceZag, LogiPrice, Boardfy, PriceMole, Skuuudle) each with Connect or Request migration
```

### Our mapping to nogl

| Pricefy label | nogl route | Keep? | Why |
|---|---|---|---|
| My Store | `/en/settings/workspace` | **Keep** (rename to "Workspace") | Company logo, name, URL, currency, timezone — needed for CFO reports |
| Automatch | `/en/settings/matching` | **Keep** (rename to "Product matching") | Cross-ref with prompt 17 `TrackedCompetitor` matcher; exposes the title/EAN/SKU dial |
| Users | `/en/settings/members` | **Keep** | Invite, role, remove |
| Communication Preferences | `/en/settings/notifications` | **Keep** | Per-category x channel matrix |
| Product Feed | `/en/settings/product-feed` | **Cut from v1, keep slot** | Overlaps with Import Data (prompt 10). Surface a **link out** to `/en/import` instead |
| API Key | `/en/settings/api-keys` | **v2 only** | No public API yet; ship empty-state-with-waitlist in v1 |
| Widget | `/en/settings/widget` | **CUT ENTIRELY** | Pricefy Widget injects a script tag into a merchant storefront for their "Shield" (MAP-monitoring) product. We are not an embeddable widget tool; Calumet storefront is not ours to instrument. Do not build. |
| Migrations | `/en/settings/migrations` | **Keep as empty/tease in v1** | Competitive wedge — "We can migrate you off Pricefy / Prisync / Price2Spy". Ship an empty card grid that says "Talk to sales"; actual connectors are post-v1 |
| — (new) | `/en/settings/profile` | **Add** | Pricefy has no explicit "Profile" tab (its user avatar menu handles it); we add one for parity with Linear/Stripe |
| — (new) | `/en/settings/security` | **Add** | Password / active sessions |
| — (new) | `/en/settings/billing` | **Add** | Stripe Customer Portal link |

## 3. Section-by-section specs

### 3.1 Profile — `/en/settings/profile`

| Field | Type | Default | Source |
|---|---|---|---|
| Avatar | image upload (PNG/JPG <= 2MB) | generated initials | `User.image` |
| Display name | text, required, 2-60 chars | existing `User.name` | `User.name` |
| Email | text, read-only in v1 (change-email flow deferred) | `User.email` | — |
| Timezone | select from IANA list | `Europe/Berlin` | new `UserPreference.timezone` |
| Locale | `en` or `de` | `en` | new `UserPreference.locale` |

- **Primary CTA:** `Save changes` (disabled until dirty).
- **Secondary:** `Cancel` (resets form). Avatar has separate `Upload` / `Remove` buttons.
- **Empty state:** not applicable — always populated from session.
- **Validation:** name 2-60 chars, image <= 2MB and PNG/JPG/WebP only.
- **Permission gate:** signed-in (any role).

### 3.2 Security — `/en/settings/security`

| Control | Behavior |
|---|---|
| Change password | `current password`, `new password` (>= 12 chars, 1 digit, 1 symbol), `confirm` |
| Active sessions | Table: device, IP, last active. Row action: `Sign out`. Header button: `Sign out all other sessions` |
| Two-factor auth | Disabled placeholder: "Coming soon — contact support if required" |

- **Primary CTA:** `Update password`. On success: toast + sign out all other sessions.
- **Empty state:** sessions table always has at least the current session (labelled `This device`).
- **Validation:** password complexity as above; current password must verify server-side.
- **Permission gate:** signed-in.

### 3.3 Workspace — `/en/settings/workspace` (Pricefy "My Store")

| Section heading | Fields (Pricefy verbatim where applicable) |
|---|---|
| **Store Visuals** | `Your Logo` (upload), `Your Favicon` (upload) |
| **Store Info** | `Store Name`, `Store Public URL` (with `https://` prefix), `Currency` (EUR default), `Time zone` (Europe/Berlin default), `Fiscal year start` (Jan 1 default) |

- **Primary CTA:** `Save Changes` (copy from Pricefy).
- **Empty state:** on first load, `Store Name` pre-filled to the tenant name, logo shows generated monogram.
- **Validation:** Store Name 2-80, URL optional but must be valid URL if set, currency ISO-4217, timezone IANA.
- **Permission gate:** `ADMIN` (read-only view for `USER` / `EXPERT`).

### 3.4 Product matching — `/en/settings/matching` (Pricefy "Automatch")

Radio group, single-select, Pricefy verbatim:

- `Title/Code` _(default, recommended label)_ — sends both product title and EAN/SKU to our matcher
- `Only Title`
- `Only Code`

Copy (Pricefy verbatim): _"Choose which product attributes are sent to the Automatch service. Using both Title and Code usually yields the best results."_

- **Primary CTA:** `Save Changes`.
- **Permission gate:** `ADMIN`. Feeds into prompt 17 (`TrackedCompetitor` matching pipeline) — store on `WorkspaceSetting.matchingMethod`.

### 3.5 Members — `/en/settings/members` (Pricefy "Users")

Page layout:

- Header right: button `Invite New User` (Pricefy verbatim).
- Empty state copy: _"Invite new users to this account — Click the button below to add users to this account"_ (Pricefy verbatim).
- Table columns: Name / Email / Role / Last active / Actions (Resend invite / Change role / Remove).

**Invite dialog:**
- Fields: `Email` (comma-separated allowed, each validated), `Role` (select: `USER`, `EXPERT`, `ADMIN` — plus `OWNER` once added).
- CTA: `Send invite`. Sends magic-link via existing NextAuth email provider; creates `User` with `emailVerified=null` + a `PendingInvite` row.

- **Permission gate:** read = signed-in; invite/role-change/remove = `ADMIN` or `OWNER`.

### 3.6 Notification preferences — `/en/settings/notifications` (Pricefy "Communication Preferences")

Matrix UI, rows x channels (Pricefy ships only E-mail; we add In-app):

| Preference (row) | In-app | E-mail |
|---|---|---|
| New features | toggle | toggle |
| Marketing Communications | toggle | toggle |
| **Reports** — _"Please disable each Report still active to stop receiving automatic email notifications"_ (Pricefy verbatim helper) | toggle | toggle |
| **Alerts** — same helper pattern | toggle | toggle |
| **Repricing** — same helper pattern | toggle | toggle |
| **MAP Notifications** — same helper pattern | toggle | toggle (v2 — hide in v1, we do not have MAP) |

- Per `decisions-log.md`, domain alerts (`/en/alerts`, `/en/fractional-cfo/alerts`) are **in-app only, real-time**. The E-mail column for `Alerts` / `Repricing` is disabled in v1 with tooltip "Email delivery ships in v2".
- **Primary CTA:** `Save Changes`.
- **Permission gate:** signed-in (always personal scope).
- **Storage:** JSON blob on new `UserPreference.notificationChannels`.

### 3.7 API keys — `/en/settings/api-keys` (v2 stub in v1)

Pricefy copy (verbatim): _"Manage your API Key like a password. Anyone who has your REST API key will be able to send notifications from your app. Do not expose the REST API key in your application code."_

v1 behavior:
- List existing keys from the `ApiKey` table (name, last 4 chars, created, last used).
- Button `Generate New API Key` opens a dialog: `Name` input -> shows the raw key **once** with copy button and a warning banner. After close, only the hash is kept.
- Row actions: `Rotate`, `Revoke` (soft-delete).
- If Calumet has no public-API endpoints yet (check with founder — Q1 below), disable `Generate` and show a "Request early access" link.
- **Permission gate:** `ADMIN` or `OWNER`.

### 3.8 Billing — `/en/settings/billing`

- Read-only card: `Plan: <plan>`, `Seats: X of Y used`, `Next invoice: <date> — EUR <amount>`.
- CTA: `Manage billing` -> server action generates Stripe Customer Portal link and redirects. **Do not build a custom billing UI.**
- `Cancel subscription` lives inside the Stripe portal.
- **Permission gate:** `OWNER` only (or `ADMIN` if OWNER role not yet added).

### 3.9 Migrations — `/en/settings/migrations` (keep as tease)

Pricefy ships a card grid of competing products with `Connect` or `Request migration` actions. We copy the **UX pattern** but with our angle:

- Header: `Migrate from another pricing tool` (badge: `Beta`, copy Pricefy verbatim).
- Card grid (one card per source): **Pricefy**, **Prisync**, **Price2Spy**, **Priceva**, **Omnia Retail**, **Boardfy**, **Sniffie / Pricen**.
- Every card in v1 has a single CTA: `Request migration` -> opens a dialog that captures `Current tool`, `Product count`, `Contact` and emails the founder.
- v2: swap cards to `Connect` where we have built actual importers.
- **Permission gate:** `ADMIN` or `OWNER`.

### 3.10 CUT — Widget

Do not build `/en/settings/widget`. Pricefy widget injects a script snippet into a merchant storefront to power their Shield (MAP violation detection) product. We are not an embeddable JS widget. If a Shield-equivalent is ever scoped, open a new prompt; until then, do not even stub the route. Reasoning is in section 2 above.

## 4. Prisma schema additions

Add to `prisma/schema.prisma` (nogl schema). **Do not duplicate existing `ApiKey`** — extend it instead.

```prisma
// Extend existing enum
enum UserRole {
  USER
  EXPERT
  ADMIN
  OWNER           // NEW — billing + workspace-delete authority; superset of ADMIN
  @@schema("nogl")
}

// NEW — personal preferences (1:1 with User)
model UserPreference {
  id                   String   @id @default(cuid())
  userId               String   @unique
  timezone             String   @default("Europe/Berlin")
  locale               String   @default("en")
  theme                String   @default("system")
  notificationChannels Json     @default("{}")
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@schema("nogl")
}

// NEW — workspace-level settings (1:1 with tenant / ForecastTenant)
model WorkspaceSetting {
  id               String   @id @default(cuid())
  companyId        String   @unique
  storeName        String
  storePublicUrl   String?
  logoUrl          String?
  faviconUrl       String?
  currency         String   @default("EUR")
  timezone         String   @default("Europe/Berlin")
  fiscalYearStart  String   @default("01-01")
  matchingMethod   String   @default("TITLE_AND_CODE")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  @@schema("nogl")
}

// EXTEND existing ApiKey (see schema line 85)
// Add: companyId (workspace-scoped), hashedKey, lastFour, lastUsedAt, revokedAt, scopes Json
// Keep userId for audit (who created it)

// NEW — pending invites
model PendingInvite {
  id         String   @id @default(cuid())
  companyId  String
  email      String
  role       UserRole
  token      String   @unique
  invitedBy  String
  expiresAt  DateTime
  acceptedAt DateTime?
  createdAt  DateTime @default(now())
  @@index([companyId])
  @@index([email])
  @@schema("nogl")
}

// NEW — migration request (from /settings/migrations cards)
model MigrationRequest {
  id            String   @id @default(cuid())
  companyId     String
  sourceTool    String
  productCount  Int?
  contactEmail  String
  contactPhone  String?
  notes         String?
  status        String   @default("REQUESTED")
  createdAt     DateTime @default(now())
  @@index([companyId])
  @@schema("nogl")
}
```

**Do NOT create a new `Workspace` or `Tenant` model** — the codebase already uses `ForecastTenant.companyId` as the workspace anchor. Route everything through `companyId`.

## 5. Server actions (per section)

File layout: `src/app/actions/settings/<section>.ts`.

- `profile.ts` — `getProfile()`, `updateProfile({ name, timezone, locale, imageUrl })`
- `security.ts` — `changePassword({ current, next })`, `listSessions()`, `revokeSession(id)`, `revokeAllOtherSessions()`
- `workspace.ts` — `getWorkspace()`, `updateWorkspace(input)` (ADMIN gate)
- `matching.ts` — `updateMatchingMethod(method)` (ADMIN gate)
- `members.ts` — `listMembers()`, `inviteMembers({ emails, role })`, `updateMemberRole(userId, role)`, `removeMember(userId)` (ADMIN gate on mutations)
- `notifications.ts` — `getNotificationPrefs()`, `updateNotificationPrefs(matrix)`
- `apiKeys.ts` — `listApiKeys()`, `createApiKey(name)` (returns raw once), `rotateApiKey(id)`, `revokeApiKey(id)` (ADMIN/OWNER gate)
- `billing.ts` — `getBillingSummary()`, `openCustomerPortal()` (OWNER gate; returns redirect URL)
- `migrations.ts` — `requestMigration({ sourceTool, productCount, contactEmail, notes })`

Every mutation: (1) `requireSession()`, (2) role check, (3) zod-validate input, (4) Prisma write, (5) `revalidatePath("/en/settings/...")`, (6) return `{ ok: true }` or `{ error }`.

## 6. UX — left-rail layout

Route-per-section (not modal). Deep-linkable. Matches Pricefy structure but groups like Linear.

```
src/app/(site)/[lang]/(app)/settings/
  layout.tsx                       <- left rail + content slot
  page.tsx                         <- redirects to ./profile
  profile/page.tsx
  security/page.tsx
  workspace/page.tsx               (ADMIN)
  matching/page.tsx                (ADMIN)
  members/page.tsx                 (ADMIN mutations)
  notifications/page.tsx
  api-keys/page.tsx                (ADMIN/OWNER, v2 tease in v1)
  billing/page.tsx                 (OWNER)
  migrations/page.tsx              (ADMIN/OWNER)
```

Left rail — two groups, Pricefy-style headers:

```
MY ACCOUNT
  Profile
  Security
  Notifications

WORKSPACE . Calumet Photographic
  General                (-> /workspace)
  Product matching       (-> /matching)
  Members
  API keys               [v2 badge]
  Billing
  Migrations             [Beta badge]
```

- Active state: left border accent + bold label.
- Admin-only items hidden from non-admins (not 403). Match Pricefy Beta badge on Migrations.
- Mobile (<768px): rail becomes a top `<Select>` — keep URL schema unchanged.

## 7. Multi-tenant scope rules

| Surface | Scope | Who writes |
|---|---|---|
| Profile, Security, Notifications | **Personal** (per user) | the user |
| Workspace (store info, currency, tz, fiscal year, matching method) | **Workspace** | ADMIN / OWNER |
| Members | **Workspace** | ADMIN / OWNER |
| API keys | **Workspace** (keyed by `companyId`, `userId` = creator for audit) | ADMIN / OWNER |
| Billing | **Workspace** | OWNER only |
| Migrations | **Workspace** | ADMIN / OWNER |

Personal timezone/locale overrides workspace defaults for that user own UI. Workspace currency is the single source of truth for all money in the app (CFO reports, repricing math). Calumet = the first `companyId`; no UI for switching workspaces in v1 (single-workspace-per-user — see `settings-notifications-profile.md` section 9 Q1).

## 8. "Migrations" section — what it actually is

Pricefy Migrations tab is a **competitive-moat feature**: it lets merchants move off rival pricing tools (Prisync, Price2Spy, Priceva, Omnia Retail, Mozenda, Sniffie/Pricen, PriceZag, LogiPrice, Boardfy, PriceMole, Skuuudle). Some cards have `Connect` (automated via the rival API); others have `Request migration` (their ops team does it by hand).

**Our equivalent:** `/settings/migrations` is **not** the same as `/en/import` (which handles CSV/Excel of Calumet own data — see `.claude/research/import-data-strategy.md` and the pending `10-cfo-import.md`). It is sales-assisted onboarding away from a competitor.

- v1: ship the card grid with `Request migration` only — no automation. Every click creates a `MigrationRequest` row and emails the founder.
- v2: add `Connect` to Pricefy + Prisync first (biggest competitors).
- Cross-link from `/en/import` onboarding wizard step 0 ("Already using another tool? Migrate instead -> /settings/migrations").

## 9. "Widget" section — decision: CUT

Pricefy Widget is the script snippet merchants paste into their storefront template (just before the closing body tag) to enable Pricefy Shield (MAP-violation detection on their own site). Verbatim copy: _"To enable Pricefy Shield protection on your store, add this tracking code to your website template."_

We are not an embeddable widget tool. Calumet storefront is out of scope — we sell them intelligence about competitors, not a script they inject into their own site. **Do not build `/en/settings/widget`.** If a MAP-violation product is ever scoped for Calumet, open a fresh prompt.

## 10. "Automatch" section — what it actually is

Pricefy Automatch is the dial for **their product-matching ML** — do we match competitor products on title, on EAN/SKU, or both. Verbatim copy: _"Using both Title and Code usually yields the best results."_

Cross-reference prompt 17 (`tracked-competitors.md`) — that prompt introduces the matcher; this setting is its configuration surface. Store as `WorkspaceSetting.matchingMethod` enum (`TITLE_AND_CODE` | `TITLE_ONLY` | `CODE_ONLY`) and the matcher reads it. Default `TITLE_AND_CODE`. Re-run matching as a background job when the user switches (show a toast: "Re-matching — this may take a few minutes").

## 11. MVP scope — ship 5, stub 3, cut 1

Pricefy ships 8 sections (My Store, Automatch, Users, Communication Preferences, Product Feed, API Key, Widget, Migrations). **We ship 5 real + 3 stubs + 1 cut for v1:**

**v1 real (build fully):**
1. Profile (personal)
2. Security (personal — password + sessions; 2FA deferred)
3. Workspace (ADMIN — Pricefy "My Store")
4. Members (ADMIN — Pricefy "Users")
5. Notifications (personal — Pricefy "Communication Preferences")

**v1 stubs (render shell + empty state + "coming soon"):**
6. Billing (OWNER — link-out to Stripe portal is a 2-line shell)
7. Migrations (ADMIN/OWNER — card grid with `Request migration` only; no Connect)
8. Product matching (ADMIN — single radio group; 15-min build, include in v1)

**Deferred:**
- API keys -> v2 (when public API exists)
- Product Feed tab -> redirects to `/en/import` (prompt 10)

**Cut permanently:**
- Widget (not applicable to our product)

Engineering estimate: **1 engineer-week** (5 real + 3 shells + rail + tests). Down from 2 in the generic research because matching is a radio and migrations is a card grid, not real logic.

## 12. Acceptance criteria

- [ ] `npx prisma db push` runs without errors after schema additions
- [ ] `/en/settings` 302-redirects to `/en/settings/profile`
- [ ] `/en/profile` 301-redirects to `/en/settings/profile`
- [ ] Left rail renders two groups (`MY ACCOUNT`, `WORKSPACE . Calumet Photographic`) with active-state on current route
- [ ] Non-admin users do not see `Workspace`, `Members`, `Migrations`, `Billing` rail items (hidden, not 403)
- [ ] Profile save round-trip persists name/timezone/locale and reflects in the top-bar user menu
- [ ] Security page shows >=1 session (current device labelled) and `Sign out all other sessions` revokes others
- [ ] Workspace save persists to `WorkspaceSetting` keyed by Calumet `companyId`
- [ ] Invite -> magic link email -> acceptance flow creates a `User` + marks `PendingInvite.acceptedAt`
- [ ] Notifications matrix persists across reloads (JSON blob round-trip intact)
- [ ] Migrations card `Request migration` creates a `MigrationRequest` row
- [ ] Dark mode renders correctly on every section
- [ ] Mobile (375px) — rail becomes `<Select>`, no horizontal scroll
- [ ] `npm run typecheck`, `npm run check-lint`, `npm run build` pass
- [ ] No hardcoded hex values; all color tokens via CSS variables (per CLAUDE.md)

## 13. Testing requirements

Follow `.claude/prompts/_TESTING_AND_DATA_APPROACH.md`. Feature-specific:

**Unit (`src/app/actions/settings/*.test.ts`):**
- `updateProfile` rejects name <2 or >60 chars
- `changePassword` rejects weak passwords, rejects wrong current
- `updateNotificationPrefs` preserves unspecified keys (no data loss on partial update)
- `inviteMembers` splits comma-separated emails and validates each
- `requireRole("ADMIN")` guard rejects `USER` / `EXPERT`

**Integration (`tests/integration/settings.integration.test.ts`):**
- Seed a Calumet workspace + 3 users (OWNER, ADMIN, USER). Verify each role sees the correct rail items.
- `updateWorkspace` as USER -> throws; as ADMIN -> persists.
- `createApiKey` returns a raw key the first time and never again.
- `PendingInvite` token expires after 7 days (`expiresAt` check).

**E2E (`tests/e2e/settings.e2e.spec.ts`):**
- Login -> `/en/settings` -> land on Profile -> change name -> reload -> still there.
- Navigate through every rail item, confirm no 404s.
- Admin invites a user with an email fixture; invite row appears in Members table with `Pending`.
- Non-admin does not see Workspace / Members rail items.

**Seed (`scripts/seed-settings-demo.ts`):** idempotent; creates 1 `WorkspaceSetting` for Calumet, 3 `UserPreference` rows, 2 `PendingInvite` rows, 1 revoked `ApiKey`. Flags: `--wipe`, `--real-only`.

## 14. Branch + commit sequence

Branch: `feat/settings-v1`.

Commits (small, reviewable):
1. `feat(db): add OWNER role, UserPreference, WorkspaceSetting, PendingInvite, MigrationRequest`
2. `feat(settings): layout shell with left rail + redirects`
3. `feat(settings): profile section + actions + tests`
4. `feat(settings): security section + sessions + password change`
5. `feat(settings): workspace section (ADMIN)`
6. `feat(settings): members section + invite flow`
7. `feat(settings): notifications matrix`
8. `feat(settings): product matching radio`
9. `feat(settings): billing stub -> Stripe Customer Portal`
10. `feat(settings): migrations card grid + MigrationRequest`
11. `feat(settings): e2e + seed script`
12. `chore(settings): remove coming-soon stub`

PR title: `feat: Settings v1 — profile, workspace, members, notifications, matching + billing/migrations stubs`.

## 15. Reference files

- Existing stub to delete: `src/app/(site)/[lang]/(app)/settings/page.tsx`
- Admin-variant to inspect for reuse: `src/app/(site)/[lang]/admin/account-settings/page.tsx`
- Pre-existing account settings: `src/app/(site)/[lang]/(app)/account/settings/page.tsx` (migrate contents into `/settings/profile` then delete)
- Prisma: `prisma/schema.prisma` (User@14, Account@45, Session@65, ApiKey@85, UserRole@639)
- Auth: NextAuth config (dev-bypass present — keep working)
- Research: `.claude/research/settings-notifications-profile.md`, `.claude/research/pricefy-features.md`, `.claude/research/pricefy-reverse-engineered.md`, `.claude/research/decisions-log.md`, `.claude/research/import-data-strategy.md`
- Cross-referenced prompts: `17-tracked-competitors.md` (matcher), `10-cfo-import.md` (Import Data, pending), `06-alerts-cmo-and-cfo.md` (notification categories)
- Testing spec: `.claude/prompts/_TESTING_AND_DATA_APPROACH.md`

## 16. Open questions (escalate before starting)

1. **Public API surface** — do we have any public REST endpoints today? If no, ship API keys as a pure tease in v1 (button disabled, waitlist CTA). If yes, which scopes (read-only products? repricing webhooks? full CRUD?).
2. **`OWNER` role migration** — existing users default to `USER`. For Calumet, should we manually promote `tuhin.mllk@gmail.com` (founder account) to `OWNER` in the migration, or introduce `OWNER` on the existing `ADMIN` seat?
3. **Email sending** — notification `E-mail` toggles are meaningful only if we have a transactional provider wired. Confirm: Resend? Postmark? SES? If none, ship the matrix but disable the E-mail column with tooltip "Connect an email provider to enable".
4. **Stripe Customer Portal** — is the Calumet tenant already a Stripe customer in live mode, or do we ship this stubbed to test mode in v1?
5. **Workspace deletion** — Pricefy does not expose it. Cut for v1 or add a danger zone under Workspace with `Delete workspace` (OWNER-only, typed-confirmation)?
6. **Avatar storage** — do we have a blob store configured (Vercel Blob? S3?), or do we store base64 in `User.image` for v1?
7. **MAP Notifications row** — Pricefy has this, we do not ship MAP in v1. Hide the row entirely (preferred), or show it disabled with "Requires Shield plan"?
8. **Fiscal year start** — CFO reports assume Jan 1. Is Calumet fiscal year actually calendar year, or different (Apr 1? Jul 1?)?

_End of prompt._
