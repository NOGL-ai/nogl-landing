import React, { FC, ReactNode } from "react";

export interface SaleOffBadgeProps {
	className?: string;
	desc?: string | ReactNode;
}

const SaleOffBadge: FC<SaleOffBadgeProps> = ({
	className = "",
	desc = "-10% today",
}) => {
	return (
		<div
			className={`nc-SaleOffBadge flex items-center justify-center rounded-full bg-red-700 px-2 py-0.5 lg:px-3 lg:py-1 text-[10px] lg:text-xs text-red-50 ${className}`}
			data-nc-id='SaleOffBadge'
		>
			{desc}
		</div>
	);
};

export default SaleOffBadge;
