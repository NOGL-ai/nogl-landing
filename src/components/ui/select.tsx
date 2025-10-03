"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export interface SelectProps
	extends React.SelectHTMLAttributes<HTMLSelectElement> {
	variant?: "default" | "error";
	size?: "sm" | "md" | "lg";
	placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
	(
		{
			className,
			variant = "default",
			size = "md",
			placeholder,
			children,
			...props
		},
		ref
	) => {
		const variants = {
			default: "border-gray-300 focus:border-gray-500 focus:ring-gray-500",
			error: "border-red-300 focus:border-red-500 focus:ring-red-500",
		};

		const sizes = {
			sm: "h-8 px-2 text-sm",
			md: "h-10 px-3 text-sm",
			lg: "h-11 px-4 text-base",
		};

		return (
			<div className='relative'>
				<select
					className={cn(
						"flex w-full appearance-none rounded-lg border bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
						variants[variant],
						sizes[size],
						className
					)}
					ref={ref}
					{...props}
				>
					{placeholder && (
						<option value='' disabled>
							{placeholder}
						</option>
					)}
					{children}
				</select>
				<ChevronDownIcon className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
			</div>
		);
	}
);

Select.displayName = "Select";

export { Select };
