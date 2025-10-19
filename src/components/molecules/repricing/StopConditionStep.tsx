"use client";

import React, { useMemo } from "react";
import { InfoCircle } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { SimpleSelect } from "@/components/base/select/simple-select";
import { cx } from "@/utils/cx";

export interface StopConditionConfig {
	type: "price" | "none";
	value?: "min_price" | "max_price" | "min_max_price";
	filter?: "not_lower_and_higher";
	options?: {
		active: boolean;
	};
}

interface StopConditionStepProps {
	value: StopConditionConfig;
	onChange: (value: StopConditionConfig) => void;
	translations: {
		title: string;
		subtitle: string;
		helpLink: string;
		types: {
			price: string;
			none: string;
		};
		minMaxSetting: string;
		enableSection: string;
	};
	errors?: {
		type?: string;
		value?: string;
	};
	className?: string;
}

/**
 * StopConditionStep Component
 * 
 * Step 4 in the Manage Repricing Rule flow. Allows users to define when
 * the repricing rule should stop executing.
 * 
 * Features:
 * - Dropdown to select condition type (New Price, No Condition)
 * - Conditional fields based on selection
 * - Dynamic example showing when rule stops
 * - Min/Max price boundary inputs
 * - Real-time validation
 * - Accessible form controls
 * 
 * Conditional Logic:
 * - "No Condition" → No additional fields
 * - "New Price" → Shows value dropdown (Min, Max, Min-Max)
 * 
 * Validation:
 * - Type is required
 * - If type is "price", value is required
 * 
 * Edge Cases:
 * - User switches from Price to No Condition → Clear value
 * - Invalid combinations → Show error
 */
export function StopConditionStep({
	value,
	onChange,
	translations,
	errors,
	className,
}: StopConditionStepProps) {
	// Update field helper
	const updateField = <K extends keyof StopConditionConfig>(
		field: K,
		fieldValue: StopConditionConfig[K]
	) => {
		const updated = { ...value, [field]: fieldValue };

		// Clear value if switching to "none"
		if (field === "type" && fieldValue === "none") {
			updated.value = undefined;
			updated.filter = undefined;
		}

		onChange(updated);
	};

	// Calculate if min/max section should be enabled
	const isMinMaxEnabled = useMemo(() => {
		return (
			value.type === "price" &&
			(value.value === "min_price" ||
				value.value === "max_price" ||
				value.value === "min_max_price")
		);
	}, [value.type, value.value]);

	// Generate dynamic example text
	const exampleText = useMemo(() => {
		if (value.type === "none") {
			return "Rule runs continuously without any stop condition";
		}

		if (value.type === "price" && value.value) {
			const valueLabels = {
				min_price: "reaches the minimum price boundary",
				max_price: "reaches the maximum price boundary",
				min_max_price: "reaches either the minimum or maximum price boundary",
			};

			return `Rule will stop when new price ${valueLabels[value.value]}`;
		}

		return "Please select a stop condition type";
	}, [value.type, value.value]);

	return (
		<div
			className={cx("mx-auto w-full mb-8 mt-14", className)}
			role="region"
			aria-labelledby="stop-condition-heading"
		>
			{/* Section Header */}
			<div className="sectionTitle">
				<div className="mb-4 pb-4 border-b border-border-primary">
					<div className="flex flex-row items-center">
						<div className="flex-none mr-1">
							<h3
								id="stop-condition-heading"
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

				{/* Stop Condition Type Selection */}
				<div className="mb-6">
					<label className="block text-sm font-medium text-text-secondary mb-2">
						Stop Condition Type
					</label>
					<SimpleSelect
						size="md"
						value={value.type}
						onChange={(e) =>
							updateField("type", e.target.value as StopConditionConfig["type"])
						}
						className="w-full sm:w-1/2"
						isInvalid={!!errors?.type}
						aria-label="Stop condition type"
						aria-describedby={errors?.type ? "type-error" : undefined}
					>
						<option value="none">{translations.types.none}</option>
						<option value="price">{translations.types.price}</option>
					</SimpleSelect>

					{errors?.type && (
						<p
							id="type-error"
							className="mt-2 text-sm text-text-error"
							role="alert"
						>
							{errors.type}
						</p>
					)}
				</div>

				{/* Conditional Fields for "New Price" */}
				{value.type === "price" && (
					<div className="mb-6 animate-in fade-in duration-200">
						<label className="block text-sm font-medium text-text-secondary mb-2">
							{translations.minMaxSetting}
						</label>
						<SimpleSelect
							size="md"
							value={value.value || ""}
							onChange={(e) =>
								updateField(
									"value",
									e.target.value as StopConditionConfig["value"]
								)
							}
							className="w-full sm:w-1/2"
							isInvalid={!!errors?.value}
							aria-label="Min/Max setting"
							aria-describedby={errors?.value ? "value-error" : undefined}
						>
							<option value="">Select Min/Max setting...</option>
							<option value="min_price">Min Price</option>
							<option value="max_price">Max Price</option>
							<option value="min_max_price">Min & Max Price</option>
						</SimpleSelect>

						{errors?.value && (
							<p
								id="value-error"
								className="mt-2 text-sm text-text-error"
								role="alert"
							>
								{errors.value}
							</p>
						)}

						{/* Filter Option */}
						{value.value && (
							<div className="mt-4">
								<SimpleSelect
									size="md"
									value={value.filter || ""}
									onChange={(e) =>
										updateField(
											"filter",
											e.target.value as StopConditionConfig["filter"]
										)
									}
									className="w-full sm:w-1/2"
									aria-label="Price filter"
								>
									<option value="">No filter</option>
									<option value="not_lower_and_higher">
										Not lower and not higher
									</option>
								</SimpleSelect>
							</div>
						)}
					</div>
				)}

				{/* Dynamic Example Box */}
				<div
					className={cx(
						"rounded-lg border p-4 transition-colors duration-200",
						isMinMaxEnabled
							? "bg-bg-brand-secondary_alt border-border-brand"
							: "bg-bg-secondary border-border-secondary"
					)}
					role="status"
					aria-live="polite"
				>
					<div className="flex items-start gap-2">
						<InfoCircle
							className={cx(
								"mt-0.5 size-4 shrink-0",
								isMinMaxEnabled ? "text-fg-brand-secondary" : "text-text-quaternary"
							)}
							aria-hidden="true"
						/>
						<div>
							<p className="text-sm font-medium text-text-primary mb-1">
								Example:
							</p>
							<p className="text-sm text-text-secondary">{exampleText}</p>
						</div>
					</div>
				</div>

				{/* Information about Min/Max section */}
				{!isMinMaxEnabled && value.type !== "none" && (
					<div className="mt-4 rounded-lg border border-border-warning bg-bg-warning-secondary p-4">
						<p className="text-sm text-text-warning">
							<strong className="font-semibold">Note:</strong>{" "}
							{translations.enableSection}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

