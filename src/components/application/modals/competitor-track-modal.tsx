"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { cx } from "@/utils/cx";

interface CompetitorTrackModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit?: (data: CompetitorFormData) => void | Promise<void>;
	onSaveDraft?: (data: CompetitorFormData) => void | Promise<void>;
}

export interface CompetitorFormData {
	name: string;
	library?: string;
	website: string;
	location?: string;
	channel: string;
	title: string;
	description: string;
}

const CHANNEL_OPTIONS = [
	{ id: "shopify", label: "Shopify" },
	{ id: "woocommerce", label: "WooCommerce" },
	{ id: "magento", label: "Magento" },
	{ id: "bigcommerce", label: "BigCommerce" },
	{ id: "other", label: "Other" },
];

export function CompetitorTrackModal({
	isOpen,
	onClose,
	onSubmit,
	onSaveDraft,
}: CompetitorTrackModalProps) {
	const { theme, resolvedTheme } = useTheme();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<CompetitorFormData>({
		name: "",
		library: "",
		website: "",
		location: "",
		channel: "shopify",
		title: "",
		description: "",
	});

	const handleSubmit = async () => {
		if (!formData.name || !formData.website) return;
		
		setIsSubmitting(true);
		try {
			await onSubmit?.(formData);
			onClose();
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSaveDraft = async () => {
		setIsSubmitting(true);
		try {
			await onSaveDraft?.(formData);
			onClose();
		} finally {
			setIsSubmitting(false);
		}
	};

	const updateField = <K extends keyof CompetitorFormData>(
		field: K,
		value: CompetitorFormData[K]
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	if (!isOpen) return null;

	const isDark = resolvedTheme === "dark" || theme === "dark";

	return (
		<div className={cx("fixed inset-0 z-[9999] flex items-center justify-center px-4 py-7.5", isDark && "dark")}>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/90 dark:bg-black/95"
				onClick={onClose}
			/>

			{/* Modal */}
			<div
				className="relative flex w-full max-w-[640px] flex-col items-center self-stretch overflow-hidden rounded-2xl bg-background shadow-[0_20px_24px_-4px_rgba(10,13,18,0.08),0_8px_8px_-4px_rgba(10,13,18,0.03),0_3px_3px_-1.5px_rgba(10,13,18,0.04)]"
			>
				{/* Background Pattern Decorative */}
				<div
					className="pointer-events-none absolute"
					style={{
						width: "336px",
						height: "336px",
						left: "-120px",
						top: "-120px",
					}}
				>
					<div
						className="absolute flex items-center justify-center"
						style={{ width: "336px", height: "336px", left: "0px", top: "0px" }}
					>
						<div
							className="absolute bg-[radial-gradient(50%_50%_at_50%_50%,_#000_0%,_rgba(0,0,0,0)_100%)] dark:bg-[radial-gradient(50%_50%_at_50%_50%,_#fff_0%,_rgba(255,255,255,0)_100%)]"
							style={{
								width: "336px",
								height: "336px",
								left: "0px",
								top: "0px",
							}}
						/>
					</div>
					<svg
						className="absolute stroke-gray-200 dark:stroke-gray-700"
						style={{ width: "336px", height: "336px", left: "0px", top: "0px" }}
						width="216"
						height="216"
						viewBox="0 0 216 216"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle cx="48" cy="48" r="47.5" className="stroke-inherit" />
						<circle cx="48" cy="48" r="71.5" className="stroke-inherit" />
						<circle cx="48" cy="48" r="95.5" className="stroke-inherit" />
						<circle cx="48" cy="48" r="119.5" className="stroke-inherit" />
						<circle cx="48" cy="48" r="143.5" className="stroke-inherit" />
						<circle cx="48" cy="48" r="167.5" className="stroke-inherit" />
					</svg>
				</div>

				{/* Modal Header */}
				<div className="relative flex w-full flex-col items-center self-stretch">
					<div className="flex w-full flex-col items-start gap-4 self-stretch px-6 pt-6">
						{/* Featured Icon */}
						<div
							className="relative flex items-center justify-center w-12 h-12 p-3 rounded-[10px] border border-border bg-background shadow-[0_0_0_1px_rgba(10,13,18,0.18)_inset,0_-2px_0_0_rgba(10,13,18,0.05)_inset,0_1px_2px_0_rgba(10,13,18,0.05)]"
						>
							<svg
								className="absolute w-6 h-6 left-3 top-3 text-secondary"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M14.0914 6.72222H20.0451C20.5173 6.72222 20.7534 6.72222 20.8914 6.82149C21.0119 6.9081 21.0903 7.04141 21.1075 7.18877C21.1272 7.35767 21.0126 7.56403 20.7833 7.97677L19.3624 10.5343C19.2793 10.684 19.2377 10.7589 19.2214 10.8381C19.207 10.9083 19.207 10.9806 19.2214 11.0508C19.2377 11.13 19.2793 11.2049 19.3624 11.3545L20.7833 13.9121C21.0126 14.3248 21.1272 14.5312 21.1075 14.7001C21.0903 14.8475 21.0119 14.9808 20.8914 15.0674C20.7534 15.1667 20.5173 15.1667 20.0451 15.1667H12.6136C12.0224 15.1667 11.7269 15.1667 11.5011 15.0516C11.3024 14.9504 11.141 14.7889 11.0398 14.5903C10.9247 14.3645 10.9247 14.0689 10.9247 13.4778V10.9444M7.23027 21.5L3.00805 4.61111M4.59143 10.9444H12.4025C12.9937 10.9444 13.2892 10.9444 13.515 10.8294C13.7137 10.7282 13.8751 10.5667 13.9763 10.3681C14.0914 10.1423 14.0914 9.84672 14.0914 9.25556V4.18889C14.0914 3.59772 14.0914 3.30214 13.9763 3.07634C13.8751 2.87773 13.7137 2.71625 13.515 2.61505C13.2892 2.5 12.9937 2.5 12.4025 2.5H4.64335C3.90602 2.5 3.53735 2.5 3.2852 2.65278C3.0642 2.78668 2.89999 2.99699 2.82369 3.24387C2.73663 3.52555 2.82605 3.88321 3.00489 4.59852L4.59143 10.9444Z"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>

						{/* Title and Supporting Text */}
						<div className="flex w-full flex-col items-start gap-0.5 self-stretch">
							<div
								className="w-full self-stretch text-primary font-semibold text-base leading-6"
								style={{
									fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
								}}
							>
								Add Competitor
							</div>
							<div
								className="w-full self-stretch text-tertiary text-sm leading-5"
								style={{
									fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
								}}
							>
								Share the companies you compete.
							</div>
						</div>
					</div>

					{/* Close Button */}
					<button
						onClick={onClose}
						className="absolute flex items-center justify-center rounded-lg hover:bg-gray-50 w-11 h-11 right-3 top-3"
					>
						<svg
							className="w-6 h-6 text-gray-400"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M18 6L6 18M6 6L18 18"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>

					{/* Padding Bottom */}
					<div className="flex w-full flex-col items-start self-stretch" style={{ height: "20px" }} />
				</div>

				{/* Content */}
				<div className="flex w-full max-h-[calc(100vh-220px)] flex-col items-start gap-5 self-stretch overflow-y-auto px-6">
					{/* Form */}
					<div className="flex w-full flex-col items-start gap-4 self-stretch">
						{/* Competitor Name */}
						<div className="flex w-full flex-col items-start gap-1.5 self-stretch">
							<label
								className="text-gray-700 text-sm font-medium leading-5"
								style={{
									fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
								}}
							>
								Competitor Name
							</label>
							<input
								type="text"
								placeholder="What is the name of your competitor?"
								value={formData.name}
								onChange={(e) => updateField("name", e.target.value)}
								className="flex w-full items-center gap-2 self-stretch outline-hidden px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm text-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base leading-6"
								style={{
									fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
								}}
							/>
						</div>

						{/* Row: Competitor Library and Website */}
						<div className="flex w-full flex-col items-start gap-4 self-stretch sm:flex-row">
							{/* Competitor Library */}
							<div className="flex flex-1 flex-col items-start gap-1.5 self-stretch sm:max-w-[280px]">
								<label
									className="text-gray-700 text-sm font-medium leading-5"
									style={{
										fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
									}}
								>
									Competitor Library
								</label>
								<div
									className="flex w-full items-center gap-2 self-stretch px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm"
								>
									<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
										<path
											d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z"
											stroke="currentColor"
											strokeWidth="1.66667"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									<input
										type="text"
										placeholder="Search for competitor company"
										value={formData.library || ""}
										onChange={(e) => updateField("library", e.target.value)}
										className="flex-1 bg-transparent outline-hidden text-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base leading-6"
										style={{
											fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
										}}
									/>
								</div>
							</div>

							{/* Competitor Website */}
							<div className="flex flex-1 flex-col items-start gap-1.5 self-stretch">
								<label
									className="text-gray-700 text-sm font-medium leading-5"
									style={{
										fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
									}}
								>
									Competitor Website
								</label>
								<div
									className="flex w-full items-start self-stretch overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm"
								>
									<div
										className="flex items-center px-3 py-2.5 text-tertiary text-base leading-6"
										style={{
											fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
										}}
									>
										https://
									</div>
									<input
										type="text"
										placeholder="www.competitor.com"
										value={formData.website}
										onChange={(e) => updateField("website", e.target.value)}
										className="flex-1 self-stretch border-l border-gray-300 bg-transparent outline-hidden px-3.5 py-2.5 text-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base leading-6"
										style={{
											fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
										}}
									/>
								</div>
							</div>
						</div>

						{/* Row: Competitor Location and Channel */}
						<div className="flex w-full flex-col items-start gap-4 self-stretch sm:flex-row">
							{/* Competitor Location */}
							<div className="flex flex-1 flex-col items-start gap-1.5 self-stretch sm:max-w-[280px]">
								<label
									className="text-gray-700 text-sm font-medium leading-5"
									style={{
										fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
									}}
								>
									Competitor Location
								</label>
								<div
									className="flex w-full items-center gap-2 self-stretch px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm"
								>
									<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
										<path
											d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z"
											stroke="currentColor"
											strokeWidth="1.66667"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									<input
										type="text"
										placeholder="Search for competitor country"
										value={formData.location || ""}
										onChange={(e) => updateField("location", e.target.value)}
										className="flex-1 bg-transparent outline-hidden text-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base leading-6"
										style={{
											fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
										}}
									/>
								</div>
							</div>

							{/* Channel */}
							<div className="flex w-full flex-col items-start gap-1.5 self-stretch sm:w-32">
								<label
									className="text-gray-700 text-sm font-medium leading-5"
									style={{
										fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
									}}
								>
									Channel
								</label>
								<div className="relative w-full">
									<select
										value={formData.channel}
										onChange={(e) => updateField("channel", e.target.value)}
										className="flex w-full cursor-pointer appearance-none items-center gap-2 self-stretch outline-hidden px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm text-gray-900 text-base font-medium leading-6"
										style={{
											fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
										}}
									>
										{CHANNEL_OPTIONS.map((option) => (
											<option 
												key={option.id} 
												value={option.id}
												className="bg-white text-gray-900"
											>
												{option.label}
											</option>
										))}
									</select>
									<svg
										className="pointer-events-none absolute w-5 h-5 right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
										width="20"
										height="20"
										viewBox="0 0 20 20"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</div>
							</div>
						</div>

						{/* Competitor Title */}
						<div className="flex w-full flex-col items-start gap-1.5 self-stretch">
							<label
								className="text-gray-700 text-sm font-medium leading-5"
								style={{
									fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
								}}
							>
								Competitor Title
							</label>
							<input
								type="text"
								placeholder="What is the title of the competitor?"
								value={formData.title}
								onChange={(e) => updateField("title", e.target.value)}
								className="flex w-full items-center gap-2 self-stretch outline-hidden px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm text-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base leading-6"
								style={{
									fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
								}}
							/>
						</div>

						{/* Competitor Description */}
						<div className="flex w-full flex-col items-start gap-1.5 self-stretch">
							<div className="flex items-center gap-0.5">
								<label
									className="text-gray-700 text-sm font-medium leading-5"
									style={{
										fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
									}}
								>
									Competitor Description
								</label>
								<div className="flex items-center justify-center w-4 h-4">
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
										<g clipPath="url(#clip0_15110_8091)">
											<path
												d="M6.06016 5.99967C6.2169 5.55412 6.52626 5.17841 6.93347 4.9391C7.34067 4.69978 7.81943 4.6123 8.28495 4.69215C8.75047 4.772 9.17271 5.01402 9.47688 5.37536C9.78106 5.7367 9.94753 6.19402 9.94683 6.66634C9.94683 7.99967 7.94683 8.66634 7.94683 8.66634M8.00016 11.333H8.00683M14.6668 7.99967C14.6668 11.6816 11.6821 14.6663 8.00016 14.6663C4.31826 14.6663 1.3335 11.6816 1.3335 7.99967C1.3335 4.31778 4.31826 1.33301 8.00016 1.33301C11.6821 1.33301 14.6668 4.31778 14.6668 7.99967Z"
												stroke="currentColor"
												strokeWidth="1.33333"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</g>
										<defs>
											<clipPath id="clip0_15110_8091">
												<rect width="16" height="16" />
											</clipPath>
										</defs>
									</svg>
								</div>
							</div>
							<div className="relative w-full self-stretch h-36">
								<textarea
									placeholder="e.g. I joined Competitor's Customer Success team to enhance their product offerings. My focus was on onboarding new clients and addressing their concerns."
									value={formData.description}
									onChange={(e) => updateField("description", e.target.value)}
									className="h-full w-full resize-none self-stretch outline-hidden px-3.5 py-3 rounded-lg border border-gray-300 bg-white shadow-sm text-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base leading-6"
									style={{
										fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
									}}
								/>
								<svg
									className="pointer-events-none absolute w-3 h-3 right-5 bottom-[18px] text-gray-300"
									width="12"
									height="12"
									viewBox="0 0 12 12"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M10 2L2 10" stroke="currentColor" strokeLinecap="round" />
									<path d="M11 7L7 11" stroke="currentColor" strokeLinecap="round" />
								</svg>
							</div>
						</div>
					</div>
				</div>

				{/* Modal Actions */}
				<div className="flex w-full flex-col items-start self-stretch pt-8">
					<div className="flex w-full items-start gap-3 self-stretch px-6 pb-6">
						{/* Save as Draft Button */}
						<button
							onClick={handleSaveDraft}
							disabled={isSubmitting}
							className="flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-[0_0_0_1px_rgba(10,13,18,0.18)_inset,0_-2px_0_0_rgba(10,13,18,0.05)_inset,0_1px_2px_0_rgba(10,13,18,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset,0_-2px_0_0_rgba(255,255,255,0.05)_inset,0_1px_2px_0_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
						>
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
								<path
									d="M5.83333 2.5V5.33333C5.83333 5.80004 5.83333 6.0334 5.92416 6.21166C6.00406 6.36846 6.13154 6.49594 6.28834 6.57584C6.4666 6.66667 6.69996 6.66667 7.16667 6.66667H12.8333C13.3 6.66667 13.5334 6.66667 13.7117 6.57584C13.8685 6.49594 13.9959 6.36846 14.0758 6.21166C14.1667 6.0334 14.1667 5.80004 14.1667 5.33333V3.33333M14.1667 17.5V12.1667C14.1667 11.7 14.1667 11.4666 14.0758 11.2883C13.9959 11.1315 13.8685 11.0041 13.7117 10.9242C13.5334 10.8333 13.3 10.8333 12.8333 10.8333H7.16667C6.69996 10.8333 6.4666 10.8333 6.28834 10.9242C6.13154 11.0041 6.00406 11.1315 5.92416 11.2883C5.83333 11.4666 5.83333 11.7 5.83333 12.1667V17.5M17.5 7.77124V13.5C17.5 14.9001 17.5 15.6002 17.2275 16.135C16.9878 16.6054 16.6054 16.9878 16.135 17.2275C15.6002 17.5 14.9001 17.5 13.5 17.5H6.5C5.09987 17.5 4.3998 17.5 3.86502 17.2275C3.39462 16.9878 3.01217 16.6054 2.77248 16.135C2.5 15.6002 2.5 14.9001 2.5 13.5V6.5C2.5 5.09987 2.5 4.3998 2.77248 3.86502C3.01217 3.39462 3.39462 3.01217 3.86502 2.77248C4.3998 2.5 5.09987 2.5 6.5 2.5H12.2288C12.6364 2.5 12.8402 2.5 13.0321 2.54605C13.2021 2.58688 13.3647 2.65422 13.5138 2.7456C13.682 2.84867 13.8261 2.9928 14.1144 3.28105L16.719 5.88562C17.0072 6.17387 17.1513 6.318 17.2544 6.48619C17.3458 6.63531 17.4131 6.79789 17.4539 6.96795C17.5 7.15976 17.5 7.36358 17.5 7.77124Z"
									stroke="currentColor"
									strokeWidth="1.66667"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<span
								className="text-gray-700 text-base font-semibold leading-6"
								style={{
									fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
								}}
							>
								Save as draft
							</span>
						</button>

						{/* Add Competitor Button */}
						<button
							onClick={handleSubmit}
							disabled={isSubmitting || !formData.name || !formData.website}
							className="flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border-2 border-purple-700 dark:border-white/12 bg-purple-600 dark:bg-purple-700 shadow-[0_0_0_1px_rgba(10,13,18,0.18)_inset,0_-2px_0_0_rgba(10,13,18,0.05)_inset,0_1px_2px_0_rgba(10,13,18,0.05)] disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isSubmitting ? (
								<svg
									className="size-5 animate-spin text-white"
									viewBox="0 0 20 20"
									fill="none"
								>
									<circle className="stroke-current opacity-30" cx="10" cy="10" r="8" fill="none" strokeWidth="2" />
									<circle
										className="origin-center animate-spin stroke-current"
										cx="10"
										cy="10"
										r="8"
										fill="none"
										strokeWidth="2"
										strokeDasharray="12.5 50"
										strokeLinecap="round"
									/>
								</svg>
							) : null}
							<span
								className="text-white text-base font-semibold leading-6"
								style={{
									fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
								}}
							>
								Add Competitor
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
