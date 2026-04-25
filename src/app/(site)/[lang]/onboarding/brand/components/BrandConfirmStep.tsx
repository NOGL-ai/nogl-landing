"use client";

import { CheckCircle as CheckCircle2, AlertCircle, Loading01 as Loader2 } from "@untitledui/icons";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import { createBrand } from "@/lib/ad-scoring/client";
import type { CreateBrandInput } from "@/lib/ad-scoring/client";
import type { BrandOnboardingForm } from "../types";

const btnPrimary =
	"inline-flex h-10 items-center justify-center rounded-lg bg-brand-solid px-6 text-sm font-medium text-white transition-colors hover:bg-brand-solid_hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
const btnSecondary =
	"inline-flex h-10 items-center justify-center rounded-lg border border-border bg-bg-primary px-6 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

interface BrandConfirmStepProps {
	onBack: () => void;
	lang: string;
}

const HEX_RE = /^#([0-9a-f]{6})$/i;

const buildPayload = (form: BrandOnboardingForm): CreateBrandInput => {
	const product_terms = (form.keywords_raw || "")
		.split(",")
		.map((k) => k.trim())
		.filter(Boolean)
		.slice(0, 5);

	const palette_hex = HEX_RE.test(form.primary_color || "")
		? [form.primary_color!.toLowerCase()]
		: [];

	const logo_reference_paths = form.logo_s3_key ? [form.logo_s3_key] : [];

	return {
		name: form.name,
		slug: form.slug,
		country: form.country,
		homepage_url: form.homepage_url || undefined,
		palette_hex,
		product_terms,
		logo_reference_paths,
	};
};

type SubmitState =
	| { phase: "idle" }
	| { phase: "submitting" }
	| { phase: "queued"; reason: string }
	| { phase: "done"; brandId: string }
	| { phase: "error"; message: string };

