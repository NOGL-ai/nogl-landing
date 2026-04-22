"use client";

import Image from "next/image";

type EmailAssetModalBodyProps = {
	title: string | null;
	bodyText: string | null;
	hero: string | null;
	activePreviewTab: "desktop" | "mobile";
	activeContentTab: "email" | "image";
	setActivePreviewTab: (tab: "desktop" | "mobile") => void;
	setActiveContentTab: (tab: "email" | "image") => void;
};

export function EmailAssetModalBody({
	title,
	bodyText,
	hero,
	activePreviewTab,
	activeContentTab,
	setActivePreviewTab,
	setActiveContentTab,
}: EmailAssetModalBodyProps) {
	return (
		<>
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

			<div className="mb-4 rounded-xl border border-border-primary bg-bg-secondary p-4">
				{activeContentTab === "email" && bodyText ? (
					<div className="max-h-[480px] overflow-y-auto whitespace-pre-wrap text-sm text-text-primary">
						{bodyText}
					</div>
				) : hero ? (
					<div
						className={`relative mx-auto overflow-hidden rounded-lg border border-border-primary bg-bg-primary ${
							activePreviewTab === "mobile" ? "h-[500px] w-[280px]" : "h-[420px] w-full max-w-[680px]"
						}`}
					>
						<Image
							src={hero}
							alt={title ?? "asset"}
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
				NOGL is not responsible for the content displayed in assets reflected here. This image was stored and
				listed here through automated systems. To report an image, please contact support.
			</div>
		</>
	);
}
