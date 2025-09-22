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
		<div role="article" aria-label={`Expert profile for ${authorName}`} className={`nc-ExperiencesCard group relative ${className} 
			bg-white dark:bg-[#1e1e1e] 
			rounded-2xl overflow-hidden 
			border border-neutral-200 dark:border-neutral-800
			hover:shadow-lg hover:shadow-teal-500/20 
			transition-all duration-300`}>
			<div className="flex flex-col h-full">
				{/* Profile Image Container */}
				<div className="relative w-full h-52 md:h-60 overflow-hidden">
					<Image
						src={featuredImage}
						alt={authorName}
						fill
						priority={true}
						className="object-cover transform 
							group-hover:scale-105 
							transition-transform duration-500
							filter brightness-90 group-hover:brightness-100"
						sizes="(max-width: 768px) 100vw, 
								(max-width: 1200px) 50vw, 
								33vw"
					/>
					{isVerifiedExpert && (
						<div className="absolute top-3 right-3 bg-white dark:bg-neutral-900 rounded-full p-1.5">
							<CheckBadgeIcon className="w-5 h-5 text-teal-600" />
						</div>
					)}
				</div>

				<div className="p-5 flex flex-col flex-grow">
					{/* Expert Info */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-teal-600 transition-colors">
								{authorName}
							</h2>
							<div className="flex items-center space-x-1.5">
								<StarIcon className="w-5 h-5 text-yellow-400" />
								<span className="text-lg font-semibold text-neutral-900 dark:text-white">
									{rating.toFixed(1)}
								</span>
							</div>
						</div>

						{/* Languages */}
						<div className="flex flex-wrap gap-2">
							{languages.map((lang: string, idx: number) => (
								<span 
									key={idx}
									className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-300"
								>
									{lang}
								</span>
							))}
						</div>

						{/* Bio */}
						<p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
							{hostBio}
						</p>

						{/* Expertise Tags */}
						<div className="flex flex-wrap gap-2">
							{expertise.slice(0, 3).map((skill: string, idx: number) => (
								<span 
									key={idx}
									className="px-3 py-1 text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full"
								>
									{skill}
								</span>
							))}
						</div>
					</div>

					{/* Stats & CTA */}
					<div className="mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
						<div className="flex items-center justify-between mb-4">
							<span className="text-sm text-neutral-600 dark:text-neutral-400">
								{totalSessions} sessions completed
							</span>
						</div>
						<Link href={{ pathname: href }}>
							<ShimmerButton 
								className="w-full text-white font-medium transition-transform 
									hover:scale-[1.02] active:scale-[0.98]"
								background="linear-gradient(135deg, #FF4B2B, #FF416C)"
								shimmerColor="rgba(255, 255, 255, 0.3)"
								shimmerDuration="2.5s"
							>
								View Profile <EyeIcon className="w-5 h-5 ml-2 inline-block" />
							</ShimmerButton>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ExperiencesCard;
