import React, { FC } from "react";
import { GallerySlider } from "@/components/molecules";
import { ExpertDataType } from "@/data/types"; // Change the data type to ExpertDataType
import { LikeButton } from "@/components/atoms";
import Badge from "@/shared/Badge";
import Link from "next/link";
import ButtonPrimary from "@/shared/ButtonPrimary";

export interface ExpertCardProps {
	className?: string;
	data?: ExpertDataType; // Change the data type to ExpertDataType
	size?: "default" | "small";
}

const ExpertCard: FC<ExpertCardProps> = ({
	size = "default",
	className = "",
	data,
}) => {
	if (!data) {
		return null; // Return null if no data
	}

	const {
		galleryImgs,
		title,
		href,
		like,
		id,
		authorName, // Expert's name
		hostBio, // Short bio
		tags = [], // Tags or areas of expertise
	} = data;

	const renderSliderGallery = () => {
		return (
			<div className='relative w-full'>
				<GallerySlider
					uniqueID={`ExpertCard_${id}`}
					ratioClass='aspect-w-12 aspect-h-11'
					galleryImgs={galleryImgs}
					imageClass='rounded-lg'
				/>
				<LikeButton isLiked={like} className='absolute right-3 top-3 z-[1]' />
			</div>
		);
	};

	const renderContent = () => {
		return (
			<div className={`mt-3 space-y-4`}>
				{/* Expert's Name as Centered Heading */}
				<div className='text-center'>
					<h2
						className={`mb-1 text-xl font-bold text-neutral-900 dark:text-white`}
					>
						{authorName ? authorName : "Unknown Author"}
					</h2>

					{/* Expert's Bio */}
					<div className='text-sm leading-relaxed text-neutral-500 dark:text-neutral-400'>
						{hostBio ? hostBio : "Expert in relevant field"}
					</div>
				</div>

				{/* Tags or Areas of Expertise */}
				<div className='mt-3 flex flex-wrap justify-center gap-2'>
					{tags.slice(0, 3).map((tag, index) => (
						<Badge
							key={index}
							name={tag}
							className='rounded-full bg-border px-3 py-1 text-sm text-tertiary'
						/>
					))}
				</div>

				<div className='my-4 border-b border-neutral-100 dark:border-neutral-800'></div>

				{/* Centered Green Button */}
				<div className='flex justify-center'>
					<ButtonPrimary
						className='bg-green-600 px-6 py-2 text-white hover:bg-green-700'
						children='View Profile'
					/>
				</div>
			</div>
		);
	};

	return (
		<div className={`nc-ExpertCard group relative ${className}`}>
			{renderSliderGallery()}
			<Link href={href}>{renderContent()}</Link>
		</div>
	);
};

export default ExpertCard;
