"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  SparklesIcon,
  LoaderCircleIcon,
  CheckIcon,
  AlertCircleIcon,
  WandSparklesIcon,
} from "lucide-react";
import { createWidget, updateWidget } from "@/actions/dashboards";
import { generateWidgetFromPrompt } from "@/actions/dashboards/copilot";
import type {
  DashboardWidgetRow,
  WidgetConfig,
  RGLLayout,
  WidgetType,
} from "@/lib/dashboards/widgetSchemas";
import { WIDGET_CATALOG } from "@/lib/dashboards/widgetSchemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WidgetTypeOpt = WidgetType;

const ENTITY_KINDS = ["product", "company", "category", "brand"] as const;
const RANK_FIELDS = [
  { value: "competitorPrice", label: "Price" },
  { value: "priceDiff", label: "Price Gap $" },
  { value: "priceDiffPct", label: "Price Gap %" },
  { value: "volume", label: "Volume" },
  { value: "revenue", label: "Revenue" },
  { value: "rating", label: "Rating" },
];
const METRICS = [
  { value: "totalRevenue", label: "Total Revenue" },
  { value: "avgPrice", label: "Avg Price" },
  { value: "skuCount", label: "SKU Count" },
  { value: "companyCount", label: "Company Count" },
  { value: "priceGap", label: "Price Gap" },
  { value: "winRate", label: "Win Rate %" },
  { value: "igFollowers", label: "IG Followers" },
  { value: "trackedCompanies", label: "Tracked Companies" },
];

