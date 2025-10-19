"use client";

import { useState } from "react";
import { Tag01, XClose, Download01 } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { Button } from "@/components/base/buttons/button";
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cx } from "@/utils/cx";

interface TrackCompetitorModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const channels = [
	{ id: "shopify", label: "Shopify" },
	{ id: "woocommerce", label: "WooCommerce" },
	{ id: "magento", label: "Magento" },
	{ id: "prestashop", label: "PrestaShop" },
	{ id: "bigcommerce", label: "BigCommerce" },
	{ id: "other", label: "Other" },
];

const countries = [
	{ id: "us", label: "United States" },
	{ id: "uk", label: "United Kingdom" },
	{ id: "de", label: "Germany" },
	{ id: "fr", label: "France" },
	{ id: "es", label: "Spain" },
	{ id: "it", label: "Italy" },
	{ id: "ca", label: "Canada" },
	{ id: "au", label: "Australia" },
];

export default function TrackCompetitorModal({ open, onOpenChange }: TrackCompetitorModalProps) {
	const [currentPage, setCurrentPage] = useState(0);
	const [formData, setFormData] = useState({
		name: "",
		library: "",
		website: "",
		location: "",
		channel: "shopify",
		title: "",
		description: "",
	});

	const handleSaveDraft = () => {
		console.log("Saving draft:", formData);
		onOpenChange(false);
	};

	const handleAddCompetitor = () => {
		console.log("Adding competitor:", formData);
		onOpenChange(false);
	};

	const totalPages = 2;
	const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogPortal>
				<DialogOverlay />
				<DialogContent 
					showCloseButton={false}
					className="max-w-[640px] p-0 max-sm:max-w-[calc(100%-2rem)] overflow-hidden"
				>
				{/* Background Pattern (Desktop only) */}
				<div className="absolute -left-[120px] -top-[120px] w-[336px] h-[336px] pointer-events-none hidden sm:block z-0">
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="absolute inset-0 rounded-full bg-gradient-radial from-black/10 to-transparent dark:from-white/10" />
						<svg className="w-full h-full stroke-gray-200 dark:stroke-gray-700" viewBox="0 0 336 336" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="168" cy="168" r="47.5" className="stroke-inherit" />
							<circle cx="168" cy="168" r="71.5" className="stroke-inherit" />
							<circle cx="168" cy="168" r="95.5" className="stroke-inherit" />
							<circle cx="168" cy="168" r="119.5" className="stroke-inherit" />
							<circle cx="168" cy="168" r="143.5" className="stroke-inherit" />
							<circle cx="168" cy="168" r="167.5" className="stroke-inherit" />
						</svg>
					</div>
				</div>

				{/* Header */}
				<div className="relative z-10 px-6 pt-6 pb-5 sm:px-6 sm:pt-6 sm:pb-5">
						<div className="flex flex-col gap-4 sm:gap-4">
							{/* Featured Icon - Desktop only */}
							<div className="hidden sm:flex w-12 h-12 p-3 items-center justify-center rounded-[10px] border border-border dark:border-border bg-white dark:bg-secondary_bg shadow-[0_0_0_1px_rgba(10,13,18,0.18)_inset,0_-2px_0_0_rgba(10,13,18,0.05)_inset,0_1px_2px_0_rgba(10,13,18,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset,0_-2px_0_0_rgba(255,255,255,0.05)_inset,0_1px_2px_0_rgba(0,0,0,0.2)]">
								<Tag01 className="w-6 h-6 text-secondary dark:text-tertiary" />
							</div>

							{/* Title and Description (accessible) */}
							<div className="flex flex-col gap-0.5">
								<DialogTitle className="text-base font-semibold text-primary dark:text-gray-100">Add Competitor</DialogTitle>
								<DialogDescription className="text-sm text-tertiary">Share the companies you compete.</DialogDescription>
							</div>
						</div>

						{/* Close Button */}
						<DialogClose className="absolute right-3 top-3 sm:right-3 sm:top-3 flex items-center justify-center w-11 h-11 p-2 rounded-lg hover:bg-secondary_bg dark:hover:bg-gray-700 transition-colors">
							<XClose className="w-6 h-6 text-tertiary dark:text-tertiary" />
							<span className="sr-only">Close</span>
						</DialogClose>
					</div>

				{/* Content */}
				<div className="relative z-10 px-6 sm:px-6">
					<form className="flex flex-col gap-4">
							{/* Mobile: Page 1 */}
							{isMobile && currentPage === 0 && (
								<>
									<Input
										label="Competitor Name"
										placeholder="What is the name of your competitor"
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									/>

									<Select
										label="Competitor Library"
										placeholder="Search for company"
										items={[]}
										onSelectionChange={(key) => setFormData({ ...formData, library: key as string })}
									>
										{() => null}
									</Select>

									<div className="flex flex-col gap-1.5">
										<label className="text-sm font-medium text-secondary dark:text-tertiary">Competitor Website</label>
										<div className="flex items-stretch rounded-lg border border-border dark:border-border bg-white dark:bg-secondary_bg shadow-sm overflow-hidden">
											<div className="flex items-center px-3.5 py-2.5 bg-white dark:bg-secondary_bg border-r border-border dark:border-border">
												<span className="text-base text-tertiary">https://</span>
											</div>
											<input
												type="text"
												className="flex-1 px-3.5 py-2.5 text-base text-primary dark:text-gray-100 placeholder:text-tertiary dark:placeholder:text-tertiary focus:outline-none border border-border dark:border-border bg-white dark:bg-secondary_bg rounded-r-lg"
												placeholder="www.example.com"
												value={formData.website}
												onChange={(e) => setFormData({ ...formData, website: e.target.value })}
											/>
										</div>
									</div>

									<Select
										label="Competitor Location"
										placeholder="Search for competitor country"
										items={countries}
										onSelectionChange={(key) => setFormData({ ...formData, location: key as string })}
									>
										{(item) => <Select.Item key={item.id}>{item.label}</Select.Item>}
									</Select>
								</>
							)}

							{/* Mobile: Page 2 */}
							{isMobile && currentPage === 1 && (
								<>
									<Input
										label="Competitor Title"
										placeholder="What is the title of the competitor?"
										value={formData.title}
										onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									/>

									<TextArea
										label="Competitor Description"
										tooltip="Provide additional information about the competitor"
										placeholder="e.g. I joined Competitor's Customer Success team to enhance their product offerings. My focus was on onboarding new clients and addressing their concerns."
										rows={6}
										value={formData.description}
										onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									/>
								</>
							)}

							{/* Desktop: All fields visible */}
							{!isMobile && (
								<>
									<Input
										label="Competitor Name"
										placeholder="What is the name of your competitor?"
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										size="md"
									/>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<Select
											label="Competitor Library"
											placeholder="Search for competitor company"
											items={[]}
											onSelectionChange={(key) => setFormData({ ...formData, library: key as string })}
											size="md"
										>
											{() => null}
										</Select>

										<div className="flex flex-col gap-1.5">
											<label className="text-sm font-medium text-secondary dark:text-tertiary">Competitor Website</label>
											<div className="flex items-stretch rounded-lg border border-border dark:border-border bg-white dark:bg-secondary_bg shadow-sm overflow-hidden">
												<div className="flex items-center px-3 py-2.5 bg-white dark:bg-secondary_bg">
													<span className="text-base text-tertiary">https://</span>
												</div>
												<input
													type="text"
													className="flex-1 px-3.5 py-2.5 text-base text-primary dark:text-gray-100 placeholder:text-tertiary dark:placeholder:text-tertiary focus:outline-none border border-border dark:border-border bg-white dark:bg-secondary_bg rounded-r-lg"
													placeholder="www.competitor.com"
													value={formData.website}
													onChange={(e) => setFormData({ ...formData, website: e.target.value })}
												/>
											</div>
										</div>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-[280px_128px] gap-4">
										<Select
											label="Competitor Location"
											placeholder="Search for competitor country"
											items={countries}
											onSelectionChange={(key) => setFormData({ ...formData, location: key as string })}
											size="md"
										>
											{(item) => <Select.Item key={item.id}>{item.label}</Select.Item>}
										</Select>

										<Select
											label="Channel"
											items={channels}
											selectedKey={formData.channel}
											onSelectionChange={(key) => setFormData({ ...formData, channel: key as string })}
											size="md"
										>
											{(item) => <Select.Item key={item.id}>{item.label}</Select.Item>}
										</Select>
									</div>

									<Input
										label="Competitor Title"
										placeholder="What is the title of the competitor?"
										value={formData.title}
										onChange={(e) => setFormData({ ...formData, title: e.target.value })}
										size="md"
									/>

									<TextArea
										label="Competitor Description"
										tooltip="Provide additional information about the competitor"
										placeholder="e.g. I joined Competitor's Customer Success team to enhance their product offerings. My focus was on onboarding new clients and addressing their concerns."
										rows={6}
										value={formData.description}
										onChange={(e) => setFormData({ ...formData, description: e.target.value })}
										className="h-[144px]"
									/>
								</>
							)}
						</form>

						{/* Mobile Pagination Dots */}
						{isMobile && (
							<div className="flex items-center justify-center gap-4 py-5">
								{Array.from({ length: totalPages }).map((_, index) => (
									<button
										key={index}
										onClick={() => setCurrentPage(index)}
										className={cx(
											"w-2.5 h-2.5 rounded-full transition-colors",
											currentPage === index ? "bg-purple-700 dark:bg-purple-600" : "bg-border dark:bg-gray-700"
										)}
										aria-label={`Go to page ${index + 1}`}
									/>
								))}
							</div>
						)}
					</div>

				{/* Footer */}
				<div className="relative z-10 px-6 pt-8 pb-6 sm:px-6 sm:pt-8 sm:pb-6">
					<div className={cx(
						"flex gap-3",
						isMobile ? "flex-col" : "flex-row"
					)}>
							{/* Mobile: Primary button first */}
							{isMobile ? (
								<>
									<Button
										color="primary"
										size="lg"
										onClick={handleAddCompetitor}
										className="w-full shadow-[0_0_0_1px_rgba(10,13,18,0.18)_inset,0_-2px_0_0_rgba(10,13,18,0.05)_inset,0_1px_2px_0_rgba(10,13,18,0.05)] border-2 border-purple-700 dark:border-white/12"
									>
										Add Competitor
									</Button>
									<Button
										color="secondary"
										size="lg"
										onClick={handleSaveDraft}
										iconLeading={Download01}
										className="w-full shadow-[0_0_0_1px_rgba(10,13,18,0.18)_inset,0_-2px_0_0_rgba(10,13,18,0.05)_inset,0_1px_2px_0_rgba(10,13,18,0.05)]"
									>
										Save as draft
									</Button>
								</>
							) : (
								<>
									<Button
										color="secondary"
										size="lg"
										onClick={handleSaveDraft}
										iconLeading={Download01}
										className="flex-1 shadow-[0_0_0_1px_rgba(10,13,18,0.18)_inset,0_-2px_0_0_rgba(10,13,18,0.05)_inset,0_1px_2px_0_rgba(10,13,18,0.05)]"
									>
										Save as draft
									</Button>
									<Button
										color="primary"
										size="lg"
										onClick={handleAddCompetitor}
										className="flex-1 shadow-[0_0_0_1px_rgba(10,13,18,0.18)_inset,0_-2px_0_0_rgba(10,13,18,0.05)_inset,0_1px_2px_0_rgba(10,13,18,0.05)] border-2 border-purple-700 dark:border-white/12"
									>
										Add Competitor
									</Button>
								</>
							)}
						</div>
					</div>
				</DialogContent>
			</DialogPortal>
		</Dialog>
	);
}
