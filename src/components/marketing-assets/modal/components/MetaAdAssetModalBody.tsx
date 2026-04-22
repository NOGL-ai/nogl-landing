"use client";

import Image from "next/image";
import { ExternalLinkAction } from "@/components/marketing-assets/modal/atoms/ExternalLinkAction";
import { isVideoMediaUrl } from "@/components/marketing-assets/modal/utils";

type MetaAdAssetModalBodyProps = {
	brandName: string;
	title: string | null;
	hero: string | null;
	metaBody: string | null;
	runningFrom: string | null;
	runningTo: string | null;
	platformCount: number;
	adsLaunched: number | null;
	adLibraryUrl: string | null;
	linkedUrl: string | null;
};

export function MetaAdAssetModalBody({
	brandName,
	title,
	hero,
	metaBody,
	runningFrom,
	runningTo,
	platformCount,
	adsLaunched,
	adLibraryUrl,
	linkedUrl,
}: MetaAdAssetModalBodyProps) {
	const isVideo = isVideoMediaUrl(hero);

	return (
		<>
			<div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border-primary pb-4">
				<div className="grid gap-4 text-sm sm:grid-cols-3 sm:gap-8">
					<div>
						<p className="text-text-tertiary">Running from</p>
						<p className="mt-1 font-medium text-text-primary">
							{runningFrom
								? `${new Date(runningFrom).toLocaleDateString("en-GB", {
										day: "numeric",
										month: "short",
										year: "numeric",
									})} - ${runningTo ? "Present" : "Unknown"}`
								: "Unknown"}
						</p>
					</div>
					<div>
						<p className="text-text-tertiary">Platforms</p>
						<p className="mt-1 font-medium text-text-primary">{platformCount || "—"}</p>
					</div>
					<div>
						<p className="text-text-tertiary">Total Ads launched</p>
						<p className="mt-1 font-medium text-text-primary">{adsLaunched ?? "—"}</p>
					</div>
				</div>
				{adLibraryUrl ? (
					<ExternalLinkAction
						href={adLibraryUrl}
						label="View All Ads in Ad Library"
						className="rounded-md bg-bg-brand-solid px-4 py-2 text-sm font-medium text-white hover:bg-bg-brand-solid-hover"
					/>
				) : null}
			</div>

			<div className="mb-5 rounded-xl border border-border-primary bg-bg-secondary p-4">
				<div className="mb-4 flex items-center gap-3">
					<div className="h-10 w-10 rounded-full border border-border-primary bg-bg-primary" />
					<div>
						<p className="text-lg font-semibold text-text-primary">{brandName}</p>
						<p className="text-sm text-text-tertiary">Sponsored</p>
					</div>
				</div>
				{metaBody ? <p className="mb-4 text-sm leading-6 text-text-primary">{metaBody}</p> : null}
				<div className="relative h-[360px] w-full overflow-hidden rounded-lg border border-border-primary bg-bg-primary">
					{hero ? (
						isVideo ? (
							<video
								src={hero}
								controls
								playsInline
								className="h-full w-full object-contain"
								preload="metadata"
								disablePictureInPicture
							/>
						) : (
							<Image src={hero} alt={title ?? "asset"} fill className="object-contain" unoptimized />
						)
					) : (
						<div className="flex h-full items-center justify-center text-sm text-text-tertiary">
							No media available.
						</div>
					)}
				</div>
			</div>

			{linkedUrl ? (
				<div className="mb-6">
					<ExternalLinkAction
						href={linkedUrl}
						label="View Linked Url"
						className="inline-flex rounded-md border border-border-primary px-3 py-2 text-sm font-medium text-text-primary hover:bg-bg-secondary"
					/>
				</div>
			) : null}
		</>
	);
}
