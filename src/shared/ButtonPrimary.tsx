import Button, { ButtonProps } from "./Button";
import React from "react";
import { Route } from "@/routers/types";

export interface ButtonPrimaryProps extends Omit<ButtonProps, 'href'> {
	href?: Route<string>;
}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
	className = "",
	...args
}) => {
	return (
		<Button
			className={`ttnc-ButtonPrimary inline-flex items-center justify-center 
				bg-primary-600 hover:bg-primary-700 
				text-white dark:text-neutral-50
				disabled:bg-primary-400 disabled:cursor-not-allowed
				transition-colors duration-300
				${className}`}
			{...args}
		/>
	);
};

export default ButtonPrimary;
