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
	const { displayName, href = "/", avatar, starRating, jobName, count, bgImage } = author;

	if (variant === "detailed") {
		return (
			<Link
				href={href}
				className={`nc-CardAuthorBox2 group relative flex flex-col items-center justify-center text-center sm:p-6 p-4 [ nc-box-1 ] [ nc-dark-box-bg ] ${className}`}
			>
				{/* Background Image */}
				{bgImage && (
					<Image
						alt=""
						fill
						sizes="(max-width: 400px) 100vw, 400px"
						className="absolute inset-0 object-cover rounded-3xl"
						src={bgImage}
					/>
				)}
				<div className="absolute inset-0 bg-black/20 rounded-3xl"></div>

				{/* Avatar */}
				<div className="relative flex-shrink-0">
					<Avatar
						imgUrl={avatar}
						userName={displayName}
						sizeClass="w-20 h-20 text-2xl"
						radius="rounded-full"
					/>
					<div className="absolute -top-1 -right-1">
						<Badge
							color="red"
							name="1"
							className="!p-1.5 min-w-[30px] h-[30px] flex items-center justify-center text-white text-xs font-medium"
						/>
					</div>
				</div>

				{/* Info */}
				<div className="mt-3 space-y-1.5">
					<h2 className="text-base font-medium text-white">
						<span className="line-clamp-1">{displayName}</span>
					</h2>
					<span className="block text-sm text-white/70">{jobName}</span>
					<div className="flex items-center text-yellow-500">
						<StarIcon className="w-4 h-4" />
						<span className="text-xs ml-1 font-medium">
							{starRating || 4.9} ({convertNumbThousand(count || 0)})
						</span>
					</div>
				</div>

				{/* Arrow */}
				<div className="absolute top-4 right-4">
					<ArrowRightIcon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
				</div>
			</Link>
		);
	}

	// Default variant
	return (
		<Link
			href={href}
			className={`nc-CardAuthorBox group relative flex flex-col items-center justify-center text-center sm:p-6 p-4 [ nc-box-1 ] [ nc-dark-box-bg ] ${className}`}
		>
			<Avatar
				imgUrl={avatar}
				userName={displayName}
				sizeClass="w-20 h-20 text-2xl"
				radius="rounded-full"
			/>
			<div className="mt-3 space-y-1.5">
				<h2 className="text-base font-medium">
					<span className="line-clamp-1">{displayName}</span>
				</h2>
				{starRating && (
					<div className="flex items-center text-yellow-500">
						<StarIcon className="w-4 h-4" />
						<span className="text-xs ml-1 font-medium">{starRating}</span>
					</div>
				)}
			</div>
		</Link>
	);
};

export default UserCard;
