"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AssetCard } from "./AssetCard";
import { AssetDetailModal } from "./AssetDetailModal";
import { PresetChips, type PresetKey } from "./PresetChips";
import type {
	AssetStatsByType,
	AssetTypeName,
	MarketingAssetListItem,
	MarketingAssetListResponse,
} from "@/types/marketing-asset";

type LibraryTab = AssetTypeName | "SMS";

const TYPE_TABS: Array<{ key: LibraryTab; label: string }> = [
	{ key: "EMAIL", label: "Emails" },
	{ key: "HOMEPAGE", label: "Homepages" },
	{ key: "HOMEPAGE_MOBILE", label: "Mobile Homepages" },
	{ key: "INSTAGRAM", label: "Instagram" },
	{ key: "SMS", label: "SMS" },
	{ key: "META_AD", label: "Meta Ads" },
];

const TAB_CONTEXT: Record<Exclude<LibraryTab, "SMS">, string> = {
	EMAIL: "Emails are sourced from company marketing outreach.",
	HOMEPAGE: "Homepage screenshots are detected monitoring the company's website.",
	HOMEPAGE_MOBILE:
		"Mobile homepage screenshots are detected monitoring the company's website on mobile devices.",
	INSTAGRAM: "Instagram posts are detected from the company's Instagram profile.",
	META_AD: "Meta Ads are sourced from the company's ads profile.",
	YOUTUBE_AD: "YouTube ads are ingested from public ad libraries.",
	TIKTOK_AD: "TikTok ads are ingested from public ad libraries.",
};

function formatRangeLabel(from: string, to: string): string {
	if (!from && !to) return "All dates";
	try {
		const a = from ? new Date(from) : null;
		const b = to ? new Date(to) : null;
		const fmt = (d: Date) =>
			d.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
		if (a && b) return `${fmt(a)} — ${fmt(b)}`;
		if (a) return `From ${fmt(a)}`;
		if (b) return `Until ${fmt(b)}`;
	} catch {
		/* ignore */
	}
	return "All dates";
}

