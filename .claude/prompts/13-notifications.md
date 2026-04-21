# Build /en/notifications — cross-cutting inbox (do NOT merge with /en/alerts)

## Goal

Replace `/en/notifications` stub with a lightweight inbox for app-wide events NOT covered by the domain alert pages (`/en/alerts` for CMO, `/en/fractional-cfo/alerts` for CFO).

`/en/notifications` handles:
- @-mentions in comments
- Workspace invites (accepted/declined)
- Billing events (payment failed, invoice ready, card expiring)
- System announcements
- Share-invites (someone shared a dashboard with you)
- Export-ready downloads (PDF/CSV ready)

`/en/alerts` + `/en/fractional-cfo/alerts` continue to handle their respective **domain** alerts (price drops, stockouts, new products, etc.). **Do not merge these.** Different mental models, different subscription rules, different detail UIs.

## Reference material — READ FIRST

`.claude/research/settings-notifications-profile.md` — 10-tool pattern comparison + the decision to ship Option C-lite (lightweight inbox + prefs page in settings).

## Prisma additions

```prisma
enum NotificationType {
  MENTION
  INVITE_ACCEPTED
  INVITE_DECLINED
  BILLING_PAYMENT_FAILED
  BILLING_INVOICE_READY
  BILLING_CARD_EXPIRING
  SYSTEM_ANNOUNCEMENT
  SHARE_INVITE
  EXPORT_READY

  @@schema("nogl")
}

enum NotificationStatus {
  UNREAD
  READ
  ARCHIVED

  @@schema("nogl")
}

model Notification {
  id             String               @id @default(cuid())
  recipientId    String               // User.id
  tenantId       String?              // Company.id (null for user-level notifications)
  type           NotificationType
  status         NotificationStatus   @default(UNREAD)
  title          String
  description    String?              @db.Text
  actionUrl      String?              // where clicking the notification takes you
  actorId        String?              // User who triggered this (for mentions, invites)
  metadata       Json?                // type-specific payload
  createdAt      DateTime             @default(now())
  readAt         DateTime?

  recipient      User                 @relation(fields: [recipientId], references: [id], onDelete: Cascade)
  tenant         Company?             @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([recipientId, status, createdAt])
  @@index([tenantId, type, createdAt])
  @@schema("nogl")
}
```

## Server actions

`src/actions/notifications.ts`:

```typescript
export async function listNotifications(params: {
  status?: NotificationStatus;
  types?: NotificationType[];
  page?: number;
  pageSize?: number;
}): Promise<{ items: Notification[]; total: number; unreadCount: number }>;

export async function markRead(id: string): Promise<void>;
export async function markAllRead(): Promise<{ count: number }>;
export async function archive(id: string): Promise<void>;
export async function getUnreadCount(): Promise<number>;

// Emitter — called by any backend code to create notifications
export async function createNotification(input: CreateNotificationInput): Promise<Notification>;
```

## UI — `/en/notifications`

### Layout
- Page header: "Notifications" + unread count pill + "Mark all read" button
- Tabs: **All** | **Mentions** | **System** | **Archive**
- Empty state: "You're all caught up." (Linear-inspired)

### Row list
Each notification row:
- Icon (type-specific: @ for mention, 💳 for billing, 🎯 for export-ready, 👥 for invite)
- Actor avatar (if present)
- Title + snippet of description
- Relative timestamp ("2 hours ago", using `date-fns` `formatDistanceToNow`)
- Unread badge (blue dot) if `status === UNREAD`
- Click → navigates to `actionUrl` AND marks read
- Hover → "Archive" button appears on the right

### Top-bar bell icon (app-wide)

Component `<NotificationsBell />` in the main `DashboardTopBar` / header:
- Shows unread count badge
- Click → opens a popover with last 10 notifications
- "See all notifications" link at bottom → `/en/notifications`
- Uses TanStack Query with auto-refresh every 60s (or subscribe to SSE — see §Real-time below)

**Important:** the bell's unread count includes notifications from `/en/notifications`, `/en/alerts`, AND `/en/fractional-cfo/alerts` — aggregate across sources. Users see ONE bell, can dive into any stream via the popover.

## Real-time delivery

Same SSE pattern as prompt 06 alerts:

- `/api/notifications/stream/route.ts` — SSE route
- Client subscribes with `EventSource`
- Server pushes via Redis pub/sub (channel: `notifications:${userId}`)
- Writer side: `createNotification()` helper publishes to Redis after creating the DB row

## Preferences (separate surface, cross-ref prompt 11)

Preferences live at `/en/settings/notifications` (NOT here). That page controls:
- Per-type toggles: which event types to create notifications for at all
- Per-channel toggles: in-app only (v1) vs in-app + email (v2)

**Enforcement:** before `createNotification()` writes the row, check `userNotificationPrefs[type].enabled`. If false, no row is created → no inbox entry, no email.

## Event emitters (integration points — don't build here, just hook up)

These existing features should emit notifications when relevant:

- Repricing (prompt 01) — when a rule applies AND delta > 5%, emit `MENTION`-style notification to the rule creator: "Your rule 'Match Foto Erhardt' applied 29 price changes"
- Import wizard (prompt 10) — when an import completes, emit `EXPORT_READY` (repurpose): "Your sales-history import is ready"
- Members/invites (prompt 11) — when invitee accepts, emit `INVITE_ACCEPTED` to the inviter
- Billing webhooks (Stripe) — when webhook fires, emit `BILLING_*` to the workspace OWNER
- Dashboard share (prompt 04) — when operator shares, emit `SHARE_INVITE` to recipient

Each integration is a 2-line code addition. Budget ~1 hour to hook up all 5 emitters.

## Acceptance criteria

- [ ] `prisma db push` creates Notification model + 2 enums
- [ ] `/en/notifications` loads with 4 tabs (All / Mentions / System / Archive)
- [ ] Unread count matches actual DB state
- [ ] Click row → navigates + marks read
- [ ] "Mark all read" toggles all UNREAD → READ
- [ ] Archive moves to Archive tab
- [ ] `<NotificationsBell />` in top bar shows aggregate unread count (notifications + alerts + CFO alerts)
- [ ] SSE: open 2 tabs → `createNotification()` in Prisma Studio → both tabs receive within 2s
- [ ] Seed script creates 15 notifications across types for demo
- [ ] Dark mode, mobile, typecheck+lint+build pass

## Out of scope

- Email delivery of notifications (v2 — requires existing transactional email infra)
- Slack / MS Teams channels (v2)
- Notification digest (daily/weekly summary)
- Do Not Disturb / Working Hours rules (v2)

## Branch + commits

```bash
git checkout -b feature/notifications-inbox
```

1. `feat(notifications): Prisma schema + server actions`
2. `feat(notifications): SSE stream + createNotification helper`
3. `feat(notifications): inbox page UI with 4 tabs`
4. `feat(notifications): top-bar bell component with aggregate count`
5. `feat(notifications): hook emitters into repricing/import/invites/billing/share`
6. `feat(notifications): seed script with 15 demo notifications`

## Reference files

- Research: `.claude/research/settings-notifications-profile.md`
- Alerts SSE reference pattern: `.claude/prompts/06-alerts-cmo-and-cfo.md`
- Settings prefs cross-ref: `.claude/prompts/11-settings.md` §3
- Redis: `src/lib/redis.ts`
- Testing: `.claude/prompts/_TESTING_AND_DATA_APPROACH.md`
