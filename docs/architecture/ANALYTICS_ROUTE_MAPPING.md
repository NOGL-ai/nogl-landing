# Analytics Route Mapping

## Purpose

Ensure analytics navigation links always resolve to implemented pages and avoid blank states in the sidebar experience.

## Current Mapping

- `/en/analytics/compare` -> **Two-company snapshot**: `TwoCompanyCompareClient` (`src/components/analytics/compare/TwoCompanyCompareClient.tsx`), wrapped by `compare/page.tsx`.
- `/en/analytics/multi-company` -> **Full competitive analysis**: `CompareClient` via `ComparePageContent` (`src/app/(site)/[lang]/(app)/analytics/_components/ComparePageContent.tsx`).
- `/en/analytics/product-matrix` -> **Product Matrix**: `ProductMatrixClient` (`src/components/analytics/product-matrix/ProductMatrixClient.tsx`) + API `GET /api/analytics/product-matrix` (aggregated pivot cells; URL-synced filters; localStorage presets).

## Rationale

- **Compare** is a focused “A vs B” metrics view using the same summary API; **Competitive Compare** is the full multi-company workspace (tables, charts, filters).
- A dedicated `multi-company` page keeps legacy/deep links stable.

## Maintenance Rule

When adding a new analytics sidebar href, add or verify a matching page route in:

- `src/app/(site)/[lang]/(app)/analytics/**/page.tsx`

If a new nav link is intended as an alias of an existing feature, document that alias in this file.
