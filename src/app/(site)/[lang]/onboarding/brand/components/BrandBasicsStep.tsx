"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import type { BrandOnboardingForm } from "../types";

// Tailwind classes that match the design tokens used elsewhere in the app.
// We deliberately use raw HTML form controls instead of `@/components/ui/*`
// (which is restricted by ESLint) and instead of `@/components/base/input/*`
// (which is react-aria-based and doesn't accept register() refs from RHF).
const inputCls = (invalid: boolean) =>
	`flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition-colors placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
		invalid
			? "border-red-300 bg-bg-primary text-text-primary focus-visible:ring-red-500"
			: "border-border bg-bg-primary text-text-primary focus-visible:ring-brand"
	}`;
const labelCls =
	"block text-sm font-medium leading-none text-text-primary mb-1.5";
const btnPrimary =
	"inline-flex h-10 items-center justify-center rounded-lg bg-brand-solid px-6 text-sm font-medium text-white transition-colors hover:bg-brand-solid_hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

interface BrandBasicsStepProps {
	onNext: () => void;
}

const COUNTRY_OPTIONS = [
	{ code: "DE", label: "Germany" },
	{ code: "US", label: "United States" },
	{ code: "GB", label: "United Kingdom" },
	{ code: "FR", label: "France" },
	{ code: "ES", label: "Spain" },
	{ code: "IT", label: "Italy" },
	{ code: "NL", label: "Netherlands" },
	{ code: "AT", label: "Austria" },
	{ code: "CH", label: "Switzerland" },
];

const slugify = (input: string): string =>
	input
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "") // strip diacritics
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");

export default function BrandBasicsStep({ onNext }: BrandBasicsStepProps) {
	const {
		register,
		watch,
		setValue,
		trigger,
		formState: { errors },
	} = useFormContext<BrandOnboardingForm>();

	const name = watch("name");
	const slug = watch("slug");
	const country = watch("country");

	// Auto-fill slug from name (only if user hasn't typed their own).
	React.useEffect(() => {
		if (!name) return;
		const auto = slugify(name);
		const countrySuffix = country ? `_${country.toLowerCase()}` : "";
		const candidate = `${auto}${countrySuffix}`;
		// Only overwrite if slug is empty or matches a previous auto value.
		const prevAuto = slugify(name);
		if (!slug || slug === prevAuto || slug === `${prevAuto}_de` || slug === `${prevAuto}_us`) {
			setValue("slug", candidate, { shouldValidate: false });
		}
	}, [name, country, slug, setValue]);

	const handleContinue = async () => {
		const valid = await trigger(["name", "slug", "country", "homepage_url"]);
		if (valid) onNext();
	};

	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-xl font-semibold text-text-primary'>
					Tell us about your brand
				</h2>
				<p className='mt-1 text-sm text-text-tertiary'>
					This is the basic identity we use across reports and dashboards.
				</p>
			</div>

			<div className='space-y-4'>
				{/* Brand name */}
				<div>
					<label htmlFor='brand-name' className={labelCls}>
						Brand name <span className='text-red-500'>*</span>
					</label>
					<input
						id='brand-name'
						type='text'
						placeholder='Calumet'
						className={inputCls(!!errors.name)}
						{...register("name", {
							required: "Brand name is required",
							minLength: { value: 2, message: "At least 2 characters" },
							maxLength: { value: 80, message: "Less than 80 characters" },
						})}
					/>
					{errors.name && (
						<p className='mt-1 text-xs text-red-500'>{errors.name.message}</p>
					)}
				</div>

				{/* Slug */}
				<div>
					<label htmlFor='brand-slug' className={labelCls}>
						Slug <span className='text-red-500'>*</span>
					</label>
					<input
						id='brand-slug'
						type='text'
						placeholder='calumet_de'
						className={inputCls(!!errors.slug)}
						{...register("slug", {
							required: "Slug is required",
							pattern: {
								value: /^[a-z0-9_]+$/,
								message: "Lowercase letters, digits, and underscores only",
							},
							minLength: { value: 2, message: "At least 2 characters" },
							maxLength: { value: 60, message: "Less than 60 characters" },
						})}
					/>
					<p className='mt-1 text-xs text-text-tertiary'>
						Used internally as a tenant identifier (e.g. calumet_de). Only lowercase
						letters, digits, and underscores.
					</p>
					{errors.slug && (
						<p className='mt-1 text-xs text-red-500'>{errors.slug.message}</p>
					)}
				</div>

				{/* Country */}
				<div>
					<label htmlFor='brand-country' className={labelCls}>
						Country <span className='text-red-500'>*</span>
					</label>
					<select
						id='brand-country'
						className={inputCls(!!errors.country)}
						{...register("country", { required: "Country is required" })}
					>
						<option value=''>Select a country…</option>
						{COUNTRY_OPTIONS.map((c) => (
							<option key={c.code} value={c.code}>
								{c.label}
							</option>
						))}
					</select>
					{errors.country && (
						<p className='mt-1 text-xs text-red-500'>
							{errors.country.message}
						</p>
					)}
				</div>

				{/* Homepage URL */}
				<div>
					<label htmlFor='brand-homepage' className={labelCls}>
						Homepage URL
					</label>
					<input
						id='brand-homepage'
						type='url'
						placeholder='https://example.com'
						className={inputCls(!!errors.homepage_url)}
						{...register("homepage_url", {
							pattern: {
								value: /^https?:\/\/[^\s]+$/i,
								message: "Must start with http:// or https://",
							},
						})}
					/>
					<p className='mt-1 text-xs text-text-tertiary'>
						We&apos;ll fetch your favicon and try to extract brand colors.
					</p>
					{errors.homepage_url && (
						<p className='mt-1 text-xs text-red-500'>
							{errors.homepage_url.message}
						</p>
					)}
				</div>
			</div>

			<div className='flex justify-end pt-4'>
				<button
					type='button'
					className={btnPrimary}
					onClick={handleContinue}
				>
					Continue
				</button>
			</div>
		</div>
	);
}
