"use client";
import Link from "next/link";
import Image from "next/image";
import { SignupWithPassword } from "../molecules";
import type { Route } from "next";

export default function Signup() {
	return (
		<section className="flex min-h-screen w-full items-stretch overflow-hidden bg-white dark:bg-[#071025]">
			{/* Left: Sign-up form */}
			<div className="relative flex w-full flex-1 flex-col items-center justify-center self-stretch lg:min-w-[480px]">
				{/* Logo - absolutely positioned */}
				<div className="absolute left-4 top-6 flex items-center gap-2 sm:left-8 sm:top-8 sm:gap-3">
					<Image
						src="/images/logo/logo.svg"
						alt="NOGL"
						width={32}
						height={32}
						className="h-7 w-7 sm:h-8 sm:w-8"
					/>
					<span className="text-lg font-semibold text-[#181d27] dark:text-white sm:text-xl">
						NOGL
					</span>
				</div>

				{/* Copyright - absolutely positioned */}
				<p className="absolute bottom-8 left-4 text-sm font-normal leading-5 text-[#535862] dark:text-gray-400 sm:bottom-[52px] sm:left-8">
					© Nogl.ai 2025
				</p>

				<div className="w-full px-4 sm:px-8">
					<div className="flex size-full flex-col items-center">
						<div className="flex w-full flex-col items-center py-0">
							<div className="flex w-full max-w-[360px] flex-col items-center gap-6 sm:gap-8">
								{/* Text and supporting text */}
								<div className="flex w-full flex-col items-start gap-3">
									<h1 className="w-full text-2xl font-semibold leading-8 text-[#181d27] dark:text-white sm:text-[30px] sm:leading-[38px]">
										Sign up
									</h1>
									<p className="w-full text-sm font-normal leading-5 text-[#535862] dark:text-gray-300 sm:text-base sm:leading-6">
										Start your 30-day free trial.
									</p>
								</div>

				{/* Content */}
				<div className="flex w-full flex-col items-center gap-6 rounded-xl">
					{/* Form */}
					<div className="w-full">
						<SignupWithPassword />
					</div>
				</div>

				{/* Row - Sign in link */}
				<div className="flex w-full items-center justify-center gap-1">
					<p className="text-[14px] font-normal leading-5 text-[#535862] dark:text-gray-300">
						Already have an account?
					</p>
				<Link
					href={"/auth/signin" as Route}
					className="text-[14px] font-semibold leading-5 text-[#6941c6] hover:underline"
				>
					Log in
				</Link>
				</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Right: Image + Testimonial */}
			<div className="relative hidden flex-1 self-stretch lg:flex lg:min-w-[640px]">
				{/* Background Image */}
				<img
					src="/images/testimonial/Polina_Sergeeva.jpeg"
					alt=""
					className="absolute inset-0 size-full object-cover object-center"
				/>

				{/* Bottom Panel with Testimonial */}
				<div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-black/40 px-5 pb-5 pt-24">
					<div className="relative w-full rounded-2xl border border-white/30 bg-white/30 backdrop-blur-md">
						<div className="flex w-full flex-col items-start gap-6 p-5">
							<p className="w-full text-[30px] font-semibold leading-[38px] text-white">
								&ldquo;We&apos;ve been using Untitled to kickstart every new project and can&apos;t imagine working without it. It&apos;s incredible.&rdquo;
							</p>

							<div className="flex w-full flex-col items-start gap-2">
								{/* Name and stars */}
								<div className="flex w-full items-start gap-4">
									<p className="min-w-0 flex-1 text-2xl font-semibold leading-8 text-white">
										Fleur Cook
									</p>
									{/* Stars */}
									<div className="flex items-center gap-1 shrink-0">
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className="size-5"
												viewBox="0 0 20 20"
												fill="#FDB022"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path d="M9.53834 1.60996C9.70914 1.19932 10.2909 1.19932 10.4617 1.60996L12.5278 6.57744C12.5998 6.75056 12.7626 6.86885 12.9495 6.88383L18.3123 7.31376C18.7556 7.3493 18.9354 7.90256 18.5976 8.19189L14.5117 11.6919C14.3693 11.8139 14.3071 12.0053 14.3506 12.1876L15.5989 17.4208C15.7021 17.8534 15.2315 18.1954 14.8519 17.9635L10.2606 15.1592C10.1006 15.0615 9.89938 15.0615 9.73937 15.1592L5.14806 17.9635C4.76851 18.1954 4.29788 17.8534 4.40108 17.4208L5.64939 12.1876C5.69289 12.0053 5.6307 11.8139 5.48831 11.6919L1.40241 8.19189C1.06464 7.90256 1.24441 7.3493 1.68773 7.31376L7.05054 6.88383C7.23744 6.86885 7.40024 6.75056 7.47225 6.57744L9.53834 1.60996Z" />
											</svg>
										))}
									</div>
								</div>

								{/* Supporting text and arrows */}
								<div className="flex w-full items-start gap-3">
									<div className="flex min-w-0 flex-1 flex-col items-start gap-1 text-white">
										<p className="w-full text-base font-semibold leading-6">Founder, Catalog</p>
										<p className="w-full text-sm font-medium leading-5">Web Design Agency</p>
									</div>

									{/* Arrows */}
									<div className="flex shrink-0 items-start gap-6">
										<button
											className="flex size-14 items-center justify-center rounded-full border border-white/50"
											aria-label="Previous testimonial"
										>
											<svg
												className="size-6"
												viewBox="0 0 24 24"
												fill="none"
												stroke="white"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path d="M19 12H5M12 19l-7-7 7-7" />
											</svg>
										</button>
										<button
											className="flex size-14 items-center justify-center rounded-full border border-white/50"
											aria-label="Next testimonial"
										>
											<svg
												className="size-6"
												viewBox="0 0 24 24"
												fill="none"
												stroke="white"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path d="M5 12h14M12 5l7 7-7 7" />
											</svg>
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

