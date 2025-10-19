"use client";

import React from "react";
import { InfoCircle } from "@untitledui/icons";
import { Radio, RadioGroup } from "react-aria-components";
import { cx } from "@/utils/cx";

export interface ApplyToProductsConfig {
	type: "all" | "categories" | "individual";
	selectedCategories?: string[];
	selectedProducts?: string[];
}

interface ApplyToProductsStepProps {
	value: ApplyToProductsConfig;
	onChange: (value: ApplyToProductsConfig) => void;
	translations: {
		title: string;
		subtitle: string;
		helpLink: string;
		allProducts: string;
		specificCategories: string;
		individualProducts: string;
		selectedCount: string;
	};
	className?: string;
}

/**
 * ApplyToProductsStep Component
 * 
 * Step 5 in the Manage Repricing Rule flow. Allows users to select which
 * products the repricing rule should apply to.
 * 
 * Features:
 * - Three radio options: All Products, Specific Categories, Individual Products
 * - Conditional product/category selectors
 * - Selected count display
 * - Theme-aware styling
 * - Full accessibility
 * 
 * Selection Methods:
 * 1. All Products: Apply to entire catalog (default)
 * 2. Specific Categories: Select from category tree
 * 3. Individual Products: Search and select specific products
 * 
 * Edge Cases:
 * - Category deleted → Remove from selection, notify user
 * - Product deleted → Remove from list
 * - Large catalogs → Paginate/virtual scroll
 */
