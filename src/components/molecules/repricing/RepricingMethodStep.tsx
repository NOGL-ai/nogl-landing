"use client";

import React from "react";
import { InfoCircle } from "@untitledui/icons";
import { Checkbox as AriaCheckbox, Radio, RadioGroup } from "react-aria-components";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { SimpleSelect } from "@/components/base/select/simple-select";
import { cx } from "@/utils/cx";

export interface RepricingMethodConfig {
	autopilot: boolean;
	options: {
		autopilot_after_import: boolean;
		autopilot_fixed_time: boolean;
		autopilot_fixed_time_value: number;
	};
}

interface RepricingMethodStepProps {
	value: RepricingMethodConfig;
	onChange: (value: RepricingMethodConfig) => void;
	isPremium?: boolean;
	onUpgradeClick?: () => void;
	translations: {
		title: string;
		subtitle: string;
		helpLink: string;
		semiAutomatic: {
			title: string;
			description: string;
		};
		autopilot: {
			title: string;
			description: string;
			upgrade: string;
			afterImport: string;
			fixedTime: string;
			timezone: string;
		};
	};
	className?: string;
}

/**
 * RepricingMethodStep Component
 * 
 * Step 7 in the Manage Repricing Rule flow. Allows users to choose between
 * semi-automatic (suggested prices) or autopilot (automatic repricing).
 * 
 * Features:
 * - Two radio options: Semi-Automatic vs Autopilot
 * - Premium badge for Autopilot
 * - Conditional sub-options when Autopilot selected
 * - Time picker for fixed schedule
 * - Timezone display
 * - Upgrade modal trigger for non-premium users
 * - Theme-aware styling
 * - Full accessibility
 * 
 * Edge Cases:
 * - Non-premium user clicks Autopilot → Show upgrade modal
 * - Fixed time option → Disable if after-import is checked
 * - Time selection → 24-hour format with timezone
 */
