"use client";

import Image from "next/image";
import { MobilePreviewFrame } from "@/components/marketing-assets/modal/molecules/MobilePreviewFrame";
import { isVideoMediaUrl } from "@/components/marketing-assets/modal/utils";

type HomepageAssetModalBodyProps = {
	title: string | null;
	hero: string | null;
	brandName: string;
	sourceUrl: string | null;
	capturedAt: string;
	useMobileFrame?: boolean;
};

export function HomepageAssetModalBody({
	title,
	hero,
	brandName,
	sourceUrl,
	capturedAt,
	useMobileFrame = false,
}: HomepageAssetModalBodyProps) {
	const isVideo = isVideoMediaUrl(hero);

	return (
		<>
			{/* Brand + meta row */}
			<div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-text-tertiary">
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

			{/* Media area */}
			{hero ? (
				useMobileFrame ? (
					<div className="mb-5 flex justify-center rounded-xl border border-border-primary bg-bg-secondary py-8">
						<MobilePreviewFrame width={280}>
							{isVideo ? (
								<video
									src={hero}
									controls
									playsInline
									className="h-auto w-full object-contain"
									preload="metadata"
									disablePictureInPicture
								/>
							) : (
								<Image
									src={hero}
									alt={title ?? "Mobile homepage"}
									width={468}
									height={900}
									unoptimized
									className="h-auto w-full"
								/>
							)}
						</MobilePreviewFrame>
					</div>
				) : (
					<div className="mb-5 overflow-hidden rounded-xl border border-border-primary bg-bg-secondary p-2 sm:p-3">
						<div className="w-full overflow-hidden rounded-lg border border-border-primary bg-bg-primary">
							{isVideo ? (
								<video
									src={hero}
									controls
									playsInline
									className="h-auto w-full object-contain"
									preload="metadata"
									disablePictureInPicture
								/>
							) : (
								<Image
									src={hero}
									alt={title ?? "Homepage"}
									width={1400}
									height={1800}
									unoptimized
									className="h-auto w-full object-contain"
								/>
							)}
						</div>
					</div>
				)
			) : (
				<div className="mb-5 flex h-[360px] items-center justify-center rounded-xl border border-border-primary bg-bg-secondary text-sm text-text-tertiary">
					No media available.
				</div>
			)}
		</>
	);
}
