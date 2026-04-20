import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared sub-schemas
// ---------------------------------------------------------------------------

export const FilterSchema = z.object({
  field: z.string(),
  operator: z.enum(["is", "is_not", "in", "not_in", "gt", "lt", "between"]),
  value: z.union([z.string(), z.number(), z.array(z.any())]),
});
export type Filter = z.infer<typeof FilterSchema>;

export const ColumnSchema = z.object({
  field: z.string(),
  label: z.string().optional(),
  format: z
    .enum(["number", "currency", "percent", "date", "image", "rating"])
    .optional(),
  width: z.number().optional(),
});

export const RGLLayoutSchema = z.object({
  i: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  minW: z.number().optional(),
  minH: z.number().optional(),
  maxW: z.number().optional(),
  maxH: z.number().optional(),
  static: z.boolean().optional(),
});
export type RGLLayout = z.infer<typeof RGLLayoutSchema>;

// ---------------------------------------------------------------------------
// Widget configs — one per type
// ---------------------------------------------------------------------------

export const TopTableConfig = z.object({
  type: z.literal("top_table"),
  entity: z.enum(["competitor", "self"]),
  entityKind: z.enum(["product", "company", "category", "brand"]),
  filters: z.array(FilterSchema).default([]),
  rankBy: z.object({
    field: z.string(),
    direction: z.enum(["asc", "desc"]),
  }),
  columns: z.array(ColumnSchema).default([]),
  rowDensity: z.enum(["compact", "spacious"]).default("compact"),
  limit: z.number().min(1).max(100).default(10),
});

export const StatConfig = z.object({
  type: z.literal("stat"),
  metric: z.string(),
  filters: z.array(FilterSchema).default([]),
  format: z.enum(["number", "currency", "percent"]).default("number"),
  label: z.string().optional(),
  comparison: z
    .object({
      period: z.enum(["7d", "28d", "90d", "ytd"]),
      showDelta: z.boolean().default(true),
    })
    .optional(),
});

export const LineChartConfig = z.object({
  type: z.literal("line_chart"),
  xField: z.string(),
  yFields: z.array(z.string()).min(1),
  groupBy: z.string().optional(),
  filters: z.array(FilterSchema).default([]),
  smooth: z.boolean().default(false),
});

export const BarChartConfig = z.object({
  type: z.literal("bar_chart"),
  xField: z.string(),
  yFields: z.array(z.string()).min(1),
  groupBy: z.string().optional(),
  filters: z.array(FilterSchema).default([]),
  orientation: z.enum(["horizontal", "vertical"]).default("vertical"),
  stacked: z.boolean().default(false),
});

export const PieConfig = z.object({
  type: z.literal("pie"),
  field: z.string(),
  valueField: z.string().default("count"),
  filters: z.array(FilterSchema).default([]),
  limit: z.number().min(2).max(20).default(8),
  donut: z.boolean().default(false),
});

export const HeatmapConfig = z.object({
  type: z.literal("heatmap"),
  rowField: z.string(),
  colField: z.string(),
  valueField: z.string(),
  filters: z.array(FilterSchema).default([]),
  colorScheme: z.enum(["green", "blue", "red", "purple"]).default("blue"),
});

export const MarkdownConfig = z.object({
  type: z.literal("markdown"),
  content: z.string().default(""),
});

export const SparklineConfig = z.object({
  type: z.literal("sparkline"),
  metric: z.string(),
  period: z.enum(["7d", "28d", "90d"]).default("28d"),
  filters: z.array(FilterSchema).default([]),
  format: z.enum(["number", "currency", "percent"]).default("number"),
});

// ---------------------------------------------------------------------------
// Discriminated union — single source of truth for all widget configs
// ---------------------------------------------------------------------------

export const WidgetConfigSchema = z.discriminatedUnion("type", [
  TopTableConfig,
  StatConfig,
  LineChartConfig,
  BarChartConfig,
  PieConfig,
  HeatmapConfig,
  MarkdownConfig,
  SparklineConfig,
]);

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;
export type WidgetType = WidgetConfig["type"];

// ---------------------------------------------------------------------------
// Full widget (as stored in DB / passed to components)
// ---------------------------------------------------------------------------

export interface DashboardWidgetRow {
  id: string;
  dashboardId: string;
  title: string;
  type: WidgetType;
  layout: RGLLayout;
  config: WidgetConfig;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardRow {
  id: string;
  tenantId: string;
  ownerId: string;
  name: string;
  description?: string | null;
  isShared: boolean;
  persona: "CFO" | "CMO" | "OPS" | "GENERIC";
  globalFilters: GlobalFilters;
  createdAt: string;
  updatedAt: string;
  widgets?: DashboardWidgetRow[];
}

export interface GlobalFilters {
  dateRange?: { from: string; to: string } | null;
  categoryIds?: string[];
  companyIds?: string[];
}

// ---------------------------------------------------------------------------
// Widget query result shapes
// ---------------------------------------------------------------------------

export interface TableRow {
  [key: string]: unknown;
}

export interface WidgetQueryResult {
  type: WidgetType;
  rows?: TableRow[];
  value?: number | string;
  previousValue?: number | string;
  delta?: number;
  series?: Array<{ name: string; data: Array<{ x: string | number; y: number }> }>;
  slices?: Array<{ label: string; value: number }>;
  cells?: Array<{ row: string; col: string; value: number }>;
  error?: string;
}

// ---------------------------------------------------------------------------
// Widget catalog (used in the "Add Chart" modal to pick a type)
// ---------------------------------------------------------------------------

export const WIDGET_CATALOG: Array<{
  type: WidgetType;
  label: string;
  description: string;
  defaultSize: { w: number; h: number };
  icon: string;
}> = [
  {
    type: "top_table",
    label: "Top Products Table",
    description: "Ranked table of products, companies, or categories",
    defaultSize: { w: 7, h: 6 },
    icon: "Table",
  },
  {
    type: "stat",
    label: "Metric Card",
    description: "Single KPI with optional period-over-period delta",
    defaultSize: { w: 3, h: 2 },
    icon: "TrendingUp",
  },
  {
    type: "line_chart",
    label: "Line Chart",
    description: "Time series or trend line",
    defaultSize: { w: 6, h: 4 },
    icon: "LineChart",
  },
  {
    type: "bar_chart",
    label: "Bar Chart",
    description: "Grouped or stacked bar chart",
    defaultSize: { w: 6, h: 4 },
    icon: "BarChart",
  },
  {
    type: "pie",
    label: "Pie / Donut",
    description: "Distribution across categories",
    defaultSize: { w: 4, h: 4 },
    icon: "PieChart",
  },
  {
    type: "heatmap",
    label: "Heatmap",
    description: "Grid of colored cells showing intensity",
    defaultSize: { w: 6, h: 5 },
    icon: "Grid",
  },
  {
    type: "sparkline",
    label: "Sparkline Card",
    description: "Compact metric + mini trend line",
    defaultSize: { w: 3, h: 2 },
    icon: "Activity",
  },
  {
    type: "markdown",
    label: "Text / Notes",
    description: "Free-form markdown annotation",
    defaultSize: { w: 4, h: 3 },
    icon: "FileText",
  },
];
