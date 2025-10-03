import React, { FC } from "react";
// import Heading from "@/shared/Heading";

export interface Statistic {
	id: string;
	heading: string;
	subHeading: string;
	metric: string;
	icon: string;
}

const PLATFORM_STATS: Statistic[] = [
	{
		id: "1",
		heading: "+60% Velocity",
		subHeading:
			"Increase sales/revenue velocity with demand‑sensed trend and buy decisions",
		metric: "+60%",
		icon: "⚡",
	},
	{
		id: "2",
		heading: "+30% Turns",
		subHeading:
			"Improve inventory turns through better width/depth and localization",
		metric: "+30%",
		icon: "🔁",
	},
	{
		id: "3",
		heading: "+20% Full‑price Sell‑through",
		subHeading:
			"Lift first-quality sell‑through with accurate demand prediction",
		metric: "+20%",
		icon: "🏷️",
	},
	{
		id: "4",
		heading: "100+ Brands & Retailers",
		subHeading: "Trusted by leading fashion and lifestyle businesses globally",
		metric: "100+",
		icon: "🏬",
	},
];

export interface SectionStatisticProps {
	className?: string;
}

const SectionStatistic: FC<SectionStatisticProps> = ({ className = "" }) => {
	return (
		<section className={`nc-SectionStatistic relative ${className}`}>
			<div className='container mx-auto px-4 py-16 lg:py-28'>
				{/* Section Heading */}
				<div className='mx-auto mb-16 max-w-2xl text-center'>
					<h2 className='mb-4 text-3xl font-bold'>
						Impact with AI Fashion Intelligence
					</h2>
					<p className='text-neutral-500 dark:text-neutral-400'>
						Demand‑sensed trend forecasting and demand prediction that reduce
						markdowns and accelerate growth.
					</p>
				</div>

				{/* Statistics Grid */}
				<div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
					{PLATFORM_STATS.map((stat) => (
						<div
							key={stat.id}
							className='dark:hover:shadow-2xl-dark relative overflow-hidden rounded-2xl bg-white p-8 transition-all duration-300 hover:shadow-xl dark:bg-neutral-800'
						>
							{/* Background Accent */}
							<div className='bg-primary-50 dark:bg-primary-900 absolute -right-2 -top-2 h-20 w-20 rounded-full opacity-20' />

							{/* Icon */}
							<span
								className='mb-4 block text-3xl'
								role='img'
								aria-label={stat.heading}
							>
								{stat.icon}
							</span>

							{/* Metric */}
							<h3 className='text-primary-600 dark:text-primary-400 mb-2 text-4xl font-bold'>
								{stat.metric}
							</h3>

							{/* Heading */}
							<h4 className='mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
								{stat.heading}
							</h4>

							{/* Description */}
							<p className='text-sm text-neutral-500 dark:text-neutral-400'>
								{stat.subHeading}
							</p>
						</div>
					))}
				</div>

				{/* Trust Banner */}
				<div className='mt-16 text-center'>
					<p className='text-sm text-neutral-500 dark:text-neutral-400'>
						Trusted by professionals from leading companies worldwide
					</p>
					<div className='mt-6 flex justify-center space-x-8 opacity-75 grayscale'>
						{/* Add company logos here */}
					</div>
				</div>
			</div>
		</section>
	);
};

export default SectionStatistic;
