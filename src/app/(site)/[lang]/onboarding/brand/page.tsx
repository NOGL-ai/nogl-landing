"use client";
// src/app/(site)/[lang]/onboarding/brand/page.tsx
//
// Multi-step brand onboarding flow. Pilot clients self-onboard their brand
// after completing the user profile onboarding step. The brand profile is
// stored in the ad-creative scoring service (FastAPI), NOT in Prisma — see
// src/lib/ad-scoring/client.ts.

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { useSession, signIn } from "next-auth/react";
import BrandBasicsStep from "./components/BrandBasicsStep";
import BrandIdentityStep from "./components/BrandIdentityStep";
import BrandLogoStep from "./components/BrandLogoStep";
import BrandConfirmStep from "./components/BrandConfirmStep";
import type { BrandOnboardingForm } from "./types";

const STEPS = [
	{ id: 1, label: "Basics" },
	{ id: 2, label: "Identity" },
	{ id: 3, label: "Logo" },
	{ id: 4, label: "Confirm" },
] as const;

const DEFAULT_VALUES: BrandOnboardingForm = {
	name: "",
	slug: "",
	country: "",
	homepage_url: "",
	primary_color: "#1e3a8a",
	keywords_raw: "",
	logo_asset_id: undefined,
	logo_s3_key: undefined,
	logo_preview_url: undefined,
};

export default function BrandOnboardingPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const params = useParams<{ lang?: string }>();
	const lang = (params?.lang as string) || "en";

	const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

	const methods = useForm<BrandOnboardingForm>({
		defaultValues: DEFAULT_VALUES,
		mode: "onBlur",
	});

	// Auth gate: redirect unauthenticated users to sign-in.
	useEffect(() => {
		if (status === "unauthenticated") {
			signIn();
		}
	}, [status]);

	// If the user hasn't finished the user onboarding step yet, send them there first.
	useEffect(() => {
		if (status === "authenticated" && session?.user) {
			if (!session.user.onboardingCompleted) {
				router.push(`/${lang}/onboarding` as any);
			}
		}
	}, [session, status, router, lang]);

	const progressPct = useMemo(() => (step / STEPS.length) * 100, [step]);

	if (status === "loading") {
		return (
			<div className='flex min-h-screen items-center justify-center bg-bg-primary'>
				<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-brand'></div>
			</div>
		);
	}

	if (!session?.user) {
		return (
			<div className='flex min-h-screen items-center justify-center bg-bg-primary'>
				<p className='text-text-tertiary'>Please sign in to continue</p>
			</div>
		);
	}

	return (
		<div className='flex min-h-screen flex-col bg-bg-primary px-4 py-8 sm:px-6 lg:px-8'>
			<div className='mx-auto w-full max-w-2xl'>
				{/* Header */}
				<div className='mb-8 text-center'>
					<h1 className='text-2xl font-bold text-text-primary sm:text-3xl'>
						Set up your brand
					</h1>
					<p className='mt-2 text-sm text-text-tertiary'>
						We&apos;ll use this to tailor ad-creative scoring to your brand.
					</p>
				</div>

				{/* Stepper */}
				<div className='mb-8'>
					<div className='mb-3 flex items-center justify-between'>
						{STEPS.map((s) => {
							const completed = s.id < step;
							const active = s.id === step;
							return (
								<div key={s.id} className='flex flex-1 items-center'>
									<div
										className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
											active
												? "bg-brand-solid text-white"
												: completed
													? "bg-brand-solid/80 text-white"
													: "bg-bg-secondary text-text-tertiary ring-1 ring-border"
										}`}
										aria-current={active ? "step" : undefined}
									>
										{completed ? "✓" : s.id}
									</div>
									<span
										className={`ml-2 hidden text-xs font-medium sm:inline ${
											active
												? "text-text-primary"
												: completed
													? "text-text-secondary"
													: "text-text-tertiary"
										}`}
									>
										{s.label}
									</span>
									{s.id < STEPS.length && (
										<div
											className={`mx-3 h-px flex-1 ${
												completed ? "bg-brand-solid/60" : "bg-border"
											}`}
											aria-hidden='true'
										/>
									)}
								</div>
							);
						})}
					</div>
					<div className='h-1 overflow-hidden rounded-full bg-bg-secondary'>
						<div
							className='h-full bg-brand-solid transition-all duration-300 ease-out'
							style={{ width: `${progressPct}%` }}
						/>
					</div>
				</div>

				{/* Form card */}
				<div className='rounded-2xl border border-border bg-bg-primary p-6 shadow-sm sm:p-8'>
					<FormProvider {...methods}>
						<form onSubmit={(e) => e.preventDefault()}>
							{step === 1 && <BrandBasicsStep onNext={() => setStep(2)} />}
							{step === 2 && (
								<BrandIdentityStep
									onBack={() => setStep(1)}
									onNext={() => setStep(3)}
								/>
							)}
							{step === 3 && (
								<BrandLogoStep
									onBack={() => setStep(2)}
									onNext={() => setStep(4)}
								/>
							)}
							{step === 4 && (
								<BrandConfirmStep onBack={() => setStep(3)} lang={lang} />
							)}
						</form>
					</FormProvider>
				</div>

				{/* Skip link */}
				<div className='mt-4 text-center'>
					<button
						type='button'
						onClick={() => router.push(`/${lang}` as any)}
						className='text-xs text-text-tertiary underline-offset-2 hover:text-text-primary hover:underline'
					>
						Skip brand setup for now
					</button>
				</div>
			</div>
		</div>
	);
}
