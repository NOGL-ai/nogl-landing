import { TrendDown01 as TrendingDown, TrendUp01 as TrendingUp, Minus } from '@untitledui/icons';
import React from "react";

import { cn } from "@/lib/utils";

interface Props {
  currentPrice: number;
  proposedPrice: number | null;
  className?: string;
}

export function DeltaChip({ currentPrice, proposedPrice, className }: Props) {
  if (proposedPrice === null) return null;

  const delta = proposedPrice - currentPrice;
  const deltaPct = currentPrice > 0 ? (delta / currentPrice) * 100 : 0;

  const isNeutral = Math.abs(delta) < 0.01;
  const isDown = delta < 0;

  if (isNeutral) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-text-tertiary", className)}>
        <Minus className="h-3 w-3" />
        No change
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        isDown
          ? "bg-success-secondary text-success-primary"
          : "bg-error-secondary text-error-primary",
        className
      )}
    >
      {isDown ? (
        <TrendingDown className="h-3 w-3" />
      ) : (
        <TrendingUp className="h-3 w-3" />
      )}
      {delta > 0 ? "+" : ""}
      {delta.toFixed(2)} ({deltaPct > 0 ? "+" : ""}
      {deltaPct.toFixed(1)}%)
    </span>
  );
}
