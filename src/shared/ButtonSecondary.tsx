"use client";

import Button, { ButtonProps } from "./Button";
import React from "react";

export interface ButtonSecondaryProps extends ButtonProps {}

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
	className = "",
	...args
}) => {
	return (
		<Button
			className={`ttnc-ButtonSecondary inline-flex items-center justify-center
				border border-neutral-200 
				bg-white dark:bg-neutral-900
				text-neutral-700 dark:text-neutral-300
				hover:bg-neutral-100 dark:hover:bg-neutral-800
				disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed
				transition-colors duration-300
				${className}`}
			{...args}
		/>
	);
};

export default ButtonSecondary;
