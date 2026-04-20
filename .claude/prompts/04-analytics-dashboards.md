# Build custom-dashboard builder at /en/analytics/dashboards (Particl-style)

## Goal

Replace the placeholder at `/en/analytics/dashboards` with a full drag-and-drop dashboard builder matching Particl's pattern — user creates named dashboards, adds resizable widgets (tables, stats, charts), auto-saves, and uses an AI "Copilot" to generate widgets from natural language.

## Reference material

- **Screenshots** (21 images): `C:\Users\tuhin.mallick\Downloads\Dashboard Screenshots\dashboards_001.png` through `_021.png`. Read 1, 5, 10, 15, 18, 21 first.
- **Strategy doc** (read first): `.claude/research/analytics-dashboards-strategy.md` — has complete data model, widget catalog, and 3-phase plan.

## Install

```bash
npm install react-grid-layout @tremor/react
```

`react-grid-layout` = the proven drag/resize grid.
`@tremor/react` = shadcn-compatible chart primitives (KPI cards, sparklines) that match the visual style Particl uses.

## Prisma additions

Add a new `dashboards` schema. Update `schemas = [...]` in datasource:

```prisma
model Dashboard {
  id             String            @id @default(cuid())
  tenantId       String
  name           String
  description    String?
  isShared       Boolean           @default(false)
  ownerId        String
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
  globalFilters  Json              // { dateRange, categoryIds, companyIds }
  widgets        DashboardWidget[]

  @@index([tenantId, ownerId])
  @@index([tenantId, isShared])
  @@schema("dashboards")
}

model DashboardWidget {
  id            String     @id @default(cuid())
  dashboardId   String
  title         String
  type          String     // "top_table" | "stat" | "bar_chart" | "line_chart" | "pie" | "sparkline" | "heatmap" | "markdown"
  layout        Json       // react-grid-layout shape: { i, x, y, w, h, minW, minH }
  config        Json       // widget-type-specific config
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  dashboard     Dashboard  @relation(fields: [dashboardId], references: [id], onDelete: Cascade)

  @@index([dashboardId])
  @@schema("dashboards")
}
```

## Widget-config schema (Zod)

`src/lib/dashboards/widgetSchemas.ts`:

```typescript
import { z } from "zod";

export const FilterSchema = z.object({
  field: z.string(),
  operator: z.enum(["is", "is_not", "in", "not_in", "gt", "lt", "between"]),
  value: z.union([z.string(), z.number(), z.array(z.any())]),
});

export const TopTableConfig = z.object({
  type: z.literal("top_table"),
  entity: z.enum(["competitor", "self"]),
  entityKind: z.enum(["product", "company", "category", "brand"]),
  filters: z.array(FilterSchema),
  rankBy: z.object({ field: z.string(), direction: z.enum(["asc", "desc"]) }),
  columns: z.array(z.object({
    field: z.string(),
    format: z.enum(["number", "currency", "percent", "date", "image", "rating"]).optional(),
    width: z.number().optional(),
  })),
  rowDensity: z.enum(["compact", "spacious"]),
  limit: z.number().min(1).max(100),
});

export const StatConfig = z.object({
  type: z.literal("stat"),
  metric: z.string(),
  filters: z.array(FilterSchema),
  format: z.enum(["number", "currency", "percent"]),
  comparison: z.object({
    period: z.enum(["7d", "28d", "90d", "ytd"]),
    showDelta: z.boolean(),
  }).optional(),
});

export const LineChartConfig = z.object({
  type: z.literal("line_chart"),
  xField: z.string(),
  yFields: z.array(z.string()),
  groupBy: z.string().optional(),
  filters: z.array(FilterSchema),
});

export const BarChartConfig = LineChartConfig.extend({ type: z.literal("bar_chart"), orientation: z.enum(["horizontal", "vertical"]) });
export const PieConfig = z.object({ type: z.literal("pie"), field: z.string(), filters: z.array(FilterSchema) });
export const MarkdownConfig = z.object({ type: z.literal("markdown"), content: z.string() });

export const WidgetConfigSchema = z.discriminatedUnion("type", [
  TopTableConfig, StatConfig, LineChartConfig, BarChartConfig, PieConfig, MarkdownConfig,
]);

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;
```

