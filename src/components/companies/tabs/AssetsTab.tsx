"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

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
  active?: boolean;
};

type AssetsState = {
  data: CompanyAssetsResponse | null;
  error: string | null;
  loading: boolean;
  loadingMore: boolean;
  page: number;
};

function StatsBar({ data }: { data: CompanyAssetsResponse }) {
  const stats = [
    { label: "Instagram Followers", value: formatNumber(data.ig_followers) },
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

export function AssetsTab({ slug }: AssetsTabProps) {
  const [state, setState] = useState<AssetsState>({
    data: null,
    error: null,
    loading: false,
    loadingMore: false,
    page: 1,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((current) => ({ ...current, loading: true, error: null }));

      try {
        const data = await fetchJson<CompanyAssetsResponse>(`/api/companies/${slug}/assets?page=1`);
        if (!cancelled) {
          setState({ data, error: null, loading: false, loadingMore: false, page: 1 });
        }
      } catch (error) {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            error: error instanceof Error ? error.message : "Could not load asset data.",
            loading: false,
          }));
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const loadMore = useCallback(async () => {
    if (!state.data || state.loadingMore) return;
    const nextPage = state.page + 1;
    if (nextPage > state.data.pagination.totalPages) return;

    setState((current) => ({ ...current, loadingMore: true }));

    try {
      const more = await fetchJson<CompanyAssetsResponse>(`/api/companies/${slug}/assets?page=${nextPage}`);
      setState((current) => ({
        ...current,
        loadingMore: false,
        page: nextPage,
        data: current.data
          ? {
              ...more,
              items: [...current.data.items, ...more.items],
            }
          : more,
      }));
    } catch {
      setState((current) => ({ ...current, loadingMore: false }));
    }
  }, [slug, state.data, state.loadingMore, state.page]);

  if (state.loading && !state.data) {
    return <PanelSkeleton rows={3} grid="grid-cols-1 md:grid-cols-3" />;
  }

  if (state.error) {
    return <InlineError message={state.error} />;
  }

  if (!state.data) {
    return null;
  }

  const { data } = state;

  // Count items by channel
  const channelCounts = data.items.reduce<Record<string, number>>((acc, item) => {
    acc[item.channel] = (acc[item.channel] ?? 0) + 1;
    return acc;
  }, {});
  const channels = Object.entries(channelCounts).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-6">
      <StatsBar data={data} />

      {/* Channel breakdown */}
      {channels.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold text-foreground">Channel Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Channel</th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Assets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {channels.map(([channel, count]) => (
                  <tr key={channel} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{channel}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {data.items.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">No assets collected yet</Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.items.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
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
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">{data.company.name}</p>
                    <p className="text-xs text-muted-foreground">{item.channel}</p>
                  </div>
                  <p className="ml-2 shrink-0 text-xs text-muted-foreground">{formatDateTime(item.published_at)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Load More button */}
          {state.page < data.pagination.totalPages && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={state.loadingMore}
                className="rounded-full border border-border bg-muted/40 px-8 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {state.loadingMore ? "Loading..." : "+ Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
