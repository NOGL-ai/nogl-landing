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
			className="group flex h-full min-h-80 w-full flex-col overflow-hidden rounded-xl border border-border-primary bg-bg-primary text-left shadow-sm transition hover:border-border-secondary hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-border-brand"
		>
			<div className="relative aspect-[5/4] w-full shrink-0 bg-bg-secondary">
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
					<div className="flex h-full min-h-48 items-center justify-center px-4 text-center text-xs text-text-tertiary">
						No preview
					</div>
				)}
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
					<div className="flex h-full w-full items-center justify-center">
						<div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/55 bg-black/30 text-white shadow-sm backdrop-blur-[1px]">
							<svg
								aria-hidden="true"
								viewBox="0 0 24 24"
								className="h-5 w-5"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.8"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<circle cx="11" cy="11" r="7" />
								<line x1="20" y1="20" x2="16.5" y2="16.5" />
								<line x1="11" y1="8.5" x2="11" y2="13.5" />
								<line x1="8.5" y1="11" x2="13.5" y2="11" />
							</svg>
						</div>
					</div>
					<p className="absolute bottom-3 left-3 right-3 line-clamp-2 text-base font-semibold leading-tight text-white">
						{title}
					</p>
				</div>
				{longevity && longevity > 60 ? (
					<span className="absolute right-2 top-2 rounded-full bg-success-secondary px-2 py-0.5 text-xs font-medium text-text-success">
						{longevity}d live
					</span>
				) : null}
			</div>
			<div className="flex flex-1 flex-col gap-2 p-4">
				<p className="line-clamp-3 text-sm font-semibold leading-snug text-text-primary">{title}</p>
				<div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-text-tertiary">
					<span className="font-medium text-text-primary">{asset.brandName}</span>
					<span>{fmtDate(asset.capturedAt)}</span>
					<span className="w-full text-xs uppercase tracking-wide text-text-tertiary">
						{TYPE_LABEL[asset.assetType]}
					</span>
				</div>
			</div>
		</button>
	);
}

export default AssetCard;
