"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { MarketingAssetDetail, MarketingAssetListResponse } from "@/types/marketing-asset";

function resolveMedia(key: string | undefined): string | null {
	if (!key) return null;
	if (key.startsWith("http")) return key;
	return `/api/marketing-assets/media/${encodeURIComponent(key)}`;
}

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
						<div className="mb-4 h-12 border-b border-border-primary">
							<div className="flex h-full items-center gap-3 text-sm">
								<span className="font-semibold uppercase tracking-wide text-text-primary">Email Preview</span>
								<button
									type="button"
									onClick={() => setActivePreviewTab("desktop")}
									className={`rounded-md px-2.5 py-1 ${
										activePreviewTab === "desktop" ? "bg-brand-50 text-text-brand" : "text-text-tertiary"
									}`}
								>
									Desktop
								</button>
								<button
									type="button"
									onClick={() => setActivePreviewTab("mobile")}
									className={`rounded-md px-2.5 py-1 ${
										activePreviewTab === "mobile" ? "bg-brand-50 text-text-brand" : "text-text-tertiary"
									}`}
								>
									Mobile
								</button>
								<button
									type="button"
									onClick={() => setActiveContentTab("email")}
									className={`rounded-md px-2.5 py-1 ${
										activeContentTab === "email" ? "bg-brand-50 text-text-brand" : "text-text-tertiary"
									}`}
								>
									Email
								</button>
								<button
									type="button"
									onClick={() => setActiveContentTab("image")}
									className={`rounded-md px-2.5 py-1 ${
										activeContentTab === "image" ? "bg-brand-50 text-text-brand" : "text-text-tertiary"
									}`}
								>
									Image
								</button>
							</div>
						</div>

						<div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
							<div className="font-medium text-text-primary">
								Asset {Math.max(activeIndex, 1)} of {totalForCounter.toLocaleString()}
							</div>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={goPrev}
									disabled={!canNavigate}
									className="rounded-md border border-border-primary px-2 py-1 text-text-tertiary disabled:opacity-50"
									aria-label="Previous asset"
								>
									←
								</button>
								<button
									type="button"
									onClick={goNext}
									disabled={!canNavigate}
									className="rounded-md border border-border-primary px-2 py-1 text-text-tertiary disabled:opacity-50"
									aria-label="Next asset"
								>
									→
								</button>
								<div className="ml-2 text-text-tertiary">Use left and right arrow keys to navigate assets</div>
							</div>
						</div>

						<div className="mb-4 rounded-xl border border-border-primary bg-bg-secondary p-4">
							{activeContentTab === "email" && detail.bodyText ? (
								<div className="max-h-[480px] overflow-y-auto whitespace-pre-wrap text-sm text-text-primary">
									{detail.bodyText}
								</div>
							) : hero ? (
								<div
									className={`relative mx-auto overflow-hidden rounded-lg border border-border-primary bg-bg-primary ${
										activePreviewTab === "mobile"
											? "h-[500px] w-[280px]"
											: "h-[420px] w-full max-w-[680px]"
									}`}
								>
									<Image
										src={hero}
										alt={detail.title ?? "asset"}
										fill
										className={activePreviewTab === "mobile" ? "object-cover object-top" : "object-contain"}
										unoptimized
									/>
								</div>
							) : (
								<div className="py-12 text-center text-sm text-text-tertiary">No media available.</div>
							)}
						</div>

						<div className="mb-5 rounded-lg border border-border-primary bg-bg-secondary p-4 text-xs leading-5 text-text-tertiary">
							NOGL is not responsible for the content displayed in assets reflected here. This image was
							stored and listed here through automated systems. To report an image, please contact
							support.
						</div>

						<div className="mb-3 flex min-w-0 items-center justify-between gap-3">
							<h3 className="min-w-0 truncate whitespace-nowrap text-base font-semibold text-text-primary sm:text-lg">
								More emails from this company
							</h3>
							<a
								href={`/${lang}/marketing-assets?assetType=EMAIL&brand=${encodeURIComponent(detail.brandSlug)}`}
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
												onClick={() => setCurrentAssetId(asset.id)}
												className={`w-full overflow-hidden rounded-lg border ${
													asset.id === detail.id
														? "border-border-brand"
														: "border-border-primary"
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
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default AssetDetailModal;
