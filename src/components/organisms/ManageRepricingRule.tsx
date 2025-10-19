"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/base/buttons/button";
import { RuleNameStep } from "@/components/molecules/repricing/RuleNameStep";
import { RepricingConfigStep } from "@/components/molecules/repricing/RepricingConfigStep";
import { SelectCompetitorsStep } from "@/components/molecules/repricing/SelectCompetitorsStep";
import { StopConditionStep } from "@/components/molecules/repricing/StopConditionStep";
import { MinMaxValuesStep } from "@/components/molecules/repricing/MinMaxValuesStep";
import { ApplyToProductsStep } from "@/components/molecules/repricing/ApplyToProductsStep";
import { RepricingMethodStep } from "@/components/molecules/repricing/RepricingMethodStep";
import { OptionsStep } from "@/components/molecules/repricing/OptionsStep";
import { ExportSettingsStep } from "@/components/molecules/repricing/ExportSettingsStep";
import {
	defaultRepricingRule,
	type RepricingRuleFormData,
	type ValidationError,
	type Competitor,
} from "@/types/repricing-rule";

// Mock competitors data - in real app, these would come from API
const mockCompetitors: Competitor[] = [
	{
		id: "1",
		name: "Amazon.com",
		url: "https://www.amazon.com",
		lastChecked: new Date(Date.now() - 3600000).toISOString(),
		enabled: true,
		avatar: "/images/competitors/amazon.png",
	},
	{
		id: "2",
		name: "eBay",
		url: "https://www.ebay.com",
		lastChecked: new Date(Date.now() - 7200000).toISOString(),
		enabled: true,
		avatar: "/images/competitors/ebay.png",
	},
	{
		id: "3",
		name: "Walmart",
		url: "https://www.walmart.com",
		lastChecked: new Date(Date.now() - 1800000).toISOString(),
		enabled: false,
		avatar: "/images/competitors/walmart.png",
	},
];

// Mock translations - in real app, these would come from i18n
const translations = {
	title: "Create / Edit Repricing Rule",
	subtitle: "Use this page to create or edit your pricing rule",
	back: "Back",
	saveRule: "Save Rule",
	saveRulePreview: "Save Rule & Preview",
	saving: "Saving...",
	step1: {
		title: "Step 1 - Rule name",
		subtitle: "Please enter a recognizable name for this rule",
		placeholder: "1% Below my cheapest competitor",
		helpLink: "How it works",
	},
	step2: {
		title: "Step 2 - Repricing",
		subtitle: "Select what actions we must perform on your prices",
		setNewPrice: "Set new price",
		helpLink: "How it works",
		priceDirection: {
			plus: "Plus",
			minus: "Minus",
			percentage: "%",
			fixed: "€",
		},
		comparisonSource: {
			myPrice: "My Price",
			cheapest: "Cheapest Competitor",
			average: "Average Competitor Price",
			specific: "Specific Competitor",
		},
		comparisonLogic: {
			equal: "Equal to",
			above: "Above",
			below: "Below",
		},
	},
	validation: {
		nameRequired: "Rule name is required",
		priceRequired: "Price value is required",
		pricePositive: "Price must be positive",
	},
};

