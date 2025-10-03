"use client";

import React from "react";

interface SupportCardProps {
	onDismiss: () => void;
}

const SupportCard: React.FC<SupportCardProps> = ({ onDismiss }) => {
	return (
		<div className='relative flex flex-col gap-3 rounded-xl bg-[#171D31] p-4'>
			{/* Header */}
			<div className='flex items-center gap-2.5'>
				<div className='h-6 w-6 text-white'>
					<svg
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M20.1 8.39998C20.5774 8.39998 21.0352 8.58963 21.3728 8.92719C21.7104 9.26476 21.9 9.72259 21.9 10.2V13.8C21.9 14.2774 21.7104 14.7352 21.3728 15.0728C21.0352 15.4103 20.5774 15.6 20.1 15.6H19.1442C18.9248 17.34 18.0779 18.94 16.7626 20.1C15.4472 21.2599 13.7538 21.9 12 21.9V20.1C13.4322 20.1 14.8057 19.5311 15.8184 18.5184C16.8311 17.5057 17.4 16.1322 17.4 14.7V9.29998C17.4 7.86781 16.8311 6.4943 15.8184 5.48161C14.8057 4.46891 13.4322 3.89998 12 3.89998C10.5678 3.89998 9.19433 4.46891 8.18163 5.48161C7.16893 6.4943 6.60001 7.86781 6.60001 9.29998V15.6H3.90001C3.42262 15.6 2.96478 15.4103 2.62721 15.0728C2.28965 14.7352 2.10001 14.2774 2.10001 13.8V10.2C2.10001 9.72259 2.28965 9.26476 2.62721 8.92719C2.96478 8.58963 3.42262 8.39998 3.90001 8.39998H4.85581C5.07543 6.66019 5.92238 5.06033 7.23772 3.90059C8.55307 2.74085 10.2464 2.10095 12 2.10095C13.7536 2.10095 15.4469 2.74085 16.7623 3.90059C18.0776 5.06033 18.9246 6.66019 19.1442 8.39998H20.1ZM8.18401 15.4065L9.13801 13.8801C9.99577 14.4174 10.9878 14.7016 12 14.7C13.0122 14.7016 14.0042 14.4174 14.862 13.8801L15.816 15.4065C14.6723 16.123 13.3496 16.5021 12 16.5C10.6504 16.5021 9.32767 16.123 8.18401 15.4065Z'
							fill='white'
						/>
					</svg>
				</div>
				<h3 className='font-inter flex-1 text-[16px] font-medium leading-6 tracking-[-0.176px] text-white'>
					Need support?
				</h3>
			</div>

			{/* Description */}
			<p className='font-inter text-[14px] font-normal leading-5 tracking-[-0.084px] text-[#9293A9]'>
				Contact with one of our experts to get support.
			</p>

			{/* Dismiss button */}
			<button
				onClick={onDismiss}
				className='absolute right-3 top-3 rounded-full p-0.5 transition-colors hover:bg-white/10'
				aria-label='Dismiss support card'
			>
				<svg
					width='20'
					height='20'
					viewBox='0 0 20 20'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						d='M10 8.93949L13.7125 5.22699L14.773 6.28749L11.0605 9.99999L14.773 13.7125L13.7125 14.773L10 11.0605L6.28751 14.773L5.22701 13.7125L8.93951 9.99999L5.22701 6.28749L6.28751 5.22699L10 8.93949Z'
						fill='white'
					/>
				</svg>
			</button>
		</div>
	);
};

export default SupportCard;
