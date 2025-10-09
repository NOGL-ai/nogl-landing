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
									Join 100+ fashion brands using AI.
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

				{/* Hand-drawn Arrow */}
				<div className="absolute left-[500px] top-[610px] hidden lg:flex lg:items-center lg:justify-center">
					<div className="rotate-[330deg]">
						<img
							src="https://www.figma.com/api/mcp/asset/6865b12a-6164-4ebc-9d4d-d8e33a8f8d5d"
							alt="Arrow pointing to hero"
							className="h-[158.491px] w-[240px]"
							style={{ filter: 'drop-shadow(0 2px 4px rgba(158, 119, 237, 0.3))' }}
						/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Right: Hero Section */}
			<div className="relative hidden flex-1 self-stretch lg:flex lg:min-w-[640px]">
				{/* Background Image */}
				<img
					src="https://www.figma.com/api/mcp/asset/6213fa51-9e98-4799-98a1-d5f6fd0bde00"
					alt=""
					className="absolute inset-0 size-full object-cover object-center"
				/>

				{/* Decorative Grid Pattern Overlay */}
				<div className="absolute left-1/2 top-0 size-[960px] -translate-x-1/2 opacity-20 pointer-events-none">
					<div className="flex flex-col overflow-clip">
						{/* 10 rows of blocks based on Figma pattern */}
						{[...Array(10)].map((_, rowIndex) => (
							<div key={rowIndex} className="flex">
								{[...Array(10)].map((_, colIndex) => {
									// Define which blocks should be white (filled) - from Figma design
									const whiteBlocks = [
										[1,2], [1,8],           // Row 1: positions 2, 8
										[2,0], [2,6],           // Row 2: positions 0, 6  
										[3,9],                  // Row 3: position 9
										[4,3],                  // Row 4: position 3
										[5,0], [5,6],           // Row 5: positions 0, 6
										[7,3], [7,9],           // Row 7: positions 3, 9
										[8,0], [8,6]            // Row 8: positions 0, 6
									];
									const isWhite = whiteBlocks.some(([r, c]) => r === rowIndex && c === colIndex);
									
									return (
										<div
											key={colIndex}
											className={`relative size-24 shrink-0 ${isWhite ? 'bg-white' : ''}`}
										>
											<div className="pointer-events-none absolute inset-0 border-b border-r border-white" />
										</div>
									);
								})}
							</div>
						))}
					</div>
				</div>

				{/* Decorative Stars - Top Left */}
				<div className="absolute left-16 top-16 h-20 w-20">
					<svg className="absolute left-0 top-0 size-20" viewBox="0 0 80 80" fill="none">
						<path d="M40 0L43.09 36.91L80 40L43.09 43.09L40 80L36.91 43.09L0 40L36.91 36.91L40 0Z" fill="#FEC84B"/>
					</svg>
					<svg className="absolute left-0 top-0 size-6" viewBox="0 0 24 24" fill="none">
						<path d="M12 0L13.854 10.146L24 12L13.854 13.854L12 24L10.146 13.854L0 12L10.146 10.146L12 0Z" fill="#FEC84B"/>
					</svg>
					<svg className="absolute left-16 top-4 size-4" viewBox="0 0 16 16" fill="none">
						<path d="M8 0L9.236 6.764L16 8L9.236 9.236L8 16L6.764 9.236L0 8L6.764 6.764L8 0Z" fill="#FEC84B"/>
					</svg>
				</div>

				{/* Bottom Panel with Content */}
				<div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-black/40 px-16 py-24">
					<div className="flex w-full flex-col gap-8">
				{/* Heading and Subtext */}
				<div className="flex w-full flex-col gap-5 text-white">
					<h2 className="text-[60px] font-semibold leading-[72px] tracking-[-1.2px]">
						Predict what sells. Before it trends.
					</h2>
					<p className="text-lg font-medium leading-7">
						AI-powered fashion forecasting. Free for 30 days. No card needed.
					</p>
				</div>

						{/* Avatars and Reviews */}
						<div className="flex items-center gap-4">
						{/* Avatar Group - Fashion Brand Logos */}
						<div className="flex items-center">
							<div className="relative -mr-3 size-10 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm p-1.5">
								<img 
									src="https://img.logo.dev/zara.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ" 
									alt="Zara" 
									className="size-full object-contain"
								/>
							</div>
							<div className="relative -mr-3 size-10 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm p-1.5">
								<img 
									src="https://img.logo.dev/hm.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ" 
									alt="H&M" 
									className="size-full object-contain"
								/>
							</div>
							<div className="relative -mr-3 size-10 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm p-1.5">
								<img 
									src="https://img.logo.dev/nike.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ" 
									alt="Nike" 
									className="size-full object-contain"
								/>
							</div>
							<div className="relative -mr-3 size-10 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm p-1.5">
								<img 
									src="https://img.logo.dev/gap.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ" 
									alt="Gap" 
									className="size-full object-contain"
								/>
							</div>
							<div className="relative size-10 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm p-1.5">
								<img 
									src="https://img.logo.dev/mango.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ" 
									alt="Mango" 
									className="size-full object-contain"
								/>
							</div>
						</div>

							{/* Reviews */}
							<div className="flex flex-col gap-1">
								<div className="flex items-center gap-2">
									{/* Stars */}
									<div className="flex items-center gap-1">
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className="size-5"
												viewBox="0 0 20 20"
												fill="#FEC84B"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path d="M9.53834 1.60996C9.70914 1.19932 10.2909 1.19932 10.4617 1.60996L12.5278 6.57744C12.5998 6.75056 12.7626 6.86885 12.9495 6.88383L18.3123 7.31376C18.7556 7.3493 18.9354 7.90256 18.5976 8.19189L14.5117 11.6919C14.3693 11.8139 14.3071 12.0053 14.3506 12.1876L15.5989 17.4208C15.7021 17.8534 15.2315 18.1954 14.8519 17.9635L10.2606 15.1592C10.1006 15.0615 9.89938 15.0615 9.73937 15.1592L5.14806 17.9635C4.76851 18.1954 4.29788 17.8534 4.40108 17.4208L5.64939 12.1876C5.69289 12.0053 5.6307 11.8139 5.48831 11.6919L1.40241 8.19189C1.06464 7.90256 1.24441 7.3493 1.68773 7.31376L7.05054 6.88383C7.23744 6.86885 7.40024 6.75056 7.47225 6.57744L9.53834 1.60996Z" />
											</svg>
										))}
									</div>
									<span className="text-base font-semibold text-white">5.0</span>
								</div>
								<p className="text-base font-medium text-white">from 100+ fashion brands</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

