"use client";

import Image from "next/image";
import type { MarketingAssetDetail } from "@/types/marketing-asset";
import { resolveMedia } from "@/components/marketing-assets/modal/utils";

type RelatedAssetsSectionProps = {
	lang: string;
	detail: MarketingAssetDetail;
	isMetaAd: boolean;
	relatedLoading: boolean;
	relatedItems: MarketingAssetDetail[];
	onSelectAsset: (id: string) => void;
};

export function RelatedAssetsSection({
	lang,
	detail,
	isMetaAd,
	relatedLoading,
	relatedItems,
	onSelectAsset,
}: RelatedAssetsSectionProps) {
	return (
		<>
			<div className="mb-3 flex min-w-0 items-center justify-between gap-3">
				<h3 className="min-w-0 truncate whitespace-nowrap text-base font-semibold text-text-primary sm:text-lg">
					{isMetaAd ? "More meta ads from this company" : "More emails from this company"}
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
				<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
					{relatedItems.slice(0, 12).map((asset) => {
						const thumb = resolveMedia(asset.mediaUrls?.[0]);
						return (
							<li key={asset.id}>
								<button
									type="button"
									onClick={() => onSelectAsset(asset.id)}
									className={`w-full overflow-hidden rounded-lg border ${
										asset.id === detail.id ? "border-border-brand" : "border-border-primary"
									}`}
								>
									<div className="relative h-[200px] w-full bg-bg-secondary">
										{thumb ? (
											<Image
												src={thumb}
												alt={asset.title ?? "Image"}
												fill
												className="object-cover"
												unoptimized
											/>
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
