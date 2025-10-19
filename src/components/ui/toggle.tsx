"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
	checked,
	onChange,
	disabled = false,
	className = "",
}) => {
	return (
		<button
			type='button'
			role='switch'
			aria-checked={checked}
			disabled={disabled}
			onClick={() => !disabled && onChange(!checked)}
		className={cn(
			"relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
			checked ? "bg-brand" : "bg-border",
			disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
			className
		)}
		>
			<span
				className={cn(
					"inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
					checked ? "translate-x-6" : "translate-x-1"
				)}
			/>
		</button>
	);
};

export default Toggle;
