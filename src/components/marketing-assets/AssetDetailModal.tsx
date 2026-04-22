"use client";

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { MarketingAssetDetail, MarketingAssetListResponse } from "@/types/marketing-asset";
import { AssetNavigationRow } from "@/components/marketing-assets/modal/molecules/AssetNavigationRow";
import { MetaAdAssetModalBody } from "@/components/marketing-assets/modal/components/MetaAdAssetModalBody";
import { EmailAssetModalBody } from "@/components/marketing-assets/modal/components/EmailAssetModalBody";
import { RelatedAssetsSection } from "@/components/marketing-assets/modal/components/RelatedAssetsSection";
import { getMetaAdModalData, resolveMedia } from "@/components/marketing-assets/modal/utils";

export function AssetDetailModal({
	assetId,
	lang,
	open,
	onOpenChange,
}: {
	assetId: string | null;
	lang: string;
	open: boolean;
	onOpenChange: (v: boolean) => void;
}) {
	const [detail, setDetail] = useState<MarketingAssetDetail | null>(null);
	const [loading, setLoading] = useState(false);
	const [currentAssetId, setCurrentAssetId] = useState<string | null>(assetId);
	const [relatedItems, setRelatedItems] = useState<MarketingAssetDetail[]>([]);
	const [relatedTotal, setRelatedTotal] = useState(0);
	const [relatedLoading, setRelatedLoading] = useState(false);
	const [activePreviewTab, setActivePreviewTab] = useState<"desktop" | "mobile">("desktop");
	const [activeContentTab, setActiveContentTab] = useState<"email" | "image">("image");

	useEffect(() => {
		setCurrentAssetId(assetId);
	}, [assetId]);

	useEffect(() => {
		let cancelled = false;
		async function load() {
			if (!currentAssetId || !open) return;
			setLoading(true);
			try {
				const res = await fetch(`/api/marketing-assets/${currentAssetId}`);
				if (!res.ok) throw new Error(`${res.status}`);
				const data = (await res.json()) as MarketingAssetDetail;
				if (!cancelled) setDetail(data);
			} catch {
				if (!cancelled) setDetail(null);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [currentAssetId, open]);

	useEffect(() => {
		let cancelled = false;
		async function loadRelated() {
			if (!open || !detail?.brandSlug || !detail.assetType) return;
			setRelatedLoading(true);
			try {
				const sp = new URLSearchParams();
				sp.set("assetType", detail.assetType);
				sp.set("brandSlug", detail.brandSlug);
				sp.set("page", "1");
				sp.set("pageSize", "24");
				sp.set("sort", "newest");
				const res = await fetch(`/api/marketing-assets?${sp.toString()}`);
				if (!res.ok) throw new Error(`${res.status}`);
				const data = (await res.json()) as MarketingAssetListResponse;
				if (cancelled) return;
				setRelatedTotal(data.total);
				setRelatedItems(data.items as MarketingAssetDetail[]);
			} catch {
				if (!cancelled) {
					setRelatedItems([]);
					setRelatedTotal(0);
				}
			} finally {
				if (!cancelled) setRelatedLoading(false);
			}
		}
		void loadRelated();
		return () => {
			cancelled = true;
		};
	}, [detail?.brandSlug, detail?.assetType, open]);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
			if (!detail || relatedItems.length === 0) return;
			const idx = relatedItems.findIndex((asset) => asset.id === detail.id);
			if (idx === -1) return;
			const next =
				event.key === "ArrowRight"
					? relatedItems[(idx + 1) % relatedItems.length]
					: relatedItems[(idx - 1 + relatedItems.length) % relatedItems.length];
			setCurrentAssetId(next.id);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [detail, open, relatedItems]);

	const hero = resolveMedia(detail?.mediaUrls?.[0]);
	const isMetaAd = detail?.assetType === "META_AD";
	const metaAdData = getMetaAdModalData(detail);
	const activeIndex =
		detail && relatedItems.length > 0 ? relatedItems.findIndex((asset) => asset.id === detail.id) + 1 : 0;
	const fallbackTotal = detail ? 1 : 0;
	const totalForCounter = relatedTotal || fallbackTotal;
	const canNavigate = relatedItems.length > 1;

	const goPrev = () => {
		if (!detail || relatedItems.length === 0) return;
		const idx = relatedItems.findIndex((asset) => asset.id === detail.id);
		if (idx === -1) return;
		const next = relatedItems[(idx - 1 + relatedItems.length) % relatedItems.length];
		setCurrentAssetId(next.id);
	};

	const goNext = () => {
		if (!detail || relatedItems.length === 0) return;
		const idx = relatedItems.findIndex((asset) => asset.id === detail.id);
		if (idx === -1) return;
		const next = relatedItems[(idx + 1) % relatedItems.length];
		setCurrentAssetId(next.id);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton
				className="max-h-[94vh] w-[min(100vw-2rem,985px)] max-w-none gap-0 overflow-y-auto p-0 sm:max-w-[min(100vw-2rem,985px)]"
			>
				<DialogHeader className="border-b border-border-primary px-6 py-4">
					<DialogTitle className="pr-8 text-2xl font-semibold text-text-primary">
						{detail?.title ?? "Asset detail"}
					</DialogTitle>
					{detail ? (
						<div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-tertiary">
							<span className="font-medium text-text-primary">{detail.brandName}</span>
							{detail.sourceUrl ? (
								<a
									className="font-medium text-text-brand underline underline-offset-2"
									href={detail.sourceUrl}
									target="_blank"
									rel="noreferrer"
								>
									View →
								</a>
							) : null}
							<span>
								{new Date(detail.capturedAt).toLocaleString("en-GB", {
									day: "numeric",
									month: "short",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</span>
						</div>
					) : null}
				</DialogHeader>
				{loading ? (
					<div className="flex h-64 items-center justify-center px-6 text-sm text-text-tertiary">
						Loading…
					</div>
				) : !detail ? (
					<div className="px-6 py-8 text-sm text-text-tertiary">Not found.</div>
				) : (
					<div className="px-6 py-5">
						{isMetaAd ? (
							<MetaAdAssetModalBody
								brandName={detail.brandName}
								title={detail.title}
								hero={hero}
								metaBody={metaAdData.metaBody}
								runningFrom={metaAdData.runningFrom}
								runningTo={metaAdData.runningTo}
								platformCount={metaAdData.platformCount}
								adsLaunched={metaAdData.adsLaunched}
								adLibraryUrl={metaAdData.adLibraryUrl}
								linkedUrl={metaAdData.linkedUrl}
							/>
						) : (
							<EmailAssetModalBody
								title={detail.title}
								bodyText={detail.bodyText}
								hero={hero}
								activePreviewTab={activePreviewTab}
								activeContentTab={activeContentTab}
								setActivePreviewTab={setActivePreviewTab}
								setActiveContentTab={setActiveContentTab}
							/>
						)}

						<AssetNavigationRow
							activeIndex={activeIndex}
							totalForCounter={totalForCounter}
							canNavigate={canNavigate}
							onPrev={goPrev}
							onNext={goNext}
						/>

						<RelatedAssetsSection
							lang={lang}
							detail={detail}
							isMetaAd={isMetaAd}
							relatedLoading={relatedLoading}
							relatedItems={relatedItems}
							onSelectAsset={setCurrentAssetId}
						/>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default AssetDetailModal;
