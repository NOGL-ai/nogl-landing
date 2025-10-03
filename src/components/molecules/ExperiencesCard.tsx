import React, { FC } from "react";
import { ExpertDataType } from "@/data/types";
import Link from "next/link";
import Image from "next/image";
import { StarIcon, CheckBadgeIcon, EyeIcon } from "@heroicons/react/24/solid";
import ShimmerButton from "@/components/ui/shimmer-button";

export interface ExperiencesCardProps {
	className?: string;
	data?: ExpertDataType;
	size?: "default" | "small";
}

const ExperiencesCard: FC<ExperiencesCardProps> = ({
	size = "default",
	className = "",
	data,
}) => {
	if (!data) return null;

	const {
		authorName,
		hostBio,
		featuredImage,
		expertise = [],
		id,
		rating = 0,
		totalSessions = 0,
		isVerifiedExpert,
		languages = [],
	} = data;

	const href = `/expert/${id}` as const;

	return (
		<div
			role='article'
			aria-label={`Expert profile for ${authorName}`}
			className={`nc-ExperiencesCard group relative ${className} 
			overflow-hidden rounded-2xl 
			border border-neutral-200 
			bg-white transition-all duration-300
			hover:shadow-lg hover:shadow-teal-500/20 
			dark:border-neutral-800 dark:bg-[#1e1e1e]`}
		>
			<div className='flex h-full flex-col'>
				{/* Profile Image Container */}
				<div className='relative h-52 w-full overflow-hidden md:h-60'>
					<Image
						src={featuredImage}
						alt={authorName}
						fill
						priority={true}
						className='transform object-cover 
							brightness-90 
							filter transition-transform
							duration-500 group-hover:scale-105 group-hover:brightness-100'
						sizes='(max-width: 768px) 100vw, 
								(max-width: 1200px) 50vw, 
								33vw'
					/>
					{isVerifiedExpert && (
						<div className='absolute right-3 top-3 rounded-full bg-white p-1.5 dark:bg-neutral-900'>
							<CheckBadgeIcon className='h-5 w-5 text-teal-600' />
						</div>
					)}
				</div>

				<div className='flex flex-grow flex-col p-5'>
					{/* Expert Info */}
					<div className='space-y-3'>
						<div className='flex items-center justify-between'>
							<h2 className='text-lg font-semibold text-neutral-900 transition-colors group-hover:text-teal-600 dark:text-neutral-100'>
								{authorName}
							</h2>
							<div className='flex items-center space-x-1.5'>
								<StarIcon className='h-5 w-5 text-yellow-400' />
								<span className='text-lg font-semibold text-neutral-900 dark:text-white'>
									{rating.toFixed(1)}
								</span>
							</div>
						</div>

						{/* Languages */}
						<div className='flex flex-wrap gap-2'>
							{languages.map((lang: string, idx: number) => (
								<span
									key={idx}
									className='rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
								>
									{lang}
								</span>
							))}
						</div>

						{/* Bio */}
						<p className='line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400'>
							{hostBio}
						</p>

						{/* Expertise Tags */}
						<div className='flex flex-wrap gap-2'>
							{expertise.slice(0, 3).map((skill: string, idx: number) => (
								<span
									key={idx}
									className='rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
								>
									{skill}
								</span>
							))}
						</div>
					</div>

					{/* Stats & CTA */}
					<div className='mt-5 border-t border-neutral-200 pt-4 dark:border-neutral-800'>
						<div className='mb-4 flex items-center justify-between'>
							<span className='text-sm text-neutral-600 dark:text-neutral-400'>
								{totalSessions} sessions completed
							</span>
						</div>
						<Link href={{ pathname: href }}>
							<ShimmerButton
								className='w-full font-medium text-white transition-transform 
									hover:scale-[1.02] active:scale-[0.98]'
								background='linear-gradient(135deg, #FF4B2B, #FF416C)'
								shimmerColor='rgba(255, 255, 255, 0.3)'
								shimmerDuration='2.5s'
							>
								View Profile <EyeIcon className='ml-2 inline-block h-5 w-5' />
							</ShimmerButton>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ExperiencesCard;
