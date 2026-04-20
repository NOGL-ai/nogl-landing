"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { RecentCreative } from "@/app/api/ads-events/overview/route";

const PLATFORM_LABELS: Record<string, string> = {
  META_ADS_LIBRARY: "Meta",
  INSTAGRAM: "IG",
  FACEBOOK: "FB",
  TIKTOK: "TikTok",
};

function HookScoreBadge({ score }: { score: string }) {
  const n = parseFloat(score);
  const variant =
    n >= 7 ? "success" : n >= 4 ? "warning" : "error";
  const cls = {
    success: "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300",
    warning: "bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300",
    error: "bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300",
  }[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        cls,
      )}
    >
      {n.toFixed(1)}
    </span>
  );
}

export function CreativeCard({ creative }: { creative: RecentCreative }) {
  const imgSrc = creative.thumbnail_url ?? creative.media_url;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border-secondary bg-bg-primary transition-shadow hover:shadow-md">
      <div className="relative h-40 w-full bg-bg-secondary">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={creative.caption ?? "Ad creative"}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-text-tertiary">
            No preview
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-600 dark:bg-brand-950 dark:text-brand-300">
            {PLATFORM_LABELS[creative.platform] ?? creative.platform}
          </span>
          {creative.hook_score && <HookScoreBadge score={creative.hook_score} />}
        </div>
        {creative.handle && (
          <p className="truncate text-xs font-medium text-text-secondary">
            @{creative.handle}
          </p>
        )}
        {creative.caption && (
          <p className="line-clamp-2 text-xs text-text-tertiary">{creative.caption}</p>
        )}
        <p className="text-[10px] text-text-quaternary">
          {new Date(creative.first_seen_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
