"use client";

import Image from "next/image";

type HomepageAssetModalBodyProps = {
	title: string | null;
	hero: string | null;
	brandName: string;
	sourceUrl: string | null;
	capturedAt: string;
};

export function HomepageAssetModalBody({
	title,
	hero,
	brandName,
	sourceUrl,
	capturedAt,
}: HomepageAssetModalBodyProps) {
	return (
		<>
			<div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-text-tertiary">
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

			<div className="mb-4 overflow-hidden rounded-xl border border-border-primary bg-bg-secondary p-2 sm:p-3">
				{hero ? (
					<div className="w-full overflow-hidden rounded-lg border border-border-primary bg-bg-primary">
						<Image
							src={hero}
							alt={title ?? "homepage asset"}
							width={1400}
							height={1800}
							unoptimized
							className="h-auto w-full object-contain"
						/>
					</div>
				) : (
					<div className="flex h-[360px] items-center justify-center text-sm text-text-tertiary">
						No media available.
					</div>
				)}
			</div>
		</>
	);
}
