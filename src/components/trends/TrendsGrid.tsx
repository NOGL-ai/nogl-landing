"use client";

import { TrendCard } from "./TrendCard";
import type { TrendCard as TrendCardData } from "@/actions/trends";

interface Props {
  title: string;
  cards: TrendCardData[];
  lang: string;
  isCompany?: boolean;
  onRefresh?: () => void;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="h-8 animate-pulse rounded bg-muted" />
      <div className="flex justify-between">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function TrendsGrid({ title, cards, lang, isCompany = false, onRefresh }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Trends refresh nightly — your first snapshot will appear tomorrow.
          </p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="rounded-md bg-brand-solid px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-solid_hover transition-colors"
            >
              Refresh now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <TrendCard key={card.id} card={card} lang={lang} isCompany={isCompany} />
          ))}
        </div>
      )}
    </section>
  );
}

export function TrendsGridSkeleton({ title }: { title: string }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  );
}
