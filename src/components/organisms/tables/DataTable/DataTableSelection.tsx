"use client";

import React from "react";
import Checkbox from "@/components/ui/checkbox";

interface SelectionCheckboxProps {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	ariaLabel: string;
	indeterminate?: boolean;
	disabled?: boolean;
}

export function SelectionCheckbox({
	checked,
	onCheckedChange,
	ariaLabel,
	indeterminate = false,
	disabled = false,
}: SelectionCheckboxProps) {
	return (
		<Checkbox
			checked={checked}
			onChange={onCheckedChange}
			ariaLabel={ariaLabel}
			className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
		/>
	);
}
