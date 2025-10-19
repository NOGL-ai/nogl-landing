"use client";

import React from "react";
import type { ComponentType } from "react";
import { cx } from "@/utils/cx";

export interface MinMaxMethod {
	id: "manual" | "gross_margin" | "cost" | "price" | "map";
	title: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
}

interface MinMaxMethodCardProps {
	method: MinMaxMethod;
	selected: boolean;
	onClick: () => void;
	disabled?: boolean;
	className?: string;
}

/**
 * MinMaxMethodCard Component
 * 
 * A selectable card component for choosing a Min/Max price calculation method.
 * Part of Step 4.5 (MinMaxValuesStep).
 * 
 * Features:
 * - Icon display for visual recognition
 * - Title and description
 * - Interactive states: default, hover, selected, disabled
 * - Keyboard accessible (radio button pattern)
 * - Micro-interactions (scale, border color shift)
 * - Theme-aware styling
 * 
 * States:
 * - Default: Gray border, gray icon, white background
 * - Hover: Brand-colored border, icon color shift
 * - Selected: 2px brand border, brand icon, subtle brand background tint
 * - Disabled: Reduced opacity, cursor-not-allowed
 * 
 * Micro-interactions:
 * - Card: Scale effect on selection (1.0 → 1.02)
 * - Border: Color transition (200ms ease-out)
 * - Icon: Color transition (200ms ease-out)
 * - Shadow: Elevation on hover (shadow-sm → shadow-md)
 */
export function MinMaxMethodCard({
	method,
	selected,
	onClick,
	disabled = false,
	className,
}: MinMaxMethodCardProps) {
	const Icon = method.icon;

	return (
		<button
			type="button"
			onClick={disabled ? undefined : onClick}
			disabled={disabled}
			className={cx(
				// Base layout
				"group relative flex flex-col items-center gap-3 rounded-lg border p-4 text-center",
				// Background
				"bg-background",
				// Border
				"border-border-primary",
				// Shadow
				"shadow-xs",
				// Transitions
				"transition-all duration-200 ease-out",
				// Focus ring
				"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
				// Hover state (not selected, not disabled)
				!selected &&
					!disabled && [
						"hover:border-border-brand",
						"hover:shadow-md",
						"hover:scale-[1.01]",
					],
				// Selected state
				selected && [
					"border-2 border-brand-solid",
					"bg-bg-brand-secondary_alt",
					"scale-[1.02]",
					"shadow-md",
					// Compensate for 2px border
					"-m-px",
				],
				// Disabled state
				disabled && "cursor-not-allowed opacity-50",
				// Active state
				!disabled && "active:scale-[0.99]",
				// Cursor
				!disabled && "cursor-pointer",
				// Custom className
				className
			)}
			role="radio"
			aria-checked={selected}
			aria-disabled={disabled}
			aria-label={`${method.title}: ${method.description}`}
		>
			{/* Icon */}
			<div
				className={cx(
					// Base styling
					"flex size-12 items-center justify-center rounded-lg transition-all duration-200",
					// Background
					selected
						? "bg-brand-solid"
						: "bg-bg-secondary group-hover:bg-bg-brand-secondary_alt",
					// Padding for icon
					"p-2.5"
				)}
			>
				<Icon
					className={cx(
						"size-7 transition-colors duration-200",
						selected
							? "text-white"
							: "text-text-quaternary group-hover:text-fg-brand-secondary"
					)}
					aria-hidden="true"
				/>
			</div>

			{/* Title */}
			<h4
				className={cx(
					"text-sm font-semibold transition-colors duration-200",
					selected ? "text-text-brand" : "text-text-primary"
				)}
			>
				{method.title}
			</h4>

			{/* Description */}
			<p
				className={cx(
					"text-xs leading-relaxed transition-colors duration-200",
					selected
						? "text-text-secondary"
						: "text-text-tertiary group-hover:text-text-secondary"
				)}
			>
				{method.description}
			</p>

			{/* Selected indicator dot */}
			{selected && (
				<div
					className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand-solid ring-2 ring-background"
					aria-hidden="true"
				>
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
				</div>
			)}
		</button>
	);
}