export function ApplyToProductsStep({
	value,
	onChange,
	translations,
	className,
}: ApplyToProductsStepProps) {
	const handleTypeChange = (newType: ApplyToProductsConfig["type"]) => {
		onChange({
			...value,
			type: newType,
			// Clear selections when changing type
			selectedCategories:
				newType === "categories" ? value.selectedCategories || [] : undefined,
			selectedProducts:
				newType === "individual" ? value.selectedProducts || [] : undefined,
		});
	};

	// Calculate selected count
	const selectedCount =
		value.type === "categories"
			? value.selectedCategories?.length || 0
			: value.type === "individual"
			? value.selectedProducts?.length || 0
			: 0;

	return (
		<div
			className={cx("mx-auto w-full mb-8 mt-14", className)}
			role="region"
			aria-labelledby="products-heading"
		>
			{/* Section Header */}
			<div className="sectionTitle">
				<div className="mb-6 pb-4 border-b border-border-primary">
					<div className="flex flex-row items-center">
						<div className="flex-none mr-1">
							<h3
								id="products-heading"
								className="text-base text-text-primary font-semibold"
							>
								{translations.title}
							</h3>
						</div>

						<div className="flex-none">
							<InfoCircle
								className="w-4 h-4 text-text-quaternary cursor-pointer hover:text-text-tertiary transition-colors"
								aria-label="More information"
							/>
						</div>

						<div className="flex-none">
							<div className="ml-1 items-center">
								<a
									href="https://help.pricefy.io/#"
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs underline text-text-brand cursor-pointer hover:text-text-brand-secondary transition-colors"
								>
									{translations.helpLink}
								</a>
							</div>
						</div>
					</div>

					<p className="text-text-tertiary mt-2 text-sm">
						{translations.subtitle}
					</p>
				</div>

				{/* Radio Group */}
				<RadioGroup
					value={value.type}
					onChange={handleTypeChange}
					className="space-y-4 mb-6"
					aria-label="Product selection method"
				>
					{/* All Products Option */}
					<RadioCard value="all" selected={value.type === "all"}>
						<div className="flex items-center gap-4">
							<Radio
								value="all"
								className={cx(
									"flex size-5 shrink-0 items-center justify-center rounded-full border-2",
									"transition-colors duration-150",
									value.type === "all"
										? "border-brand-solid bg-brand-solid"
										: "border-border-primary bg-background",
									"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
								)}
							>
								{value.type === "all" && (
									<div className="size-2 rounded-full bg-white" />
								)}
							</Radio>

							<div className="flex-1">
								<h4 className="text-sm font-semibold text-text-primary">
									{translations.allProducts}
								</h4>
								<p className="text-sm text-text-tertiary mt-0.5">
									Apply this rule to all products in your catalog
								</p>
							</div>
						</div>
					</RadioCard>

					{/* Specific Categories Option */}
					<RadioCard value="categories" selected={value.type === "categories"}>
						<div className="flex items-start gap-4">
							<Radio
								value="categories"
								className={cx(
									"mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
									"transition-colors duration-150",
									value.type === "categories"
										? "border-brand-solid bg-brand-solid"
										: "border-border-primary bg-background",
									"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
								)}
							>
								{value.type === "categories" && (
									<div className="size-2 rounded-full bg-white" />
								)}
							</Radio>

							<div className="flex-1">
								<h4 className="text-sm font-semibold text-text-primary">
									{translations.specificCategories}
								</h4>
								<p className="text-sm text-text-tertiary mt-0.5 mb-3">
									Apply this rule to products in specific categories
								</p>

								{/* Category Selector Placeholder */}
								{value.type === "categories" && (
									<div className="animate-in fade-in duration-200">
										<div className="rounded-lg border border-border-secondary bg-bg-secondary p-4">
											<p className="text-sm text-text-secondary">
												Category selector coming soon. You can select multiple
												categories from your product catalog.
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</RadioCard>

					{/* Individual Products Option */}
					<RadioCard value="individual" selected={value.type === "individual"}>
						<div className="flex items-start gap-4">
							<Radio
								value="individual"
								className={cx(
									"mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
									"transition-colors duration-150",
									value.type === "individual"
										? "border-brand-solid bg-brand-solid"
										: "border-border-primary bg-background",
									"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
								)}
							>
								{value.type === "individual" && (
									<div className="size-2 rounded-full bg-white" />
								)}
							</Radio>

							<div className="flex-1">
								<h4 className="text-sm font-semibold text-text-primary">
									{translations.individualProducts}
								</h4>
								<p className="text-sm text-text-tertiary mt-0.5 mb-3">
									Select specific products to apply this rule to
								</p>

								{/* Product Selector Placeholder */}
								{value.type === "individual" && (
									<div className="animate-in fade-in duration-200">
										<div className="rounded-lg border border-border-secondary bg-bg-secondary p-4">
											<p className="text-sm text-text-secondary">
												Product selector coming soon. You can search and select
												individual products from your catalog.
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</RadioCard>
				</RadioGroup>

				{/* Selected Count */}
				{(value.type === "categories" || value.type === "individual") &&
					selectedCount > 0 && (
						<div className="mt-4 px-4 py-3 bg-bg-secondary rounded-lg">
							<p className="text-sm text-text-secondary">
								<strong className="text-text-primary font-semibold">
									{selectedCount}
								</strong>{" "}
								{value.type === "categories" ? "categories" : "products"}{" "}
								selected
							</p>
						</div>
					)}
			</div>
		</div>
	);
}

/**
 * RadioCard Component
 * Styled container for radio options
 */
interface RadioCardProps {
	value: string;
	selected: boolean;
	children: React.ReactNode;
}

function RadioCard({ value, selected, children }: RadioCardProps) {
	return (
		<div
			className={cx(
				// Base layout
				"relative rounded-lg border p-4",
				// Background
				"bg-background",
				// Border
				selected ? "border-2 border-brand-solid" : "border border-border-primary",
				// Shadow
				"shadow-xs",
				// Transitions
				"transition-all duration-200 ease-out",
				// Hover (if not selected)
				!selected && "hover:border-border-brand hover:shadow-md",
				// Selected state
				selected && [
					"bg-bg-brand-secondary_alt",
					"shadow-md",
					// Compensate for 2px border
					"-m-px",
				]
			)}
		>
			{children}
		</div>
	);
}

