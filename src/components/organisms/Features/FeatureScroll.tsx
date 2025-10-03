import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FeatureScrollProps {
	dictionary: unknown;
}

const FeatureScroll: React.FC<FeatureScrollProps> = ({ dictionary }) => {
	const features = [
		{
			title: "Demand Sensing",
			description:
				"Real-time analysis of consumer demand patterns and market signals to predict trending products.",
			icon: "/images/features/demand-sensing.svg",
		},
		{
			title: "Trend Forecasting",
			description:
				"AI-powered predictions of upcoming fashion trends based on social media, runway shows, and market data.",
			icon: "/images/features/trend-forecasting.svg",
		},
		{
			title: "Assortment Optimization",
			description:
				"Intelligent recommendations for product mix and inventory planning to maximize sales potential.",
			icon: "/images/features/assortment-optimization.svg",
		},
		{
			title: "Price Intelligence",
			description:
				"Dynamic pricing insights and competitive analysis to optimize your pricing strategy.",
			icon: "/images/features/price-intelligence.svg",
		},
	];

	return (
		<section className='bg-gray-50 py-20 dark:bg-gray-900'>
			<div className='container mx-auto px-4'>
				<div className='mb-16 text-center'>
					<h2 className='mb-4 text-4xl font-bold text-gray-900 dark:text-white'>
						AI Fashion Intelligence
					</h2>
					<p className='mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300'>
						Discover demand-sensed trends, predict new-product demand, and
						optimize assortments with our advanced AI platform.
					</p>
				</div>

				<div className='relative'>
					{/* Scrolling container */}
					<div className='scrollbar-hide flex space-x-8 overflow-x-auto pb-4'>
						{features.map((feature, index) => (
							<div
								key={index}
								className={cn(
									"w-80 flex-shrink-0 rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800",
									"border border-gray-200 dark:border-gray-700"
								)}
							>
								<div className='bg-primary/10 mb-6 flex h-16 w-16 items-center justify-center rounded-full'>
									<Image
										src={feature.icon}
										alt={feature.title}
										width={32}
										height={32}
										className='h-8 w-8'
									/>
								</div>

								<h3 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
									{feature.title}
								</h3>

								<p className='text-gray-600 dark:text-gray-300'>
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default FeatureScroll;