export default function ManageRepricingRule() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const ruleId = searchParams.get("id");
	
	const [formData, setFormData] =
		useState<RepricingRuleFormData>(defaultRepricingRule);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmittingPreview, setIsSubmittingPreview] = useState(false);
	const [isLoadingRule, setIsLoadingRule] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [competitors, setCompetitors] = useState<Competitor[]>(mockCompetitors);

	// Load existing rule for editing
	useEffect(() => {
		if (ruleId) {
			loadExistingRule(ruleId);
		}
	}, [ruleId]);

	const loadExistingRule = async (id: string) => {
		setIsLoadingRule(true);
		try {
			// TODO: Replace with actual API call
			// const response = await fetch(`/api/repricing/rules/${id}`);
			// const rule = await response.json();
			
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 800));
			
			// Mock: Load a sample rule for demo
			const mockRule: RepricingRuleFormData = {
				...defaultRepricingRule,
				name: `Repricing Rule ${id}`,
				pricing: {
					...defaultRepricingRule.pricing,
					set_price: 5,
				},
			};
			
			setFormData(mockRule);
			
			toast.success(`Rule loaded successfully\nEditing: ${mockRule.name}`);
		} catch (error) {
			console.error("Error loading rule:", error);
			toast.error("Failed to load repricing rule\nPlease try again");
		} finally {
			setIsLoadingRule(false);
		}
	};

	const validateForm = (): ValidationError[] => {
		const validationErrors: ValidationError[] = [];

		if (!formData.name || formData.name.trim() === "") {
			validationErrors.push({
				field: "name",
				message: translations.validation.nameRequired,
			});
		}

		if (!formData.pricing.set_price || formData.pricing.set_price <= 0) {
			validationErrors.push({
				field: "pricing.set_price",
				message: translations.validation.pricePositive,
			});
		}

		// Validate export email if enabled and email notification is on
		if (
			formData.export_settings.enabled &&
			formData.export_settings.email_notification &&
			!isValidEmail(formData.export_settings.email_address)
		) {
			validationErrors.push({
				field: "export_settings.email_address",
				message: "Please enter a valid email address",
			});
		}

		return validationErrors;
	};

	const handleSave = async (preview: boolean = false) => {
		// Validate form
		const validationErrors = validateForm();
		if (validationErrors.length > 0) {
			const errorMap: Record<string, string> = {};
			validationErrors.forEach((err) => {
				errorMap[err.field] = err.message;
			});
			setErrors(errorMap);
			return;
		}

		// Clear errors
		setErrors({});

		// Set loading state
		if (preview) {
			setIsSubmittingPreview(true);
		} else {
			setIsSubmitting(true);
		}

		try {
			// TODO: Replace with actual API call
			// const method = ruleId ? 'PUT' : 'POST';
			// const url = ruleId ? `/api/repricing/rules/${ruleId}` : '/api/repricing/rules';
			// await fetch(url, {
			//   method,
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify(formData),
			// });

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Show success toast
			const action = ruleId ? "updated" : "created";
			const message = preview
				? `Repricing rule ${action}!\nYour rule preview is ready to view`
				: `Repricing rule ${action}!\nYour rule is now active and ready to use`;
			toast.success(message);

			// Navigate based on action
			if (preview) {
				router.push("/repricing/auto-overview" as any);
			} else {
				router.push("/repricing/auto-rules" as any);
			}
		} catch (error) {
			console.error("Error saving rule:", error);
			
			// Show error toast
			const errorMessage = error instanceof Error
				? `Failed to save repricing rule\n${error.message}`
				: "Failed to save repricing rule\nPlease check your inputs and try again";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
			setIsSubmittingPreview(false);
		}
	};

	const handleBack = () => {
		router.push("/repricing/auto-rules" as any);
	};

	const getRepricingSchedule = (automations: typeof formData.automations) => {
		if (automations.options.autopilot_after_import) {
			return "After each catalog import";
		}
		if (automations.options.autopilot_fixed_time) {
			const time = automations.options.autopilot_fixed_time_value ?? 7;
			return `Every day at ${time.toString().padStart(2, "0")}:00`;
		}
		return "Not configured";
	};

	const isValidEmail = (email?: string): boolean => {
		if (!email) return false;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	return (
		<div className="min-h-screen w-full p-6 bg-bg-secondary">
			<div className="mx-auto max-w-5xl">
				{/* Loading Overlay */}
				{isLoadingRule && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
						<div className="rounded-lg bg-background p-6 shadow-xl">
							<div className="flex items-center gap-3">
								<svg
									className="size-5 animate-spin text-brand-solid"
									viewBox="0 0 24 24"
									fill="none"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
									/>
								</svg>
								<p className="text-text-primary font-medium">
									Loading repricing rule...
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Header */}
				<div className="mb-6">
					<div className="flex justify-between items-start">
						<div className="flex-1">
							<div className="mx-auto">
								<div className="flex flex-col">
									<div className="flex-none">
										<h2 className="text-lg text-text-primary font-semibold">
											{ruleId ? "Edit Repricing Rule" : translations.title}
										</h2>
										<p className="text-sm text-text-secondary mt-1">
											{ruleId
												? "Modify your existing pricing rule"
												: translations.subtitle}
										</p>
									</div>

									<div className="flex justify-end gap-3 mt-4 -mb-2">
										<Button
											color="secondary"
											size="md"
											onClick={handleBack}
											aria-label="Go back to rules list"
										>
											{translations.back}
										</Button>

									<Button
										color="primary"
										size="md"
										onClick={() => handleSave(false)}
										isDisabled={isSubmitting || isSubmittingPreview}
										isLoading={isSubmitting}
										className="bg-success-solid hover:bg-success-solid_hover border-success-solid"
										aria-busy={isSubmitting}
									>
										{translations.saveRule}
									</Button>

									<Button
										color="primary"
										size="md"
										onClick={() => handleSave(true)}
										isDisabled={isSubmitting || isSubmittingPreview}
										isLoading={isSubmittingPreview}
										className="bg-brand-solid hover:bg-brand-solid_hover border-brand-solid"
										aria-busy={isSubmittingPreview}
									>
										{translations.saveRulePreview}
									</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<hr className="mb-6 border-border-primary" />

				{/* Form Steps */}
				<div className="w-11/12" id="containerAlertForm">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSave(false);
						}}
						role="form"
						aria-label="Repricing rule form"
					>
						{/* Step 1: Rule Name */}
						<RuleNameStep
							value={formData.name}
							onChange={(value) => setFormData({ ...formData, name: value })}
							error={errors.name}
							translations={translations.step1}
						/>

						{/* Step 2: Repricing Configuration */}
						<RepricingConfigStep
							value={formData.pricing}
							onChange={(value) =>
								setFormData({ ...formData, pricing: value })
							}
							translations={translations.step2}
						/>

						{/* Step 3: Select Competitors */}
						<SelectCompetitorsStep
							value={competitors}
							onChange={(updatedCompetitors) => {
								setCompetitors(updatedCompetitors);
								// Update competitors in form data
								setFormData({
									...formData,
									competitors: updatedCompetitors
										.filter((c) => c.enabled)
										.map((c) => c.id),
								});
							}}
							translations={{
								title: "Step 3 - Select Competitors",
								subtitle: "Choose which competitors to track for this rule",
								selectAll: "Select All",
								deselectAll: "Deselect All",
								addCompetitor: "Add New Competitor",
								searchPlaceholder: "Search competitors...",
								noCompetitors: "No competitors available. Add one to get started.",
								lastChecked: "Last checked: {time}",
								helpLink: "How it works",
							}}
						/>

						{/* Step 4: Stop Condition */}
						<StopConditionStep
							value={{
								type: formData.stop_condition.type as "price" | "none",
								value: formData.stop_condition.value as any,
								filter: formData.stop_condition.filter as any,
							}}
							onChange={(value) => {
								setFormData({ ...formData, stop_condition: value });
							}}
							translations={{
								title: "Step 4 - Stop Condition",
								subtitle: "Choose when this rule must be halted",
								helpLink: "How it works",
								types: {
									price: "New Price",
									none: "No Condition",
								},
								minMaxSetting: "Min/Max Values Setting",
								enableSection:
									"Please select Min / Max / Min-Max as stop condition to enable this section",
							}}
						/>

						{/* Step 4.5: Min/Max Values */}
						<MinMaxValuesStep
							value={{
								type: formData.min_max_price.type as any,
								min: formData.min_max_price.min as any,
								max: formData.min_max_price.max as any,
							}}
							onChange={(value) => {
								setFormData({ ...formData, min_max_price: value });
							}}
							isEnabled={
								formData.stop_condition.type === "price" &&
								!!formData.stop_condition.value
							}
							translations={{
								step4: {
									minMaxSetting: "Step 4.5 - Min/Max Values",
									enableSection:
										"Please select Min / Max / Min-Max as stop condition to enable this section",
								},
								minMaxMethods: {
									manual: {
										title: "Manually Assign",
										description:
											"Manually specify your Min/Max prices for all items assigned this repricing rule via products page or using the bulk upload option in the import page",
									},
									grossMargin: {
										title: "Markup",
										description:
											"Automatically specify your Min/Max prices for all items assigned this repricing rule using a Markup fixed or percentage value based on your product Cost",
									},
									cost: {
										title: "Item Cost",
										description:
											"Automatically specify your Min/Max prices for all items assigned this repricing rule based on percentage of the individual cost of the item",
									},
									price: {
										title: "Item Price",
										description:
											"Automatically specify your Min/Max prices for all items assigned this repricing rule based on percentage of the individual price of the item",
									},
									map: {
										title: "MAP",
										description:
											"Automatically specify your Min/Max prices for all items assigned this repricing rule based on the MAP you assigned to your product",
									},
								},
							}}
						/>

						{/* Step 5: Apply to Products */}
						<ApplyToProductsStep
							value={{
								type: formData.products.type === "specific" ? "individual" : formData.products.type,
								selectedCategories: formData.products.categories,
								selectedProducts: formData.products.product_ids,
							}}
							onChange={(value) => {
								setFormData({
									...formData,
									products: {
										...value,
										type: value.type === "individual" ? "specific" : value.type,
									},
								});
							}}
							translations={{
								title: "Step 5 - Apply to products",
								subtitle:
									"Select which product(s) must be considered or excluded",
								helpLink: "How it works",
								allProducts: "All Products",
								specificCategories: "Specific Categories",
								individualProducts: "Individual Products",
								selectedCount: "{count} products selected",
							}}
						/>

						{/* Step 7: Repricing Method */}
						<RepricingMethodStep
							value={{
								autopilot: formData.automations.autopilot,
								options: {
									autopilot_after_import:
										formData.automations.options.autopilot_after_import ?? false,
									autopilot_fixed_time:
										formData.automations.options.autopilot_fixed_time ?? false,
									autopilot_fixed_time_value:
										formData.automations.options.autopilot_fixed_time_value ?? 7,
								},
							}}
							onChange={(value) => {
								setFormData({ ...formData, automations: value });
							}}
							isPremium={false} // TODO: Get from user session
							onUpgradeClick={() => {
								// TODO: Open upgrade modal
								console.log("Show upgrade modal");
							}}
							translations={{
								title: "Step 7 - Repricing Method",
								subtitle:
									"Choose if Pricefy will apply the new price automatically on your platform or will just suggest it",
								helpLink: "How it works",
								semiAutomatic: {
									title: "Semi-Automatic",
									description:
										"Pricefy will suggest you the new price which you could apply with just a click.",
								},
								autopilot: {
									title: "Autopilot",
									description:
										"Price will be automatically changed by Pricefy, every day, according to this rule.",
									upgrade: "Upgrade to unlock",
									afterImport: "Every time a catalog import terminates",
									fixedTime: "Every day at",
									timezone: "Europe/Berlin",
								},
							}}
						/>

						{/* Step 8: Options */}
						<OptionsStep
							value={{
								adjust_calculated_price: {
									enabled: formData.options.adjust_calculated_price.enabled,
									direction:
										formData.options.adjust_calculated_price.direction ?? "plus",
									value: formData.options.adjust_calculated_price.value ?? 0,
									type: formData.options.adjust_calculated_price.type ?? "percentage",
								},
								rounding_price: formData.options.rounding_price,
								rounding_price_options: {
									value: formData.options.rounding_price_options?.value ?? 99,
								},
							}}
							onChange={(value) => {
								setFormData({
									...formData,
									options: {
										...value,
										adjust_calculated_price: {
											enabled: value.adjust_calculated_price.enabled,
											direction: value.adjust_calculated_price.direction,
											value: value.adjust_calculated_price.value,
											type: value.adjust_calculated_price.type,
										},
									},
								});
							}}
							translations={{
								title: "Step 8 - Options",
								subtitle:
									"Options to let your prices be more attractive. Note: The options are applied BEFORE the stop condition analysis",
								helpLink: "How it works",
								adjustPrice: {
									title: 'Adjust "New Price"',
									newPrice: "New Price",
									plus: "Plus",
									minus: "Minus",
									example:
										"Example: If the repricing rule calculates the new price as € {calculated}, Pricefy will reprice the sale price at € {adjusted}",
								},
								roundingPrice: {
									title: "End repriced product prices",
									newPrice: "New Price",
									example:
										"Example: If the repricing rule sets the new price at € {calculated}, Pricefy will list the price as € {rounded} on your platform",
								},
							}}
						/>

						{/* Step 9: Export Settings */}
						<ExportSettingsStep
							value={{
								enabled: formData.export_settings.enabled,
								format: formData.export_settings.format,
								emailNotification: formData.export_settings.email_notification,
								emailAddress: formData.export_settings.email_address,
							}}
							onChange={(value) => {
								setFormData({
									...formData,
									export_settings: {
										enabled: value.enabled,
										format: value.format,
										email_notification: value.emailNotification,
										email_address: value.emailAddress,
									},
								});
							}}
							isAutopilotEnabled={formData.automations.autopilot}
							isPremium={false} // TODO: Get from user session
							repricingSchedule={getRepricingSchedule(formData.automations)}
							translations={{
								title: "Step 9 - Export Settings",
								subtitle: "Configure how you want to receive your repricing results",
								enableExport: "Enable export",
								format: "Export format",
								formats: {
									csv: "CSV (Comma-separated values)",
									excel: "Excel (.xlsx)",
									xml: "XML",
									json: "JSON",
								},
								emailNotification: "Send export by email",
								emailAddress: "Email address",
								emailPlaceholder: "your@email.com",
								autopilotRequired:
									"Export only works when Autopilot is enabled (Step 7)",
								premiumRequired: "Upgrade to premium to unlock export functionality",
								scheduleInfo: "Export will be generated: {schedule}",
								helpLink: "How it works",
							}}
							errors={{
								emailAddress: errors["export_settings.email_address"],
							}}
							onUpgradeClick={() => {
								// TODO: Open upgrade modal
								console.log("Show upgrade modal");
							}}
						/>
					</form>
				</div>
			</div>
		</div>
	);
}

