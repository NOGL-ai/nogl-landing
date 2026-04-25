# Pricefy Dashboard — Reverse-Engineered Reference

Source: saved HTML of the Pricefy dashboard at
- `/repricing/rules` (Dynamic Pricing Rule form)
- `/repricing/preview/9849` (Repricing Preview)
- `/repricing/history` (Repricing History)

This document is the ground-truth reference for the NOGL repricing engine build. We replicate the *information architecture* and *behavior*, **not** the visual chrome — all styling comes from our Untitled-UI-based design system (`bg-brand`, `text-primary`, `border-primary`, etc.).

---

## Page 1 — Dynamic Pricing Rule

**Route:** `/repricing/rules` (edit) — a single long form, not a stepped wizard.

**Sections (top → bottom):**

| Section | Fields | Notes |
|---|---|---|
| Header | Rule name (text), Last Run (display) | Header stays fixed while scrolling |
| Repricing Action | One strategy line: *"Reprice 1 cent below my cheapest competitor"* | Composable: `{direction} {amount}{unit} {operator} my {reference}` where direction ∈ `match \| above \| below`, reference ∈ `cheapest \| average \| highest \| specific` |
| Products | "All Products" / custom selector | All-or-custom toggle |
| Competitors | "All Competitors" / custom selector | Multi-select, filter by enabled |
| Method | "Manual" / "Autopilot" | Autopilot gated behind a premium/upgrade CTA |
| Save CTAs | `Save`, `Save & Preview` | Second one redirects to Preview page for this rule |

**Implicit guardrails** (not on this page — they live on an adjacent *Min/Max* tab):
- absolute min, absolute max, margin%-of-cost, max-discount-%.

---

## Page 2 — Repricing Preview

**Route:** `/repricing/preview/{ruleId}`

**Header:**
- Title: "Repricing Preview"
- Stats: `{N} products analyzed` · `{M} products skipped`
- Controls: Filters `(N active)`, `Launch all rules preview` CTA, status banner ("Preview successfully completed.")

**Table — 11 columns in order:**

1. **Product Name** (SKU + product title) — primary identifier, clickable to product page.
2. **Triggered Rule** — name of the rule whose predicate matched.
3. **Price** — current list price.
4. **Cost** — COGS.
5. **Markup** — absolute margin `price - cost`.
6. **New Price** — calculated target, or `—` when skipped.
7. **Min / Max Price** — guardrail bounds, two stacked values.
8. **Competitor Prices** — Cheapest / Highest / Avg (three inline badges).
9. **Status** — badge: `Will apply` (green) · `Skipped` (gray) · `Blocked` (amber) · `No change` (neutral).
10. **Executed At** — relative time ("10 seconds ago").
11. **Actions** — Approve · Reject · Override (row-level).

**Above the table:**
- Filters drawer (status, triggered rule, guardrail-blocked only).
- Bulk selection + bulk Approve / Reject.
- Column visibility toggle.
- Pagination (default 10 rows).

**Row patterns:**
- `Skipped` rows: muted foreground, no price in New Price.
- `Blocked` rows: amber left border, tooltip on the Status badge explaining which guardrail fired.
- `Will apply` rows: delta chip (`+1.20€ / +0.8%`) next to New Price.

**Apply flow:** Bulk Apply CTA → confirm modal summarising count + $ impact → writes a `RepricingJob` with status `APPLIED`.

---

## Page 3 — Repricing History

**Route:** `/repricing/history`

**Header:** Title + subtitle "Track your repricing activities and results".

**Table — 5 columns:**

1. **Executed At** — timestamp, relative.
2. **Rule Name** — hyperlinked to the rule.
3. **Repriced Products** — count.
4. **Status** — badge: `Repriced` · `Pending` · `Failed` · `Rolled back`.
5. **Actions** — `View Details`, `Rollback` (confirm modal).

**Drill-in:** `View Details` expands a drawer showing per-SKU before→after price, which guardrails blocked which rows, and who approved.

**Filters:** date range, rule, operator, status.

**Pagination:** default 20 rows.

---

## Cross-Cutting Observations

- **Framework:** React. No framework-specific markers beyond standard React hydration.
- **Icons:** 16–20px SVG inline (Heroicons-style outline).
- **Tables:** client-sortable; filters are server-backed (URL query params).
- **API shape (inferred from URLs/forms):**
  - `GET /api/repricing/rules`
  - `POST /api/repricing/rules`
  - `GET /api/repricing/preview?ruleIds=...`
  - `POST /api/repricing/apply`
  - `GET /api/repricing/history?dateFrom=...&ruleId=...`
  - `POST /api/repricing/history/{jobId}/rollback`

**We do NOT copy Pricefy's colors or typography.** All visual tokens come from `src/styles/tailwind.config.ts` and `src/styles/theme.css`.
