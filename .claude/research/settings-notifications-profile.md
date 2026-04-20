# Settings, Notifications & Profile — B2B SaaS Pattern Research

_Compiled by background research agent. Benchmarked against Linear / Notion / Stripe / Vercel / Intercom / Shopify / GitHub / Slack / HubSpot / Retool._

---

## Executive summary

- **Settings:** Ship a single left-rail layout at `/en/settings` with **6 sections for v1**: Profile, Account Security, Workspace, Members, Billing, Notifications. Everything else (API keys, integrations, audit log, SSO, webhooks, custom domains) is **stub-on-demand** — don't render empty tabs.
- **Notifications:** Option C-lite — lightweight inbox at `/en/notifications` (app-wide mentions, system announcements, billing warnings, share-invites) plus a preferences pane inside `/en/settings/notifications`. **Keep the existing CMO `/en/alerts` and CFO `/en/fractional-cfo/alerts` as domain inboxes.** Do NOT consolidate.
- **Profile:** `/en/profile` should not be a standalone route — **301 redirect to `/en/settings/profile`**. Reserve the URL in case a public teammate-profile view is needed later.
- **Critical decision to make before v1:** nogl is multi-tenant. Current role enum is `USER | EXPERT | ADMIN`. **Add `OWNER`** before v1 for billing safety.

---

## 1. Settings — reference product matrix

| Product | Nav style | Personal scope | Workspace scope | Notable |
|---|---|---|---|---|
| **Linear** | Left rail, two groups: My account + Workspace | Profile, Preferences, Notifications, API keys, Security | Members, Teams, Billing, Integrations, Import/Export, SLA, SAML | Modal overlay, keyboard-first (G then S) |
| **Notion** | Modal, left rail | Account, My notifications, My connections, Language & region | People, Teamspaces, Upgrade, Sites, Security & identity, Identity & provisioning, Connections, Import, Audit log | Explicit "My …" prefix for personal |
| **Stripe Dashboard** | Top gear → list | Profile, Communication prefs, Security (2FA, devices) | Business details, Branding, Tax, Custom domains, Team, Invoices, Billing, Webhooks, API keys, Connected apps, Events, Emails, Customer portal, Radar, Compliance | ~40 sub-pages; only ~6 used daily |
| **Vercel** | Top tabs per scope (`/account`, `/[team]/settings`) | Account, Billing, Tokens, Security, Integrations, Login Connections, Notifications | General, Members, Billing, Domains, Env vars, Integrations, SSO, Audit Log, Usage | Scope-switch via URL |
| **Intercom** | Left rail (deep) | My details, My notifications, Keyboard shortcuts | People, Channels, Data, Apps & integrations, Operator, Privacy, Security, Billing, Settings | 100+ sub-pages — warning sign |
| **Retool** | Left rail | Account settings, API tokens | Users, Groups, Permissions, Spaces, Environments, SSO, Audit log, Billing, Branding, Webhooks | Heavy on permissions — dev tool |
| **Shopify admin** | Modal off main nav | (separate `/account`) | Store details, Plan, Billing, Users and permissions, Payments, Shipping, Taxes, Locations, Markets, Policies, Domains, Notifications, Files, Brand, Languages, Metafields, Apps, Checkout, Customer accounts | 20+ sections — retail ops |
| **GitHub** | Left rail | Profile, Account, Appearance, Accessibility, Notifications, Billing, Emails, Password & auth, SSH/GPG keys, Organizations, Enterprises, Moderation, Code review, Repositories, Packages, Copilot, Pages, Saved replies, Security log, Sponsorship log, Applications, Scheduled reminders, Active sessions, Integrations, Developer settings | Org settings at `/organizations/<org>/settings` | Personal-dominant |
| **Slack** | Two entry points: Preferences (personal) + Settings & admin (workspace) | Notifications, Sidebar, Themes, Messages & media, Language, Accessibility, Mark as read, Audio & video, Advanced | Workspace settings, Permissions, Authentication, Customize, Integrations, Analytics, Emoji, Slackbot, Billing, Retention | Strong personal/workspace split |
| **HubSpot** | Left rail with accordion groups | General, Notifications, Calling, Calendar, Email, Security | Account defaults, Users & teams, Integrations, Data management, Marketing, Sales, Service, Website, AI, Automation, Reporting | Too many — power-user oriented |

### Patterns that matter

