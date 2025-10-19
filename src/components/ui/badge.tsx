"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?:
		| "default"
		| "secondary"
		| "destructive"
		| "outline"
		| "success"
		| "warning";
	size?: "sm" | "md" | "lg";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
	({ className, variant = "default", size = "md", ...props }, ref) => {
	const variants = {
		default: "bg-brand-solid text-white hover:bg-brand-solid_hover",
		secondary: "bg-background text-secondary ring-1 ring-border hover:bg-primary_hover",
		destructive: "bg-red-500 text-white hover:bg-red-600",
		outline: "border border-border text-secondary hover:bg-primary_hover",
		success: "bg-green-500 text-white hover:bg-green-600",
		warning: "bg-yellow-500 text-white hover:bg-yellow-600",
	};

		const sizes = {
			sm: "px-2 py-1 text-xs",
			md: "px-2.5 py-0.5 text-sm",
			lg: "px-3 py-1 text-base",
		};

		return (
		<div
			ref={ref}
			className={cn(
				"inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
				variants[variant],
				sizes[size],
				className
			)}
			{...props}
		/>
		);
	}
);

Badge.displayName = "Badge";

export { Badge };
