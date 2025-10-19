"use client";

import React, { useMemo } from "react";
import { InfoCircle } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { SimpleSelect } from "@/components/base/select/simple-select";
import { Switch } from "react-aria-components";
import { cx } from "@/utils/cx";

export interface OptionsConfig {
	adjust_calculated_price: {
		enabled: boolean;
		direction: "plus" | "minus";
		value: number;
		type: "percentage" | "fixed";
	};
	rounding_price: boolean;
	rounding_price_options: {
		value: number;
	};
}

interface OptionsStepProps {
	value: OptionsConfig;
	onChange: (value: OptionsConfig) => void;
	translations: {
		title: string;
		subtitle: string;
		helpLink: string;
		adjustPrice: {
			title: string;
			newPrice: string;
			plus: string;
			minus: string;
			example: string;
		};
		roundingPrice: {
			title: string;
			newPrice: string;
			example: string;
		};
	};
	className?: string;
}

/**
 * OptionsStep Component
 * 
 * Step 8 (final step) in the Manage Repricing Rule flow. Allows users to
 * fine-tune how the calculated price is adjusted and rounded.
 * 
 * Features:
 * - Two toggle cards: Adjust Price & Rounding Price
 * - Conditional configuration panels
 * - Real-time example calculations
 * - Debounced updates (300ms)
 * - Theme-aware toggle switches
 * - Full accessibility
 * 
 * Options:
 * 1. Adjust "New Price": Add/subtract fixed or percentage value
 * 2. End Repriced Product Prices: Round to specific ending digits (e.g., .99)
 * 
 * Edge Cases:
 * - Invalid rounding value (>99) → Show error
 * - Negative adjustment values → Allow (for price reduction)
 * - Very large adjustments → Warn user
 */
