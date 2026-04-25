"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  ReferenceArea,
  Brush,
} from "recharts";
import { format, parseISO } from "date-fns";
import {
  HISTORY_PALETTE,
  FORECAST_PALETTE,
  QUANTILE_LABELS,
} from "@/config/forecast";
import type {
  ForecastChannelData,
  ForecastChannelConfig,
  ForecastMetric,
  ForecastScale,
  ForecastQuantileValue,
  ForecastAnnotation,
  ForecastAnnotationKind,
  ForecastAnnotationSeverity,
} from "@/types/forecast";

interface AnnotationLayerToggle {
  kind: ForecastAnnotationKind;
  label: string;
  enabled: boolean;
  onToggle: () => void;
}

interface ForecastChartProps {
  data: ForecastChannelData;
  metric: ForecastMetric;
  scale: ForecastScale;
  quantile: ForecastQuantileValue;
  channels: ForecastChannelConfig[];
  height?: number;
  startForecastDate?: string;
  annotations?: ForecastAnnotation[];
  annotationLayers?: AnnotationLayerToggle[];
  /**
   * Bar layout mode.
   *  - `'stacked'` (default): channels stack on top of one another, with
   *    history and forecast in two separate stacks.
   *  - `'grouped'`: channels render side-by-side as separate bars per
   *    category, all with rounded tops (mockup style).
   */
  mode?: "stacked" | "grouped";
}

// Per-kind dot colors used in the legend + flag stems.
const ANNOTATION_KIND_COLOR: Record<ForecastAnnotationKind, string> = {
  event_spike: "#2970FF",
  out_of_stock: "#D92D20",
  promotion: "#DC6803",
  launch: "#6938EF",
};

// Severity → flag fill (info/warning/critical).
const ANNOTATION_SEVERITY_COLOR: Record<ForecastAnnotationSeverity, string> = {
  info: "#2970FF",
  warning: "#DC6803",
  critical: "#D92D20",
};

function formatAxisDate(date: string, scale: ForecastScale): string {
  try {
    const d = parseISO(date);
    if (scale === "monthly") return format(d, "MMM yy");
    if (scale === "weekly") return format(d, "d MMM");
    return format(d, "d MMM");
  } catch {
    return date;
  }
}

function formatValue(v: number, metric: ForecastMetric): string {
  if (metric === "revenue") {
    return v >= 1000 ? `€${(v / 1000).toFixed(1)}K` : `€${Math.round(v)}`;
  }
  return v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(Math.round(v));
}

/* ─── Dual legend (HISTORY | FORECAST | ANNOTATIONS) ──────────────────────── */

interface LegendProps {
  channels: ForecastChannelConfig[];
  textColor: string;
  subtleColor: string;
  annotationLayers?: AnnotationLayerToggle[];
}

