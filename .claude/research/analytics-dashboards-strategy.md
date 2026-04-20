# Analytics Dashboards — Strategy & Build Spec

_Analysis of Particl's dashboard builder (21 screenshots reviewed) + grid-library recommendation + Calumet-specific widget catalog + MVP scope._

---

## 1. What Particl's builder actually is

Reviewed 21 screenshots from `C:\Users\tuhin.mallick\Downloads\Dashboard Screenshots\`. Clear picture of the product.

### Core mental model

- **Dashboard** = a named board with a grid layout (e.g. "Shorts", "Winter Coats", "Accessories margin"). User can create many.
- **Widget** = a draggable, resizable card placed on the grid. Types seen:
  1. **Top Table** — ranked product list (rank, title, volume, revenue, reviews, thumbnail). The power widget.
  2. **Stat Card** — single big number with label (e.g. `$3.0m / Sales Revenue`).
  3. **Bar Chart** — grouped bars (Sunday Performance by Color).
  4. Implicit others: line chart, pie, treemap, sparkline (standard dashboard-builder set).
- **Dashboard filter controls** — top-of-board filters that apply to every widget simultaneously (e.g. date range, region). Keeps widgets consistent.
- **Arrange mode** — toggle at top: OFF = view/interact, ON = drag/resize/add. Single most common dashboard-builder UX pattern, in use since Grafana.
- **Auto-save** — footer shows "Auto-saved: 3:28pm". No explicit save button.
- **Breadcrumb** — `Dashboards > Shorts > How to use`. Hints at dashboard nesting or templates.

### Widget editor (modal, opened via "+ Add Chart" or the pencil on a widget)

Fields observed:

| Field | Control | Purpose |
|---|---|---|
| Title | text input | displayed on widget header |
| Chart Type | dropdown | e.g. "Top Table", "Bar Chart", "Stat" |
| Copilot | badge | suggests AI-assist to generate widget config from plain text |
| Entity toggle | two-tab: Competitor / Self | whose data (your catalog vs. competitors) |
| Entity | dropdown | "Top Products", "Top Companies", "Top Categories", etc. |
| Filter chips | add + remove | e.g. `Product Type: Shorts`, `Gender: is male` |
| Rank by | dropdown + direction | e.g. `Sort by Sales Volume` |
| Extra Columns | multi-select | which columns to show (Volume, Revenue, Reviews, Image, Price Range, Avg. Current Price, Discount Rate, Date First Seen, Average Rating, Sell-Thru Rate, Confidence Score) |
| Column Order | "Reorder" button | drag columns to reorder |
| Row Density | Compact / Spacious | row height |
| Live preview | inline | shows the result as user edits |

`[Cancel] [Save]` buttons.

### Key UX primitives to copy

1. **Per-widget toolbar** on hover: expand (fullscreen), edit pencil, delete X, `…` more menu.
2. **Auto-save** with "last saved" indicator (no save button).
3. **Filter chips with operator** (`Product Type | Shorts X`). Comparison-tool influence.
4. **Dashboard-level filters** that cascade to every widget — critical for coherence.
5. **"Optimized for faster loading"** badge + `7 Stable / 6+ Scores` metadata — surfaces query-performance to the user so they know when results are computed vs. cached.
6. **"Add Another Chart"** button at the bottom mirrors the top "+ Add Chart" for tall boards.

---

## 2. Grid library — my recommendation in 2026

You asked for "react grid or something better". Honest answer: **`react-grid-layout` is still the right pick** in 2026. It's not exciting, but it's the right tool:

| Library | Pros | Cons | Verdict |
|---|---|---|---|
| **`react-grid-layout`** ([github.com/react-grid-layout/react-grid-layout](https://github.com/react-grid-layout/react-grid-layout)) | Battle-tested (used by Grafana originally, Metabase, Kibana-likes). ~20k stars. Mobile/touch support via `react-resizable`. Supports responsive breakpoints. Simple JSON layout format. | Feels dated. Animations are basic. Styling hooks are limited. | **Pick this.** |
| **`gridstack.js`** + `gridstack-react` ([gridstackjs.com](https://gridstackjs.com/)) | Better animations, nicer touch, 30% faster on large boards. Growing React community. | React bindings less mature — API shifts between versions. Some advanced features still vanilla-only. | Second choice if you hate RGL |
| **`@dnd-kit/core` + custom grid** | Maximum flexibility. Modern, composable. Unopinionated. | You're building a grid from scratch. Weeks of work to match RGL's feature set. | Only if you have a dedicated designer |
| **`react-mosaic`** ([github.com/nomcopter/react-mosaic](https://github.com/nomcopter/react-mosaic)) | Tree-based tiling (VSCode / Bloomberg style). No overlap, always fills screen. Neat for IDE-like layouts. | Wrong model for the "bento grid" dashboards Particl shows. Users expect gaps, not forced tiling. | Wrong paradigm |
| **Shadcn/UI Resizable** | Nice horizontal splits. | 1D only. Can't do 2D grids. | Doesn't solve the problem |

**Decision: use `react-grid-layout` with `WidthProvider` + `Responsive`.** Write the widgets themselves as plain React components that receive `{ width, height }` and render with Recharts (charts), tanstack-table (tables), or plain divs (stats).

### "Something better" honorable mentions

- **[Tremor](https://www.tremor.so/)** — not a grid library, but a great pre-built widget set (KPI cards, line charts, bar charts) styled like Particl's widgets. Pair with `react-grid-layout` for the board, Tremor for the widgets. Tremor acquired by Vercel in 2024 and now ships shadcn-compatible components.
- **[Tableau Embedded Analytics](https://www.tableau.com/solutions/embedded-analytics)** / **Superset embedding** — if you want to let users build dashboards against a data warehouse directly, but that's a different product (BI tool) vs. feature (built-in dashboards). Skip for now.

---

## 3. Data model

Three tables handle the entire feature.

```prisma
model Dashboard {
  id             String           @id @default(cuid())
  tenantId       String           // Company.id (Calumet)
  name           String
  description    String?
  isShared       Boolean          @default(false)
  ownerId        String           // User.id
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  // Global filters applied to every widget on this board.
  // Same shape as widget filters so it composes.
  globalFilters  Json             // { dateRange: [...], categoryIds: [...], companyIds: [...] }

  widgets        DashboardWidget[]

  @@index([tenantId, ownerId])
  @@index([tenantId, isShared])
  @@schema("dashboards")
}

