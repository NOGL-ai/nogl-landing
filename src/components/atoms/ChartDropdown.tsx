"use client";

import React, { useState } from "react";

interface ChartDropdownProps {
	value: string;
	onChange: (value: string) => void;
	options?: Array<{ value: string; label: string }>;
	className?: string;
}

const ChartDropdown: React.FC<ChartDropdownProps> = ({
	value,
	onChange,
	options = [
		{ value: "last-year", label: "Last Year" },
		{ value: "last-6-months", label: "Last 6 Months" },
		{ value: "last-3-months", label: "Last 3 Months" },
		{ value: "last-month", label: "Last Month" },
	],
	className = "",
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectedOption = options.find((option) => option.value === value);

	const ArrowDownIcon = () => (
		<svg
			width='20'
			height='20'
			viewBox='0 0 20 20'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M9.99956 10.879L13.7121 7.1665L14.7726 8.227L9.99956 13L5.22656 8.227L6.28706 7.1665L9.99956 10.879Z'
				fill='#525866'
			/>
		</svg>
	);

	return (
		<div className={`relative ${className}`}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='flex items-center gap-0.5 rounded-lg border border-[#E1E4EA] bg-white px-2.5 py-1.5 shadow-[0_1px_2px_0_rgba(10,13,20,0.03)] transition-colors hover:bg-secondary_bg dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.1)]'
			>
				<span
					className='text-sm font-normal text-[#0E121B]'
					style={{
						fontFamily: "Inter",
						fontSize: "14px",
						lineHeight: "20px",
						letterSpacing: "-0.084px",
					}}
				>
					{selectedOption?.label || value}
				</span>
				<ArrowDownIcon />
			</button>

			{isOpen && (
				<>
					{/* Backdrop */}
					<div
						className='fixed inset-0 z-10'
						onClick={() => setIsOpen(false)}
					/>

					{/* Dropdown Menu */}
					<div className='absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-[#E1E4EA] bg-white py-1 shadow-lg dark:shadow-[0_4px_12px_0_rgba(0,0,0,0.3)]'>
						{options.map((option) => (
							<button
								key={option.value}
								onClick={() => {
									onChange(option.value);
									setIsOpen(false);
								}}
								className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-secondary_bg ${
									option.value === value
										? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
										: "text-secondary"
								}`}
								style={{
									fontFamily: "Inter",
									fontSize: "14px",
									lineHeight: "20px",
									letterSpacing: "-0.084px",
								}}
							>
								{option.label}
							</button>
						))}
					</div>
				</>
			)}
		</div>
	);
};

export default ChartDropdown;
