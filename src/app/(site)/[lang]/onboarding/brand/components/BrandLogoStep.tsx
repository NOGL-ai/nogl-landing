"use client";

import { UploadCloud01 as UploadCloud, CheckCircle as CheckCircle2, AlertCircle, Loading01 as Loader2 } from "@untitledui/icons";
import React, { useCallback, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { uploadBrandLogo } from "@/lib/ad-scoring/client";
import type { BrandOnboardingForm } from "../types";

const btnPrimary =
	"inline-flex h-10 items-center justify-center rounded-lg bg-brand-solid px-6 text-sm font-medium text-white transition-colors hover:bg-brand-solid_hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
const btnSecondary =
	"inline-flex h-10 items-center justify-center rounded-lg border border-border bg-bg-primary px-6 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";
const btnGhost =
	"inline-flex h-10 items-center justify-center rounded-lg bg-transparent px-6 text-sm font-medium text-text-tertiary transition-colors hover:bg-bg-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";

interface BrandLogoStepProps {
	onBack: () => void;
	onNext: () => void;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

type LogoState =
	| { phase: "idle" }
	| { phase: "uploading" }
	| { phase: "done"; assetId: string; s3Key: string; previewUrl: string }
	| { phase: "error"; message: string };

export default function BrandLogoStep({ onBack, onNext }: BrandLogoStepProps) {
	const { setValue, watch } = useFormContext<BrandOnboardingForm>();
	const existingS3Key = watch("logo_s3_key");
	const existingPreview = watch("logo_preview_url");

	const [state, setState] = useState<LogoState>(() =>
		existingS3Key && existingPreview
			? { phase: "done", assetId: watch("logo_asset_id") || "", s3Key: existingS3Key, previewUrl: existingPreview }
			: { phase: "idle" }
	);
	const [drag, setDrag] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFile = useCallback(
		async (file: File) => {
			if (!ACCEPTED_TYPES.includes(file.type)) {
				setState({
					phase: "error",
					message: "Logo must be PNG, JPEG, SVG, or WebP",
				});
				return;
			}
			if (file.size > MAX_BYTES) {
				setState({ phase: "error", message: "Logo must be smaller than 5MB" });
				return;
			}

			const previewUrl = URL.createObjectURL(file);
			setState({ phase: "uploading" });

			try {
				const asset = await uploadBrandLogo(file);
				setState({
					phase: "done",
					assetId: asset.id,
					s3Key: asset.s3_key,
					previewUrl,
				});
				setValue("logo_asset_id", asset.id, { shouldValidate: false });
				setValue("logo_s3_key", asset.s3_key, { shouldValidate: false });
				setValue("logo_preview_url", previewUrl, { shouldValidate: false });
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Logo upload failed";
				setState({ phase: "error", message });
			}
		},
		[setValue]
	);

	const onDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setDrag(false);
			const f = e.dataTransfer.files[0];
			if (f) handleFile(f);
		},
		[handleFile]
	);

	const handleSkip = () => {
		// Skipping is allowed — the brand can still be created without a logo.
		// Clear any partial state so we don't carry a stale preview to confirm step.
		setValue("logo_asset_id", undefined, { shouldValidate: false });
		setValue("logo_s3_key", undefined, { shouldValidate: false });
		setValue("logo_preview_url", undefined, { shouldValidate: false });
		onNext();
	};

	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-xl font-semibold text-text-primary'>
					Upload your logo
				</h2>
				<p className='mt-1 text-sm text-text-tertiary'>
					We use this as a reference image to detect your logo in ad creatives.
					You can skip this and add it later.
				</p>
			</div>

			{/* Drop zone */}
			<div
				className={`relative rounded-xl border-2 border-dashed bg-bg-primary transition-colors ${
					drag
						? "border-brand bg-brand/5"
						: "border-border hover:border-brand/50 hover:bg-bg-secondary"
				}`}
				onDragOver={(e) => {
					e.preventDefault();
					setDrag(true);
				}}
				onDragLeave={() => setDrag(false)}
				onDrop={onDrop}
				onClick={() => inputRef.current?.click()}
				role='button'
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						inputRef.current?.click();
					}
				}}
			>
				<input
					ref={inputRef}
					type='file'
					accept={ACCEPTED_TYPES.join(",")}
					className='sr-only'
					onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
				/>
				<div className='flex flex-col items-center justify-center px-6 py-10 text-center'>
					{state.phase === "done" ? (
						<>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={state.previewUrl}
								alt='Logo preview'
								className='mb-3 h-24 w-24 rounded-lg border border-border object-contain'
							/>
							<p className='text-sm font-medium text-text-primary'>
								Logo uploaded
							</p>
							<p className='mt-1 text-xs text-text-tertiary'>
								Click to replace
							</p>
						</>
					) : state.phase === "uploading" ? (
						<>
							<Loader2 className='mb-2 h-8 w-8 animate-spin text-brand' />
							<p className='text-sm text-text-tertiary'>Uploading…</p>
						</>
					) : (
						<>
							<UploadCloud
								className={`mb-2 h-8 w-8 ${drag ? "text-brand" : "text-text-tertiary"}`}
							/>
							<p className='text-sm text-text-primary'>
								Drop your logo here, or{" "}
								<span className='font-medium text-brand'>browse</span>
							</p>
							<p className='mt-1 text-xs text-text-tertiary'>
								PNG, JPEG, SVG, or WebP — max 5MB
							</p>
						</>
					)}
				</div>
			</div>

			{state.phase === "done" && (
				<div className='flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'>
					<CheckCircle2 className='h-4 w-4 shrink-0' />
					<span className='truncate font-mono text-xs'>{state.s3Key}</span>
				</div>
			)}

			{state.phase === "error" && (
				<div className='flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'>
					<AlertCircle className='h-4 w-4 shrink-0' />
					{state.message}
				</div>
			)}

			<div className='flex justify-between pt-4'>
				<button type='button' className={btnSecondary} onClick={onBack}>
					Back
				</button>
				<div className='flex gap-2'>
					<button type='button' className={btnGhost} onClick={handleSkip}>
						Skip for now
					</button>
					<button
						type='button'
						className={btnPrimary}
						onClick={onNext}
						disabled={state.phase === "uploading"}
					>
						Continue
					</button>
				</div>
			</div>
		</div>
	);
}