function DualLegend({
  channels,
  textColor,
  subtleColor,
  annotationLayers,
}: LegendProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-6 rounded-lg border border-border-secondary bg-bg-secondary px-3 py-2 text-[11px]">
      <div className="flex items-center gap-3">
        <span
          className="font-semibold uppercase tracking-wider"
          style={{ color: subtleColor, letterSpacing: "0.08em" }}
        >
          History
        </span>
        {channels.map((ch, i) => (
          <div key={`h-${ch.name}`} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: HISTORY_PALETTE[i % HISTORY_PALETTE.length] }}
            />
            <span style={{ color: textColor }}>{ch.label}</span>
          </div>
        ))}
      </div>

      <div className="h-4 w-px bg-border-secondary" />

      <div className="flex items-center gap-3">
        <span
          className="font-semibold uppercase tracking-wider"
          style={{ color: subtleColor, letterSpacing: "0.08em" }}
        >
          Forecast
        </span>
        {channels.map((ch, i) => (
          <div key={`f-${ch.name}`} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: FORECAST_PALETTE[i % FORECAST_PALETTE.length] }}
            />
            <span style={{ color: textColor }}>{ch.label}</span>
          </div>
        ))}
      </div>

      {annotationLayers && annotationLayers.length > 0 ? (
        <>
          <div className="h-4 w-px bg-border-secondary" />

          <div className="flex items-center gap-3">
            <span
              className="font-semibold uppercase tracking-wider"
              style={{ color: subtleColor, letterSpacing: "0.08em" }}
            >
              Annotations
            </span>
            {annotationLayers.map((layer) => (
              <label
                key={`a-${layer.kind}`}
                className="flex cursor-pointer items-center gap-1.5 select-none"
                style={{ color: textColor }}
              >
                <input
                  type="checkbox"
                  checked={layer.enabled}
                  onChange={layer.onToggle}
                  aria-label={`Toggle ${layer.label} annotations`}
                  className="h-3 w-3 cursor-pointer accent-[#2970FF]"
                />
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: ANNOTATION_KIND_COLOR[layer.kind] }}
                />
                <span>{layer.label}</span>
              </label>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ─── Annotation flag label (rendered inside ReferenceDot) ────────────────── */

interface FlagLabelProps {
  viewBox?: { x: number; y: number };
  color: string;
  title: string;
  chartWidth: number;
}

function AnnotationFlag({ viewBox, color, title, chartWidth }: FlagLabelProps) {
  if (!viewBox) return null;
  const { x, y } = viewBox;
  const stemHeight = 18;
  const labelWidth = Math.min(120, Math.max(56, title.length * 6 + 12));
  const labelHeight = 16;
  // Flip the flag to the left if we're too close to the right edge.
  const flipLeft = x + labelWidth + 8 > chartWidth;
  const labelX = flipLeft ? x - labelWidth : x;
  const labelY = y - stemHeight - labelHeight;

  return (
    <g role="presentation" pointerEvents="none">
      <title>{title}</title>
      {/* Stem */}
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={y - stemHeight}
        stroke={color}
        strokeWidth={1}
      />
      {/* Flag background */}
      <rect
        x={labelX}
        y={labelY}
        width={labelWidth}
        height={labelHeight}
        rx={3}
        ry={3}
        fill={color}
        opacity={0.92}
      />
      {/* Flag text (truncate visually with CSS-ish ellipsis approximation) */}
      <text
        x={labelX + 6}
        y={labelY + labelHeight - 4}
        fontSize={10}
        fontWeight={500}
        fill="#ffffff"
      >
        {title.length > 18 ? `${title.slice(0, 17)}…` : title}
      </text>
    </g>
  );
}

/* ─── Chart ───────────────────────────────────────────────────────────────── */

export function ForecastChart({
  data,
  metric,
  scale,
  quantile,
  channels,
  height = 400,
  startForecastDate,
  annotations,
  annotationLayers,
  mode = "stacked",
}: ForecastChartProps) {
  const isGrouped = mode === "grouped";
  // In grouped mode each Bar lives on its own track (no stackId), so every
  // top is rounded. In stacked mode only the top-most channel of each stack
  // gets rounded corners.
  const historyStackId = isGrouped ? undefined : "history";
  const forecastStackId = isGrouped ? undefined : "forecast";
  const groupedRadius: [number, number, number, number] = [4, 4, 0, 0];
  const stackedTopRadius: [number, number, number, number] = [3, 3, 0, 0];
  const stackedFlatRadius: [number, number, number, number] = [0, 0, 0, 0];
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const textColor = isDark ? "#d5d7da" : "#414651";
  const subtleColor = isDark ? "#94979c" : "#717680";
  const gridColor = isDark ? "#1f242f" : "#eaecf0";
  const brushFill = isDark ? "#0a0d12" : "#fafafa";
  const today = format(new Date(), "yyyy-MM-dd");
  const boundary = startForecastDate ?? today;

  // Flatten: one row per date, with history_<ch> OR forecast_<ch> set (never both).
  const { chartData, allDates, rowTotals } = useMemo(() => {
    const dateSet = new Set<string>();
    for (const ch of channels) {
      (data[ch.name] ?? []).forEach((p) => dateSet.add(p.date));
    }
    const dates = Array.from(dateSet).sort();

    const rows = dates.map((date) => {
      const row: Record<string, string | number | null> = { date };
      const isFuture = date >= boundary;
      for (const ch of channels) {
        const point = (data[ch.name] ?? []).find((p) => p.date === date);
        // History (real_value) lives in past, Forecast (forecast_value) in future.
        // Keep them in separate dataKeys so Recharts renders two stacks with
        // different palettes.
        row[`history_${ch.name}`] = isFuture ? null : point?.real_value ?? null;
        row[`forecast_${ch.name}`] = isFuture ? point?.forecast_value ?? null : null;
      }
      return row;
    });

    // Build a per-date total used to place ReferenceDots at the top of each bar.
    const totals = new Map<string, number>();
    for (const row of rows) {
      let sum = 0;
      for (const ch of channels) {
        const hv = row[`history_${ch.name}`];
        const fv = row[`forecast_${ch.name}`];
        if (typeof hv === "number") sum += hv;
        if (typeof fv === "number") sum += fv;
      }
      totals.set(String(row.date), sum);
    }

    return { chartData: rows, allDates: dates, rowTotals: totals };
  }, [data, channels, boundary]);

  // Filter annotations to those intersecting the full data window (the brush
  // already narrows visually, but layer-toggle filtering is still the caller's
  // responsibility via the `enabled` flag on each layer).
  const visibleAnnotations = useMemo<ForecastAnnotation[]>(() => {
    if (!annotations?.length || allDates.length === 0) return [];
    const first = allDates[0];
    const last = allDates[allDates.length - 1];
    return annotations.filter((a) => {
      const end = a.endDate ?? a.annotationDate;
      return a.annotationDate <= last && end >= first;
    });
  }, [annotations, allDates]);

  // Split by rendering mode.
  const flagAnnotations = visibleAnnotations.filter(
    (a) => a.kind === "event_spike" || a.kind === "launch" || a.kind === "promotion"
  );
  const stockoutAnnotations = visibleAnnotations.filter(
    (a) => a.kind === "out_of_stock"
  );

  const baseAria =
    allDates.length > 0
      ? `${metric === "revenue" ? "Revenue" : "Sales"} forecast, ${
          channels.length
        } ${channels.length === 1 ? "channel" : "channels"}, ${scale} granularity, ${QUANTILE_LABELS[quantile]} scenario, from ${allDates[0]} to ${
          allDates[allDates.length - 1]
        }.`
      : "Empty forecast chart — no data points available.";
  const ariaSummary =
    visibleAnnotations.length > 0
      ? `${baseAria} ${visibleAnnotations.length} annotations in view.`
      : baseAria;

  // Brush default: last 90 days, if there are more than 90 points.
  const brushStartIndex =
    allDates.length > 90 ? Math.max(0, allDates.length - 90) : 0;
  const brushEndIndex = Math.max(0, allDates.length - 1);

  return (
    <div
      role="img"
      aria-label={ariaSummary}
      className="rounded-xl border border-border-secondary bg-bg-primary p-4"
    >
      <DualLegend
        channels={channels}
        textColor={textColor}
        subtleColor={subtleColor}
        annotationLayers={annotationLayers}
      />

      <div role="region" aria-label="Chart range selector">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 24, right: 16, left: 0, bottom: 0 }}
          barCategoryGap="20%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: subtleColor, fontSize: 11 }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
            tickFormatter={(d: string) => formatAxisDate(d, scale)}
            interval={Math.max(0, Math.floor(allDates.length / 10) - 1)}
          />
          <YAxis
            tick={{ fill: subtleColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={54}
            tickFormatter={(v: number) => formatValue(v, metric)}
          />
          <Tooltip
            cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
            contentStyle={{
              background: isDark ? "#0a0d12" : "#ffffff",
              border: `1px solid ${gridColor}`,
              borderRadius: 8,
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            labelStyle={{ color: subtleColor, marginBottom: 4, fontWeight: 500 }}
            labelFormatter={(label: unknown) => {
              try {
                return format(parseISO(label as string), "dd MMM yyyy");
              } catch {
                return String(label);
              }
            }}
            formatter={(value: unknown, name: unknown) => {
              const v = value as number | null;
              if (v === null || v === undefined) return ["—", String(name)];
              const n = String(name);
              const isForecast = n.startsWith("forecast_");
              const chName = n.replace("history_", "").replace("forecast_", "");
              const ch = channels.find((c) => c.name === chName);
              const suffix = isForecast
                ? ` • Forecast (${QUANTILE_LABELS[quantile]})`
                : " • Actual";
              return [
                formatValue(v, metric),
                `${ch?.label ?? chName}${suffix}`,
              ] as [string, string];
            }}
          />

          <ReferenceLine
            x={boundary}
            stroke={subtleColor}
            strokeDasharray="3 3"
            label={{
              value: "Forecast →",
              fill: subtleColor,
              fontSize: 10,
              position: "insideTopRight",
            }}
          />

          {/* HISTORY bars (blues). In stacked mode they share stackId="history"
              and only the top channel gets rounded corners; in grouped mode
              they sit side-by-side and every bar has rounded tops. */}
          {channels.map((ch, i) => (
            <Bar
              key={`h-${ch.name}`}
              dataKey={`history_${ch.name}`}
              stackId={historyStackId}
              fill={HISTORY_PALETTE[i % HISTORY_PALETTE.length]}
              radius={
                isGrouped
                  ? groupedRadius
                  : i === channels.length - 1
                    ? stackedTopRadius
                    : stackedFlatRadius
              }
              maxBarSize={24}
              isAnimationActive={false}
            />
          ))}

          {/* FORECAST bars (pinks). Same stacked vs. grouped logic as above. */}
          {channels.map((ch, i) => (
            <Bar
              key={`f-${ch.name}`}
              dataKey={`forecast_${ch.name}`}
              stackId={forecastStackId}
              fill={FORECAST_PALETTE[i % FORECAST_PALETTE.length]}
              radius={
                isGrouped
                  ? groupedRadius
                  : i === channels.length - 1
                    ? stackedTopRadius
                    : stackedFlatRadius
              }
              maxBarSize={24}
              isAnimationActive={false}
            />
          ))}

          {/* Stock-out ranges — soft red ReferenceArea */}
          {stockoutAnnotations.map((a) => {
            const end = a.endDate ?? a.annotationDate;
            return (
              <ReferenceArea
                key={`oos-${a.id}`}
                x1={a.annotationDate}
                x2={end}
                fill="#FEE4E2"
                fillOpacity={0.4}
                stroke="#F04438"
                strokeOpacity={0.25}
                ifOverflow="extendDomain"
                label={{
                  value: "●",
                  position: "insideTopRight",
                  fill: "#D92D20",
                  fontSize: 10,
                  // aria-label is accepted by Recharts labels via a pass-through
                  // `aria-label` prop; screen readers will announce the title.
                  ...({ "aria-label": a.title } as Record<string, unknown>),
                }}
              />
            );
          })}

          {/* Flag dots — event_spike / launch / promotion */}
          {flagAnnotations.map((a) => {
            const y = rowTotals.get(a.annotationDate) ?? 0;
            const color = ANNOTATION_SEVERITY_COLOR[a.severity];
            return (
              <ReferenceDot
                key={`dot-${a.id}`}
                x={a.annotationDate}
                y={y}
                r={4}
                fill={color}
                stroke="#ffffff"
                strokeWidth={1.5}
                ifOverflow="extendDomain"
                label={(labelProps: {
                  viewBox?: { x: number; y: number; width?: number };
                }) => (
                  <AnnotationFlag
                    viewBox={labelProps.viewBox}
                    color={color}
                    title={a.title}
                    chartWidth={1024}
                  />
                )}
              />
            );
          })}

          <Brush
            dataKey="date"
            height={24}
            stroke="#2970FF"
            fill={brushFill}
            travellerWidth={14}
            startIndex={brushStartIndex}
            endIndex={brushEndIndex}
            tickFormatter={(d: string) => formatAxisDate(d, scale)}
          />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