1. Every product except HubSpot and Intercom separates Personal and Workspace visually. Even Stripe groups "Personal" vs "Business."
2. **Left rail beats top tabs once you pass ~6 sections.** We will by v2.
3. **Modal vs route:** Linear/Notion use modals; Stripe/Vercel/GitHub use routes. **Routes win for us** — deep-linkable, bookmarkable, testable with Playwright.
4. Stub-empty pages are the #1 B2B SaaS anti-pattern.

### Proposed ship order

| Priority | Section | Scope | Why |
|---|---|---|---|
| **v1** | Profile | Personal | Every tool ships it. Name/avatar/email/tz/locale. |
| **v1** | Account Security | Personal | Password change, sign-out-other-sessions. 2FA v1.5. |
| **v1** | Workspace | Workspace (ADMIN) | Company name, logo, currency (EUR), tz (Europe/Berlin), fiscal year. Needed for CFO reports. |
| **v1** | Members | Workspace (ADMIN) | Invite, role dropdown, remove. |
| **v1** | Billing | Workspace (ADMIN) | Plan, seats, Stripe Customer Portal link. |
| **v1** | Notifications | Personal | Channel × event-type toggles. Pairs with inbox. |
| v2 | API keys | Workspace (ADMIN) | Only if a public API or webhook auth emerges. |
| v2 | Integrations | Workspace (ADMIN) | Shopify, BigCommerce, Google Merchant Center. |
| v2 | Data sources | Workspace (ADMIN) | Competitor URLs, scrape schedules. Promote from trend-scraper internals when >5. |
| v3 | SSO / SAML | Workspace (ADMIN) | Only when a prospect demands it. |
| v3 | Audit log | Workspace (ADMIN) | Enterprise checklist. |
| v3 | Webhooks | Workspace (ADMIN) | Defer until integrations ecosystem exists. |
| **Never v1** | Custom domain, Email templates, Branding, Import/Export | Workspace | Over-build. |

---

## 2. Notifications — interpretation review

| Product | Inbox | Preferences | Prefs location |
|---|---|---|---|
| Linear | Yes (`/inbox`) | Yes | Settings → My account → Notifications |
| GitHub | Yes (`/notifications`) | Yes | Settings → Notifications (granular) |
| Slack | Activity tab + per-channel | Yes | Preferences → Notifications |
| Jira | Bell dropdown | Yes | Personal settings → Notifications |
| Notion | Yes (Inbox tab) | Yes | Settings → My notifications |
| Asana | Yes (Inbox primary surface) | Yes | Profile settings → Notifications |
| Stripe | No inbox | Preferences only | Settings → Communication preferences |

**Pattern:** Every collaboration-heavy tool has both inbox and preferences. Only transaction-processing tools (Stripe) skip the inbox. **nogl is closer to Linear/Notion.**

### Interaction with existing Alerts

- `/en/alerts` (CMO) and `/en/fractional-cfo/alerts` (CFO) are **domain inboxes** with their own metadata, ack workflow, subscription rules. Keep them.
- `/en/notifications` is the **cross-cutting inbox** — @-mentions, workspace invites, billing warnings, export-ready downloads, system announcements, shared-report invites.
- **Do not merge.** Merging destroys the CFO-only mental model.
- **Cross-surface signal:** one bell icon in the top bar with unified unread count across all three sources; click routes to `/en/notifications`; pills inside pivot to CMO/CFO streams.

### Recommendation

`/en/notifications` with tabs **All / Mentions / System** + link-outs to CMO and CFO alerts. `/en/settings/notifications` controls delivery channels (in-app, email; Slack in v2) per category and links down to CMO/CFO subscription pages. Don't unify the subscription model — let each domain own its own rules.

---

## 3. Profile — standalone vs settings tab

- **Public-profile tools** (GitHub, Linear, Notion): profile has a public face plus private edit in settings.
- **Private-app tools** (Stripe, Vercel, Retool, HubSpot, Shopify admin): no public profile. "Edit my profile" is a tab inside Settings.

**nogl is private-app.** No external profile page, no hovercards, no teammate directory. A standalone `/en/profile` would be a stub.

**Recommendation:** `/en/profile` → 301 to `/en/settings/profile`. Reserve the URL. Revisit if/when public teammate profiles become a product need (unlikely before year 2).

**Minimal field set for v1:** displayName, avatar, email (read-only unless change-flow exists), password change, timezone, locale (en/de). Defer bio, pronouns, presence, activity feed. Presence is especially a trap — implies realtime infra we don't have.

