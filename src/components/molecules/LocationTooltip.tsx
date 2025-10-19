/**
 * Location Tooltip Component
 * 
 * Tooltip displayed above map markers showing location details.
 * Based on Figma design with flag, city name, and website.
 */

import React from "react";
import { CountryFlag } from "@/components/atoms/CountryFlags";
import { cx } from "@/utils/cx";

interface LocationTooltipProps {
	city: string;
	country: string;
	countryCode: string;
	website: string;
	/** Whether the tooltip is visible */
	isVisible: boolean;
	/** X position as percentage (0-100) */
	x: number;
	/** Y position as percentage (0-100) */
	y: number;
	className?: string;
}

export default function LocationTooltip({
	city,
	country,
	countryCode,
	website,
	isVisible,
	x,
	y,
	className = "",
}: LocationTooltipProps) {
	if (!isVisible) return null;

	return (
		<div
			className={cx(
				"absolute z-20 transition-all duration-200",
				isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
				className
			)}
			style={{
				left: `${x}%`,
				top: `${y}%`,
				transform: "translate(-50%, -100%)",
				marginTop: "-52px", // Position above marker with some spacing
			}}
			role="tooltip"
			aria-live="polite"
		>
			{/* Tooltip content */}
			<div
				className={cx(
					"flex flex-col items-center gap-2 px-4 py-3 rounded-lg",
					"bg-bg-primary dark:bg-gray-900",
					"border border-border-primary dark:border-gray-700",
					"shadow-lg"
				)}
				style={{
					boxShadow: "0px 12px 16px -4px rgba(10, 13, 18, 0.08), 0px 4px 6px -2px rgba(10, 13, 18, 0.03), 0px 2px 2px -1px rgba(10, 13, 18, 0.04)",
				}}
			>
				{/* Country Flag */}
				<CountryFlag countryCode={countryCode} size={20} />

				{/* Location Info */}
				<div className="flex flex-col gap-1 items-center text-center">
					<p className="text-xs font-semibold leading-[18px] text-text-primary whitespace-nowrap">
						{city}, {country}
					</p>
					<p className="text-xs leading-[18px] text-text-tertiary whitespace-nowrap">
						{website}
					</p>
				</div>
			</div>

			{/* Arrow pointer - small triangle pointing down */}
			<div
				className="absolute left-1/2 -translate-x-1/2"
				style={{
					bottom: "-6px",
					width: 0,
					height: 0,
					borderLeft: "6px solid transparent",
					borderRight: "6px solid transparent",
					borderTop: "6px solid var(--color-border-primary)",
				}}
			/>
			<div
				className="absolute left-1/2 -translate-x-1/2"
				style={{
					bottom: "-5px",
					width: 0,
					height: 0,
					borderLeft: "5px solid transparent",
					borderRight: "5px solid transparent",
					borderTop: "5px solid var(--color-bg-primary)",
				}}
			/>
		</div>
	);
}

