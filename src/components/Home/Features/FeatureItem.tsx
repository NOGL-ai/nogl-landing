import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FeatureItem as FeatureItemType } from "./featuresData";

interface FeatureItemProps {
	data: FeatureItemType;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ data }) => {
	return (
		<div className='group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800'>
			{/* Feature Icon */}
			<div className='mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20'>
				<Image
					src={data.icon}
					alt={data.title}
					width={32}
					height={32}
					className='h-8 w-8 text-primary'
				/>
			</div>

			{/* Feature Content */}
			<div className='space-y-4'>
				<h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
					{data.title}
				</h3>
				<p className='text-gray-600 dark:text-gray-300'>
					{data.description}
				</p>
			</div>

			{/* Feature Link */}
			<Link
				href={data.href as any}
				className='mt-6 inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200'
			>
				Learn More
				<svg
					className='ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M9 5l7 7-7 7'
					/>
				</svg>
			</Link>

			{/* Hover Effect */}
			<div className='absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
		</div>
	);
};

export default FeatureItem;
