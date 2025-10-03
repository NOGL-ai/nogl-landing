"use client";

import React from "react";

interface LoadingChartProps {
	title: string;
	height?: string;
	className?: string;
}

export const LoadingChart: React.FC<LoadingChartProps> = ({
	title,
	height = "442px",
	className = "",
}) => {
	const ErrorIcon = () => (
		<svg
			width='38'
			height='38'
			viewBox='0 0 38 38'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M19 33.25C11.1297 33.25 4.75 26.8703 4.75 19C4.75 11.1297 11.1297 4.75 19 4.75C26.8703 4.75 33.25 11.1297 33.25 19C33.25 26.8703 26.8703 33.25 19 33.25ZM17.575 23.275V26.125H20.425V23.275H17.575ZM17.575 11.875V20.425H20.425V11.875H17.575Z'
				fill='#0A0D14'
			/>
		</svg>
	);

	return (
		<div
			className={`relative overflow-hidden rounded-2xl border border-[#E2E4E9] bg-white p-5 dark:border-gray-700 dark:bg-gray-800 ${className}`}
			style={{ height }}
		>
			{/* Title */}
			<div className='mb-5'>
				<h3
					className='text-base font-medium leading-6 text-[#111827] dark:text-white'
					style={{
						fontFamily: "Inter",
						fontSize: "16px",
						lineHeight: "24px",
						letterSpacing: "-0.176px",
					}}
				>
					{title}
				</h3>
			</div>

			{/* Loading Overlay - positioned to cover the bottom part */}
			<div
				className='absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center rounded-b-[11px] bg-white bg-opacity-30 backdrop-blur-[10px] dark:bg-gray-800 dark:bg-opacity-50'
				style={{
					height: "calc(100% - 80px)", // Leave space for title
				}}
			>
				<div className='flex flex-col items-center justify-center text-center'>
					<ErrorIcon />
					<h4
						className='mb-4 mt-8 max-w-[234px] text-base font-semibold leading-[18px] text-[#111827] dark:text-white'
						style={{
							fontFamily: "Inter",
							fontSize: "16px",
							lineHeight: "18px",
						}}
					>
						Missing data from input feed
					</h4>
					<p
						className='max-w-[280px] text-sm font-normal leading-5 text-[#646978] dark:text-gray-400'
						style={{
							fontFamily: "Inter",
							fontSize: "14px",
							lineHeight: "20px",
						}}
					>
						We need sales price to calculate price status. Provide sales price
						in your input feeds to see statistics
					</p>
				</div>
			</div>
		</div>
	);
};

export default LoadingChart;