## Server actions

`src/actions/dashboards.ts`:

- `listDashboards(tenantId)` → dashboards for current user or shared in tenant
- `createDashboard(tenantId, name)` → returns id
- `getDashboard(id)` → full dashboard + all widgets
- `updateDashboardLayout(id, layouts: RGLLayout[])` → debounced auto-save
- `updateWidget(widgetId, patch)` → partial update
- `createWidget(dashboardId, config)` → add new widget
- `deleteWidget(widgetId)`
- `cloneWidget(widgetId)`
- `runWidgetQuery(widgetId, globalFilters)` → resolves widget's config to a data result (calls internal query builder based on widget type + entityKind)
- `generateWidgetFromPrompt(dashboardId, prompt, context)` → Claude-powered widget config (see "Copilot" section below)

## Copilot (AI-assisted widget creation)

Use the already-installed `@ai-sdk/anthropic` + `ai` packages.

```typescript
// src/actions/dashboards/copilot.ts
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { WidgetConfigSchema } from "@/lib/dashboards/widgetSchemas";

export async function generateWidgetFromPrompt(
  dashboardId: string,
  prompt: string,
): Promise<WidgetConfig> {
  const dashboard = await prisma.dashboard.findUnique({ where: { id: dashboardId } });
  const availableFields = await listDataFieldsForTenant(dashboard.tenantId);

  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-5"),
    schema: WidgetConfigSchema,
    system: `You generate dashboard widget configurations for a retail-intelligence SaaS.
    Available fields: ${JSON.stringify(availableFields)}
    Global filters: ${JSON.stringify(dashboard.globalFilters)}
    Never invent fields. Pick from the available list.`,
    prompt,
  });

  return object;
}
```

In the chart editor modal, add a **Copilot** tab next to the manual fields:
- Textarea with placeholder: _"Show me top 10 Canon products by price drop in the last 4 weeks"_
- Submit button → calls `generateWidgetFromPrompt` → returns a config
- Preview renders immediately → user can edit any field in the manual tab before saving
- "Use this" confirm → saves as normal widget

## UI pages

### List page `/en/analytics/dashboards/page.tsx` (server component)

- Table/grid of user's dashboards (name, last updated, widget count, open/share/delete actions).
- "+ New Dashboard" button → creates empty dashboard → redirects to detail page.
- "Shared" toggle filter.

### Detail page `/en/analytics/dashboards/[id]/page.tsx`

RSC + Client Component split:

- Server: fetch dashboard + widgets, pass to `<DashboardEditor>`.
- Client (`DashboardEditor.tsx`): all interactivity.

Client component structure:

```tsx
<DashboardHeader>
  <Breadcrumb>Dashboards > {dashboard.name}</Breadcrumb>
  <ArrangeModeToggle />    {/* switches between view and edit */}
  <AutoSavedIndicator />
  <GlobalFilterBar filters={dashboard.globalFilters} onChange={setGlobalFilters} />
  <Actions>
    <Button onClick={addChart}>+ Add Chart</Button>
    <IconButton icon={Settings}/>
    <IconButton icon={Export}/>
  </Actions>
</DashboardHeader>

<ResponsiveReactGridLayout
  layouts={layouts}
  onLayoutChange={debouncedSave}
  isDraggable={arrangeMode}
  isResizable={arrangeMode}
  breakpoints={{ lg: 1200, md: 996, sm: 768 }}
  cols={{ lg: 12, md: 10, sm: 6 }}
  rowHeight={60}
>
  {widgets.map(w => (
    <div key={w.id}>
      <WidgetFrame widget={w} globalFilters={globalFilters} arrangeMode={arrangeMode}>
        <WidgetRenderer widget={w} globalFilters={globalFilters} />
      </WidgetFrame>
    </div>
  ))}
</ResponsiveReactGridLayout>
```

