"use client";

import React, { FC, useState } from "react";
import GallerySlider from "@/components/GallerySlider";
// import { SessionDataType } from "@/data/types";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import StartRating from "@/components/StartRating";
import BtnLikeIcon from "@/components/BtnLikeIcon";
import SaleOffBadge from "@/components/SaleOffBadge";
import Badge from "@/shared/Badge";
import Link from "next/link";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { Route } from 'next';
import Avatar from '@/shared/Avatar';

const R2_BUCKET_URL = 'https://pub-beabd1ed711d4df3bbda9b37465d8b04.r2.dev';

export interface StayCard2Props {
	className?: string;
	data: {
		id: string;
		featuredImage: string;
		galleryImgs: string[];
		title: string;
		href: string;
		expertId: string;
		expertName: string;
		timing: {
			sessionStart: string;
			duration: number;
		};
		saleOff: string;
		price: number;
		reviews: {
			averageRating: number;
			totalReviews: number;
		};
		categoryName: string;
		isCircleCommunity: boolean;
		availableSpots: number;
		bookedSpots: number;
		maxParticipants: number;
		
		date: string;
		time: string;
		duration: number;
	};
	size?: "default" | "small";
}

const StayCard2: FC<StayCard2Props> = ({
	size = "default",
	className = "",
	data,
}) => {
	const [like, setLike] = useState(false);

	if (!data) {
		return null;
	}

	console.log("StayCard2 Data:", data);
	console.log("Expert Data:", data.expertId);

	const {
		id,
		galleryImgs,
		title,
		href,
		saleOff,
		price,
		reviews,
		categoryName,
		isCircleCommunity,
		availableSpots = 0,
		bookedSpots = 0,
		featuredImage,
		expertId,
		expertName: initialName,
		timing,
		maxParticipants,
		date,
		time,
		duration,
	} = data;

	console.log("Destructured Expert:", expertId);
	console.log("Expert Name:", initialName);

	const bookedParticipants = bookedSpots || 0;
	const availableParticipants = availableSpots || maxParticipants - bookedParticipants;

	const expertName: string = initialName || 'Expert Not Available';
	console.log("Final Expert Name:", expertName);

	const formattedGalleryImgs = galleryImgs.map(img => 
			img.startsWith('http') ? img : `${R2_BUCKET_URL}/${img}`
	);
	
	const formattedFeaturedImage = featuredImage?.startsWith('http') 
		? featuredImage 
		: `${R2_BUCKET_URL}/${featuredImage}`;

	const expertImage = expertId?.startsWith('http')
		? expertId
		: `${R2_BUCKET_URL}/${expertId || 'default-avatar.png'}`;
	const sessionDuration = timing?.duration ? `${timing.duration} mins` : 'Duration not specified';
	const ratings = reviews?.averageRating || 0;
	const reviewCount = reviews?.totalReviews || 0;

	const formatDateTime = (date: string, time: string) => {
		try {
			const sessionDate = new Date(time);

			const formattedDate = sessionDate.toLocaleDateString('en-US', {
				month: 'long',
				day: 'numeric',
				year: 'numeric'
			});

			const formattedTime = sessionDate.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			});

			return {
				date: formattedDate,
				time: `${formattedTime} CET`
			};
		} catch (error) {
			console.error('Error formatting date/time:', error);
			return { date: 'Date TBD', time: 'Time TBD' };
		}
	};

	const { date: formattedDate, time: formattedTime } = formatDateTime(date, time);

	const renderSliderGallery = () => {
		return (
			<div className='relative w-full'>
				<GallerySlider
							uniqueID={`StayCard2_${id}`}
							ratioClass='aspect-w-12 aspect-h-11'
							galleryImgs={formattedGalleryImgs}
							imageClass='rounded-lg'
				/>
				<BtnLikeIcon 
					isLiked={like} 
					className='absolute right-3 top-3 z-[1]'
					onClick={() => setLike(!like)}
				/>
				{saleOff && (
					<SaleOffBadge className='absolute left-3 top-3 text-xs lg:text-sm' desc={saleOff} />
				)}
				<SaleOffBadge
					className='absolute left-3 bottom-3 flex items-center bg-blue-700 text-blue-50 text-xs lg:text-sm'
					desc={
						<div className="flex items-center">
							<i className="las la-clock text-xs lg:text-sm"></i>
							<span className="ml-1">{duration} hrs</span>
						</div>
					}
				/>
				{!!ratings && (
					<div className='absolute bottom-3 right-3 z-[1] bg-black bg-opacity-75 p-1 rounded-lg text-white text-xs lg:text-sm'>
						<StartRating reviewCount={reviewCount} rating={ratings} />
					</div>
				)}
			</div>
		);
	};

	const renderContent = () => {
		console.log('isCircleCommunity:', isCircleCommunity);
		
		return (
			<div className={size === "default" ? "mt-3 space-y-3" : "mt-2 space-y-2"}>
				<div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
					<Badge name={categoryName} className="text-xs lg:text-sm px-2 py-1 lg:px-3 lg:py-1.5" />
					{Boolean(isCircleCommunity) && (
						<Badge name="Circle" color="green" className="text-xs lg:text-sm px-2 py-1 lg:px-3 lg:py-1.5" />
					)}
				</div>

				<div className='flex items-center space-x-2'>
					<h2
						className={`font-semibold capitalize text-neutral-900 dark:text-white ${
							size === "default" ? "text-xs lg:text-base" : "text-xs lg:text-sm"
						}`}
					>
						<span className='break-words'>{title}</span>
					</h2>

				</div>

				{/* Author Information */}
				<div className="flex items-center space-x-2 text-xs lg:text-sm text-neutral-500 dark:text-neutral-400">
					<UserCircleIcon className="h-6 w-6 lg:h-8 lg:w-8 text-neutral-500" />
					<span>
						Led by{' '}
						<span className="font-medium text-neutral-900 dark:text-neutral-200">
							{expertName}
						</span>
					</span>
				</div>

				{/* Calendar and Time Information */}
				<div className="flex items-center justify-between text-[10px] lg:text-xs text-neutral-500 dark:text-neutral-400">
					<div className="flex items-center">
						<i className="las la-calendar text-sm lg:text-base"></i>
						<span className="ml-1">{formattedDate}</span>
					</div>
					<div className="flex items-center">
						<span>{formattedTime}</span>
					</div>
				</div>

				{/* Guest Information */}
				<div className="flex justify-between text-[10px] lg:text-xs text-neutral-500 dark:text-neutral-400">
					<div className="flex items-center">
						<i className="las la-user-plus text-sm lg:text-base"></i>
						<span className="ml-1">Available: {availableParticipants}</span>
					</div>
					<div className="flex items-center">
						<i className="las la-user-check text-sm lg:text-base"></i>
						<span className="ml-1">Booked: {bookedParticipants}</span>
					</div>
				</div>

				<div className='w-14 border-b border-neutral-100 dark:border-neutral-800'></div>
				<div className='flex items-center justify-between'>
					<span className='text-sm lg:text-base font-semibold'>€
						{price}
						{` `}
						<span className='text-xs lg:text-sm font-normal text-neutral-500 dark:text-neutral-400'>
							/session
						</span>

					</span>
					<ButtonPrimary className="ml-auto text-xs lg:text-sm" children="Book Now" />
				</div>
			</div>
		);
	};
	return (
		<div className={`nc-StayCard2 group relative ${className}`}>
			{renderSliderGallery()}
			<Link 
				href={href as Route}
				className="block"
				aria-label={`View details for ${title}`}
			>
				{renderContent()}
			</Link>
		</div>
	);
};

export default StayCard2;
