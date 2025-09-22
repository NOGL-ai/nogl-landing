"use client";

import React from "react";
import { FC } from "react";

export interface ClearDataButtonProps {
	onClick?: () => void;
}

const ClearDataButton: FC<ClearDataButtonProps> = ({ onClick }) => {
	return (
		<span
			onClick={() => onClick && onClick()}
			className=' absolute right-1 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 transform items-center justify-center rounded-full bg-neutral-200 text-sm dark:bg-neutral-800 lg:right-1.5 lg:h-6 lg:w-6 '
		>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				className='h-4 w-4'
				fill='none'
				viewBox='0 0 24 24'
				stroke='currentColor'
				strokeWidth={2}
			>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					d='M6 18L18 6M6 6l12 12'
				/>
			</svg>
		</span>
	);
};

export default ClearDataButton;
