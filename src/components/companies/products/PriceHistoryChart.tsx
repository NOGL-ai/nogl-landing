"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";

import { Card } from "@/components/ui/card";
import type { PriceHistoryPoint } from "@/types/companyProducts";

type ChartPoint = {
  date: string;
  label: string;
  shortLabel: string;
  price: number;
  x: number;
  y: number;
};

function fmtPrice(n: number): string {
  return `€${n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function PriceHistoryChart({
  history,
  productId,
}: {
  history: PriceHistoryPoint[];
  productId: string;
}) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const geometry = useMemo(() => {
    if (history.length === 0) return null;

    const W = 720;
    const H = 260;
    const pad = { top: 16, right: 20, bottom: 36, left: 80 };
    const iW = W - pad.left - pad.right;
    const iH = H - pad.top - pad.bottom;

    const prices = history.map((p) => p.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const spread = maxP - minP || Math.max(1, maxP * 0.1);
    const yMin = Math.max(0, minP - spread * 0.15);
    const yMax = maxP + spread * 0.15;

    const points: ChartPoint[] = history.map((p, i) => {
      const x =
        pad.left +
        (history.length === 1
          ? iW / 2
          : (i / (history.length - 1)) * iW);
      const ratio = yMax === yMin ? 0.5 : (p.price - yMin) / (yMax - yMin);
      const y = pad.top + iH - ratio * iH;
      const d = new Date(p.date);
      return {
        date: p.date,
        label: d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        shortLabel: d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        price: p.price,
        x,
        y,
      };
    });

    const linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${H - pad.bottom} L ${points[0].x} ${H - pad.bottom} Z`;

    const tickCount = 4;
    const yTicks = Array.from({ length: tickCount }, (_, i) => {
      const val = yMin + ((yMax - yMin) / (tickCount - 1)) * i;
      return {
        val,
        y: pad.top + iH - (i / (tickCount - 1)) * iH,
      };
    });

    return { W, H, pad, points, linePath, areaPath, yTicks };
  }, [history]);

  if (!mounted) {
    return <div className="h-64 animate-pulse rounded-xl bg-bg-tertiary" />;
  }

  if (history.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-border-primary bg-bg-secondary">
        <p className="text-sm text-text-tertiary">No price history available</p>
      </div>
    );
  }

  if (history.length === 1) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-border-primary bg-bg-secondary">
        <p className="text-sm text-text-tertiary">
          Price History: {fmtPrice(history[0].price)} (no changes tracked)
        </p>
      </div>
    );
  }

  const activePoint =
    activeIndex != null && geometry ? geometry.points[activeIndex] : null;

  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const labelColor = isDark ? "#9ca3af" : "#6b7280";
  const bgColor = isDark ? "#111827" : "#ffffff";

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden">
        <svg
          id={`price-history-chart-${productId}`}
          viewBox={`0 0 ${geometry!.W} ${geometry!.H}`}
          className="h-64 w-full"
          role="img"
          aria-label="Price over time"
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient
              id={`price-grad-${productId}`}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Grid lines + y-axis labels */}
          {geometry!.yTicks.map((tick) => (
            <g key={`${tick.y}-${tick.val}`}>
              <line
                x1={geometry!.pad.left}
                x2={geometry!.W - geometry!.pad.right}
                y1={tick.y}
                y2={tick.y}
                stroke={gridColor}
                strokeDasharray="4 4"
              />
              <text
                x={geometry!.pad.left - 8}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="12"
                fill={labelColor}
              >
                {fmtPrice(tick.val)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path
            d={geometry!.areaPath}
            fill={`url(#price-grad-${productId})`}
          />

          {/* Line */}
          <path
            d={geometry!.linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points + hover zones */}
          {geometry!.points.map((pt, i) => (
            <g key={`${pt.date}-${i}`}>
              {/* Hover column */}
              <line
                x1={pt.x}
                x2={pt.x}
                y1={geometry!.pad.top}
                y2={geometry!.H - geometry!.pad.bottom}
                stroke="#3b82f6"
                strokeOpacity={activeIndex === i ? 0.15 : 0}
              />
              {/* Dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={activeIndex === i ? 5 : 3}
                fill="#3b82f6"
                stroke={bgColor}
                strokeWidth="2"
                onMouseEnter={() => setActiveIndex(i)}
              />
            </g>
          ))}

          {/* X-axis labels */}
          {geometry!.points.map((pt, i) => {
            const step = Math.max(
              1,
              Math.ceil(geometry!.points.length / 6)
            );
            const show =
              i % step === 0 || i === geometry!.points.length - 1;
            return (
              <text
                key={`lbl-${i}`}
                x={pt.x}
                y={geometry!.H - 8}
                textAnchor="middle"
                fontSize="11"
                fill={labelColor}
              >
                {show ? pt.shortLabel : ""}
              </text>
            );
          })}
        </svg>
      </Card>

      {/* Tooltip row */}
      {activePoint && (
        <div className="flex items-center justify-between rounded-lg border border-border-primary/60 bg-bg-secondary px-3 py-2 text-sm">
          <span className="text-text-tertiary">{activePoint.label}</span>
          <span className="font-semibold text-text-primary">
            {fmtPrice(activePoint.price)}
          </span>
        </div>
      )}

      <p className="text-xs text-text-tertiary">
        {history.length} data point{history.length !== 1 ? "s" : ""} tracked
      </p>
    </div>
  );
}