`WidgetFrame` provides:
- Header with title + toolbar (expand, edit pencil, delete X, ... menu) visible on hover when `arrangeMode`.
- Loading spinner while `runWidgetQuery` resolves.
- Error boundary.

`WidgetRenderer` dispatches on `widget.type`:
- `top_table` → `<TopTableWidget>` using `@tanstack/react-table` with thumbnail + rating support
- `stat` → `<StatWidget>` using Tremor `<Metric>` with period-over-period delta
- `line_chart` / `bar_chart` → Recharts with Tremor theming
- `pie` → Recharts `<PieChart>`
- `heatmap` → custom grid of colored cells
- `markdown` → `react-markdown` with Tailwind Typography

### Widget editor modal

Opened via "+ Add Chart" or edit pencil. Two tabs: **Manual** (all fields per widget type) and **Copilot** (natural language prompt). Live preview below. Cancel / Save buttons.

## Seed 4 default dashboards

Script `scripts/seed-dashboards-demo.ts`:

1. **"Competitor Overview (4w)"** — stat cards + top tables.
2. **"Pricing War Room"** — gap analysis.
3. **"Forecast & Replenishment"** — forecast line + stockout/overstock stats.
4. **"Marketing Signals"** — (scaffold only — will populate once scraper prompts land).

Run on first login for the Calumet tenant so the page is useful day 1.

## Acceptance criteria

- [ ] `prisma db push` creates Dashboard + DashboardWidget in a new `dashboards` schema.
- [ ] `npm run seed:dashboards-demo` creates 4 boards with 5-8 widgets each.
- [ ] `/en/analytics/dashboards` list page shows 4 seeded dashboards + "New Dashboard" button.
- [ ] Click a dashboard → detail page → widgets render with real data from the scraped products + forecast tables.
- [ ] Arrange mode toggle enables drag + resize; auto-save fires every 500ms while arranging.
- [ ] "+ Add Chart" → modal with Manual + Copilot tabs, can create a widget of each type (top_table, stat, line_chart, bar_chart, pie, markdown).
- [ ] Copilot: type "Top 10 Canon products by price drop last 4 weeks" → renders a valid `top_table` config within 5s.
- [ ] Responsive: at mobile width, widgets stack single-column.
- [ ] Dark mode OK.
- [ ] `npm run typecheck` + `build` pass.

## Out of scope

- Real-time widget refresh / polling (widgets fetch on mount + on filter change only).
- Public share links (require a `shareToken` table — future).
- PDF/PNG export (use Playwright screenshot in a later prompt).
- Drilldown from widget to full-page explorer (future).
- Widget-to-widget cross-filtering (click a bar → filter neighboring widgets — future).

## Branch + commits

```bash
git checkout -b feature/analytics-dashboards
```

1. `feat(dashboards): add Prisma models + widget Zod schemas`
2. `feat(dashboards): add server actions + query builder`
3. `feat(dashboards): build DashboardEditor with react-grid-layout`
4. `feat(dashboards): add widget editor modal + 6 widget types`
5. `feat(dashboards): add Copilot AI-assist with Claude`
6. `feat(dashboards): seed 4 default dashboards for Calumet`

## Reference files

- Stub page: `src/app/(site)/[lang]/(app)/analytics/dashboards/page.tsx`
- Research: `.claude/research/analytics-dashboards-strategy.md` (read first)
- Screenshots: `C:\Users\tuhin.mallick\Downloads\Dashboard Screenshots\`
- Pattern: `src/actions/forecast.ts` for server action style
- Chart lib: `recharts` (already installed) + install `@tremor/react`
- Icons: `@untitledui/icons`