---

## 4. Proposed information architecture

```
/en/settings                     -> redirects to /en/settings/profile
  /en/settings/profile           [v1] personal: name, avatar, email, tz, locale
  /en/settings/security          [v1] personal: password, sessions, 2FA (v1.5)
  /en/settings/notifications     [v1] personal: delivery channels × event types
  /en/settings/workspace         [v1, ADMIN] company name, logo, currency, fiscal year
  /en/settings/members           [v1, ADMIN] invite, role, remove
  /en/settings/billing           [v1, ADMIN] plan, seats, Stripe portal link
  /en/settings/integrations      [v2, ADMIN]
  /en/settings/data-sources      [v2, ADMIN]
  /en/settings/api-keys          [v2, ADMIN]
  /en/settings/sso               [v3, ADMIN]
  /en/settings/audit-log         [v3, ADMIN]
  /en/settings/webhooks          [v3, ADMIN]

/en/notifications                [v1] ?tab=all|mentions|system
/en/profile                      -> 301 to /en/settings/profile
/en/alerts                       (unchanged) CMO-domain inbox
/en/fractional-cfo/alerts        (unchanged) CFO-domain inbox
```

**Rules:**
- Route-per-section, not modal — deep-linkable, testable, onboarding emails can point `?tab=billing`.
- No scope picker in the URL (unlike Vercel's `/[team]/settings`). Single-workspace-per-user for v1.
- Admin-only pages return 404 (not 403) to non-admins — don't leak their existence.

---

## 5. Cross-tool pattern comparison

Legend: Y = ships, P = partial / enterprise-only, N = absent

| Module | Linear | Notion | Stripe | Vercel | Intercom | Shopify | GitHub | Slack |
|---|---|---|---|---|---|---|---|---|
| Profile (name/avatar) | Y | Y | Y | Y | Y | Y | Y | Y |
| Password & 2FA | Y | Y | Y | Y | Y | Y | Y | Y |
| Active sessions | Y | Y | Y | Y | Y | Y | Y | Y |
| Personal notifications | Y | Y | Y | Y | Y | Y | Y | Y |
| Theme / appearance | Y | Y | N | Y | N | N | Y | Y |
| Locale / timezone | Y | Y | P | P | Y | Y | N | Y |
| Workspace general | Y | Y | Y | Y | Y | Y | Y | Y |
| Members / invites | Y | Y | Y | Y | Y | Y | Y | Y |
| Roles / permissions | Y | Y | P | Y | Y | Y | Y | Y |
| Billing / plan | Y | Y | Y | Y | Y | Y | Y | Y |
| API keys / tokens | Y | Y | Y | Y | Y | Y | Y | Y |
| Webhooks | N | N | Y | N | Y | Y | Y | Y |
| Integrations directory | Y | Y | Y | Y | Y | Y | Y | Y |
| SSO (SAML/OIDC) | P | P | P | P | P | P | P | P |
| Audit log | P | P | Y | P | P | Y | P | P |
| Custom domain | P | Y | Y | Y | Y | Y | Y | N |
| Data export / import | Y | Y | Y | N | Y | Y | Y | Y |
| Cross-cutting inbox | Y | Y | N | N | P | P | Y | P |

**Nine modules everyone ships = hard floor:** Profile, Password/2FA, Sessions, Personal notifications, Workspace general, Members, Billing, API keys, Integrations.

---

## 6. Multi-tenant specifics

Current schema uses `UserRole = USER | EXPERT | ADMIN`. UI should reason in terms of **scopes**, not roles.

**Scope decision rule:**
- Affects only the signed-in user's own session → **Personal**.
- Affects data visible to other workspace members → **Workspace**.
- Changes billing or costs money → **Workspace, ADMIN-only**.
- Cross-tenant (support impersonation) → belongs under `/en/admin/*`, not `/en/settings`.

**Edge cases:**
- **Timezone/locale** — personal per-user; workspace default locale for invitees.
- **Currency** — workspace (all users see the same margin numbers).
- **API keys** — start workspace-only for simplicity.
- **Integrations** — always workspace.

**Visual treatment:** left rail split into two groups: *My account* and *Workspace · Calumet Photographic* (labelled by workspace name).

---

## 7. Admin-only sections (role gate)

| Section | Minimum role | Check | UI on denial |
|---|---|---|---|
| `/settings/profile` | signed-in | session | — |
| `/settings/security` | signed-in | session | — |
| `/settings/notifications` | signed-in | session | — |
| `/settings/workspace` | ADMIN | `requireRole("ADMIN")` | 404 |
| `/settings/members` (read) | signed-in | session | read-only |
| `/settings/members` (mutate) | ADMIN | server action guard | button hidden |
| `/settings/billing` | ADMIN | server action guard | 404 |
| `/settings/integrations` | ADMIN | server action guard | 404 |

**Two hard rules:**
1. All mutations check role server-side. Never trust a UI toggle.
2. Render nav items conditionally — hidden rail item beats an access-denied stub.

**Recommendation:** **Add `OWNER` role before v1.** The workspace creator, holds billing, can delete/transfer workspace. `OWNER` is a superset of `ADMIN`. Matches Vercel/Slack/GitHub and enterprise purchasing.

---

## 8. MVP scope — week-1 shipping target

1. `/en/settings` layout: left rail, active-state, "My account" / "Workspace · Calumet Photographic" grouping.
2. `/en/settings/profile` — name, avatar upload, email (display + resend-verification), timezone, locale (en/de). One server action `updateProfile`.
3. `/en/settings/security` — password change, "sign out all other sessions." 2FA slot reserved.
4. `/en/settings/notifications` — event type × channel (in-app, email). Four event types: @-mention, Workspace invite, Billing event, Export ready. JSON blob on User.
5. `/en/settings/workspace` — company name, logo upload, currency (EUR default), timezone (Europe/Berlin default), fiscal year start. ADMIN only.
6. `/en/settings/members` — name/email/role/lastActiveAt; invite by email; role dropdown for ADMINs; remove confirm dialog.
7. `/en/settings/billing` — plan name, seat count, "Manage billing" button → Stripe Customer Portal. Do NOT build custom billing UI.
8. `/en/notifications` inbox — icon, actor, timestamp, action link, read/unread toggle; filter pills (All / Mentions / System). Empty state "You're all caught up."
9. `/en/profile` → 301 to `/en/settings/profile`.

**Explicitly defer:** API keys, integrations UI, audit log, SSO, webhooks, custom domain, email templates, data export.

**Engineering estimate:** ~2 engineer-weeks for the eight surfaces above + 1 week for i18n and QA.

---

## 9. Open questions for the founder

1. **Tenant shape.** Can a user be in >1 workspace? If yes → workspace switcher + `/w/<slug>/settings` URLs.
2. **Seat pricing vs flat.** Does billing scale with member count? If yes, Members page shows "+EUR X/seat" preview on invite.
3. **SSO on the 12-month roadmap?** Any enterprise deal asking for SAML?
4. **Audit log — legal or checklist?** Contractual (SOC 2, GDPR Art. 30)?
5. **Notification channels.** Email only for v1, or Slack / MS Teams from day one?
6. **@-mention surface.** Where do users @-mention today? Nowhere yet → inbox has 3 event types and doesn't need tabs.
7. **OWNER role.** Add a 4th role now or defer?
8. **User-facing data export.** GDPR right-to-portability: per-user or workspace-only?
9. **Language.** Bilingual at launch or en-only first?
10. **Impersonation for support.** Will nogl staff need to "log in as" a Calumet user?

## Sources

- [Linear settings](https://linear.app/docs/settings), [Linear inbox](https://linear.app/docs/inbox)
- [Notion account settings](https://www.notion.so/help/account-settings), [Notion notifications](https://www.notion.so/help/notifications)
- [Stripe account](https://docs.stripe.com/get-started/account/activate), [Stripe emails](https://docs.stripe.com/get-started/account/emails)
- [Vercel accounts & teams](https://vercel.com/docs/accounts)
- [Intercom navigation](https://www.intercom.com/help/en/articles/135-navigating-intercom)
- [Retool org admin](https://docs.retool.com/org-users)
- [Shopify admin settings](https://help.shopify.com/en/manual/your-account/account-settings)
- [GitHub personal settings](https://github.com/settings/profile), [GitHub notifications](https://github.com/notifications)
- [Slack preferences](https://slack.com/help/articles/213185467-Manage-your-account-settings)
- [HubSpot settings nav](https://knowledge.hubspot.com/account/navigate-your-settings)
- [Asana Inbox](https://asana.com/guide/help/fundamentals/inbox)
- [Jira notifications](https://support.atlassian.com/jira-software-cloud/docs/manage-notifications-for-jira-cloud/)
