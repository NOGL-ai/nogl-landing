"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { MarketingAssetDetail } from "@/types/marketing-asset";

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

	const hero = resolveMedia(detail?.mediaUrls?.[0]);
	const proxies = detail?.proxies ?? {};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton
				className="max-h-[92vh] w-[min(100vw-2rem,1120px)] max-w-none gap-0 overflow-y-auto p-0 sm:max-w-[min(100vw-2rem,1120px)]"
			>
				<DialogHeader className="border-b border-border-primary px-6 py-4">
					<DialogTitle className="pr-8 text-xl font-semibold">
						{detail?.title ?? "Asset detail"}
					</DialogTitle>
				</DialogHeader>
				{loading ? (
					<div className="flex h-64 items-center justify-center px-6 text-sm text-text-tertiary">
						Loading…
					</div>
				) : !detail ? (
					<div className="px-6 py-8 text-sm text-text-tertiary">Not found.</div>
				) : (
					<div className="grid gap-0 lg:grid-cols-[1.35fr_1fr]">
						<div className="border-b border-border-primary p-6 lg:border-b-0 lg:border-r">
							<div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
								<span className="font-semibold text-text-primary">{detail.brandName}</span>
								<span className="text-text-tertiary">
									{new Date(detail.capturedAt).toLocaleDateString("en-GB", {
										day: "numeric",
										month: "short",
										year: "numeric",
									})}
								</span>
								{detail.sourceUrl ? (
									<a
										className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline"
										href={detail.sourceUrl}
										target="_blank"
										rel="noreferrer"
									>
										View →
									</a>
								) : null}
							</div>
							{hero ? (
								<div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border-primary bg-bg-secondary">
									<Image src={hero} alt={detail.title ?? "asset"} fill className="object-contain" unoptimized />
								</div>
							) : null}
							{detail.bodyText ? (
								<div className="mt-4 max-h-[40vh] overflow-y-auto whitespace-pre-wrap rounded-lg border border-border-primary bg-bg-secondary p-4 text-sm text-text-primary">
									{detail.bodyText}
								</div>
							) : null}
						</div>
						<div className="space-y-4 p-6 text-sm">
							<div>
								<div className="text-xs uppercase text-text-tertiary">Source</div>
								<div className="text-text-primary">{detail.source}</div>
							</div>
							{detail.sourceUrl ? (
								<div>
									<div className="text-xs uppercase text-text-tertiary">URL</div>
									<a
										className="break-all text-primary underline underline-offset-2"
										href={detail.sourceUrl}
										target="_blank"
										rel="noreferrer"
									>
										{detail.sourceUrl}
									</a>
								</div>
							) : null}
							<div className='rounded border border-border-primary bg-bg-primary p-3'>
								<div className='mb-2 text-xs font-semibold uppercase text-text-tertiary'>
									Engagement proxies
								</div>
								<dl className='space-y-1 text-xs'>
									{typeof proxies.longevityDays === "number" ? (
										<div className='flex justify-between'>
											<dt>Longevity</dt>
											<dd>{proxies.longevityDays}d</dd>
										</div>
									) : null}
									{typeof proxies.iterationRate28d === "number" ? (
										<div className='flex justify-between'>
											<dt>Iteration rate (28d)</dt>
											<dd>{proxies.iterationRate28d}</dd>
										</div>
									) : null}
									{typeof proxies.platformBreadth === "number" ? (
										<div className='flex justify-between'>
											<dt>Platform breadth</dt>
											<dd>{proxies.platformBreadth}</dd>
										</div>
									) : null}
									{typeof proxies.geographicBreadth === "number" ? (
										<div className='flex justify-between'>
											<dt>Geographic breadth</dt>
											<dd>{proxies.geographicBreadth}</dd>
										</div>
									) : null}
									{typeof proxies.aestheticScore === "number" ? (
										<div className='flex justify-between' title='Subjective VLM judgment — not a performance prediction'>
											<dt>Aesthetic score</dt>
											<dd>{proxies.aestheticScore.toFixed(1)}/10</dd>
										</div>
									) : null}
									{typeof proxies.copyReadability === "number" ? (
										<div className='flex justify-between'>
											<dt>Readability (Flesch-DE)</dt>
											<dd>{proxies.copyReadability.toFixed(0)}</dd>
										</div>
									) : null}
								</dl>
							</div>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default AssetDetailModal;
