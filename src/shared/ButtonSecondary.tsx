"use client";

import Button, { ButtonProps } from "./Button";
import React from "react";

const ButtonSecondary: React.FC<ButtonProps> = ({
	className = "",
	...args
}) => {
	return (
		<Button
			className={`ttnc-ButtonSecondary inline-flex items-center justify-center
				border border-neutral-200 
				bg-white text-neutral-700
				transition-colors duration-300
				hover:bg-neutral-100 disabled:cursor-not-allowed
				disabled:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-300
				dark:hover:bg-neutral-800 dark:disabled:bg-neutral-800
				${className}`}
			{...args}
		/>
	);
};

export default ButtonSecondary;
