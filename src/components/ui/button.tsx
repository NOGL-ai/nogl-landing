"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "tertiary" | "ghost" | "destructive" | "outline";
	size?: "sm" | "md" | "lg" | "xl";
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className, variant = "primary", size = "md", asChild = false, ...props },
		ref
	) => {
	const baseClasses =
		"inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

	const variants = {
		primary:
			"bg-brand-solid text-white hover:bg-brand-solid_hover focus-visible:ring-brand",
		secondary:
			"bg-background text-secondary ring-1 ring-border hover:bg-primary_hover hover:text-secondary_hover focus-visible:ring-brand",
		tertiary:
			"bg-transparent text-tertiary hover:bg-primary_hover hover:text-tertiary_hover focus-visible:ring-brand",
		ghost:
			"bg-transparent text-tertiary hover:bg-primary_hover hover:text-tertiary_hover focus-visible:ring-brand",
		destructive:
			"bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
		outline:
			"border border-border bg-transparent text-secondary hover:bg-primary_hover focus-visible:ring-brand",
	};

		const sizes = {
			sm: "h-8 px-3 text-sm",
			md: "h-10 px-4 text-sm",
			lg: "h-11 px-6 text-sm",
			xl: "h-12 px-8 text-base",
		};

		return (
			<button
				className={cn(baseClasses, variants[variant], sizes[size], className)}
				ref={ref}
				{...props}
			/>
		);
	}
);

Button.displayName = "Button";

export { Button };