model DashboardWidget {
  id            String     @id @default(cuid())
  dashboardId   String
  title         String
  type          String     // "top_table" | "stat" | "bar_chart" | "line_chart" | "pie" | "sparkline" | "treemap"
  layout        Json       // { i, x, y, w, h, minW, minH } — react-grid-layout shape
  config        Json       // widget-type-specific config (see below)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  dashboard     Dashboard  @relation(fields: [dashboardId], references: [id], onDelete: Cascade)

  @@index([dashboardId])
  @@schema("dashboards")
}

// Saved "data source" config — reusable across widgets
model DashboardDataset {
  id           String     @id @default(cuid())
  tenantId     String
  name         String
  description  String?
  // Which backing table + filter/aggregation to run
  source       String     // "products" | "price_observations" | "forecast_variants" | "scraped_items" | etc.
  query        Json       // { select, where, groupBy, orderBy, limit }
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@schema("dashboards")
}
```

### Widget `config` shape by type

```typescript
type WidgetConfig =
  | {
      type: "top_table";
      entity: "competitor" | "self";
      entityKind: "product" | "company" | "category";
      filters: Array<{ field: string; operator: "is" | "is_not" | "in" | "not_in" | "gt" | "lt"; value: any }>;
      rankBy: { field: string; direction: "asc" | "desc" };
      columns: Array<{ field: string; format?: "number" | "currency" | "percent" | "date" | "image" | "rating" }>;
      rowDensity: "compact" | "spacious";
      limit: number;
    }
  | {
      type: "stat";
      metric: string;              // "sales_revenue" | "avg_price" | "stock_count"
      filters: Filter[];
      format: "number" | "currency" | "percent";
      comparison?: {               // optional period-over-period
        period: "7d" | "28d" | "90d" | "ytd";
        showDelta: boolean;
      };
    }
  | {
      type: "bar_chart" | "line_chart" | "pie";
      xField: string;
      yFields: string[];
      groupBy?: string;
      filters: Filter[];
      orientation?: "horizontal" | "vertical";
    };
