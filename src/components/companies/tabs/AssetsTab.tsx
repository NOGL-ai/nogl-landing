"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { FilterBar } from "@/components/companies/FilterBar";
import type { CompanyAssetDTO, CompanyAssetsResponse } from "@/types/company";
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

function getFrequencyLabel(countPerMonth: number): { label: string; color: string } {
  if (countPerMonth === 0) return { label: "N/A", color: "text-text-disabled" };
  if (countPerMonth < 2) return { label: "Infrequent", color: "text-text-tertiary" };
  if (countPerMonth < 8) return { label: "Regular", color: "text-text-secondary" };
  return { label: "Frequent", color: "text-text-brand-secondary" };
}

function StatsBar({ data }: { data: CompanyAssetsResponse }) {
  const mostLiked =
    data.items
      .filter((a) => typeof a.likes === "number")
      .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))[0] ?? null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border-primary bg-bg-primary p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
            Instagram Followers
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
            {data.ig_followers != null ? formatNumber(data.ig_followers) : "N/A"}
          </p>
        </div>
        <div className="rounded-xl border border-border-primary bg-bg-primary p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
            Avg. Likes
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
            {data.ig_avg_likes != null ? formatNumber(data.ig_avg_likes) : "N/A"}
          </p>
        </div>
        <div className="rounded-xl border border-border-primary bg-bg-primary p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
            Total Assets
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
            {formatNumber(data.pagination.total)}
          </p>
        </div>
      </div>

      {mostLiked && (
        <div className="rounded-xl border border-border-primary bg-bg-primary p-5 shadow-xs">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
            Most-liked post
          </p>
          <div className="flex gap-4">
            {mostLiked.thumbnail_url && (
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-bg-tertiary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mostLiked.thumbnail_url}
                  alt="Most liked"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm text-text-secondary">
                {mostLiked.caption ?? "—"}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-text-tertiary">
                {mostLiked.likes != null && <span>❤ {mostLiked.likes.toLocaleString()}</span>}
                {mostLiked.comments != null && (
                  <span>💬 {mostLiked.comments.toLocaleString()}</span>
                )}
                {mostLiked.published_at && <span>{formatDateTime(mostLiked.published_at)}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
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

  const [allChannels, setAllChannels] = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<CompanyAssetDTO | null>(null);

  function buildUrl(channel: string | null, page = 1) {
    const params = new URLSearchParams({ page: String(page) });
    if (channel) params.set("channel", channel);
    return `/api/companies/${slug}/assets?${params.toString()}`;
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState((c) => ({ ...c, loading: true, error: null, page: 1 }));
      try {
        const data = await fetchJson<CompanyAssetsResponse>(buildUrl(channelFilter, 1));
        if (!cancelled) {
          setState({ data, error: null, loading: false, loadingMore: false, page: 1 });
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
    return () => {
      cancelled = true;
    };
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

  const channelCounts = data.items.reduce<Record<string, number>>((acc, item) => {
    acc[item.channel] = (acc[item.channel] ?? 0) + 1;
    return acc;
  }, {});
  const channels = Object.entries(channelCounts).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-6">
      <StatsBar data={data} />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border-primary bg-bg-secondary px-4 py-3">
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
              <span className="animate-pulse text-xs text-text-tertiary">Filtering…</span>
            ) : undefined
          }
        />
      </div>

      {/* Channel breakdown */}
      {channels.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border-primary bg-bg-primary shadow-xs">
          <div className="border-b border-border-primary px-5 py-3">
            <h3 className="text-sm font-semibold text-text-primary">Channel Breakdown</h3>
          </div>
          <div className="divide-y divide-border-primary">
            {channels.map(([channel, count]) => {
              const perWeek = (count / 4).toFixed(2);
              const freq = getFrequencyLabel(count / 4);
              const isActive = channelFilter === channel;
              return (
                <div
                  key={channel}
                  className={`flex cursor-pointer items-center gap-4 px-5 py-3 transition-colors hover:bg-bg-secondary ${isActive ? "bg-brand-50" : ""}`}
                  onClick={() => setChannelFilter(isActive ? null : channel)}
                >
                  <div className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                  <span
                    className={`flex-1 text-sm font-medium capitalize ${isActive ? "text-text-brand-secondary" : "text-text-primary"}`}
                  >
                    {channel.replace(/_/g, " ")}
                  </span>
                  <span className={`text-xs ${freq.color}`}>{freq.label}</span>
                  <span className="tabular-nums text-xs text-text-tertiary">{perWeek}/wk</span>
                  <span className="w-8 text-right text-xs font-semibold tabular-nums text-text-primary">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Asset grid */}
      {data.items.length === 0 ? (
        <div className="rounded-xl border border-border-primary bg-bg-primary p-6 text-sm text-text-tertiary">
          No assets collected yet
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.items.map((item) => (
              <div
                key={item.id}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border-primary bg-bg-primary shadow-xs transition-all hover:border-border-secondary hover:shadow-md"
                onClick={() => setSelectedAsset(item)}
              >
                <div className="relative aspect-square overflow-hidden bg-bg-tertiary">
                  {item.thumbnail_url ? (
                    <Image
                      src={item.thumbnail_url}
                      alt={item.caption ?? `${item.channel} asset`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
                      <div className="text-2xl">
                        {item.channel === "instagram"
                          ? "📸"
                          : item.channel === "meta_ads"
                            ? "📣"
                            : item.channel === "email"
                              ? "✉️"
                              : "🖼️"}
                      </div>
                      <p className="line-clamp-3 text-center text-xs text-text-tertiary">
                        {item.caption ?? "No preview"}
                      </p>
                    </div>
                  )}
                  {item.thumbnail_url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/0 transition-colors group-hover:bg-bg-primary/40">
                      <span className="rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                        View
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium capitalize text-text-tertiary">
                      {item.channel?.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {formatDateTime(item.published_at)}
                    </span>
                  </div>
                  {item.caption && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-text-secondary">
                      {item.caption}
                    </p>
                  )}
                  {(item.likes != null || item.comments != null) && (
                    <div className="mt-1 flex items-center gap-3 text-xs text-text-tertiary">
                      {item.likes != null && <span>❤ {item.likes.toLocaleString()}</span>}
                      {item.comments != null && <span>💬 {item.comments.toLocaleString()}</span>}
                    </div>
                  )}
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
                className="rounded-full border border-border-primary bg-bg-secondary px-8 py-2.5 text-sm font-medium text-text-primary shadow-xs transition-colors hover:bg-bg-tertiary disabled:opacity-50"
              >
                {state.loadingMore ? "Loading..." : "+ Load More"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Asset detail modal */}
      {selectedAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedAsset(null)}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border-primary bg-bg-primary shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-bg-secondary text-text-tertiary transition-colors hover:text-text-primary"
              onClick={() => setSelectedAsset(null)}
            >
              ✕
            </button>

            {selectedAsset.thumbnail_url && (
              <div className="relative aspect-video w-full bg-bg-tertiary">
                <Image
                  src={selectedAsset.thumbnail_url}
                  alt={selectedAsset.caption ?? "Asset"}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}

            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{data.company.name}</p>
                  <p className="text-xs capitalize text-text-tertiary">
                    {selectedAsset.channel?.replace(/_/g, " ")} ·{" "}
                    {formatDateTime(selectedAsset.published_at)}
                  </p>
                </div>
                {selectedAsset.url && (
                  <a
                    href={selectedAsset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-text-brand-secondary hover:underline"
                  >
                    View original →
                  </a>
                )}
              </div>

              {selectedAsset.caption && (
                <p className="text-sm leading-relaxed text-text-secondary">
                  {selectedAsset.caption}
                </p>
              )}

              <div className="flex items-center gap-4 border-t border-border-primary pt-4">
                {selectedAsset.likes != null && (
                  <div className="text-center">
                    <p className="text-xs text-text-tertiary">Likes</p>
                    <p className="text-base font-semibold tabular-nums text-text-primary">
                      {selectedAsset.likes.toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedAsset.comments != null && (
                  <div className="text-center">
                    <p className="text-xs text-text-tertiary">Comments</p>
                    <p className="text-base font-semibold tabular-nums text-text-primary">
                      {selectedAsset.comments.toLocaleString()}
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-xs text-text-tertiary">Channel</p>
                  <p className="text-base font-semibold capitalize text-text-primary">
                    {selectedAsset.channel?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
