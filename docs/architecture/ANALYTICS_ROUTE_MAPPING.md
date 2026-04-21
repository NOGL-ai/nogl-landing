# Analytics Route Mapping

## Purpose

Ensure analytics navigation links always resolve to implemented pages and avoid blank states in the sidebar experience.

## Current Mapping

- `/en/analytics/compare` -> `CompareClient` page
- `/en/analytics/multi-company` -> `CompareClient` page (competitive compare entry point)
- Shared UI component: `src/app/(site)/[lang]/(app)/analytics/_components/ComparePageContent.tsx`

## Rationale

- Sidebar navigation includes a "Competitive Compare" item that points to `/en/analytics/multi-company`.
- A dedicated `multi-company` page keeps legacy/deep links stable and prevents empty or missing-content states.
- Both routes intentionally render the same comparison experience for now.

## Maintenance Rule

When adding a new analytics sidebar href, add or verify a matching page route in:

- `src/app/(site)/[lang]/(app)/analytics/**/page.tsx`

If a new nav link is intended as an alias of an existing feature, document that alias in this file.