```

Filters compose across three layers (dashboard → widget → user-interactive). Dashboard filters always apply; widget filters narrow further; interactive filters (click a legend item) further narrow in-session only.

---

## 4. Widget catalog for Calumet (MVP)

Ship these **8 widget types** in v1. Everything else can be built by composing these.

1. **Top Table** — ranked product / company / category list with configurable columns. Particl's power widget; handles 60% of real-world use cases alone.
2. **Stat Card** — single big number with optional period-over-period delta.
3. **Line Chart** — time series (price over time, stock over time, forecast curve).
4. **Bar Chart** — grouped or stacked bars (revenue by channel, SKU count by category).
5. **Pie / Donut** — share breakdown (assortment share by brand). Use sparingly — line/bar almost always reads better.
6. **Sparkline** (inline in table cells) — not standalone, but rendered inside Top Table rows.
7. **Heatmap** — calendar heatmap for "competitor activity" (new products added per day). Pattern spotter.
8. **Text / Markdown** — for annotations, context, instructions. Avoids the "empty dashboard looks dumb" problem.

### Calumet-specific data sources (what widgets query against)

- `scraping.scraped_items` — raw competitor product data, 160k+ rows.
- `public.products` — normalized product catalog per company, 160k+ rows across 6 companies.
- `forecast.ForecastVariant` + `ForecastHistoricalSale` + `ForecastQuantile` — forecast pipeline.
- `forecast.ReplenishmentPurchaseOrder` + related — inventory pipeline.
- `alerts.Alert` — alert feed (for "Top 10 open alerts by impact" widgets).
- `trends.TrendsObservation` (pending trends feature) — external signal.

### Example dashboards to ship with seed data

1. **"Competitor Overview (4w)"** — default board. Stat cards for `total tracked products`, `avg catalog price`, `new products added last 4w`, `price changes last 4w`. Top tables for `top companies by new-product velocity` and `top categories by price movement`. Line chart for `tracked SKU count over time`.

2. **"Pricing War Room"** — stat cards for `SKUs cheaper than market avg`, `SKUs priced above market avg`. Top table of `my SKUs with largest competitor gap`. Line chart of `my avg price vs competitor avg over 90 days`.

3. **"Forecast & Replenishment"** — line chart with forecast quantiles for selected category. Stat cards for `stockout risk SKUs`, `overstock SKUs`. Top table of `inbound POs by ETA`.

4. **"Marketing Signals"** (once scrapers land) — stat cards for `emails received last 28d`, `new ads detected`. Top table of `competitors by email frequency`.

Seed these boards for the Calumet tenant so the page is useful from day one.

---

## 5. Copilot (AI-assist) widget generation

Particl shows a `Copilot` badge in the chart editor. The implied UX: user types a sentence, LLM generates a widget config, user accepts or edits.

**Recommended implementation:**
- Server action: `generateWidgetFromPrompt(prompt: string, dashboardContext): WidgetConfig`.
- LLM: pick **Claude Sonnet** (or whatever model the app already uses for chat). Already have `@ai-sdk/anthropic` in `package.json`.
- Prompt the model with:
  - The available widget types + their config schemas (JSON Schema).
  - The available data sources + their field lists.
  - The dashboard's existing globalFilters (so Copilot respects context).
  - The user's natural-language prompt.
- Force **structured output** via Zod schema or tool-call format.
- Return the suggested config; user sees a preview, can edit any field, then save.

This is a **low-risk v1 AI feature**: it's bounded (output is a JSON widget config), the user has full edit control, and errors manifest as a rejected preview rather than bad data.

Examples:
- "Show me top 10 Canon products by price drop in the last 4 weeks" → `{ type: "top_table", entityKind: "product", filters: [{ field: "brand", op: "is", value: "Canon" }, { field: "price_change_pct", op: "lt", value: 0 }], rankBy: { field: "price_change_pct", direction: "asc" }, columns: [...], limit: 10 }`
- "Compare Foto Erhardt and Fotokoch avg prices over 90 days" → line chart.
- "How many SKUs am I cheaper than market on?" → stat card.

---

## 6. Implementation plan — ruthless MVP

### Phase 1 (5–7 days)
- Add Prisma models + migration.
- `/en/analytics/dashboards` list page — cards for existing boards, "New Dashboard" button.
- `/en/analytics/dashboards/[id]` detail page with `react-grid-layout` shell in view mode.
- Implement **3 widget types** first: `top_table`, `stat`, `line_chart`. Enough to cover 80% of real-world dashboards.
- Dashboard-level filters row + auto-save.
- Server actions: `listDashboards`, `createDashboard`, `updateDashboard`, `deleteDashboard`, `updateWidget`, `runWidgetQuery`.

### Phase 2 (5 days)
- Arrange mode toggle → drag/resize.
- Widget editor (modal/sheet) with chart-type picker, entity + filter + column config.
- Add widget types: `bar_chart`, `pie`, `heatmap`, `sparkline`, `markdown`.
- Widget toolbar (expand, edit, delete, clone).

### Phase 3 (3–4 days)
- Copilot prompt → structured widget config (Zod-validated LLM output).
- Share dashboard (read-only link) — update `isShared` flag.
- PDF / PNG export of dashboard (Playwright headless screenshot or `html-to-image`).
- 4 seeded dashboards for Calumet.

### Phase 4 (2–3 days)
- Performance pass: per-widget React Query cache, server-side aggregation push-down (use Postgres materialized views for common queries).
- The "Optimized for faster loading" badge Particl shows is actual query caching + the user can see it's stale.

**Total v1: ~3 weeks for one engineer.**

---

## 7. Open questions for the founder

1. **Template sharing.** Should dashboards be per-user, per-tenant, or both? Particl shows a `Shorts > How to use` breadcrumb hinting at templates or guides.
2. **Permissions.** Who can edit vs. view? Just the owner, or everyone in the tenant? Read-only share links needed?
3. **Copilot default-on or opt-in.** Is the AI-assist the primary path (type a sentence → get a widget) or a side-feature (the wizard is still default)?
4. **Export formats.** PDF and PNG are cheap. CSV-per-widget? Scheduled email exports (daily/weekly)?
5. **Real-time vs. snapshot.** Should widgets auto-refresh every N minutes, or always snapshot on save? Particl's "Optimized for faster loading" badge suggests snapshot + manual refresh.
6. **Mobile.** Are dashboards responsive (`react-grid-layout` supports breakpoints) or desktop-only? MVP can be desktop-first; mobile uses single-column stacked view.
7. **Query safety.** LLM-generated widget configs execute SQL-equivalent server actions against Postgres. Do we whitelist fields/operators in the config schema (safer but more work) or accept arbitrary filters (risky)?

---

## 8. Build spec for new session — what to paste into the prompt

When you spin up the builder session, the prompt should include:
- Reference screenshots path: `C:\Users\tuhin.mallick\Downloads\Dashboard Screenshots\dashboards_*.png` (read 1, 5, 10, 15, 20 first)
- This strategy doc.
- Existing repo patterns:
  - `src/actions/forecast.ts` for server-action style
  - `src/components/companies/tabs/*` for tab pattern
  - `src/lib/prisma.ts` for DB access
- Install: `npm install react-grid-layout @tremor/react` — that's it for new deps beyond what's already there.
- Schemas should live in a new `dashboards` Postgres schema (pattern copied from `forecast`/`alerts`).

## 9. Sources

- Particl dashboard screenshots (local, 21 images analyzed).
- [react-grid-layout docs](https://github.com/react-grid-layout/react-grid-layout)
- [gridstack.js](https://gridstackjs.com/)
- [react-mosaic](https://github.com/nomcopter/react-mosaic)
- [@dnd-kit](https://dndkit.com/)
- [Tremor components](https://www.tremor.so/)
- [Grafana's original grid implementation](https://grafana.com/) (for inspiration on arrange-mode UX)
- Existing NOGL repo — Prisma schema, `src/actions/*`, `src/components/companies/tabs/*` patterns.
