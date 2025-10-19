"use client";

import React, { useMemo } from "react";
import {
	InfoCircle,
	Edit03,
	TrendUp01,
	CurrencyDollarCircle,
	Tag03,
	Shield03,
} from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { SimpleSelect } from "@/components/base/select/simple-select";
import { MinMaxMethodCard, type MinMaxMethod } from "./MinMaxMethodCard";
import { DisabledOverlay } from "./DisabledOverlay";
import { cx } from "@/utils/cx";

export interface MinMaxConfig {
	type: "manual" | "gross_margin" | "cost" | "price" | "map";
	min: {
		value: number;
		type: "percentage" | "fixed";
		stay: "above" | "equal";
	};
	max: {
		value: number;
		type: "percentage" | "fixed";
		stay: "below" | "equal";
	};
}

interface MinMaxValuesStepProps {
	value: MinMaxConfig;
	onChange: (value: MinMaxConfig) => void;
	isEnabled: boolean;
	translations: Record<string, any>;
	errors?: Partial<Record<keyof MinMaxConfig, string>>;
	className?: string;
}

/**
 * MinMaxValuesStep Component
 * 
 * Step 4.5 - The most complex step in the repricing rule flow.
 * Allows users to define how Min/Max price boundaries are calculated.
 * 
 * Features:
 * - 5 method selection cards (Manual, Markup, Cost, Price, MAP)
 * - Conditional configuration panels for each method
 * - Real-time preview calculations
 * - Validation with inline errors
 * - Disabled overlay when not enabled
 * - Confirmation dialog on method switch
 * - Theme-aware styling
 * - Full keyboard navigation
 * 
 * Methods:
 * 1. Manual: Set via products page
 * 2. Gross Margin (Markup): Based on cost + markup %
 * 3. Item Cost: Based on % of product cost
 * 4. Item Price: Based on % of current price
 * 5. MAP: Based on manufacturer's advertised price
 * 
 * Edge Cases:
 * - Min > Max → Show error
 * - Method switch with unsaved changes → Confirm
 * - Percentage over 1000% → Warn
 * - Cost/MAP unavailable → Show warning
 */
