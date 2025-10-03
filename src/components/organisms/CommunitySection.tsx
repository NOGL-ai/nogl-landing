"use client";

import React from "react";
import { Tab } from "@headlessui/react";
import { FiHome, FiUsers, FiCalendar } from "react-icons/fi";

interface CommunitySectionProps {
	memberCount?: number;
	discussions?: number;
	className?: string;
	stickyOffset?: string;
	tabs?: Array<{
		name: string;
		icon: React.ReactNode;
		count?: number;
		content?: React.ReactNode;
	}>;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({
	memberCount = 5988,
	discussions = 0,
	className = "",
	stickyOffset = "80px",
	tabs = [
		{
			name: "News Feed",
			icon: <FiHome className='h-5 w-5' />,
			content: undefined,
		},
		{
			name: "Members",
			icon: <FiUsers className='h-5 w-5' />,
			count: memberCount,
			content: undefined,
		},
		{
			name: "Calendar",
			icon: <FiCalendar className='h-5 w-5' />,
			content: undefined,
		},
	],
}) => {
	return (
		<div className={`listingSection__wrap ${className}`}>
			<Tab.Group>
				<div
					className={`sticky top-[${stickyOffset}] z-10 bg-white dark:bg-neutral-900`}
				>
					<Tab.List className='flex space-x-1 rounded-xl bg-neutral-100/70 p-1 backdrop-blur-sm dark:bg-neutral-800/70'>
						{tabs.map((tab) => (
							<Tab
								key={tab.name}
								className={({ selected }) =>
									`flex w-full items-center justify-center space-x-2 rounded-lg py-3 text-sm font-medium leading-5 transition-all duration-150 ease-in-out
                  ${
										selected
											? "bg-white text-neutral-900 shadow dark:bg-neutral-900 dark:text-white"
											: "text-neutral-600 hover:bg-white/[0.12] hover:text-neutral-900 dark:text-neutral-400"
									}`
								}
							>
								{({ selected }) => (
									<>
										{tab.icon}
										<span>{tab.name}</span>
										{tab.count && (
											<span
												className={`ml-1.5 rounded-full px-2 py-0.5 text-xs 
                        ${
													selected
														? "bg-neutral-100 dark:bg-neutral-800"
														: "bg-neutral-200 dark:bg-neutral-700"
												}`}
											>
												{tab.count.toLocaleString()}
											</span>
										)}
									</>
								)}
							</Tab>
						))}
					</Tab.List>
				</div>

				<Tab.Panels className='mt-8'>
					{tabs.map((tab, idx) => (
						<Tab.Panel key={idx} className='animate-fadeIn'>
							{tab.content ||
								(idx === 0 ? (
									<div className='rounded-xl border border-neutral-200 p-4 dark:border-neutral-700'>
										<div className='flex items-center space-x-4'>
											<div className='h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700' />
											<div className='flex-1'>
												<input
													type='text'
													placeholder='Share something with the community...'
													className='w-full rounded-full border border-neutral-200 px-4 py-2 dark:border-neutral-700 dark:bg-neutral-800'
												/>
											</div>
										</div>
									</div>
								) : idx === 1 ? (
									<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
										{Array(10)
											.fill(0)
											.map((_, i) => (
												<div
													key={i}
													className='flex flex-col items-center space-y-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700'
												>
													<div className='h-16 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700' />
													<div className='h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-700' />
												</div>
											))}
									</div>
								) : (
									<div className='rounded-xl border border-neutral-200 p-6 dark:border-neutral-700'>
										<div className='grid gap-4'>
											<div className='h-8 w-full rounded bg-neutral-200 dark:bg-neutral-700' />
											<div className='grid grid-cols-7 gap-2'>
												{Array(31)
													.fill(0)
													.map((_, i) => (
														<div
															key={i}
															className='aspect-square rounded bg-neutral-100 p-2 dark:bg-neutral-800'
														/>
													))}
											</div>
										</div>
									</div>
								))}
						</Tab.Panel>
					))}
				</Tab.Panels>
			</Tab.Group>
		</div>
	);
};

export default CommunitySection;
