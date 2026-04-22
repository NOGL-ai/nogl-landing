"use client";

import Image from "next/image";
import { ExternalLinkAction } from "@/components/marketing-assets/modal/atoms/ExternalLinkAction";
import { isVideoMediaUrl } from "@/components/marketing-assets/modal/utils";

type InstagramAssetModalBodyProps = {
	brandName: string;
	title: string | null;
	bodyText: string | null;
	hero: string | null;
	capturedAt: string;
	sourceUrl: string | null;
};

export function InstagramAssetModalBody({
	brandName,
	title,
	bodyText,
	hero,
	capturedAt,
	sourceUrl,
}: InstagramAssetModalBodyProps) {
	const isVideo = isVideoMediaUrl(hero);

	return (
		<>
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border-primary pb-4 text-sm">
				<div className="flex flex-wrap items-center gap-3 text-text-tertiary">
					<span className="font-medium text-text-primary">{brandName}</span>
					{sourceUrl ? (
						<a
							className="font-medium text-text-brand underline underline-offset-2"
							href={sourceUrl}
							target="_blank"
							rel="noreferrer"
						>
							View →
						</a>
					) : null}
					<span>
						{new Date(capturedAt).toLocaleString("en-GB", {
							day: "numeric",
							month: "short",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
				</div>
				{sourceUrl ? (
					<ExternalLinkAction
						href={sourceUrl}
						label="View Post"
						className="rounded-md bg-bg-brand-solid px-4 py-2 text-sm font-medium text-white hover:bg-bg-brand-solid-hover"
					/>
				) : null}
			</div>

			<div className="mb-5 rounded-xl border border-border-primary bg-bg-secondary p-4">
				<div className="mb-4 flex items-center gap-3">
					<div className="h-10 w-10 rounded-full border border-border-primary bg-bg-primary" />
					<div>
						<p className="text-lg font-semibold text-text-primary">{brandName}</p>
						<p className="text-sm text-text-tertiary">Instagram post</p>
					</div>
				</div>
				{bodyText ? <p className="mb-4 text-sm leading-6 text-text-primary">{bodyText}</p> : null}
				<div className="relative h-[640px] w-full overflow-hidden rounded-lg border border-border-primary bg-bg-primary">
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
							<Image src={hero} alt={title ?? "instagram asset"} fill className="object-contain" unoptimized />
						)
					) : (
						<div className="flex h-full items-center justify-center text-sm text-text-tertiary">
							No media available.
						</div>
					)}
				</div>
			</div>
		</>
	);
}
