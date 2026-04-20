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
			<DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>{detail?.title ?? "Asset detail"}</DialogTitle>
				</DialogHeader>
				{loading ? (
					<div className='flex h-64 items-center justify-center text-sm text-muted-foreground'>
						Loading…
					</div>
				) : !detail ? (
					<div className='text-sm text-muted-foreground'>Not found.</div>
				) : (
					<div className='grid gap-6 lg:grid-cols-[2fr_1fr]'>
						<div>
							{hero ? (
								<div className='relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted'>
									<Image src={hero} alt={detail.title ?? "asset"} fill className='object-contain' unoptimized />
								</div>
							) : null}
							{detail.bodyText ? (
								<div className='mt-4 whitespace-pre-wrap rounded border border-border bg-card p-4 text-sm text-foreground'>
									{detail.bodyText}
								</div>
							) : null}
						</div>
						<div className='space-y-4 text-sm'>
							<div>
								<div className='text-xs uppercase text-muted-foreground'>Brand</div>
								<div className='font-medium text-foreground'>{detail.brandName}</div>
							</div>
							<div>
								<div className='text-xs uppercase text-muted-foreground'>Captured</div>
								<div>{new Date(detail.capturedAt).toLocaleString()}</div>
							</div>
							<div>
								<div className='text-xs uppercase text-muted-foreground'>Source</div>
								<div>{detail.source}</div>
							</div>
							{detail.sourceUrl ? (
								<div>
									<div className='text-xs uppercase text-muted-foreground'>URL</div>
									<a
										className='break-all text-primary underline'
										href={detail.sourceUrl}
										target='_blank'
										rel='noreferrer'
									>
										{detail.sourceUrl}
									</a>
								</div>
							) : null}
							<div className='rounded border border-border bg-card p-3'>
								<div className='mb-2 text-xs font-semibold uppercase text-muted-foreground'>
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
