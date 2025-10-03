"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	variant?: "default" | "error";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, variant = "default", type, ...props }, ref) => {
		const baseClasses =
			"flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

		const variants = {
			default: "border-gray-300 bg-white focus-visible:ring-gray-500",
			error: "border-red-300 bg-white focus-visible:ring-red-500",
		};

		return (
			<input
				type={type}
				className={cn(baseClasses, variants[variant], className)}
				ref={ref}
				{...props}
			/>
		);
	}
);

Input.displayName = "Input";

export { Input };
