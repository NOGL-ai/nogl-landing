"use client";

import React from "react";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { InfoCircle } from "@untitledui/icons";
import type { PricingConfig } from "@/types/repricing-rule";

interface RepricingConfigStepProps {
	value: PricingConfig;
	onChange: (value: PricingConfig) => void;
	translations: {
		title: string;
		subtitle: string;
		setNewPrice: string;
		helpLink: string;
		priceDirection: Record<string, string>;
		comparisonSource: Record<string, string>;
		comparisonLogic: Record<string, string>;
	};
}

export function RepricingConfigStep({
	value,
	onChange,
	translations,
}: RepricingConfigStepProps) {
	const updateField = <K extends keyof PricingConfig>(
		field: K,
		fieldValue: PricingConfig[K]
	) => {
		onChange({ ...value, [field]: fieldValue });
	};

	return (
		<div className="mx-auto w-full mb-8 mt-14">
			<div className="sectionTitle">
				<div className="mb-4 pb-4 border-b border-border-primary">
					<div className="flex flex-row items-center">
						<div className="flex-none mr-1">
							<span className="text-base text-text-primary font-semibold">
								{translations.title}
							</span>
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
			</div>

			<div id="repricingContainer">
				<div className="w-full">
					<div className="mb-4">
						<div className="flex items-center gap-2">
							<div>
								<p className="text-text-primary text-sm font-medium">
									{translations.setNewPrice}
								</p>
							</div>

							<div className="mx-1">
								<Input
									type="number"
									value={value.set_price}
									onChange={(e) =>
										updateField("set_price", parseFloat(e.target.value) || 0)
									}
									min={0.01}
									step={0.01}
									max={999999999}
									placeholder="1"
									className="w-20"
									aria-label="Set new price value"
								/>
							</div>

							<div className="mx-1">
								<Select
									value={value.price_direction}
									onChange={(e) =>
										updateField(
											"price_direction",
											e.target.value as typeof value.price_direction
										)
									}
									className="w-full"
									aria-label="Price direction"
								>
									<option value="percentage">
										{translations.priceDirection.percentage}
									</option>
									<option value="fixed">{translations.priceDirection.fixed}</option>
									<option value="plus">{translations.priceDirection.plus}</option>
									<option value="minus">{translations.priceDirection.minus}</option>
								</Select>
							</div>

							<div className="mx-1">
								<Select
									value={value.comparison_logic}
									onChange={(e) =>
										updateField(
											"comparison_logic",
											e.target.value as typeof value.comparison_logic
										)
									}
									className="w-full"
									aria-label="Comparison logic"
								>
									<option value="below">
										{translations.comparisonLogic.below}
									</option>
									<option value="above">
										{translations.comparisonLogic.above}
									</option>
									<option value="equal">
										{translations.comparisonLogic.equal}
									</option>
								</Select>
							</div>

							<div className="mx-1">
								<Select
									value={value.comparison_source}
									onChange={(e) =>
										updateField(
											"comparison_source",
											e.target.value as typeof value.comparison_source
										)
									}
									className="w-full"
									aria-label="Comparison source"
								>
									<option value="cheapest">
										{translations.comparisonSource.cheapest}
									</option>
									<option value="average">
										{translations.comparisonSource.average}
									</option>
									<option value="my_price">
										{translations.comparisonSource.myPrice}
									</option>
									<option value="specific">
										{translations.comparisonSource.specific}
									</option>
								</Select>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