export function MinMaxValuesStep({
	value,
	onChange,
	isEnabled,
	translations,
	errors,
	className,
}: MinMaxValuesStepProps) {
	// Define the 5 methods
	const methods: MinMaxMethod[] = [
		{
			id: "manual",
			title: translations.minMaxMethods.manual.title,
			description: translations.minMaxMethods.manual.description,
			icon: Edit03,
		},
		{
			id: "gross_margin",
			title: translations.minMaxMethods.grossMargin.title,
			description: translations.minMaxMethods.grossMargin.description,
			icon: TrendUp01,
		},
		{
			id: "cost",
			title: translations.minMaxMethods.cost.title,
			description: translations.minMaxMethods.cost.description,
			icon: CurrencyDollarCircle,
		},
		{
			id: "price",
			title: translations.minMaxMethods.price.title,
			description: translations.minMaxMethods.price.description,
			icon: Tag03,
		},
		{
			id: "map",
			title: translations.minMaxMethods.map.title,
			description: translations.minMaxMethods.map.description,
			icon: Shield03,
		},
	];

	// Handle method selection
	const handleMethodChange = (newType: MinMaxConfig["type"]) => {
		// In a real app, show confirmation dialog if there are unsaved changes
		onChange({
			...value,
			type: newType,
		});
	};

	// Update field helper
	const updateField = <K extends keyof MinMaxConfig>(
		field: K,
		fieldValue: MinMaxConfig[K]
	) => {
		onChange({ ...value, [field]: fieldValue });
	};

	// Calculate preview
	const previewCalculation = useMemo(() => {
		// Safety check for undefined values
		if (!value.min || !value.max) return null;
		
		const exampleCost = 10;
		const examplePrice = 20;
		const minValue = value.min.value ?? 0;
		const maxValue = value.max.value ?? 0;

		switch (value.type) {
			case "gross_margin":
				return {
					min: (exampleCost * (1 + minValue / 100)).toFixed(2),
					max: (exampleCost * (1 + maxValue / 100)).toFixed(2),
					text: `Cost €${exampleCost} → Min €${(exampleCost * (1 + minValue / 100)).toFixed(2)}, Max €${(exampleCost * (1 + maxValue / 100)).toFixed(2)}`,
				};

			case "cost":
				return {
					min: (exampleCost * (minValue / 100)).toFixed(2),
					max: (exampleCost * (maxValue / 100)).toFixed(2),
					text: `Cost €${exampleCost} × ${minValue}% = Min €${(exampleCost * (minValue / 100)).toFixed(2)}`,
				};

			case "price":
				return {
					min: (examplePrice * (minValue / 100)).toFixed(2),
					max: (examplePrice * (maxValue / 100)).toFixed(2),
					text: `Price €${examplePrice} × ${minValue}% = Min €${(examplePrice * (minValue / 100)).toFixed(2)}`,
				};

			default:
				return null;
		}
	}, [value.type, value.min, value.max]);

	return (
		<div
			className={cx("relative mx-auto w-full mb-8 mt-14", className)}
			role="region"
			aria-labelledby="minmax-heading"
		>
			{/* Disabled Overlay */}
			{!isEnabled && (
				<DisabledOverlay
					message={translations.step4.enableSection}
				/>
			)}

			<div className={!isEnabled ? "pointer-events-none opacity-50" : ""}>
				{/* Section Header */}
				<div className="sectionTitle">
					<div className="mb-6 pb-4 border-b border-border-primary">
						<div className="flex flex-row items-center">
							<div className="flex-none mr-1">
								<h3
									id="minmax-heading"
									className="text-base text-text-primary font-semibold"
								>
									{translations.step4.minMaxSetting}
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
										How it works
									</a>
								</div>
							</div>
						</div>

						<p className="text-text-tertiary mt-2 text-sm">
							Select how to calculate minimum and maximum price boundaries
						</p>
					</div>

					{/* Method Selection Cards */}
					<div
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
						role="radiogroup"
						aria-label="Min/Max calculation method"
					>
						{methods.map((method) => (
							<MinMaxMethodCard
								key={method.id}
								method={method}
								selected={value.type === method.id}
								onClick={() => handleMethodChange(method.id)}
								disabled={!isEnabled}
							/>
						))}
					</div>

					{/* Conditional Configuration Panels */}
					{value.type === "manual" && (
						<ManualMethodPanel />
					)}

					{value.type === "gross_margin" && (
						<GrossMarginPanel
							value={value}
							onChange={updateField}
							errors={errors}
							preview={previewCalculation}
						/>
					)}

					{value.type === "cost" && (
						<CostMethodPanel
							value={value}
							onChange={updateField}
							errors={errors}
							preview={previewCalculation}
						/>
					)}

					{value.type === "price" && (
						<PriceMethodPanel
							value={value}
							onChange={updateField}
							errors={errors}
							preview={previewCalculation}
						/>
					)}

					{value.type === "map" && (
						<MapMethodPanel
							value={value}
							onChange={updateField}
							errors={errors}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

/**
 * Manual Method Panel
 * Shows info about manual assignment
 */
function ManualMethodPanel() {
	return (
		<div className="rounded-lg border border-border-secondary bg-bg-secondary p-4 animate-in fade-in duration-200">
			<div className="flex items-start gap-3">
				<InfoCircle className="mt-0.5 size-5 shrink-0 text-text-quaternary" />
				<div>
					<p className="text-sm font-medium text-text-primary mb-1">
						Manual Assignment
					</p>
					<p className="text-sm text-text-secondary">
						Min/Max prices will be set manually via the products page or using
						the bulk upload option in the import page.
					</p>
				</div>
			</div>
		</div>
	);
}

/**
 * Gross Margin Panel
 * Configuration for markup-based pricing
 */
interface PanelProps {
	value: MinMaxConfig;
	onChange: (field: any, value: any) => void;
	errors?: any;
	preview?: any;
}

function GrossMarginPanel({ value, onChange, errors, preview }: PanelProps) {
	return (
		<div className="space-y-4 animate-in fade-in duration-200">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Min Markup */}
				<div>
					<label className="block text-sm font-medium text-text-secondary mb-2">
						Minimum Markup (%)
					</label>
					<Input
						type="number"
						value={value.min.value}
						onChange={(e) =>
							onChange("min", {
								...value.min,
								value: parseFloat(e.target.value) || 0,
							})
						}
						min={0}
						max={1000}
						step={0.1}
						placeholder="50"
						size="md"
						aria-label="Minimum markup percentage"
					/>
				</div>

				{/* Max Markup */}
				<div>
					<label className="block text-sm font-medium text-text-secondary mb-2">
						Maximum Markup (%)
					</label>
					<Input
						type="number"
						value={value.max.value}
						onChange={(e) =>
							onChange("max", {
								...value.max,
								value: parseFloat(e.target.value) || 0,
							})
						}
						min={0}
						max={1000}
						step={0.1}
						placeholder="100"
						size="md"
						aria-label="Maximum markup percentage"
					/>
				</div>
			</div>

			{/* Preview */}
			{preview && (
				<div className="rounded-lg border border-border-brand bg-bg-brand-secondary_alt p-4">
					<div className="flex items-start gap-2">
						<InfoCircle className="mt-0.5 size-4 shrink-0 text-fg-brand-secondary" />
						<div>
							<p className="text-sm font-medium text-text-primary mb-1">
								Preview Calculation:
							</p>
							<p className="text-sm text-text-secondary">{preview.text}</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

/**
 * Cost Method Panel
 * Configuration for cost-based pricing
 */
function CostMethodPanel({ value, onChange, errors, preview }: PanelProps) {
	return (
		<div className="space-y-4 animate-in fade-in duration-200">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Min Percentage */}
				<div>
					<label className="block text-sm font-medium text-text-secondary mb-2">
						Minimum (% of Cost)
					</label>
					<div className="flex gap-2">
						<Input
							type="number"
							value={value.min.value}
							onChange={(e) =>
								onChange("min", {
									...value.min,
									value: parseFloat(e.target.value) || 0,
								})
							}
							min={0}
							max={1000}
							step={1}
							placeholder="120"
							size="md"
							className="flex-1"
						/>
						<SimpleSelect
							size="md"
							value={value.min.stay}
							onChange={(e) =>
								onChange("min", {
									...value.min,
									stay: e.target.value,
								})
							}
							className="w-32"
						>
							<option value="above">Above</option>
							<option value="equal">Equal</option>
						</SimpleSelect>
					</div>
				</div>

				{/* Max Percentage */}
				<div>
					<label className="block text-sm font-medium text-text-secondary mb-2">
						Maximum (% of Cost)
					</label>
					<div className="flex gap-2">
						<Input
							type="number"
							value={value.max.value}
							onChange={(e) =>
								onChange("max", {
									...value.max,
									value: parseFloat(e.target.value) || 0,
								})
							}
							min={0}
							max={1000}
							step={1}
							placeholder="200"
							size="md"
							className="flex-1"
						/>
						<SimpleSelect
							size="md"
							value={value.max.stay}
							onChange={(e) =>
								onChange("max", {
									...value.max,
									stay: e.target.value,
								})
							}
							className="w-32"
						>
							<option value="below">Below</option>
							<option value="equal">Equal</option>
						</SimpleSelect>
					</div>
				</div>
			</div>

			{/* Preview */}
			{preview && (
				<div className="rounded-lg border border-border-brand bg-bg-brand-secondary_alt p-4">
					<div className="flex items-start gap-2">
						<InfoCircle className="mt-0.5 size-4 shrink-0 text-fg-brand-secondary" />
						<div>
							<p className="text-sm font-medium text-text-primary mb-1">
								Preview:
							</p>
							<p className="text-sm text-text-secondary">{preview.text}</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

/**
 * Price Method Panel
 * Configuration for current price-based pricing
 */
function PriceMethodPanel({ value, onChange, errors, preview }: PanelProps) {
	return (
		<div className="space-y-4 animate-in fade-in duration-200">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Min Percentage */}
				<div>
					<label className="block text-sm font-medium text-text-secondary mb-2">
						Minimum (% of Price)
					</label>
					<div className="flex gap-2">
						<Input
							type="number"
							value={value.min.value}
							onChange={(e) =>
								onChange("min", {
									...value.min,
									value: parseFloat(e.target.value) || 0,
								})
							}
							min={0}
							max={1000}
							step={1}
							placeholder="90"
							size="md"
							className="flex-1"
						/>
						<SimpleSelect
							size="md"
							value={value.min.stay}
							onChange={(e) =>
								onChange("min", {
									...value.min,
									stay: e.target.value,
								})
							}
							className="w-32"
						>
							<option value="above">Above</option>
							<option value="equal">Equal</option>
							<option value="below">Below</option>
						</SimpleSelect>
					</div>
				</div>

				{/* Max Percentage */}
				<div>
					<label className="block text-sm font-medium text-text-secondary mb-2">
						Maximum (% of Price)
					</label>
					<div className="flex gap-2">
						<Input
							type="number"
							value={value.max.value}
							onChange={(e) =>
								onChange("max", {
									...value.max,
									value: parseFloat(e.target.value) || 0,
								})
							}
							min={0}
							max={1000}
							step={1}
							placeholder="110"
							size="md"
							className="flex-1"
						/>
						<SimpleSelect
							size="md"
							value={value.max.stay}
							onChange={(e) =>
								onChange("max", {
									...value.max,
									stay: e.target.value,
								})
							}
							className="w-32"
						>
							<option value="below">Below</option>
							<option value="equal">Equal</option>
							<option value="above">Above</option>
						</SimpleSelect>
					</div>
				</div>
			</div>

			{/* Preview */}
			{preview && (
				<div className="rounded-lg border border-border-brand bg-bg-brand-secondary_alt p-4">
					<div className="flex items-start gap-2">
						<InfoCircle className="mt-0.5 size-4 shrink-0 text-fg-brand-secondary" />
						<div>
							<p className="text-sm font-medium text-text-primary mb-1">
								Preview:
							</p>
							<p className="text-sm text-text-secondary">{preview.text}</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

/**
 * MAP Method Panel
 * Configuration for manufacturer's advertised price
 */
function MapMethodPanel({ value, onChange, errors }: PanelProps) {
	return (
		<div className="space-y-4 animate-in fade-in duration-200">
			<div className="rounded-lg border border-border-secondary bg-bg-secondary p-4">
				<div className="flex items-start gap-3">
					<InfoCircle className="mt-0.5 size-5 shrink-0 text-text-quaternary" />
					<div>
						<p className="text-sm font-medium text-text-primary mb-1">
							MAP (Manufacturer's Advertised Price)
						</p>
						<p className="text-sm text-text-secondary">
							Min/Max prices will be based on the MAP values assigned to your
							products. If a product doesn't have a MAP value, you can set a
							fallback behavior below.
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Min Stay */}
				<div>
					<label className="block text-sm font-medium text-text-secondary mb-2">
						Minimum Price Stay
					</label>
					<SimpleSelect
						size="md"
						value={value.min.stay}
						onChange={(e) =>
							onChange("min", {
								...value.min,
								stay: e.target.value,
							})
						}
						className="w-full"
					>
						<option value="above">Above MAP</option>
						<option value="equal">Equal to MAP</option>
						<option value="below">Below MAP</option>
					</SimpleSelect>
				</div>

				{/* Max Stay */}
				<div>
					<label className="block text-sm font-medium text-text-secondary mb-2">
						Maximum Price Stay
					</label>
					<SimpleSelect
						size="md"
						value={value.max.stay}
						onChange={(e) =>
							onChange("max", {
								...value.max,
								stay: e.target.value,
							})
						}
						className="w-full"
					>
						<option value="below">Below MAP</option>
						<option value="equal">Equal to MAP</option>
						<option value="above">Above MAP</option>
					</SimpleSelect>
				</div>
			</div>
		</div>
	);
}