export default function BrandConfirmStep({
	onBack,
	lang,
}: BrandConfirmStepProps) {
	const router = useRouter();
	const { watch, getValues } = useFormContext<BrandOnboardingForm>();
	const form = watch();
	const payload = React.useMemo(() => buildPayload(getValues()), [form, getValues]);

	const [state, setState] = useState<SubmitState>({ phase: "idle" });

	const handleSubmit = async () => {
		setState({ phase: "submitting" });
		try {
			const brand = await createBrand(payload);
			setState({ phase: "done", brandId: brand.id });
			toast.success("Brand created!");

			// Persist locally so the sidebar can pick it up immediately on navigation.
			try {
				localStorage.setItem(
					"nogl:active_brand",
					JSON.stringify({ id: brand.id, name: brand.name, slug: payload.slug })
				);
			} catch {
				// localStorage might be unavailable (private mode); non-fatal.
			}

			// Brief pause so users see the success state, then redirect home.
			setTimeout(() => {
				router.push(`/${lang}` as any);
			}, 1200);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to create brand";

			// If the upstream is unreachable (502) we still consider the form submitted
			// and queue the brand profile locally so the user isn't blocked.
			const isUpstreamDown =
				message.includes("502") || message.includes("upstream");
			if (isUpstreamDown) {
				try {
					const queue = JSON.parse(
						localStorage.getItem("nogl:pending_brands") || "[]"
					);
					queue.push({ ...payload, queued_at: new Date().toISOString() });
					localStorage.setItem("nogl:pending_brands", JSON.stringify(queue));
				} catch {
					// non-fatal
				}
				setState({
					phase: "queued",
					reason: "Ad-scoring service is offline — saved locally and will sync.",
				});
				toast.success("Brand saved (offline). It will sync when the service is back.");
				setTimeout(() => {
					router.push(`/${lang}` as any);
				}, 1500);
				return;
			}

			setState({ phase: "error", message });
			toast.error(message);
		}
	};

	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-xl font-semibold text-text-primary'>
					Review and create
				</h2>
				<p className='mt-1 text-sm text-text-tertiary'>
					This is the brand profile we&apos;ll save to the ad-scoring service.
				</p>
			</div>

			{/* Preview card */}
			<div className='rounded-xl border border-border bg-bg-primary p-5'>
				<div className='flex items-start gap-4'>
					{form.logo_preview_url ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={form.logo_preview_url}
							alt='Logo'
							className='h-16 w-16 rounded-lg border border-border object-contain'
						/>
					) : (
						<div
							className='flex h-16 w-16 items-center justify-center rounded-lg border border-border text-xl font-semibold text-white'
							style={{
								backgroundColor: HEX_RE.test(form.primary_color || "")
									? form.primary_color
									: "#1e3a8a",
							}}
						>
							{(form.name || "?").charAt(0).toUpperCase()}
						</div>
					)}
					<div className='flex-1'>
						<h3 className='text-lg font-semibold text-text-primary'>
							{form.name || "Untitled brand"}
						</h3>
						<p className='font-mono text-xs text-text-tertiary'>
							{form.slug || "(no slug)"}
							{form.country ? ` · ${form.country}` : ""}
						</p>
						{form.homepage_url && (
							<a
								href={form.homepage_url}
								target='_blank'
								rel='noopener noreferrer'
								className='text-xs text-brand hover:underline'
							>
								{form.homepage_url}
							</a>
						)}
					</div>
				</div>

				<dl className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
					<div>
						<dt className='text-xs font-medium uppercase tracking-wide text-text-tertiary'>
							Primary color
						</dt>
						<dd className='mt-1 flex items-center gap-2 text-sm text-text-primary'>
							<span
								className='inline-block h-4 w-4 rounded border border-border'
								style={{
									backgroundColor: HEX_RE.test(form.primary_color || "")
										? form.primary_color
										: "transparent",
								}}
							/>
							<span className='font-mono'>
								{form.primary_color || "—"}
							</span>
						</dd>
					</div>
					<div>
						<dt className='text-xs font-medium uppercase tracking-wide text-text-tertiary'>
							Product terms
						</dt>
						<dd className='mt-1 flex flex-wrap gap-1'>
							{payload.product_terms.length > 0 ? (
								payload.product_terms.map((kw) => (
									<span
										key={kw}
										className='inline-flex items-center rounded-full border border-border bg-bg-secondary px-2 py-0.5 text-xs text-text-primary'
									>
										{kw}
									</span>
								))
							) : (
								<span className='text-sm text-text-tertiary'>—</span>
							)}
						</dd>
					</div>
				</dl>

				{/* JSON preview (collapsed) */}
				<details className='mt-4 rounded-lg border border-border bg-bg-secondary p-3'>
					<summary className='cursor-pointer text-xs font-medium text-text-tertiary'>
						View raw brand_profile JSON
					</summary>
					<pre className='mt-2 overflow-x-auto rounded bg-bg-primary p-3 text-xs text-text-primary'>
						{JSON.stringify(payload, null, 2)}
					</pre>
				</details>
			</div>

			{/* State banners */}
			{state.phase === "done" && (
				<div className='flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'>
					<CheckCircle2 className='h-4 w-4 shrink-0' />
					Brand created. Redirecting…
				</div>
			)}
			{state.phase === "queued" && (
				<div className='flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400'>
					<AlertCircle className='h-4 w-4 shrink-0' />
					{state.reason}
				</div>
			)}
			{state.phase === "error" && (
				<div className='flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'>
					<AlertCircle className='h-4 w-4 shrink-0' />
					{state.message}
				</div>
			)}

			<div className='flex justify-between pt-4'>
				<button
					type='button'
					className={btnSecondary}
					onClick={onBack}
					disabled={state.phase === "submitting" || state.phase === "done"}
				>
					Back
				</button>
				<button
					type='button'
					className={btnPrimary}
					onClick={handleSubmit}
					disabled={state.phase === "submitting" || state.phase === "done"}
				>
					{state.phase === "submitting" ? (
						<span className='inline-flex items-center gap-2'>
							<Loader2 className='h-4 w-4 animate-spin' />
							Creating…
						</span>
					) : (
						"Create brand"
					)}
				</button>
			</div>
		</div>
	);
}
