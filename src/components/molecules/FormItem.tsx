import { Label } from "../atoms";
import React, { ReactNode } from "react";
import { FC } from "react";

export interface FormItemProps {
	className?: string;
	label?: ReactNode;
	desc?: string;
	error?: string;
	children?: React.ReactNode;
	comingSoon?: boolean;
	dictionary: {
		common: {
			comingSoon: string;
		};
	};
}

const FormItem: FC<FormItemProps> = ({
	children,
	className = "",
	label,
	desc,
	error,
	comingSoon,
	dictionary,
}) => {
	return (
		<div className={`flex flex-col ${className}`}>
			{label && typeof label === "string" ? <Label>{label}</Label> : label}
			<div className='mt-1'>{children}</div>
			{desc && (
				<span className='mt-2 block text-xs text-neutral-500 dark:text-neutral-400'>
					{desc}
				</span>
			)}
			{error && (
				<span className='mt-2 block text-xs text-red-500'>{error}</span>
			)}
			{comingSoon && (
				<span className='mt-2 block text-xs text-neutral-500 dark:text-neutral-400'>
					{dictionary.common.comingSoon}
				</span>
			)}
		</div>
	);
};

export default FormItem;
