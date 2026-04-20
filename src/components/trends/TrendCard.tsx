"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TrendCard as TrendCardData } from "@/actions/trends";

interface Props {
  card: TrendCardData;
  lang: string;
  /** Whether this is a company card (links to company page) */
  isCompany?: boolean;
}

const BADGE_VARIANT: Record<
  TrendCardData["badge"],
  "success" | "warning" | "secondary"
> = {
  extreme: "success",
  fast: "warning",
  steady: "secondary",
};

const BADGE_LABEL: Record<TrendCardData["badge"], string> = {
  extreme: "Extreme growth",
  fast: "Fast growth",
  steady: "Steady",
};

const SPARKLINE_COLOR: Record<TrendCardData["badge"], string> = {
  extreme: "#22c55e",
  fast: "#f59e0b",
  steady: "#94a3b8",
};

export function TrendCard({ card, lang, isCompany = false }: Props) {
  const sparkData = card.sparkline.map((v, i) => ({ i, v }));
  const hasSparkline = sparkData.length > 1 && sparkData.some((d) => d.v > 0);

  const inner = (
    <div className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand hover:bg-card/80">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isCompany && card.logoUrl && (
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-border bg-background">
              <Image
                src={card.logoUrl}
                alt={card.name}
                fill
                className="object-contain p-0.5"
                unoptimized
              />
            </div>
          )}
          {isCompany && !card.logoUrl && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-xs font-bold text-muted-foreground">
              {card.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="truncate text-sm font-semibold text-foreground">
            {card.name}
          </span>
        </div>
        <Badge variant={BADGE_VARIANT[card.badge]} size="sm">
          {BADGE_LABEL[card.badge]}
        </Badge>
      </div>

      {/* Sparkline */}
      {hasSparkline ? (
        <div className="h-8 w-full">
          <ResponsiveContainer width="100%" height={32}>
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={SPARKLINE_COLOR[card.badge]}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-8" />
      )}

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className={cn("font-medium", card.growthMetric > 0 ? "text-green-500" : "text-muted-foreground")}>
          {card.growthLabel}
        </span>
        <span>{card.totalProducts.toLocaleString()} total</span>
      </div>
    </div>
  );

  if (isCompany && card.slug) {
    return (
      <Link href={`/${lang}/companies/${card.slug}`} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
