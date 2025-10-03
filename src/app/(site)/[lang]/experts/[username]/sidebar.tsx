// Sidebar.tsx

import React from "react";
import Avatar from "@/shared/Avatar";
import StartRating from "@/components/StartRating";
import SocialsList from "@/shared/SocialsList";

interface SidebarProps {
	name: string;
	avatarUrl: string;
	rating: number;
	location: string;
	joinedDate: string;
}

const Sidebar: React.FC<SidebarProps> = ({
	name,
	avatarUrl,
	rating,
	location,
	joinedDate,
}) => {
	return (
		<div className='flex w-full flex-col items-center space-y-6 border-neutral-200 px-0 text-center sm:space-y-7 sm:rounded-2xl sm:border sm:p-6 xl:p-8 dark:border-neutral-700'>
			{/* Avatar */}
			<Avatar src={avatarUrl} hasChecked size={112} />

			{/* Name and Rating */}
			<div className='flex flex-col items-center space-y-3 text-center'>
				<h2 className='text-3xl font-semibold'>{name}</h2>
				<StartRating className='!text-base' rating={rating} />
			</div>

			{/* Location */}
			<p className='text-neutral-500 dark:text-neutral-400'>{location}</p>

			{/* Social Links */}
			<SocialsList
				className='!space-x-3'
				itemClass='flex items-center justify-center w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xl'
			/>

			{/* Divider */}
			<div className='w-14 border-b border-neutral-200 dark:border-neutral-700'></div>

			{/* Additional Info */}
			<div className='space-y-4'>
				<div className='flex items-center space-x-4'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-6 w-6 text-neutral-400'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={1.5}
							d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
						/>
					</svg>
					<span className='text-neutral-6000 dark:text-neutral-300'>
						{location}
					</span>
				</div>
				<div className='flex items-center space-x-4'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-6 w-6 text-neutral-400'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={1.5}
							d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
						/>
					</svg>
					<span className='text-neutral-6000 dark:text-neutral-300'>
						Joined in {joinedDate}
					</span>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
