"use client";

import { type SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface SimpleSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	size?: "sm" | "md";
	isInvalid?: boolean;
	isDisabled?: boolean;
}

/**
 * SimpleSelect Component
 * 
 * Native HTML select styled to match Untitled UI Figma specifications.
 * Based on "Select - Size=md, Type=Default" from Figma.
 * 
 * Figma Reference: https://www.figma.com/design/E4hWuxZhRqGSAiDA8NePGk/
 * Node: 3281:377673 (Select component)
 * 
 * Specifications from Figma:
 * - Size sm: 40px height, 14px text, 12px padding
 * - Size md: 44px height, 16px text, 14px padding
 * - Border: 1px solid, border-primary
 * - Focus: 2px border-brand ring
 * - Shadow: shadow-xs (0 1px 2px rgba(16, 24, 40, 0.05))
 * - Border radius: 8px (rounded-lg)
 * 
 * @example
 * <SimpleSelect size="md" value={value} onChange={handleChange}>
 *   <option value="1">Option 1</option>
 *   <option value="2">Option 2</option>
 * </SimpleSelect>
 */
export const SimpleSelect = forwardRef<HTMLSelectElement, SimpleSelectProps>(
	({ size = "md", isInvalid, isDisabled, className, children, ...props }, ref) => {
		return (
			<div className="relative inline-flex w-full items-center">
				<select
					ref={ref}
					disabled={isDisabled}
					aria-invalid={isInvalid}
					className={cx(
						// Base styles (Untitled UI)
						"w-full appearance-none rounded-lg bg-background",
						"text-text-primary font-medium",
						"shadow-xs ring-1 ring-inset ring-border-primary",
						"transition-all duration-150 ease-out",
						
						// Placeholder text
						"placeholder:text-text-quaternary",
						
						// Focus state (Untitled UI spec: 2px brand ring)
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
						
						// Invalid state (2px error ring)
						isInvalid && "ring-2 ring-border-error focus-visible:ring-border-error",
						
						// Disabled state
						isDisabled && [
							"cursor-not-allowed",
							"bg-bg-disabled",
							"text-text-disabled",
							"ring-border-disabled",
						],
						
						// Size variants (matching Figma specs)
						size === "sm" && [
							"h-10", // 40px
							"px-3 py-2",
							"text-sm leading-5", // 14px
						],
						size === "md" && [
							"h-11", // 44px
							"px-3.5 py-2.5",
							"text-md leading-6", // 16px
						],
						
						// Right padding for chevron icon
						"pr-10",
						
						// Custom className
						className
					)}
					{...props}
				>
					{children}
				</select>
				
				{/* Chevron Icon (Untitled UI standard) */}
				<ChevronDown
					aria-hidden="true"
					className={cx(
						"pointer-events-none absolute right-3.5",
						"text-fg-quaternary",
						"transition-colors duration-150",
						// Size based on select size
						size === "sm" && "size-4 stroke-[2.5px]",
						size === "md" && "size-5",
						// Disabled state
						isDisabled && "text-fg-disabled"
					)}
				/>
			</div>
		);
	}
);

SimpleSelect.displayName = "SimpleSelect";