export function RepricingMethodStep({
	value,
	onChange,
	isPremium = false,
	onUpgradeClick,
	translations,
	className,
}: RepricingMethodStepProps) {
	const handleMethodChange = (methodValue: string) => {
		const isAutopilot = methodValue === "autopilot";

		// If user is not premium and tries to select autopilot, show upgrade modal
		if (isAutopilot && !isPremium) {
			onUpgradeClick?.();
			return;
		}

		onChange({
			...value,
			autopilot: isAutopilot,
		});
	};

	const updateOptions = <K extends keyof RepricingMethodConfig["options"]>(
		option: K,
		optionValue: RepricingMethodConfig["options"][K]
	) => {
		onChange({
			...value,
			options: {
				...value.options,
				[option]: optionValue,
			},
		});
	};

	// Generate time options (0-23)
	const timeOptions = Array.from({ length: 24 }, (_, i) => ({
		value: i,
		label: `${i.toString().padStart(2, "0")}:00`,
	}));

	return (
		<div
			className={cx("mx-auto w-full mb-8 mt-14", className)}
			role="region"
			aria-labelledby="method-heading"
		>
			{/* Section Header */}
			<div className="sectionTitle">
				<div className="mb-6 pb-4 border-b border-border-primary">
					<div className="flex flex-row items-center">
						<div className="flex-none mr-1">
							<h3
								id="method-heading"
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
					value={value.autopilot ? "autopilot" : "semi-automatic"}
					onChange={handleMethodChange}
					className="space-y-4"
					aria-label="Repricing method selection"
				>
					{/* Semi-Automatic Option */}
					<RadioCard
						value="semi-automatic"
						selected={!value.autopilot}
						disabled={false}
					>
						<div className="flex items-start gap-4">
							<Radio
								value="semi-automatic"
								className={cx(
									"mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
									"transition-colors duration-150",
									!value.autopilot
										? "border-brand-solid bg-brand-solid"
										: "border-border-primary bg-background",
									"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
								)}
							>
								{!value.autopilot && (
									<div className="size-2 rounded-full bg-white" />
								)}
							</Radio>

							<div className="flex-1">
								<h4 className="text-sm font-semibold text-text-primary mb-1">
									{translations.semiAutomatic.title}
								</h4>
								<p className="text-sm text-text-tertiary">
									{translations.semiAutomatic.description}
								</p>
							</div>
						</div>
					</RadioCard>

					{/* Autopilot Option */}
					<RadioCard
						value="autopilot"
						selected={value.autopilot}
						disabled={!isPremium}
					>
						<div className="flex items-start gap-4">
							<Radio
								value="autopilot"
								isDisabled={!isPremium}
								className={cx(
									"mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
									"transition-colors duration-150",
									value.autopilot
										? "border-brand-solid bg-brand-solid"
										: "border-border-primary bg-background",
									"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
									!isPremium && "cursor-not-allowed opacity-50"
								)}
							>
								{value.autopilot && (
									<div className="size-2 rounded-full bg-white" />
								)}
							</Radio>

							<div className="flex-1">
								<div className="flex items-center gap-2 mb-1">
									<h4 className="text-sm font-semibold text-text-primary">
										{translations.autopilot.title}
									</h4>
									{!isPremium && (
										<BadgeWithDot
											color="success"
											size="sm"
											className="text-xs"
										>
											{translations.autopilot.upgrade}
										</BadgeWithDot>
									)}
								</div>
								<p className="text-sm text-text-tertiary mb-4">
									{translations.autopilot.description}
								</p>

								{/* Autopilot Sub-options */}
								{(value.autopilot || !isPremium) && (
									<div
										className={cx(
											"space-y-3 pl-1",
											!value.autopilot && "opacity-50 pointer-events-none"
										)}
									>
										{/* After Import Option */}
										<label className="flex items-start gap-3 cursor-pointer group">
											<AriaCheckbox
												isSelected={value.options.autopilot_after_import}
												onChange={(checked) =>
													updateOptions("autopilot_after_import", checked)
												}
												isDisabled={!value.autopilot}
												className={cx(
													"mt-0.5 flex size-4 shrink-0 items-center justify-center rounded",
													"border-2 border-border-primary bg-background",
													"transition-all duration-150",
													"data-[selected]:border-brand-solid data-[selected]:bg-brand-solid",
													"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
													!value.autopilot && "cursor-not-allowed"
												)}
											>
												{({ isSelected }) =>
													isSelected && (
														<svg
															className="size-3 text-white"
															viewBox="0 0 12 12"
															fill="none"
														>
															<path
																d="M10 3L4.5 8.5L2 6"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
															/>
														</svg>
													)
												}
											</AriaCheckbox>
											<span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
												{translations.autopilot.afterImport}
											</span>
										</label>

										{/* Fixed Time Option */}
										<div className="flex items-start gap-3">
											<AriaCheckbox
												isSelected={value.options.autopilot_fixed_time}
												onChange={(checked) =>
													updateOptions("autopilot_fixed_time", checked)
												}
												isDisabled={!value.autopilot}
												className={cx(
													"mt-0.5 flex size-4 shrink-0 items-center justify-center rounded",
													"border-2 border-border-primary bg-background",
													"transition-all duration-150",
													"data-[selected]:border-brand-solid data-[selected]:bg-brand-solid",
													"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
													!value.autopilot && "cursor-not-allowed"
												)}
											>
												{({ isSelected }) =>
													isSelected && (
														<svg
															className="size-3 text-white"
															viewBox="0 0 12 12"
															fill="none"
														>
															<path
																d="M10 3L4.5 8.5L2 6"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
															/>
														</svg>
													)
												}
											</AriaCheckbox>

											<div className="flex-1 flex items-center gap-2 flex-wrap">
												<span className="text-sm text-text-secondary">
													{translations.autopilot.fixedTime}
												</span>
												<SimpleSelect
													size="sm"
													value={value.options.autopilot_fixed_time_value.toString()}
													onChange={(e) =>
														updateOptions(
															"autopilot_fixed_time_value",
															parseInt(e.target.value)
														)
													}
													isDisabled={
														!value.autopilot ||
														!value.options.autopilot_fixed_time
													}
													className="w-24"
													aria-label="Select time"
												>
													{timeOptions.map((option) => (
														<option
															key={option.value}
															value={option.value}
														>
															{option.label}
														</option>
													))}
												</SimpleSelect>
												<span className="text-sm text-text-tertiary">
													{translations.autopilot.timezone}
												</span>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</RadioCard>
				</RadioGroup>
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
	disabled: boolean;
	children: React.ReactNode;
}

function RadioCard({ value, selected, disabled, children }: RadioCardProps) {
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
				// Hover (if not selected and not disabled)
				!selected && !disabled && "hover:border-border-brand hover:shadow-md",
				// Selected state
				selected && [
					"bg-bg-brand-secondary_alt",
					"shadow-md",
					// Compensate for 2px border
					"-m-px",
				],
				// Disabled
				disabled && "cursor-not-allowed opacity-60"
			)}
		>
			{children}
		</div>
	);
}

