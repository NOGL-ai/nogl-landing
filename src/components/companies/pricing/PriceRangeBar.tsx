"use client";

import { fmtPrice } from "./utils";

interface PriceRangeBarProps {
  min: number;
  max: number;
  globalMin: number;
  globalMax: number;
}

/**
 * Inline price-range bar used in the Product Types table.
 * Shows min/max labels with a proportional filled segment.
 */
export function PriceRangeBar({ min, max, globalMin, globalMax }: PriceRangeBarProps) {
  const range = Math.max(globalMax - globalMin, 1);
  const left = ((min - globalMin) / range) * 100;
  const width = Math.max(((max - min) / range) * 100, 3);

  return (
    <div className="flex items-center gap-2">
      <span className="w-14 text-right text-xs text-muted-foreground">{fmtPrice(min)}</span>
      <div className="relative h-1.5 w-20 flex-shrink-0 rounded-full bg-muted">
        <div
          className="absolute h-1.5 rounded-full bg-primary/60"
          style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
        />
      </div>
      <span className="w-14 text-xs text-muted-foreground">{fmtPrice(max)}</span>
    </div>
  );
}