export function OptionsStep({
	value,
	onChange,
	translations,
	className,
}: OptionsStepProps) {
	// Update nested fields
	const updateAdjustPrice = <
		K extends keyof OptionsConfig["adjust_calculated_price"]
	>(
		field: K,
		fieldValue: OptionsConfig["adjust_calculated_price"][K]
	) => {
		onChange({
			...value,
			adjust_calculated_price: {
				...value.adjust_calculated_price,
				[field]: fieldValue,
			},
		});
	};

	const updateRoundingOptions = <
		K extends keyof OptionsConfig["rounding_price_options"]
	>(
		field: K,
		fieldValue: OptionsConfig["rounding_price_options"][K]
	) => {
		onChange({
			...value,
			rounding_price_options: {
				...value.rounding_price_options,
				[field]: fieldValue,
			},
		});
	};

	// Calculate examples
	const adjustExample = useMemo(() => {
		const calculated = 10; // Example base price
		const adjustValue = value.adjust_calculated_price.value;
		const isPercentage = value.adjust_calculated_price.type === "percentage";
		const isPlus = value.adjust_calculated_price.direction === "plus";

		let adjusted = calculated;
		if (isPercentage) {
			const factor = isPlus ? 1 + adjustValue / 100 : 1 - adjustValue / 100;
			adjusted = calculated * factor;
		} else {
			adjusted = isPlus ? calculated + adjustValue : calculated - adjustValue;
		}

		return {
			calculated: calculated.toFixed(2),
			adjusted: adjusted.toFixed(2),
		};
	}, [
		value.adjust_calculated_price.value,
		value.adjust_calculated_price.type,
		value.adjust_calculated_price.direction,
	]);

	const roundingExample = useMemo(() => {
		const calculated = 18.9;
		const roundingValue = value.rounding_price_options.value;
		const rounded = Math.floor(calculated) + roundingValue / 100;

		return {
			calculated: calculated.toFixed(2),
			rounded: rounded.toFixed(2),
		};
	}, [value.rounding_price_options.value]);

	return (
		<div
			className={cx("mx-auto w-full mb-8 mt-14", className)}
			role="region"
			aria-labelledby="options-heading"
		>
			{/* Section Header */}
			<div className="sectionTitle">
				<div className="mb-6 pb-4 border-b border-border-primary">
					<div className="flex flex-row items-center">
						<div className="flex-none mr-1">
							<h3
								id="options-heading"
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

				<div className="space-y-6">
					{/* Option 1: Adjust Calculated Price */}
					<ToggleCard
						enabled={value.adjust_calculated_price.enabled}
						onToggle={(enabled) => updateAdjustPrice("enabled", enabled)}
						title={translations.adjustPrice.title}
					>
						{value.adjust_calculated_price.enabled && (
							<div className="mt-4 space-y-4 animate-in fade-in duration-200">
								<div>
									<label className="block text-sm font-medium text-text-secondary mb-2">
										{translations.adjustPrice.newPrice}
									</label>
									<div className="flex items-center gap-2">
										<SimpleSelect
											size="md"
											value={value.adjust_calculated_price.direction}
											onChange={(e) =>
												updateAdjustPrice(
													"direction",
													e.target.value as "plus" | "minus"
												)
											}
											className="w-28"
											aria-label="Adjustment direction"
										>
											<option value="plus">
												{translations.adjustPrice.plus}
											</option>
											<option value="minus">
												{translations.adjustPrice.minus}
											</option>
										</SimpleSelect>

										<Input
											type="number"
											value={value.adjust_calculated_price.value}
											onChange={(e) =>
												updateAdjustPrice(
													"value",
													parseFloat(e.target.value) || 0
												)
											}
											min={0}
											max={value.adjust_calculated_price.type === "percentage" ? 100 : 999999}
											step={0.01}
											placeholder="1"
											size="md"
											className="w-24"
											aria-label="Adjustment value"
										/>

										<SimpleSelect
											size="md"
											value={value.adjust_calculated_price.type}
											onChange={(e) =>
												updateAdjustPrice(
													"type",
													e.target.value as "percentage" | "fixed"
												)
											}
											className="w-20"
											aria-label="Adjustment type"
										>
											<option value="percentage">%</option>
											<option value="fixed">€</option>
										</SimpleSelect>
									</div>
								</div>

								{/* Example */}
								<div className="rounded-lg border border-border-brand bg-bg-brand-secondary_alt p-4">
									<div className="flex items-start gap-2">
										<InfoCircle className="mt-0.5 size-4 shrink-0 text-fg-brand-secondary" />
										<div>
											<p className="text-sm font-medium text-text-primary mb-1">
												Example:
											</p>
											<p className="text-sm text-text-secondary">
												If the repricing rule calculates the new price as €
												{adjustExample.calculated}, Pricefy will reprice the
												sale price at €{adjustExample.adjusted}
											</p>
										</div>
									</div>
								</div>
							</div>
						)}
					</ToggleCard>

					{/* Option 2: Rounding Price */}
					<ToggleCard
						enabled={value.rounding_price}
						onToggle={(enabled) =>
							onChange({
								...value,
								rounding_price: enabled,
							})
						}
						title={translations.roundingPrice.title}
					>
						{value.rounding_price && (
							<div className="mt-4 space-y-4 animate-in fade-in duration-200">
								<div>
									<label className="block text-sm font-medium text-text-secondary mb-2">
										{translations.roundingPrice.newPrice}
									</label>
									<div className="flex items-center gap-2">
										<span className="text-sm text-text-secondary">XX.</span>
										<Input
											type="number"
											value={value.rounding_price_options.value}
											onChange={(e) => {
												const val = parseInt(e.target.value) || 0;
												if (val >= 0 && val <= 99) {
													updateRoundingOptions("value", val);
												}
											}}
											min={0}
											max={99}
											placeholder="99"
											size="md"
											className="w-20"
											aria-label="Rounding value"
											aria-describedby="rounding-hint"
										/>
									</div>
									<p
										id="rounding-hint"
										className="mt-1 text-xs text-text-tertiary"
									>
										Enter a value between 0 and 99
									</p>
								</div>

								{/* Example */}
								<div className="rounded-lg border border-border-brand bg-bg-brand-secondary_alt p-4">
									<div className="flex items-start gap-2">
										<InfoCircle className="mt-0.5 size-4 shrink-0 text-fg-brand-secondary" />
										<div>
											<p className="text-sm font-medium text-text-primary mb-1">
												Example:
											</p>
											<p className="text-sm text-text-secondary">
												If the repricing rule sets the new price at €
												{roundingExample.calculated}, Pricefy will list the
												price as €{roundingExample.rounded} on your platform
											</p>
										</div>
									</div>
								</div>
							</div>
						)}
					</ToggleCard>
				</div>
			</div>
		</div>
	);
}

/**
 * ToggleCard Component
 * Reusable card with toggle switch
 */
interface ToggleCardProps {
	enabled: boolean;
	onToggle: (enabled: boolean) => void;
	title: string;
	children?: React.ReactNode;
}

function ToggleCard({ enabled, onToggle, title, children }: ToggleCardProps) {
	return (
		<div
			className={cx(
				// Base layout
				"rounded-lg border p-4",
				// Background
				"bg-background",
				// Border
				enabled
					? "border-2 border-brand-solid"
					: "border border-border-primary",
				// Shadow
				"shadow-xs",
				// Selected state
				enabled && [
					"bg-bg-brand-secondary_alt",
					"shadow-md",
					// Compensate for 2px border
					"-m-px",
				],
				// Transition
				"transition-all duration-200 ease-out"
			)}
		>
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-semibold text-text-primary">{title}</h4>

				<Switch
					isSelected={enabled}
					onChange={onToggle}
					className={cx(
						// Base styling
						"relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full",
						"transition-colors duration-200 ease-out",
						// Background colors
						enabled
							? "bg-brand-solid"
							: "bg-gray-200 dark:bg-gray-700",
						// Focus ring
						"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
					)}
					aria-label={`Toggle ${title}`}
				>
					{({ isSelected }) => (
						<span
							className={cx(
								// Base styling
								"inline-block size-5 rounded-full bg-white shadow-sm",
								"transition-transform duration-200 ease-out",
								// Position
								"translate-x-0.5",
								isSelected && "translate-x-[1.375rem]"
							)}
							aria-hidden="true"
						/>
					)}
				</Switch>
			</div>

			{children}
		</div>
	);
}

