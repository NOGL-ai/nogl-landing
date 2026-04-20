"use client";

import Image from "next/image";
import type { AssetTypeName, MarketingAssetListItem } from "@/types/marketing-asset";

const TYPE_LABEL: Record<AssetTypeName, string> = {
	EMAIL: "Email",
	HOMEPAGE: "Homepage",
	HOMEPAGE_MOBILE: "Mobile Homepage",
	INSTAGRAM: "Instagram",
	META_AD: "Meta Ad",
	YOUTUBE_AD: "YouTube Ad",
	TIKTOK_AD: "TikTok Ad",
};

function fmtDate(iso: string): string {
	try {
		return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
	} catch {
		return iso;
	}
}

function resolveMedia(key: string | undefined): string | null {
	if (!key) return null;
	if (key.startsWith("http")) return key;
	return `/api/marketing-assets/media/${encodeURIComponent(key)}`;
}

export function AssetCard({
	asset,
	onClick,
}: {
	asset: MarketingAssetListItem;
	onClick: () => void;
}) {
	const hero = resolveMedia(asset.mediaUrls?.[0]);
	const proxies = asset.proxies ?? {};
	const longevity = proxies.longevityDays;
	const iteration = proxies.iterationRate28d;

	return (
		<button
			type='button'
			onClick={onClick}
			className='group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary'
		>
			<div className='relative aspect-[4/3] w-full bg-muted'>
				{hero ? (
					<Image
						src={hero}
						alt={asset.title ?? TYPE_LABEL[asset.assetType]}
						fill
						sizes='(max-width: 768px) 100vw, 33vw'
						className='object-cover transition group-hover:scale-105'
						unoptimized
					/>
				) : (
					<div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
						No preview
					</div>
				)}
				<div className='absolute left-2 top-2 flex gap-1'>
					<span className='rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium text-foreground'>
						{TYPE_LABEL[asset.assetType]}
					</span>
				</div>
				{longevity && longevity > 60 ? (
					<span className='absolute right-2 top-2 rounded-full bg-green-500/90 px-2 py-0.5 text-[10px] font-medium text-white'>
						{longevity}d live
					</span>
				) : null}
			</div>
			<div className='flex flex-1 flex-col gap-1 p-3'>
				<div className='flex items-center justify-between text-[11px] text-muted-foreground'>
					<span className='truncate font-medium text-foreground'>{asset.brandName}</span>
					<span>{fmtDate(asset.capturedAt)}</span>
				</div>
				<p className='line-clamp-2 text-sm text-foreground'>
					{asset.title ?? asset.bodyText ?? "Untitled"}
				</p>
				{iteration && iteration > 5 ? (
					<span className='mt-1 w-fit rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-700 dark:text-amber-300'>
						{iteration} variants / 28d
					</span>
				) : null}
			</div>
		</button>
	);
}

export default AssetCard;
