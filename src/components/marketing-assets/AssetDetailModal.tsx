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
	open,
	onOpenChange,
}: {
	assetId: string | null;
	open: boolean;
	onOpenChange: (v: boolean) => void;
}) {
	const [detail, setDetail] = useState<MarketingAssetDetail | null>(null);
	const [loading, setLoading] = useState(false);
	const [relatedItems, setRelatedItems] = useState<MarketingAssetDetail[]>([]);
	const [relatedTotal, setRelatedTotal] = useState(0);
	const [relatedLoading, setRelatedLoading] = useState(false);
	const [activePreviewTab, setActivePreviewTab] = useState<"desktop" | "mobile">("desktop");
	const [activeContentTab, setActiveContentTab] = useState<"email" | "image">("image");

	useEffect(() => {
		let cancelled = false;
		async function load() {
			if (!assetId || !open) return;
			setLoading(true);
			try {
				const res = await fetch(`/api/marketing-assets/${assetId}`);
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
	}, [assetId, open]);

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
				sp.set("pageSize", "12");
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
			setDetail(next);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [detail, open, relatedItems]);

	const hero = resolveMedia(detail?.mediaUrls?.[0]);
	const activeIndex = detail ? relatedItems.findIndex((asset) => asset.id === detail.id) + 1 : 0;
	const fallbackTotal = detail ? 1 : 0;
	const totalForCounter = relatedTotal || fallbackTotal;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton
				className="max-h-[94vh] w-[min(100vw-2rem,1000px)] max-w-none gap-0 overflow-y-auto p-0 sm:max-w-[min(100vw-2rem,1000px)]"
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
									hour: "numeric",
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
						<div className="mb-4 flex flex-wrap gap-2">
							<button
								type="button"
								onClick={() => setActivePreviewTab("desktop")}
								className={`rounded-md px-3 py-1.5 text-sm font-medium ${
									activePreviewTab === "desktop"
										? "bg-brand-50 text-text-brand"
										: "bg-bg-secondary text-text-tertiary"
								}`}
							>
								Desktop
							</button>
							<button
								type="button"
								onClick={() => setActivePreviewTab("mobile")}
								className={`rounded-md px-3 py-1.5 text-sm font-medium ${
									activePreviewTab === "mobile"
										? "bg-brand-50 text-text-brand"
										: "bg-bg-secondary text-text-tertiary"
								}`}
							>
								Mobile
							</button>
							<button
								type="button"
								onClick={() => setActiveContentTab("email")}
								className={`rounded-md px-3 py-1.5 text-sm font-medium ${
									activeContentTab === "email"
										? "bg-brand-50 text-text-brand"
										: "bg-bg-secondary text-text-tertiary"
								}`}
							>
								Email
							</button>
							<button
								type="button"
								onClick={() => setActiveContentTab("image")}
								className={`rounded-md px-3 py-1.5 text-sm font-medium ${
									activeContentTab === "image"
										? "bg-brand-50 text-text-brand"
										: "bg-bg-secondary text-text-tertiary"
								}`}
							>
								Image
							</button>
						</div>

						<div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
							<div className="font-medium text-text-primary">
								Asset {Math.max(activeIndex, 1)} of {totalForCounter.toLocaleString()}
							</div>
							<div className="text-text-tertiary">Use left and right arrow keys to navigate assets</div>
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
										className="object-contain"
										unoptimized
									/>
								</div>
							) : (
								<div className="py-12 text-center text-sm text-text-tertiary">No media available.</div>
							)}
						</div>

						<div className="mb-5 rounded-lg border border-border-primary bg-bg-secondary p-4 text-xs leading-5 text-text-tertiary">
							Particl is not responsible for the content displayed in assets reflected here. This image
							was stored and listed here through automated systems. To report an image, please contact
							support.
						</div>

						<div className="mb-3 flex items-center justify-between gap-3">
							<h3 className="text-lg font-semibold text-text-primary">More emails from this company</h3>
							<a
								href={`/en/marketing-assets?brand=${encodeURIComponent(detail.brandSlug)}`}
								className="rounded-md border border-border-primary px-3 py-2 text-sm font-medium text-text-brand hover:bg-brand-50"
							>
								See all
							</a>
						</div>
						{relatedLoading ? (
							<div className="py-4 text-sm text-text-tertiary">Loading related assets…</div>
						) : (
							<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
								{relatedItems.slice(0, 8).map((asset) => {
									const thumb = resolveMedia(asset.mediaUrls?.[0]);
									return (
										<li key={asset.id}>
											<button
												type="button"
												onClick={() => setDetail(asset)}
												className={`w-full overflow-hidden rounded-lg border ${
													asset.id === detail.id
														? "border-border-brand"
														: "border-border-primary"
												}`}
											>
												<div className="relative h-40 w-full bg-bg-secondary">
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
