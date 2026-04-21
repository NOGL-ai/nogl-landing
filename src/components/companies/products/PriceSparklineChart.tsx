"use client";

import { useState, useMemo } from "react";
import type { PriceHistoryPoint } from "@/types/companyProducts";

interface PriceSparklineChartProps {
  history: PriceHistoryPoint[];
  productId: string;
}

function fmtPrice(n: number): string {
  return `€${n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const PAD = 16;
const W = 600;

interface SparklineProps {
  data: Array<{ date: string; price: number }>;
  height?: number;
}

function PriceSparkline({ data, height = 140 }: SparklineProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const H = height;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  const prices = data.map((d) => d.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  const toX = (i: number) =>
    data.length === 1 ? PAD + innerW / 2 : PAD + (i / (data.length - 1)) * innerW;
  const toY = (price: number) =>
    PAD + innerH - ((price - minP) / range) * innerH;

  // Single point: flat line
  if (data.length === 1) {
    const cx = PAD + innerW / 2;
    const cy = PAD + innerH / 2;
    return (
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={`sg-single`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1={PAD}
          y1={cy}
          x2={PAD + innerW}
          y2={cy}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeDasharray="6 4"
          strokeOpacity="0.6"
        />
        <circle cx={cx} cy={cy} r="5" fill="hsl(var(--primary))" />
        <text
          x={W / 2}
          y={cy + 22}
          textAnchor="middle"
          fontSize="11"
          fill="hsl(var(--muted-foreground))"
          fontStyle="italic"
        >
          1 snapshot — updates on next scrape
        </text>
      </svg>
    );
  }

  // Build SVG path
  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.price) }));
  const linePath =
    "M " +
    points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x.toFixed(1)},${(PAD + innerH).toFixed(1)} L ${PAD},${(PAD + innerH).toFixed(1)} Z`;

  // X-axis labels — show up to 5 evenly spaced
  const labelCount = Math.min(data.length, 5);
  const labelIndices =
    labelCount === 1
      ? [0]
      : Array.from({ length: labelCount }, (_, i) =>
          Math.round((i / (labelCount - 1)) * (data.length - 1))
        );

  const gradId = `sg-multi`;

  return (
    <svg
      width="100%"
      height={H + 20}
      viewBox={`0 0 ${W} ${H + 20}`}
      preserveAspectRatio="none"
      className="overflow-visible"
      onMouseLeave={() => setHovered(null)}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((frac) => (
        <line
          key={frac}
          x1={PAD}
          y1={PAD + innerH * frac}
          x2={PAD + innerW}
          y2={PAD + innerH * frac}
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
          strokeDasharray="4 4"
        />
      ))}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Hover hit targets */}
      {points.map((p, i) => (
        <rect
          key={i}
          x={i === 0 ? PAD : (p.x + points[i - 1].x) / 2}
          y={PAD}
          width={
            i === 0
              ? (points[1]?.x ?? p.x + innerW) / 2 - PAD
              : i === points.length - 1
              ? PAD + innerW - (p.x + points[i - 1].x) / 2
              : ((points[i + 1]?.x ?? p.x) - points[i - 1].x) / 2
          }
          height={innerH}
          fill="transparent"
          onMouseEnter={() => setHovered(i)}
        />
      ))}

      {/* Hover dot */}
      {hovered !== null && (
        <>
          <line
            x1={points[hovered].x}
            y1={PAD}
            x2={points[hovered].x}
            y2={PAD + innerH}
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            strokeDasharray="3 3"
            strokeOpacity="0.5"
          />
          <circle
            cx={points[hovered].x}
            cy={points[hovered].y}
            r="5"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth="2"
          />
          {/* Tooltip */}
          {(() => {
            const tx = points[hovered].x;
            const ty = points[hovered].y;
            const tooltipW = 120;
            const tooltipH = 40;
            const tooltipX = Math.min(
              Math.max(tx - tooltipW / 2, PAD),
              PAD + innerW - tooltipW
            );
            const tooltipY = ty - tooltipH - 10 < PAD ? ty + 10 : ty - tooltipH - 10;
            return (
              <g>
                <rect
                  x={tooltipX}
                  y={tooltipY}
                  width={tooltipW}
                  height={tooltipH}
                  rx="4"
                  fill="hsl(var(--popover))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
                <text
                  x={tooltipX + tooltipW / 2}
                  y={tooltipY + 15}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="hsl(var(--popover-foreground))"
                >
                  {fmtPrice(data[hovered].price)}
                </text>
                <text
                  x={tooltipX + tooltipW / 2}
                  y={tooltipY + 30}
                  textAnchor="middle"
                  fontSize="10"
                  fill="hsl(var(--muted-foreground))"
                >
                  {fmtDateShort(data[hovered].date)}
                </text>
              </g>
            );
          })()}
        </>
      )}

      {/* X-axis labels */}
      {labelIndices.map((idx) => (
        <text
          key={idx}
          x={points[idx].x}
          y={H + 14}
          textAnchor={
            idx === 0 ? "start" : idx === data.length - 1 ? "end" : "middle"
          }
          fontSize="10"
          fill="hsl(var(--muted-foreground))"
        >
          {fmtDateShort(data[idx].date)}
        </text>
      ))}
    </svg>
  );
}

export function PriceSparklineChart({ history }: PriceSparklineChartProps) {
  const [period, setPeriod] = useState<"1m" | "3m" | "all">("all");

  const chartData = useMemo(() => {
    if (period === "all") return history;
    const cutoff = new Date();
    if (period === "1m") cutoff.setMonth(cutoff.getMonth() - 1);
    if (period === "3m") cutoff.setMonth(cutoff.getMonth() - 3);
    return history.filter((p) => new Date(p.date) >= cutoff);
  }, [history, period]);

  const isEmpty = chartData.length === 0;

  const prices = chartData.map((p) => p.price);
  const minP = prices.length ? Math.min(...prices) : null;
  const maxP = prices.length ? Math.max(...prices) : null;

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-text-tertiary">
          {minP !== null && maxP !== null && minP !== maxP && (
            <>
              <span>
                Low:{" "}
                <span className="font-medium text-text-primary">
                  {fmtPrice(minP)}
                </span>
              </span>
              <span className="text-text-tertiary/40">·</span>
              <span>
                High:{" "}
                <span className="font-medium text-text-primary">
                  {fmtPrice(maxP)}
                </span>
              </span>
            </>
          )}
        </div>
        {/* Period selector */}
        <div className="flex items-center gap-0.5 rounded-md border p-0.5">
          {(["1m", "3m", "all"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-0.5 text-xs rounded font-medium transition-colors ${
                period === p
                  ? "bg-bg-brand-solid text-white"
                  : "text-text-tertiary hover:text-text-primary"
              }`}
            >
              {p === "all" ? "All" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full">
        {isEmpty ? (
          <div className="h-36 flex items-center justify-center text-sm text-text-tertiary">
            No price data for this period
          </div>
        ) : (
          <PriceSparkline data={chartData} height={140} />
        )}
      </div>

      {/* Footer */}
      {!isEmpty && (
        <p className="text-[10px] text-text-tertiary/60 text-right">
          {chartData.length} data point{chartData.length !== 1 ? "s" : ""}
          {period !== "all" ? ` · last ${period}` : ""}
        </p>
      )}
    </div>
  );
}
