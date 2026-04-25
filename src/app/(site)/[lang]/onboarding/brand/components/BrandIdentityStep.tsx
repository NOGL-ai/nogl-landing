"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import type { BrandOnboardingForm } from "../types";

const inputCls = (invalid: boolean, extra = "") =>
	`flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition-colors placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
		invalid
			? "border-red-300 bg-bg-primary text-text-primary focus-visible:ring-red-500"
			: "border-border bg-bg-primary text-text-primary focus-visible:ring-brand"
	} ${extra}`;
const labelCls =
	"block text-sm font-medium leading-none text-text-primary mb-1.5";
const btnPrimary =
	"inline-flex h-10 items-center justify-center rounded-lg bg-brand-solid px-6 text-sm font-medium text-white transition-colors hover:bg-brand-solid_hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
const btnSecondary =
	"inline-flex h-10 items-center justify-center rounded-lg border border-border bg-bg-primary px-6 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";

interface BrandIdentityStepProps {
	onBack: () => void;
	onNext: () => void;
}

const HEX_RE = /^#([0-9a-f]{6})$/i;

const PRESET_COLORS = [
	"#0f172a",
	"#1e3a8a",
	"#0d9488",
	"#16a34a",
	"#ca8a04",
	"#dc2626",
	"#9333ea",
	"#db2777",
];

export default function BrandIdentityStep({
	onBack,
	onNext,
}: BrandIdentityStepProps) {
	const {
		register,
		watch,
		setValue,
		trigger,
		formState: { errors },
	} = useFormContext<BrandOnboardingForm>();

	const primaryColor = watch("primary_color") || "#1e3a8a";
	const keywordsRaw = watch("keywords_raw") || "";

	const keywordPreview = React.useMemo(() => {
		return keywordsRaw
			.split(",")
			.map((k) => k.trim())
			.filter(Boolean)
			.slice(0, 5);
	}, [keywordsRaw]);

	const handleContinue = async () => {
		const valid = await trigger(["primary_color", "keywords_raw"]);
		if (!valid) return;
		if (keywordPreview.length < 3) {
			// Set a manual error via setValue + trigger trick — re-trigger with shouldFocus.
			// Simplest: just block and rely on inline message.
			return;
		}
		onNext();
	};

	const setColor = (hex: string) => {
		setValue("primary_color", hex.toLowerCase(), { shouldValidate: true });
	};

	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-xl font-semibold text-text-primary'>
					Brand identity
				</h2>
				<p className='mt-1 text-sm text-text-tertiary'>
					Pick a primary color and add a few keywords. We use these to score
					whether new ad creatives stay on-brand.
				</p>
			</div>

			{/* Primary color */}
			<div>
				<label htmlFor='primary-color' className={labelCls}>
					Primary color <span className='text-red-500'>*</span>
				</label>
				<div className='mt-1 flex items-center gap-3'>
					<input
						type='color'
						value={HEX_RE.test(primaryColor) ? primaryColor : "#1e3a8a"}
						onChange={(e) => setColor(e.target.value)}
						className='h-10 w-12 cursor-pointer rounded border border-border bg-bg-primary'
						aria-label='Pick a primary color'
					/>
					<input
						id='primary-color'
						type='text'
						placeholder='#1e3a8a'
						className={inputCls(!!errors.primary_color, "font-mono")}
						{...register("primary_color", {
							required: "Primary color is required",
							pattern: {
								value: HEX_RE,
								message: "Must be a valid hex color (e.g. #1e3a8a)",
							},
						})}
					/>
					<div
						className='h-10 w-10 rounded-lg border border-border'
						style={{
							backgroundColor: HEX_RE.test(primaryColor)
								? primaryColor
								: "transparent",
						}}
						aria-hidden='true'
					/>
				</div>
				{errors.primary_color && (
					<p className='mt-1 text-xs text-red-500'>
						{errors.primary_color.message}
					</p>
				)}
				<div className='mt-3 flex flex-wrap gap-2'>
					{PRESET_COLORS.map((c) => (
						<button
							key={c}
							type='button'
							onClick={() => setColor(c)}
							className='h-7 w-7 rounded-md border border-border transition-transform hover:scale-110'
							style={{ backgroundColor: c }}
							aria-label={`Use preset color ${c}`}
						/>
					))}
				</div>
			</div>

			{/* Keywords */}
			<div>
				<label htmlFor='keywords' className={labelCls}>
					Brand keywords <span className='text-red-500'>*</span>
				</label>
				<input
					id='keywords'
					type='text'
					placeholder='photography, professional gear, wedding'
					className={inputCls(!!errors.keywords_raw)}
					{...register("keywords_raw", {
						required: "Add at least 3 keywords (comma-separated)",
					})}
				/>
				<p className='mt-1 text-xs text-text-tertiary'>
					3–5 product or category terms, comma-separated. Used as
					<code className='mx-1'>product_terms</code>
					in your brand profile.
				</p>
				{keywordPreview.length > 0 && (
					<div className='mt-2 flex flex-wrap gap-1.5'>
						{keywordPreview.map((kw) => (
							<span
								key={kw}
								className='inline-flex items-center rounded-full border border-border bg-bg-secondary px-2.5 py-0.5 text-xs text-text-primary'
							>
								{kw}
							</span>
						))}
					</div>
				)}
				{keywordsRaw && keywordPreview.length < 3 && (
					<p className='mt-1 text-xs text-red-500'>
						Add at least 3 keywords (got {keywordPreview.length}).
					</p>
				)}
				{keywordPreview.length > 5 && (
					<p className='mt-1 text-xs text-amber-600'>
						Only the first 5 keywords will be saved.
					</p>
				)}
				{errors.keywords_raw && (
					<p className='mt-1 text-xs text-red-500'>
						{errors.keywords_raw.message}
					</p>
				)}
			</div>

			<div className='flex justify-between pt-4'>
				<button type='button' className={btnSecondary} onClick={onBack}>
					Back
				</button>
				<button
					type='button'
					className={btnPrimary}
					onClick={handleContinue}
					disabled={keywordPreview.length < 3}
				>
					Continue
				</button>
			</div>
		</div>
	);
}