export function MarketingAssetLibrary({
	initialStats,
	lang,
}: {
	initialStats: AssetStatsByType | null;
	lang: string;
}) {
	const [stats] = useState<AssetStatsByType | null>(initialStats);
	const [items, setItems] = useState<MarketingAssetListItem[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [tab, setTab] = useState<LibraryTab>("EMAIL");
	const [brandSlug, setBrandSlug] = useState<string | undefined>(undefined);
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [preset, setPreset] = useState<PresetKey | null>(null);
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	const brandOptions = useMemo(() => stats?.brands ?? [], [stats]);

	useEffect(() => {
		const t = setTimeout(() => setSearch(searchInput), 280);
		return () => clearTimeout(t);
	}, [searchInput]);

	const fetchPage = useCallback(
		async (nextPage: number, mode: "replace" | "append") => {
			if (tab === "SMS") {
				setItems([]);
				setTotal(0);
				setError(null);
				setLoading(false);
				setLoadingMore(false);
				setPage(1);
				return;
			}

			if (mode === "replace") setLoading(true);
			else setLoadingMore(true);
			setError(null);

			const params = new URLSearchParams();
			params.set("assetType", tab);
			if (brandSlug) params.set("brandSlug", brandSlug);
			if (search.trim()) params.set("search", search.trim());
			if (preset) params.set("preset", preset);
			if (from) params.set("from", from);
			if (to) params.set("to", to);
			params.set("page", String(nextPage));
			params.set("pageSize", "24");
			params.set("sort", "newest");

			try {
				const res = await fetch(`/api/marketing-assets?${params.toString()}`);
				if (!res.ok) throw new Error(`${res.status}`);
				const data = (await res.json()) as MarketingAssetListResponse;
				setTotal(data.total);
				setPage(nextPage);
				if (mode === "append") {
					setItems((prev) => [...prev, ...data.items]);
				} else {
					setItems(data.items);
				}
			} catch (e) {
				setError((e as Error).message);
				if (mode === "replace") {
					setItems([]);
					setTotal(0);
				}
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[tab, brandSlug, search, preset, from, to],
	);

	useEffect(() => {
		void fetchPage(1, "replace");
	}, [fetchPage]);

	const openAsset = (id: string) => {
		setSelectedId(id);
		setModalOpen(true);
	};

	const contextLine =
		tab === "SMS"
			? "SMS captures are not stored in this catalog yet. Connect a telephony / SMS provider to ingest message creatives."
			: TAB_CONTEXT[tab];

	const rangeLabel = formatRangeLabel(from, to);
	const hasMore = tab !== "SMS" && items.length < total;

	return (
		<div className="min-h-screen bg-bg-primary">
			<div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight text-text-primary">
							Marketing Asset Library
						</h1>
						<p className="mt-1 max-w-xl text-sm text-text-tertiary">
							Browse competitor creatives across email, site, social, and paid ads — filtered like a
							research workspace.
						</p>
					</div>
					<details className="w-full shrink-0 rounded-lg border border-border-primary bg-bg-primary px-3 py-2 text-sm sm:max-w-xs">
						<summary className="cursor-pointer font-medium text-text-primary">How to use</summary>
						<p className="mt-2 text-text-tertiary">
							Pick a channel tab, narrow by company and date, optionally apply a preset, then open any
							card for the full asset. Use{" "}
							<Link
								className="text-text-brand underline underline-offset-2"
								href={`/${lang}/marketing-assets/pipeline`}
							>
								Ingestion health
							</Link>{" "}
							to monitor scrapers.
						</p>
					</details>
				</div>

				<div className="mb-1 border-b border-border-primary">
					<div className="flex flex-wrap gap-0 overflow-x-visible pb-px">
						{TYPE_TABS.map((t) => {
							const active = tab === t.key;
							const count =
								t.key === "SMS" ? undefined : stats?.byType[t.key as AssetTypeName];
							return (
								<button
									key={t.key}
									type="button"
									onClick={() => {
										setPreset(null);
										setTab(t.key);
									}}
									className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition sm:px-4 ${
										active
											? "border-border-brand text-text-primary"
											: "border-transparent text-text-tertiary hover:text-text-primary"
									}`}
								>
									<span>{t.label}</span>
									{typeof count === "number" ? (
										<span className="ml-1 text-xs font-normal text-text-tertiary">
											({count.toLocaleString()})
										</span>
									) : null}
								</button>
							);
						})}
					</div>
				</div>

				<div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
					<span className="font-medium uppercase tracking-wide">Range</span>
					<input
						type="date"
						value={from}
						onChange={(e) => setFrom(e.target.value)}
						className="h-9 rounded-md border border-border-primary bg-bg-primary px-2 text-text-primary"
						aria-label="Captured from"
					/>
					<span>—</span>
					<input
						type="date"
						value={to}
						onChange={(e) => setTo(e.target.value)}
						className="h-9 rounded-md border border-border-primary bg-bg-primary px-2 text-text-primary"
						aria-label="Captured to"
					/>
					<span className="rounded-md border border-border-primary bg-bg-secondary px-2 py-1 font-medium text-text-primary">
						{rangeLabel}
					</span>
				</div>

				<div className="mb-4 mt-4 flex flex-col gap-3">
					<div className="grid gap-3 text-xs font-medium uppercase tracking-wide text-text-tertiary sm:grid-cols-2 lg:grid-cols-3">
						<div className="flex min-w-0 flex-col gap-1 normal-case">
							<span className="text-xs uppercase tracking-wide text-text-tertiary">Company</span>
							<select
								value={brandSlug ?? ""}
								onChange={(e) => setBrandSlug(e.target.value || undefined)}
								className="h-9 w-full min-w-0 rounded-md border border-border-primary bg-bg-primary px-2 text-sm font-normal normal-case text-text-primary"
								aria-label="Filter by company"
							>
								<option value="">All companies</option>
								{brandOptions.map((b) => (
									<option key={b.slug} value={b.slug}>
										{b.name} ({b.count.toLocaleString()})
									</option>
								))}
							</select>
						</div>
						<div className="flex min-w-0 flex-col gap-1 normal-case">
							<span className="text-xs uppercase tracking-wide text-text-tertiary">
								Title &amp; contents
							</span>
							<input
								type="search"
								placeholder="Search title or body…"
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="h-9 w-full rounded-md border border-border-primary bg-bg-primary px-3 text-sm font-normal normal-case text-text-primary placeholder:text-text-quaternary"
							/>
						</div>
						<div className="flex min-w-0 flex-col gap-1 opacity-60">
							<span className="text-xs uppercase tracking-wide">Company vertical</span>
							<span className="h-9 rounded-md border border-dashed border-border-primary px-2 py-2 text-sm font-normal normal-case text-text-tertiary">
								Coming soon
							</span>
						</div>
					</div>

					<div className="flex flex-col gap-2 text-sm text-text-tertiary">
						<p>
							<span className="font-medium text-text-primary">
								Found {tab === "SMS" ? "0" : total.toLocaleString()} assets
							</span>{" "}
							for these filters. {contextLine}
						</p>
					</div>
				</div>

				<div className="mb-6">
					<PresetChips active={preset} onSelect={setPreset} disabled={tab === "SMS"} />
				</div>

				{error ? (
					<div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
						Failed to load: {error}
					</div>
				) : null}

				{tab === "SMS" ? (
					<div className="rounded-xl border border-dashed border-border-primary py-16 text-center text-sm text-text-tertiary">
						SMS is shown in Particl for text-message creatives. This tenant does not ingest SMS rows yet —
						the tab is here for parity.
					</div>
				) : loading && items.length === 0 ? (
					<ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 lg:grid-cols-2">
						{Array.from({ length: 6 }).map((_, i) => (
							<li key={i}>
								<div className="h-80 animate-pulse rounded-xl bg-bg-secondary" />
							</li>
						))}
					</ol>
				) : items.length === 0 ? (
					<div className="rounded-xl border border-dashed border-border-primary py-16 text-center text-sm text-text-tertiary">
						No assets match these filters. Seed demo data with{" "}
						<code className="rounded bg-bg-secondary px-1.5 py-0.5 text-xs">npm run seed:marketing-assets</code> or
						adjust filters.
					</div>
				) : (
					<>
						<ol className="m-0 grid list-none grid-cols-1 justify-items-start gap-4 p-0 lg:grid-cols-2">
							{items.map((a) => (
								<li key={a.id} className="w-full">
									<AssetCard asset={a} onClick={() => openAsset(a.id)} />
								</li>
							))}
						</ol>
						{hasMore ? (
							<button
								type="button"
								disabled={loadingMore}
								onClick={() => void fetchPage(page + 1, "append")}
								className="mt-6 flex h-10 w-full items-center justify-center rounded-lg bg-bg-brand-solid text-sm font-medium text-white shadow transition hover:bg-bg-brand-solid-hover disabled:opacity-60"
							>
								{loadingMore ? "Loading…" : "Load more"}
							</button>
						) : null}
					</>
				)}
			</div>

			<AssetDetailModal
				assetId={selectedId}
				open={modalOpen}
				onOpenChange={(v) => {
					setModalOpen(v);
					if (!v) setSelectedId(null);
				}}
			/>
		</div>
	);
}

export default MarketingAssetLibrary;
