"use client";

import React from "react";
import { InfoCircle, FileCheck02, Mail01 } from "@untitledui/icons";
import { Switch, Checkbox } from "react-aria-components";
import { SimpleSelect } from "@/components/base/select/simple-select";
import { Input } from "@/components/base/input/input";
import { DisabledOverlay } from "./DisabledOverlay";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

export interface ExportConfig {
	enabled: boolean;
	format: "csv" | "excel" | "xml" | "json";
	emailNotification: boolean;
	emailAddress?: string;
}

interface ExportSettingsStepProps {
	value: ExportConfig;
	onChange: (value: ExportConfig) => void;
	isAutopilotEnabled: boolean;
	isPremium: boolean;
	repricingSchedule: string; // e.g., "Every day at 07:00"
	translations: {
		title: string;
		subtitle: string;
		enableExport: string;
		format: string;
		formats: Record<string, string>;
		emailNotification: string;
		emailAddress: string;
		emailPlaceholder: string;
		autopilotRequired: string;
		premiumRequired: string;
		scheduleInfo: string;
		helpLink: string;
	};
	errors?: {
		emailAddress?: string;
	};
	onUpgradeClick?: () => void;
	className?: string;
}

export function ExportSettingsStep({
	value,
	onChange,
	isAutopilotEnabled,
	isPremium,
	repricingSchedule,
	translations,
	errors,
	onUpgradeClick,
	className,
}: ExportSettingsStepProps) {
	const isEnabled = isAutopilotEnabled && isPremium;

	return (
		<div
			className={cx("relative mx-auto w-full mb-8 mt-14", className)}
			role="region"
			aria-labelledby="export-heading"
		>
			{/* Disabled Overlay */}
			{!isEnabled && (
				<DisabledOverlay
					message={
						!isAutopilotEnabled
							? translations.autopilotRequired
							: translations.premiumRequired
					}
				/>
			)}

			<div className={!isEnabled ? "pointer-events-none opacity-50" : ""}>
				{/* Section Header */}
				<div className="sectionTitle">
					<div className="mb-6 pb-4 border-b border-border-primary">
						<div className="flex flex-row items-center">
							<div className="flex-none mr-1">
								<h3
									id="export-heading"
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
										href="https://help.pricefy.io/how-to-export-repricing-results/"
										target="_blank"
										rel="noopener noreferrer"
										className="text-xs underline text-text-brand cursor-pointer hover:text-text-brand-secondary transition-colors"
									>
										{translations.helpLink}
									</a>
								</div>
							</div>

							{!isPremium && (
								<div className="ml-auto">
									<BadgeWithDot
										color="warning"
										size="sm"
										className="cursor-pointer"
										onClick={onUpgradeClick}
									>
										Premium Feature
									</BadgeWithDot>
								</div>
							)}
						</div>

						<p className="text-text-tertiary mt-2 text-sm">
							{translations.subtitle}
						</p>
					</div>

					{/* Enable Export Toggle */}
					<div className="mb-6">
						<div className="flex items-center justify-between p-4 rounded-lg border border-border-primary bg-background">
							<div className="flex items-center gap-3">
								<FileCheck02 className="size-5 text-fg-quaternary" />
								<span className="text-sm font-medium text-text-primary">
									{translations.enableExport}
								</span>
							</div>

							<Switch
								isSelected={value.enabled}
								onChange={(enabled) => onChange({ ...value, enabled })}
								isDisabled={!isEnabled}
								className={cx(
									"relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full",
									"transition-colors duration-200 ease-out",
									value.enabled
										? "bg-brand-solid"
										: "bg-gray-200 dark:bg-gray-700",
									"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
									!isEnabled && "cursor-not-allowed opacity-50"
								)}
								aria-label="Enable export toggle"
							>
								{({ isSelected }) => (
									<span
										className={cx(
											"inline-block size-5 rounded-full bg-white shadow-sm",
											"transition-transform duration-200 ease-out",
											"translate-x-0.5",
											isSelected && "translate-x-[1.375rem]"
										)}
										aria-hidden="true"
									/>
								)}
							</Switch>
						</div>
					</div>

					{/* Format Selection */}
					{value.enabled && (
						<div className="mb-6 animate-in fade-in duration-200">
							<label className="block text-sm font-medium text-text-secondary mb-2">
								{translations.format}
							</label>
							<SimpleSelect
								size="md"
								value={value.format}
								onChange={(e) =>
									onChange({
										...value,
										format: e.target.value as ExportConfig["format"],
									})
								}
								className="w-full sm:w-1/2"
								aria-label="Export format"
							>
								<option value="csv">{translations.formats.csv}</option>
								<option value="excel">{translations.formats.excel}</option>
								<option value="xml">{translations.formats.xml}</option>
								<option value="json">{translations.formats.json}</option>
							</SimpleSelect>
						</div>
					)}

					{/* Email Notification */}
					{value.enabled && (
						<div className="mb-6 animate-in fade-in duration-200">
							<label className="flex items-start gap-3 cursor-pointer group">
								<Checkbox
									isSelected={value.emailNotification}
									onChange={(checked) =>
										onChange({ ...value, emailNotification: checked })
									}
									className={cx(
										"mt-0.5 flex size-4 shrink-0 items-center justify-center rounded",
										"border-2 border-border-primary bg-background",
										"transition-all duration-150",
										"data-[selected]:border-brand-solid data-[selected]:bg-brand-solid",
										"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
									)}
									aria-label="Send export by email"
								>
									{({ isSelected }) =>
										isSelected && (
											<svg
												className="size-3 text-white"
												viewBox="0 0 12 12"
												fill="none"
												aria-hidden="true"
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
								</Checkbox>
								<div className="flex-1">
									<span className="text-sm font-medium text-text-primary group-hover:text-text-secondary transition-colors">
										{translations.emailNotification}
									</span>
								</div>
							</label>

							{/* Email Address Input */}
							{value.emailNotification && (
								<div className="mt-4 ml-7 animate-in fade-in duration-200">
									<Input
										type="email"
										value={value.emailAddress || ""}
										onChange={(e) =>
											onChange({ ...value, emailAddress: e.target.value })
										}
										placeholder={translations.emailPlaceholder}
										size="md"
										icon={Mail01}
										className="w-full sm:w-1/2"
										isInvalid={!!errors?.emailAddress}
										aria-label={translations.emailAddress}
										aria-describedby={
											errors?.emailAddress ? "email-error" : undefined
										}
									/>
									{errors?.emailAddress && (
										<p
											id="email-error"
											className="mt-2 text-sm text-text-error"
											role="alert"
										>
											{errors.emailAddress}
										</p>
									)}
								</div>
							)}
						</div>
					)}

					{/* Schedule Info */}
					{value.enabled && isAutopilotEnabled && (
						<div
							className="rounded-lg border border-border-brand bg-bg-brand-secondary_alt p-4"
							role="status"
							aria-live="polite"
						>
							<div className="flex items-start gap-2">
								<InfoCircle
									className="mt-0.5 size-4 shrink-0 text-fg-brand-secondary"
									aria-hidden="true"
								/>
								<div>
									<p className="text-sm font-medium text-text-primary mb-1">
										Export Schedule:
									</p>
									<p className="text-sm text-text-secondary">
										{translations.scheduleInfo.replace(
											"{schedule}",
											repricingSchedule
										)}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

