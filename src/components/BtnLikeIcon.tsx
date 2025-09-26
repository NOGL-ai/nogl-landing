"use client";

import React, { FC } from "react";

export interface BtnLikeIconProps {
	className?: string;
	colorClass?: string;
	isLiked?: boolean;
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const BtnLikeIcon: FC<BtnLikeIconProps> = ({
	className = "",
	// colorClass = "",
	isLiked = false,
	onClick,
}) => {
	return (
		<button
			className={`nc-BtnLikeIcon w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-neutral-700 dark:hover:bg-neutral-600 hover:bg-neutral-100 ${className}`}
			onClick={onClick}
		>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				className='h-5 w-5'
				fill={isLiked ? 'currentColor' : 'none'}
				viewBox='0 0 24 24'
				stroke='currentColor'
			>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					
					strokeWidth={1.5}
					d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
				/>
			</svg>
		</button>
	);
};

export default BtnLikeIcon;
