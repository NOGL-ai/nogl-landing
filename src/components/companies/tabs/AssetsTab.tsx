"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import type { CompanyAssetsResponse } from "@/types/company";
import {
  fetchJson,
  formatDateTime,
  formatNumber,
  InlineError,
  PanelSkeleton,
} from "./shared";

type AssetsTabProps = {
  slug: string;
  active: boolean;
};

type AssetsState = {
  data: CompanyAssetsResponse | null;
  error: string | null;
  loading: boolean;
};

function StatsBar({ data }: { data: CompanyAssetsResponse }) {
  const stats = [
    { label: "Followers", value: formatNumber(data.ig_followers) },
    { label: "Avg Likes", value: formatNumber(data.ig_avg_likes) },
    { label: "Assets", value: formatNumber(data.ig_asset_count) },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {stat.label}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}

export function AssetsTab({ slug, active }: AssetsTabProps) {
  const [state, setState] = useState<AssetsState>({
    data: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    if (!active || state.data || state.loading) {
      return;
    }

    let cancelled = false;

    async function load() {
      setState((current) => ({ ...current, loading: true, error: null }));

      try {
        const data = await fetchJson<CompanyAssetsResponse>(`/api/companies/${slug}/assets`);
        if (!cancelled) {
          setState({ data, error: null, loading: false });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            error: error instanceof Error ? error.message : "Could not load asset data.",
            loading: false,
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [active, slug, state.data, state.loading]);

  if (state.loading && !state.data) {
    return <PanelSkeleton rows={3} grid="grid-cols-1 md:grid-cols-3" />;
  }

  if (state.error) {
    return <InlineError message={state.error} />;
  }

  if (!state.data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <StatsBar data={state.data} />

      {state.data.items.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">No assets collected yet</Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {state.data.items.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card"
            >
              <div className="relative aspect-[4/5] bg-muted">
                {item.thumbnail_url ? (
                  <Image
                    src={item.thumbnail_url}
                    alt={item.caption ?? `${item.channel} asset`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized={true}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No preview
                  </div>
                )}
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-4 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em]">
                    {item.channel}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em]">
                    {item.asset_type}
                  </span>
                </div>
                <p className="mt-3 text-sm text-white/85">
                  {formatDateTime(item.published_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
