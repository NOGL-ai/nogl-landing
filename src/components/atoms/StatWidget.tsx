"use client";

import React from "react";
import CircularProgress from "./CircularProgress";

interface StatWidgetProps {
	title: string;
	percentage: number;
	value: number;
	total: number;
	progressColor?: string;
	progressBackgroundColor?: string;
	showSeeAll?: boolean;
	onSeeAllClick?: () => void;
	className?: string;
}

const StatWidget: React.FC<StatWidgetProps> = ({
	title,
	percentage,
	value,
	total,
	progressColor = "#FB3748",
	progressBackgroundColor = "#FFEBED",
	showSeeAll = true,
	onSeeAllClick,
	className = "",
}) => {
	const InfoIcon = () => (
		<svg
			width='20'
			height='20'
			viewBox='0 0 20 20'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M10 17.5C5.85775 17.5 2.5 14.1423 2.5 10C2.5 5.85775 5.85775 2.5 10 2.5C14.1423 2.5 17.5 5.85775 17.5 10C17.5 14.1423 14.1423 17.5 10 17.5ZM10 16C11.5913 16 13.1174 15.3679 14.2426 14.2426C15.3679 13.1174 16 11.5913 16 10C16 8.4087 15.3679 6.88258 14.2426 5.75736C13.1174 4.63214 11.5913 4 10 4C8.4087 4 6.88258 4.63214 5.75736 5.75736C4.63214 6.88258 4 8.4087 4 10C4 11.5913 4.63214 13.1174 5.75736 14.2426C6.88258 15.3679 8.4087 16 10 16ZM9.25 6.25H10.75V7.75H9.25V6.25ZM9.25 9.25H10.75V13.75H9.25V9.25Z'
				fill='#525866'
			/>
		</svg>
	);

	return (
		<div
			className={`rounded-xl border border-[#E1E4EA] bg-white shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] transition-all duration-200 hover:border-[#D0D5DD] hover:shadow-lg dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] dark:hover:border-gray-600 ${className}`}
			style={{ padding: "20px 16px" }}
		>
			<div className='flex h-full flex-col justify-between'>
				{/* Header */}
				<div className='flex flex-col gap-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-1'>
							<span
								className='text-base font-medium leading-6 text-[#54565B]'
								style={{
									fontFamily: "Inter",
									fontSize: "16px",
									lineHeight: "24px",
									letterSpacing: "-0.176px",
								}}
							>
								{title}
							</span>
							<InfoIcon />
						</div>
						{showSeeAll && (
							<button
								onClick={onSeeAllClick}
								className='flex items-center justify-center gap-0.5 rounded-lg border border-[#E1E4EA] bg-white px-1.5 py-1.5 shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-md dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.1)]'
							>
								<span
									className='px-1 text-sm font-medium text-[#525866]'
									style={{
										fontFamily: "Inter",
										fontSize: "14px",
										lineHeight: "20px",
										letterSpacing: "-0.084px",
									}}
								>
									See All
								</span>
							</button>
						)}
					</div>

					{/* Content Divider */}
					<div className='h-0 border-t border-transparent'></div>
				</div>

				{/* Progress & Content */}
				<div className='flex items-center gap-4'>
					<div className='transition-transform duration-200 hover:scale-110'>
						<CircularProgress
							percentage={percentage}
							color={progressColor}
							backgroundColor={progressBackgroundColor}
							size={72}
						/>
					</div>
					<div className='flex flex-1 flex-col justify-between'>
						<div
							className='text-[#3D5067]'
							style={{
								fontFamily: "Inter",
								fontSize: "18px",
								lineHeight: "130%",
							}}
						>
							<span
								className='text-3xl font-bold text-gray-900 transition-colors duration-200 dark:text-white'
								style={{
									fontSize: "34px",
								}}
							>
								{value.toLocaleString()}
							</span>
							<span className='ml-1 text-lg font-normal text-[#3D5067] transition-colors duration-200'>
								/{total.toLocaleString()}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StatWidget;
