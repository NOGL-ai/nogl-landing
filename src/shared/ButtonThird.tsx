import Button, { ButtonProps } from "./Button";
import React from "react";

const ButtonThird: React.FC<ButtonProps> = ({
	className = "text-neutral-700 border border-neutral-200 dark:text-neutral-200 dark:border-neutral-700",
	...args
}) => {
	return <Button className={`ttnc-ButtonThird ${className}`} {...args} />;
};

export default ButtonThird;
