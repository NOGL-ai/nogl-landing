import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { ReactDatePickerCustomHeaderProps } from "react-datepicker";

const DatePickerCustomHeaderTwoMonth = ({
	monthDate,
	customHeaderCount,
	decreaseMonth,
	increaseMonth,
}: ReactDatePickerCustomHeaderProps) => {
	// Check if we're in mobile view (when customHeaderCount is forced to 0)
	const isMobileView = window.innerWidth < 768;

	return (
		<div className='relative flex items-center justify-center py-2'>
			<button
				aria-label='Previous Month'
				className={
					"absolute left-0 flex items-center justify-center rounded-full p-2 hover:bg-secondary_bg dark:hover:bg-gray-700"
				}
				// Show left arrow always on mobile, or follow customHeaderCount logic on desktop
				style={
					!isMobileView && customHeaderCount === 1
						? { visibility: "hidden" }
						: {}
				}
				onClick={decreaseMonth}
				type='button'
			>
				<ChevronLeftIcon className='h-5 w-5' />
			</button>
			<span className='text-sm font-medium'>
				{monthDate.toLocaleString("en-US", {
					month: "long",
					year: "numeric",
				})}
			</span>
			<button
				aria-label='Next Month'
				className='absolute right-0 flex items-center justify-center rounded-full p-2 hover:bg-secondary_bg dark:hover:bg-gray-700'
				// Show right arrow always on mobile, or follow customHeaderCount logic on desktop
				style={
					!isMobileView && customHeaderCount === 0
						? { visibility: "hidden" }
						: {}
				}
				type='button'
				onClick={increaseMonth}
			>
				<ChevronRightIcon className='h-5 w-5' />
			</button>
		</div>
	);
};

export default DatePickerCustomHeaderTwoMonth;
