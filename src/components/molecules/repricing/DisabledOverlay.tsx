"use client";

import React from "react";
import { InfoCircle } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface DisabledOverlayProps {
	/** Message to display in the overlay */
	message: string;
	/** Optional className for custom styling */
	className?: string;
	/** Optional icon to display */
	icon?: React.ComponentType<{ className?: string }>;
	/** Show icon (default: true) */
	showIcon?: boolean;
}

/**
 * DisabledOverlay Component
 * 
 * A semi-transparent overlay that blocks user interaction with a section
 * and displays an informational message. Used when a section is conditionally
 * disabled based on other form selections.
 * 
 * Features:
 * - Backdrop blur effect
 * - Theme-aware (light/dark mode)
 * - Centered message with icon
 * - Accessible (aria-disabled)
 * 
 * @example
 * <div className="relative">
 *   {!isEnabled && (
 *     <DisabledOverlay message="Please select a condition first" />
 *   )}
 *   <div className={!isEnabled ? 'pointer-events-none opacity-50' : ''}>
 *     {content}
 *   </div>
 * </div>
 */
export function DisabledOverlay({
	message,
	className,
	icon: Icon = InfoCircle,
	showIcon = true,
}: DisabledOverlayProps) {
	return (
		<div
			className={cx(
				// Positioning
				"absolute inset-0 z-10",
				// Layout
				"flex items-center justify-center p-4",
				// Background with blur
				"bg-blue-100/30 dark:bg-blue-900/30",
				"backdrop-blur-[2px]",
				// Transition
				"transition-all duration-200 ease-out",
				className
			)}
			role="presentation"
			aria-hidden="true"
		>
			<div
				className={cx(
					// Card styling
					"flex items-start gap-3 rounded-lg border border-border-brand bg-background px-4 py-3",
					"shadow-lg",
					// Max width for readability
					"max-w-md"
				)}
			>
				{showIcon && Icon && (
					<Icon className="mt-0.5 size-5 shrink-0 text-fg-brand-secondary" />
				)}
				<p className="text-sm text-text-secondary leading-5">{message}</p>
			</div>
		</div>
	);
}

