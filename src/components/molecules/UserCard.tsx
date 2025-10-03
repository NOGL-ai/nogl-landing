import React, { FC } from "react";
import { AuthorType } from "@/data/types";
import { StarIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import Avatar from "@/shared/Avatar";
import Badge from "@/shared/Badge";
import convertNumbThousand from "@/utils/convertNumbThousand";
import Link from "next/link";
import Image from "next/image";

export interface UserCardProps {
	className?: string;
	author: AuthorType;
	index?: number;
	variant?: "default" | "detailed";
}

const UserCard: FC<UserCardProps> = ({
	className = "",
	author,
	index,
	variant = "default",
}) => {
	const {
		displayName,
		href = "/",
		avatar,
		starRating,
		jobName,
		count,
		bgImage,
	} = author;

	if (variant === "detailed") {
		return (
			<Link
				href={href}
				className={`nc-CardAuthorBox2 [ nc-box-1 ] [ nc-dark-box-bg ] group relative flex flex-col items-center justify-center p-4 text-center sm:p-6 ${className}`}
			>
				{/* Background Image */}
				{bgImage && (
					<Image
						alt=''
						fill
						sizes='(max-width: 400px) 100vw, 400px'
						className='absolute inset-0 rounded-3xl object-cover'
						src={bgImage}
					/>
				)}
				<div className='absolute inset-0 rounded-3xl bg-black/20'></div>

				{/* Avatar */}
				<div className='relative flex-shrink-0'>
					<Avatar
						imgUrl={avatar}
						userName={displayName}
						sizeClass='w-20 h-20 text-2xl'
						radius='rounded-full'
					/>
					<div className='absolute -right-1 -top-1'>
						<Badge
							color='red'
							name='1'
							className='flex h-[30px] min-w-[30px] items-center justify-center !p-1.5 text-xs font-medium text-white'
						/>
					</div>
				</div>

				{/* Info */}
				<div className='mt-3 space-y-1.5'>
					<h2 className='text-base font-medium text-white'>
						<span className='line-clamp-1'>{displayName}</span>
					</h2>
					<span className='block text-sm text-white/70'>{jobName}</span>
					<div className='flex items-center text-yellow-500'>
						<StarIcon className='h-4 w-4' />
						<span className='ml-1 text-xs font-medium'>
							{starRating || 4.9} ({convertNumbThousand(count || 0)})
						</span>
					</div>
				</div>

				{/* Arrow */}
				<div className='absolute right-4 top-4'>
					<ArrowRightIcon className='h-5 w-5 text-white/70 transition-colors group-hover:text-white' />
				</div>
			</Link>
		);
	}

	// Default variant
	return (
		<Link
			href={href}
			className={`nc-CardAuthorBox [ nc-box-1 ] [ nc-dark-box-bg ] group relative flex flex-col items-center justify-center p-4 text-center sm:p-6 ${className}`}
		>
			<Avatar
				imgUrl={avatar}
				userName={displayName}
				sizeClass='w-20 h-20 text-2xl'
				radius='rounded-full'
			/>
			<div className='mt-3 space-y-1.5'>
				<h2 className='text-base font-medium'>
					<span className='line-clamp-1'>{displayName}</span>
				</h2>
				{starRating && (
					<div className='flex items-center text-yellow-500'>
						<StarIcon className='h-4 w-4' />
						<span className='ml-1 text-xs font-medium'>{starRating}</span>
					</div>
				)}
			</div>
		</Link>
	);
};

export default UserCard;
