"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { FilterBar } from "@/components/companies/FilterBar";
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

  // Available channels (populated from initial unfiltered load)
  const [allChannels, setAllChannels] = useState<string[]>([]);
  // Active filters
  const [channelFilter, setChannelFilter] = useState<string | null>(null);

  function buildUrl(channel: string | null, page = 1) {
    const params = new URLSearchParams({ page: String(page) });
    if (channel) params.set("channel", channel);
    return `/api/companies/${slug}/assets?${params.toString()}`;
  }

  // Load (or reload on filter change)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState((c) => ({ ...c, loading: true, error: null, page: 1 }));
      try {
        const data = await fetchJson<CompanyAssetsResponse>(buildUrl(channelFilter, 1));
        if (!cancelled) {
          setState({ data, error: null, loading: false, loadingMore: false, page: 1 });
          // Populate channel list from all items on first unfiltered load
          if (!channelFilter) {
            const channels = [...new Set(data.items.map((i) => i.channel).filter(Boolean))];
            setAllChannels(channels);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setState((c) => ({
            ...c,
            error: error instanceof Error ? error.message : "Could not load asset data.",
            loading: false,
          }));
        }
      }
    }
    void load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, channelFilter]);

  const loadMore = useCallback(async () => {
    if (!state.data || state.loadingMore) return;
    const nextPage = state.page + 1;
    if (nextPage > state.data.pagination.totalPages) return;

    setState((c) => ({ ...c, loadingMore: true }));
    try {
      const more = await fetchJson<CompanyAssetsResponse>(buildUrl(channelFilter, nextPage));
      setState((c) => ({
        ...c,
        loadingMore: false,
        page: nextPage,
        data: c.data ? { ...more, items: [...c.data.items, ...more.items] } : more,
      }));
    } catch {
      setState((c) => ({ ...c, loadingMore: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, state.data, state.loadingMore, state.page, channelFilter]);

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

  // Channel breakdown from current loaded items
  const channelCounts = data.items.reduce<Record<string, number>>((acc, item) => {
    acc[item.channel] = (acc[item.channel] ?? 0) + 1;
    return acc;
  }, {});
  const channels = Object.entries(channelCounts).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-6">
      <StatsBar data={data} />

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <FilterBar
          filters={[
            {
              key: "channel",
              label: "All Platforms",
              options: allChannels.map((ch) => ({
                label: ch.charAt(0).toUpperCase() + ch.slice(1),
                value: ch,
              })),
            },
          ]}
          values={{ channel: channelFilter }}
          onChange={(_key, v) => setChannelFilter(v)}
          resultCount={data.pagination.total}
          resultLabel="assets"
          right={
            state.loading ? (
              <span className="text-xs text-muted-foreground animate-pulse">Filtering…</span>
            ) : undefined
          }
        />
      </div>

      {/* Channel breakdown table */}
      {channels.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold text-foreground">Channel Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Channel
                  </th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Assets
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {channels.map(([channel, count]) => (
                  <tr
                    key={channel}
                    className={`cursor-pointer hover:bg-muted/20 transition-colors ${channelFilter === channel ? "bg-primary/5" : ""}`}
                    onClick={() => setChannelFilter(channelFilter === channel ? null : channel)}
                  >
                    <td className="px-5 py-3 font-medium text-foreground">{channel}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                      {count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Asset grid */}
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
