"use client";

import React from "react";
import { Input } from "@/components/base/input/input";
import { InfoCircle } from "@untitledui/icons";

interface RuleNameStepProps {
	value: string;
	onChange: (value: string) => void;
	error?: string;
	translations: {
		title: string;
		subtitle: string;
		placeholder: string;
		helpLink: string;
	};
}

export function RuleNameStep({
	value,
	onChange,
	error,
	translations,
}: RuleNameStepProps) {
	return (
		<div className="mx-auto w-full mb-8">
			<div className="sectionTitle">
				<div className="mb-4 pb-4 border-b border-border-primary">
					<div className="flex flex-row items-center">
						<div className="flex-none mr-1">
							<span className="text-base text-text-primary font-semibold">
								{translations.title}
							</span>
						</div>

						<div className="flex-none">
							<div>
								<InfoCircle
									className="w-4 h-4 text-text-quaternary cursor-pointer hover:text-text-tertiary transition-colors"
									aria-label="More information"
								/>
							</div>
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

				<div>
					<Input
						type="text"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						placeholder={translations.placeholder}
						className="w-1/2 mt-4"
						aria-label={translations.title}
						aria-required="true"
						aria-invalid={!!error}
						aria-describedby={error ? "rule-name-error" : undefined}
					/>
					{error && (
						<p
							id="rule-name-error"
							className="mt-2 text-sm text-text-error"
							role="alert"
						>
							{error}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

