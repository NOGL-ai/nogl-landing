# Build the Events tab timeline UI on company detail pages

## Goal

The Events tab at `/en/companies/[slug]/events` currently shows "No events detected yet". Replace with a real chronological timeline displaying all `CompetitorEvent` rows for this competitor (prompt 14 produces the data).

## Reference material — READ FIRST

- `.claude/prompts/14-events-scrapers.md` — data source + event types + deduplication logic
- `.claude/research/decisions-log.md` → "Events tab" (events = promo/product/ad/newsletter, NOT price changes)
- Existing tab pattern: `src/components/companies/tabs/AssetsTab.tsx` is the shape to copy

## Timeline UI spec

### Header
- "Events" title + total count ("142 events in last 90 days")
- Date-range selector (default: last 90 days)
- Type filter chips (multi-select): Promos / New products / Discontinued / Ad creative / Newsletters / All
- "Export" dropdown (CSV, PDF)

### Vertical timeline layout

Left-column pattern: dates group events by day.

```
┌────────────────────────────────────────────────────────────┐
│  Apr 18, 2026                                               │
│                                                              │
│  14:32 ● PROMO LAUNCHED                                      │
│          "25% off all Sony bodies"                           │
│          via email "Spring Sale — don't miss out"           │
│          [View email]                                        │
│                                                              │
│  09:15 ● NEWSLETTER SENT                                     │
│          Subject: "New Canon R5 II arrivals"                 │
│          [View email]                                        │
│                                                              │
│  Apr 17, 2026                                                │
│                                                              │
│  16:47 ● AD CREATIVE CHANGED (Meta)                          │
│          New variant for "Winter clearance"                  │
│          [View ad in library]                                │
│                                                              │
│  10:02 ● PRODUCT LAUNCHED                                    │
│          Canon RF 200-800mm f/6.3-9 IS USM                   │
│          €3,499                                              │
│          [View product]                                      │
└────────────────────────────────────────────────────────────┘
```

### Type icons + colors

- **PROMO_LAUNCHED** — 🔥 red
- **PROMO_ENDED** — ⌛ gray
- **PRODUCT_LAUNCHED** — ✨ green
- **PRODUCT_DISCONTINUED** — 📦 gray
- **AD_CREATIVE_CHANGED** — 🎨 blue
- **NEWSLETTER_SENT** — 📧 purple

Icons from `@untitledui/icons` (no emoji in production UI — use semantic icon names).

### Event detail modal (on click)

Opens right drawer (shadcn/ui Sheet, 480px):
- Event type badge + occurredAt + detectedAt
- Title + description
- Source preview:
  - For PROMO/NEWSLETTER → email screenshot + full text
  - For PRODUCT_LAUNCHED → product card with image + price
  - For AD_CREATIVE_CHANGED → video/image embed
- Metadata JSON (pretty-printed, for power users)
- "Open source" button → deep-links to the MarketingAsset or Product detail page

### Empty state

When no events in selected range: big illustration + "No events in this period. Try expanding the date range or checking [sibling brand]."

## Server integration

Server-side fetch in the tab page:

```tsx
// src/app/(site)/[lang]/(app)/companies/[slug]/events/page.tsx
export default async function EventsPage({ params }) {
  const session = await getAuthSession();
  if (!session) redirect('/auth/signin');

  const company = await prisma.company.findUnique({ where: { slug: params.slug } });
  if (!company) notFound();

  return <EventsTabClient brandId={company.id} brandName={company.name} />;
}
```

Client-side fetch via `listCompetitorEvents` (from prompt 14). TanStack Query for caching + pagination.

## Real-time updates

Same SSE pattern as alerts/notifications. Subscribe to Redis channel `events:${tenantId}:${brandId}` — when a new event arrives, prepend to the timeline with a subtle "NEW" flash.

## Date grouping

Use `date-fns` `format(date, 'MMM d, yyyy')` for day headings. Group within a day by `occurredAt` time.

For "Yesterday" and "Today" use relative labels.

## Performance

- Fetch in pages of 50 events at a time
- Infinite scroll with `react-intersection-observer` — when user scrolls near bottom, fetch next page
- Cache previous page results with TanStack Query
- Cap total loaded events to 500 client-side; "Load older" button shows after that

## Acceptance criteria

- [ ] `/en/companies/calumet-de/events` shows timeline when events exist
- [ ] Empty state when no events in range
- [ ] Type filter chips work (single + multi-select)
- [ ] Date range picker updates results
- [ ] Click event → right drawer opens with detail + source preview
- [ ] Real-time: Prisma Studio → insert event → tab prepends within 2s
- [ ] Infinite scroll loads next 50 on near-bottom scroll
- [ ] Export CSV downloads all filtered events
- [ ] Dark mode, mobile, typecheck+lint+build pass

## Out of scope

- Cross-company event aggregation view (that's the Trends tab, prompt 02)
- Event "mute" / "subscribe to this event type" (that's notifications prefs)
- Comment threads on events
- Event-based forecast triggers

## Branch + commits

```bash
git checkout -b feature/events-timeline
```

1. `feat(events): replace stub events tab with timeline component`
2. `feat(events): date grouping + type filter chips`
3. `feat(events): right-drawer detail view per event type`
4. `feat(events): SSE subscribe for real-time prepend`
5. `feat(events): infinite scroll + CSV export`

## Reference files

- Data source: `.claude/prompts/14-events-scrapers.md`
- Existing events stub: `src/app/(site)/[lang]/(app)/companies/[slug]/events/page.tsx`
- Tab pattern: `src/components/companies/tabs/AssetsTab.tsx`
- Decisions: `.claude/research/decisions-log.md`
- Icons: `@untitledui/icons` (already installed)
- Testing: `.claude/prompts/_TESTING_AND_DATA_APPROACH.md`
