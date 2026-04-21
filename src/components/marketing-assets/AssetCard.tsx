"use client";

import Image from "next/image";
import type { AssetTypeName, MarketingAssetListItem } from "@/types/marketing-asset";

const TYPE_LABEL: Record<AssetTypeName, string> = {
	EMAIL: "Email",
	HOMEPAGE: "Homepages",
	HOMEPAGE_MOBILE: "Mobile Homepages",
	INSTAGRAM: "Instagram",
	META_AD: "Meta Ads",
	YOUTUBE_AD: "YouTube Ad",
	TIKTOK_AD: "TikTok Ad",
};

function fmtDate(iso: string): string {
	try {
		return new Date(iso).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
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
	const title = asset.title ?? asset.bodyText ?? "Untitled";
	const proxies = asset.proxies ?? {};
	const longevity = proxies.longevityDays;

	return (
		<button
			type="button"
			onClick={onClick}
			className="group flex h-full min-h-[320px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			<div className="relative aspect-[5/4] w-full shrink-0 bg-muted">
				{hero ? (
					<Image
						src={hero}
						alt={title}
						fill
						sizes="(max-width: 1024px) 100vw, 400px"
						className="object-cover transition duration-300 group-hover:scale-[1.02]"
						unoptimized
					/>
				) : (
					<div className="flex h-full min-h-[200px] items-center justify-center px-4 text-center text-xs text-muted-foreground">
						No preview
					</div>
				)}
				{longevity && longevity > 60 ? (
					<span className="absolute right-2 top-2 rounded-full bg-green-600/90 px-2 py-0.5 text-[10px] font-medium text-white">
						{longevity}d live
					</span>
				) : null}
			</div>
			<div className="flex flex-1 flex-col gap-2 p-4">
				<p className="line-clamp-3 text-sm font-semibold leading-snug text-foreground">{title}</p>
				<div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-muted-foreground">
					<span className="font-medium text-foreground">{asset.brandName}</span>
					<span>{fmtDate(asset.capturedAt)}</span>
					<span className="w-full text-[11px] uppercase tracking-wide text-muted-foreground">
						{TYPE_LABEL[asset.assetType]}
					</span>
				</div>
			</div>
		</button>
	);
}

export default AssetCard;