interface Props {
  open: boolean;
  dashboardId: string;
  existingWidget?: DashboardWidgetRow;
  onCreated: (widget: DashboardWidgetRow) => void;
  onUpdated: (widget: DashboardWidgetRow) => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

export function WidgetEditorModal({
  open,
  dashboardId,
  existingWidget,
  onCreated,
  onUpdated,
  onClose,
}: Props) {
  const isEditing = !!existingWidget;

  // ── Manual form state ────────────────────────────────────────────────────
  const [title, setTitle] = useState(existingWidget?.title ?? "");
  const [widgetType, setWidgetType] = useState<WidgetTypeOpt>(
    (existingWidget?.type as WidgetTypeOpt) ?? "top_table"
  );
  // top_table specific
  const [entity, setEntity] = useState<"competitor" | "self">("competitor");
  const [entityKind, setEntityKind] =
    useState<(typeof ENTITY_KINDS)[number]>("product");
  const [rankField, setRankField] = useState("competitorPrice");
  const [rankDir, setRankDir] = useState<"asc" | "desc">("desc");
  const [rowLimit, setRowLimit] = useState(10);
  const [rowDensity, setRowDensity] = useState<"compact" | "spacious">("compact");
  // stat specific
  const [metric, setMetric] = useState("totalRevenue");
  const [format, setFormat] = useState<"number" | "currency" | "percent">("currency");
  // chart specifics
  const [xField, setXField] = useState("date");
  const [yField, setYField] = useState("competitorPrice");
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("vertical");
  // markdown
  const [mdContent, setMdContent] = useState("");

  // ── Copilot state ────────────────────────────────────────────────────────
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [copilotConfig, setCopilotConfig] = useState<WidgetConfig | null>(null);
  const [copilotTitle, setCopilotTitle] = useState<string>("");
  const [copilotError, setCopilotError] = useState<string | null>(null);
  const [isCopilotPending, startCopilot] = useTransition();
  const [isSavePending, startSave] = useTransition();
  const [activeTab, setActiveTab] = useState("manual");

  // ── Helpers ──────────────────────────────────────────────────────────────

  function buildConfig(): WidgetConfig {
    switch (widgetType) {
      case "top_table":
        return {
          type: "top_table",
          entity,
          entityKind,
          filters: [],
          rankBy: { field: rankField, direction: rankDir },
          columns: [],
          rowDensity,
          limit: rowLimit,
        };
      case "stat":
        return {
          type: "stat",
          metric,
          filters: [],
          format,
          label: title,
          comparison: { period: "28d", showDelta: true },
        };
      case "line_chart":
        return {
          type: "line_chart",
          xField,
          yFields: [yField],
          filters: [],
          smooth: true,
        };
      case "bar_chart":
        return {
          type: "bar_chart",
          xField,
          yFields: [yField],
          filters: [],
          orientation,
          stacked: false,
        };
      case "pie":
        return {
          type: "pie",
          field: xField,
          valueField: yField,
          filters: [],
          limit: rowLimit,
          donut: false,
        };
      case "heatmap":
        return {
          type: "heatmap",
          rowField: "competitor",
          colField: "category",
          valueField: "priceDiffPct",
          filters: [],
          colorScheme: "blue",
        };
      case "sparkline":
        return {
          type: "sparkline",
          metric,
          period: "28d",
          filters: [],
          format,
        };
      case "markdown":
        return { type: "markdown", content: mdContent };
    }
  }

  function defaultLayout(type: WidgetType): RGLLayout {
    const cat = WIDGET_CATALOG.find((c) => c.type === type);
    const { w, h } = cat?.defaultSize ?? { w: 6, h: 4 };
    return { i: "new", x: 0, y: Infinity, w, h };
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  function handleSave() {
    const config =
      activeTab === "copilot" && copilotConfig ? copilotConfig : buildConfig();
    const resolvedTitle =
      title.trim() ||
      (activeTab === "copilot" && copilotTitle ? copilotTitle : widgetType.replace("_", " "));

    startSave(async () => {
      if (isEditing && existingWidget) {
        await updateWidget(existingWidget.id, {
          title: resolvedTitle,
          config,
        });
        onUpdated({
          ...existingWidget,
          title: resolvedTitle,
          config,
          updatedAt: new Date().toISOString(),
        });
      } else {
        const layout = defaultLayout(config.type);
        const created = await createWidget(dashboardId, resolvedTitle, config, layout);
        onCreated(created as DashboardWidgetRow);
      }
    });
  }

  // ── Copilot generate ─────────────────────────────────────────────────────

  function handleCopilotGenerate() {
    if (!copilotPrompt.trim()) return;
    setCopilotError(null);
    setCopilotConfig(null);

    startCopilot(async () => {
      const result = await generateWidgetFromPrompt(dashboardId, copilotPrompt);
      setCopilotConfig(result.config);
      setCopilotTitle(result.suggestedTitle);
      if (!title.trim()) setTitle(result.suggestedTitle);
    });
  }

  function handleUseCopilotConfig() {
    if (!copilotConfig) return;
    // Populate manual fields from copilot config so user can tweak
    if (copilotConfig.type === "top_table") {
      setWidgetType("top_table");
      setEntity(copilotConfig.entity);
      setEntityKind(copilotConfig.entityKind);
      setRankField(copilotConfig.rankBy.field);
      setRankDir(copilotConfig.rankBy.direction);
      setRowLimit(copilotConfig.limit);
    } else if (copilotConfig.type === "stat") {
      setWidgetType("stat");
      setMetric(copilotConfig.metric);
      setFormat(copilotConfig.format);
    } else if (copilotConfig.type === "line_chart" || copilotConfig.type === "bar_chart") {
      setWidgetType(copilotConfig.type);
      setXField(copilotConfig.xField);
      setYField(copilotConfig.yFields[0] ?? yField);
    }
    setActiveTab("manual");
  }

  // ── Persona example prompts ──────────────────────────────────────────────

  const EXAMPLE_PROMPTS = [
    "Top 10 products by price drop in the last 4 weeks",
    "Revenue trend over the past 28 days",
    "Compare avg prices by brand",
    "Share of market by company",
    "Stockout risk for my top SKUs",
  ];

  // ────────────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? "Edit Widget" : "Add Chart"}
            {widgetType && (
              <Badge variant="secondary" className="text-xs">
                {widgetType.replace("_", " ")}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
            <TabsList className="mx-6 mt-4 w-auto self-start">
              <TabsTrigger value="manual">Manual</TabsTrigger>
              <TabsTrigger value="copilot" className="gap-1.5">
                <SparklesIcon className="h-3.5 w-3.5" />
                Copilot
              </TabsTrigger>
            </TabsList>

            {/* ── Manual tab ──────────────────────────────────────────── */}
            <TabsContent value="manual" className="flex flex-col gap-5 px-6 pb-4 pt-4">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <Label>Widget title</Label>
                <Input
                  placeholder="e.g. Top Products by Price Drop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Type picker */}
              <div className="flex flex-col gap-2">
                <Label>Chart type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {WIDGET_CATALOG.map((cat) => (
                    <button
                      key={cat.type}
                      onClick={() => setWidgetType(cat.type)}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors
                        ${widgetType === cat.type
                          ? "border-primary bg-primary/10 text-primary"
                          : "hover:border-foreground/30 text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <span className="text-base">{catIcon(cat.type)}</span>
                      <span className="text-center leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Type-specific fields */}
              {widgetType === "top_table" && (
                <TopTableFields
                  entity={entity} setEntity={setEntity}
                  entityKind={entityKind} setEntityKind={setEntityKind}
                  rankField={rankField} setRankField={setRankField}
                  rankDir={rankDir} setRankDir={setRankDir}
                  rowLimit={rowLimit} setRowLimit={setRowLimit}
                  rowDensity={rowDensity} setRowDensity={setRowDensity}
                />
              )}

              {(widgetType === "stat" || widgetType === "sparkline") && (
                <StatFields
                  metric={metric} setMetric={setMetric}
                  format={format} setFormat={setFormat}
                />
              )}

              {(widgetType === "line_chart" || widgetType === "bar_chart") && (
                <ChartFields
                  xField={xField} setXField={setXField}
                  yField={yField} setYField={setYField}
                  orientation={orientation} setOrientation={setOrientation}
                  showOrientation={widgetType === "bar_chart"}
                />
              )}

              {widgetType === "pie" && (
                <PieFields
                  xField={xField} setXField={setXField}
                  yField={yField} setYField={setYField}
                  rowLimit={rowLimit} setRowLimit={setRowLimit}
                />
              )}

              {widgetType === "markdown" && (
                <div className="flex flex-col gap-1.5">
                  <Label>Content (Markdown)</Label>
                  <Textarea
                    className="min-h-[100px] font-mono text-xs"
                    placeholder="# Heading&#10;&#10;Some **bold** text or a list."
                    value={mdContent}
                    onChange={(e) => setMdContent(e.target.value)}
                  />
                </div>
              )}
            </TabsContent>

            {/* ── Copilot tab ─────────────────────────────────────────── */}
            <TabsContent value="copilot" className="flex flex-col gap-4 px-6 pb-4 pt-4">
              <div className="flex flex-col gap-1.5">
                <Label className="flex items-center gap-1.5">
                  <WandSparklesIcon className="h-3.5 w-3.5 text-violet-500" />
                  Describe the widget you want
                </Label>
                <Textarea
                  className="min-h-[80px] resize-none"
                  placeholder={`e.g. "${EXAMPLE_PROMPTS[0]}"`}
                  value={copilotPrompt}
                  onChange={(e) => setCopilotPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.metaKey) handleCopilotGenerate();
                  }}
                />
                <div className="flex flex-wrap gap-1.5">
                  {EXAMPLE_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setCopilotPrompt(p)}
                      className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCopilotGenerate}
                disabled={!copilotPrompt.trim() || isCopilotPending}
                variant="outline"
                className="gap-1.5 self-start"
              >
                {isCopilotPending ? (
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <SparklesIcon className="h-4 w-4 text-violet-500" />
                )}
                {isCopilotPending ? "Generating…" : "Generate (⌘ Enter)"}
              </Button>

              {/* Result preview */}
              {copilotConfig && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      Widget config generated
                    </span>
                  </div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    <strong>Type:</strong> {copilotConfig.type.replace("_", " ")} —{" "}
                    <strong>Title:</strong> {copilotTitle}
                  </p>
                  <pre className="overflow-x-auto rounded-sm bg-muted p-2 text-[10px] leading-relaxed">
                    {JSON.stringify(copilotConfig, null, 2)}
                  </pre>
                  <button
                    onClick={handleUseCopilotConfig}
                    className="mt-2 text-xs text-primary underline"
                  >
                    Open in Manual tab to fine-tune →
                  </button>
                </div>
              )}

              {copilotError && (
                <div className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
                  {copilotError}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="border-t px-6 py-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSavePending}
            className="gap-1.5"
          >
            {isSavePending ? (
              <LoaderCircleIcon className="h-4 w-4 animate-spin" />
            ) : null}
            {isEditing ? "Save changes" : "Add widget"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Field sub-forms
// ---------------------------------------------------------------------------

function TopTableFields({
  entity, setEntity,
  entityKind, setEntityKind,
  rankField, setRankField,
  rankDir, setRankDir,
  rowLimit, setRowLimit,
  rowDensity, setRowDensity,
}: {
  entity: "competitor" | "self"; setEntity: (v: "competitor" | "self") => void;
  entityKind: string; setEntityKind: (v: string) => void;
  rankField: string; setRankField: (v: string) => void;
  rankDir: "asc" | "desc"; setRankDir: (v: "asc" | "desc") => void;
  rowLimit: number; setRowLimit: (v: number) => void;
  rowDensity: "compact" | "spacious"; setRowDensity: (v: "compact" | "spacious") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Entity toggle — Particl-style Competitor / Self */}
      <div className="col-span-2 flex flex-col gap-1.5">
        <Label>Data source</Label>
        <div className="inline-flex rounded-lg border p-0.5">
          {(["competitor", "self"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setEntity(v)}
              className={`flex-1 rounded-md px-3 py-1 text-xs font-medium transition-colors
                ${entity === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {v === "competitor" ? "Competitor" : "Self"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Entity kind</Label>
        <Select value={entityKind} onValueChange={setEntityKind}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {ENTITY_KINDS.map((k) => (
              <SelectItem key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Rank by</Label>
        <Select value={rankField} onValueChange={setRankField}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {RANK_FIELDS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Direction</Label>
        <Select value={rankDir} onValueChange={(v) => setRankDir(v as "asc" | "desc")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending (highest first)</SelectItem>
            <SelectItem value="asc">Ascending (lowest first)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Rows</Label>
        <Input
          type="number"
          min={1}
          max={100}
          value={rowLimit}
          onChange={(e) => setRowLimit(Number(e.target.value))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Row density</Label>
        <Select value={rowDensity} onValueChange={(v) => setRowDensity(v as "compact" | "spacious")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="spacious">Spacious</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function StatFields({
  metric, setMetric, format, setFormat,
}: {
  metric: string; setMetric: (v: string) => void;
  format: "number" | "currency" | "percent"; setFormat: (v: "number" | "currency" | "percent") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Metric</Label>
        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {METRICS.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Format</Label>
        <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="currency">Currency ($)</SelectItem>
            <SelectItem value="percent">Percent (%)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function ChartFields({
  xField, setXField, yField, setYField,
  orientation, setOrientation, showOrientation,
}: {
  xField: string; setXField: (v: string) => void;
  yField: string; setYField: (v: string) => void;
  orientation: "horizontal" | "vertical"; setOrientation: (v: "horizontal" | "vertical") => void;
  showOrientation: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>X axis field</Label>
        <Input value={xField} onChange={(e) => setXField(e.target.value)} placeholder="e.g. date" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Y axis field</Label>
        <Input value={yField} onChange={(e) => setYField(e.target.value)} placeholder="e.g. competitorPrice" />
      </div>
      {showOrientation && (
        <div className="flex flex-col gap-1.5">
          <Label>Orientation</Label>
          <Select value={orientation} onValueChange={(v) => setOrientation(v as typeof orientation)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="vertical">Vertical</SelectItem>
              <SelectItem value="horizontal">Horizontal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

function PieFields({
  xField, setXField, yField, setYField,
  rowLimit, setRowLimit,
}: {
  xField: string; setXField: (v: string) => void;
  yField: string; setYField: (v: string) => void;
  rowLimit: number; setRowLimit: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Group by field</Label>
        <Input value={xField} onChange={(e) => setXField(e.target.value)} placeholder="e.g. companyName" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Value field</Label>
        <Input value={yField} onChange={(e) => setYField(e.target.value)} placeholder="e.g. total_products" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Max slices</Label>
        <Input type="number" min={2} max={20} value={rowLimit} onChange={(e) => setRowLimit(Number(e.target.value))} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Emoji icons for the type picker
// ---------------------------------------------------------------------------

function catIcon(type: WidgetType): string {
  switch (type) {
    case "top_table":  return "⊞";
    case "stat":       return "📊";
    case "line_chart": return "📈";
    case "bar_chart":  return "📉";
    case "pie":        return "🥧";
    case "heatmap":    return "🔲";
    case "sparkline":  return "⚡";
    case "markdown":   return "📝";
    default:           return "□";
  }
}
