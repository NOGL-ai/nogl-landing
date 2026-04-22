"use client";

import Image from "next/image";
import type { MarketingAssetDetail } from "@/types/marketing-asset";
import { isVideoMediaUrl, resolveMedia } from "@/components/marketing-assets/modal/utils";

type RelatedAssetsSectionProps = {
	lang: string;
	detail: MarketingAssetDetail;
	relatedHeading: string;
	relatedLoading: boolean;
	relatedItems: MarketingAssetDetail[];
	onSelectAsset: (id: string) => void;
};

export function RelatedAssetsSection({
	lang,
	detail,
	relatedHeading,
	relatedLoading,
	relatedItems,
	onSelectAsset,
}: RelatedAssetsSectionProps) {
	const isHomepageAsset = detail.assetType === "HOMEPAGE" || detail.assetType === "HOMEPAGE_MOBILE";

	return (
		<>
			<div className="mb-3 flex min-w-0 items-center justify-between gap-3">
				<h3 className="min-w-0 truncate whitespace-nowrap text-base font-semibold text-text-primary sm:text-lg">
					{relatedHeading}
				</h3>
				<a
					href={`/${lang}/marketing-assets?assetType=${encodeURIComponent(detail.assetType)}&brand=${encodeURIComponent(detail.brandSlug)}`}
					className="rounded-md border border-border-primary px-3 py-2 text-sm font-medium text-text-brand hover:bg-brand-50"
				>
					See all
				</a>
			</div>
			{relatedLoading ? (
				<div className="py-4 text-sm text-text-tertiary">Loading related assets…</div>
			) : (
				<ul className={isHomepageAsset ? "flex flex-wrap gap-3" : "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"}>
					{relatedItems.slice(0, 12).map((asset) => {
						const thumb = resolveMedia(asset.mediaUrls?.[0]);
						const isVideo = isVideoMediaUrl(thumb);
						return (
							<li key={asset.id} className={isHomepageAsset ? "w-[200px]" : undefined}>
								<button
									type="button"
									onClick={() => onSelectAsset(asset.id)}
									className={`w-full overflow-hidden rounded-lg border ${
										asset.id === detail.id ? "border-border-brand" : "border-border-primary"
									}`}
								>
									<div className={`relative w-full bg-bg-secondary ${isHomepageAsset ? "h-[200px]" : "h-[200px]"}`}>
										{thumb ? (
											isVideo ? (
												<video
													src={thumb}
													className="h-full w-full object-cover"
													autoPlay
													loop
													muted
													playsInline
													preload="metadata"
													disablePictureInPicture
												/>
											) : (
												<Image
													src={thumb}
													alt={asset.title ?? "Image"}
													fill
													className="object-cover"
													unoptimized
												/>
											)
										) : null}
									</div>
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</>
	);
}
