import Button, { ButtonProps } from "./Button";
import React from "react";
import { Route } from "@/routers/types";

export interface ButtonPrimaryProps extends Omit<ButtonProps, "href"> {
	href?: Route;
}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
	className = "",
	...args
}) => {
	return (
		<Button
			className={`ttnc-ButtonPrimary bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 
				inline-flex items-center 
				justify-center text-white
				transition-colors duration-300
				disabled:cursor-not-allowed dark:text-neutral-50
				${className}`}
			{...args}
		/>
	);
};

export default ButtonPrimary;
