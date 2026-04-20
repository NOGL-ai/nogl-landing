"use client";

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

const TYPE_TABS: Array<{ key: AssetTypeName | "ALL"; label: string }> = [
	{ key: "ALL", label: "All" },
	{ key: "EMAIL", label: "Emails" },
	{ key: "HOMEPAGE", label: "Homepages" },
	{ key: "HOMEPAGE_MOBILE", label: "Mobile Homepages" },
	{ key: "INSTAGRAM", label: "Instagram" },
	{ key: "META_AD", label: "Meta Ads" },
	{ key: "YOUTUBE_AD", label: "YouTube Ads" },
	{ key: "TIKTOK_AD", label: "TikTok Ads" },
];

export function MarketingAssetLibrary({
	initialStats,
}: {
	initialStats: AssetStatsByType | null;
}) {
	const [stats] = useState<AssetStatsByType | null>(initialStats);
	const [items, setItems] = useState<MarketingAssetListItem[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [assetType, setAssetType] = useState<AssetTypeName | "ALL">("ALL");
	const [brandSlug, setBrandSlug] = useState<string | undefined>(undefined);
	const [search, setSearch] = useState("");
	const [preset, setPreset] = useState<PresetKey | null>(null);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	const brandOptions = useMemo(() => stats?.brands ?? [], [stats]);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		const params = new URLSearchParams();
		if (assetType !== "ALL") params.set("assetType", assetType);
		if (brandSlug) params.set("brandSlug", brandSlug);
		if (search) params.set("search", search);
		if (preset) params.set("preset", preset);
		params.set("pageSize", "48");
		try {
			const res = await fetch(`/api/marketing-assets?${params.toString()}`);
			if (!res.ok) throw new Error(`${res.status}`);
			const data = (await res.json()) as MarketingAssetListResponse;
			setItems(data.items);
			setTotal(data.total);
		} catch (e) {
			setError((e as Error).message);
			setItems([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [assetType, brandSlug, search, preset]);

	useEffect(() => {
		const t = setTimeout(load, 200);
		return () => clearTimeout(t);
	}, [load]);

	const openAsset = (id: string) => {
		setSelectedId(id);
		setModalOpen(true);
	};

	const statTotal = stats?.total ?? total;
	const brandCount = stats?.brands.length ?? 0;
	const last28d = stats?.last28d ?? 0;

	return (
		<div className='space-y-4'>
			{/* Stats bar */}
			<div className='flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4 text-sm'>
				<div>
					<span className='font-semibold text-foreground'>{statTotal.toLocaleString()}</span>{" "}
					<span className='text-muted-foreground'>assets</span>
				</div>
				<div className='h-4 w-px bg-border' />
				<div>
					<span className='font-semibold text-foreground'>{brandCount}</span>{" "}
					<span className='text-muted-foreground'>brands</span>
				</div>
				<div className='h-4 w-px bg-border' />
				<div>
					<span className='font-semibold text-foreground'>{last28d.toLocaleString()}</span>{" "}
					<span className='text-muted-foreground'>in last 28d</span>
				</div>
			</div>

			<div className='grid gap-4 md:grid-cols-[220px_1fr]'>
				{/* Left rail: type tabs */}
				<aside className='space-y-1 rounded-lg border border-border bg-card p-2'>
					{TYPE_TABS.map((t) => {
						const count =
							t.key === "ALL"
								? stats?.total
								: stats?.byType[t.key as AssetTypeName];
						const active = assetType === t.key;
						return (
							<button
								key={t.key}
								type='button'
								onClick={() => setAssetType(t.key)}
								className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition ${
									active
										? "bg-primary/10 text-primary"
										: "text-foreground hover:bg-muted"
								}`}
							>
								<span>{t.label}</span>
								{typeof count === "number" ? (
									<span className='text-xs text-muted-foreground'>{count}</span>
								) : null}
							</button>
						);
					})}
				</aside>

				{/* Main column */}
				<div className='space-y-4'>
					<div className='flex flex-wrap items-center gap-3'>
						<input
							type='search'
							placeholder='Search title or body…'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className='h-9 flex-1 min-w-[180px] rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none'
						/>
						<select
							value={brandSlug ?? ""}
							onChange={(e) => setBrandSlug(e.target.value || undefined)}
							className='h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground'
						>
							<option value=''>All brands</option>
							{brandOptions.map((b) => (
								<option key={b.slug} value={b.slug}>
									{b.name} ({b.count})
								</option>
							))}
						</select>
					</div>

					<PresetChips active={preset} onSelect={setPreset} />

					{error ? (
						<div className='rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive'>
							Failed to load: {error}
						</div>
					) : null}

					{loading && items.length === 0 ? (
						<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
							{Array.from({ length: 8 }).map((_, i) => (
								<div key={i} className='h-64 animate-pulse rounded-lg bg-muted' />
							))}
						</div>
					) : items.length === 0 ? (
						<div className='rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground'>
							No assets match these filters. Try clearing filters or seed demo data with{" "}
							<code className='rounded bg-muted px-1'>npm run seed:marketing-assets</code>.
						</div>
					) : (
						<>
							<div className='text-xs text-muted-foreground'>
								Showing {items.length} of {total.toLocaleString()}
							</div>
							<div
								data-testid='marketing-assets-grid'
								className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
							>
								{items.map((a) => (
									<AssetCard key={a.id} asset={a} onClick={() => openAsset(a.id)} />
								))}
							</div>
						</>
					)}
				</div>
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
