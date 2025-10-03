import { avatarColors } from "@/constants/constants";
import React, { FC } from "react";
import avatar1 from "@/images/avatars/Image-1.png";
import Image, { StaticImageData } from "next/image";

export interface AvatarProps {
	containerClassName?: string;
	sizeClass?: string;
	radius?: string;
	imgUrl?: string | StaticImageData;
	userName?: string;
	hasChecked?: boolean;
	hasCheckedClass?: string;
	sizes?: string;
}

const Avatar: FC<AvatarProps> = ({
	containerClassName = "ring-1 ring-white dark:ring-neutral-900",
	sizeClass = "h-6 w-6 text-sm",
	radius = "rounded-full",
	imgUrl,
	userName,
	hasChecked,
	hasCheckedClass = "w-4 h-4 -top-0.5 -right-0.5",
	sizes,
}) => {
	const url = imgUrl || avatar1;
	const name = userName || "John Doe";
	const _setBgColor = (name: string) => {
		const backgroundIndex = Math.floor(
			name.charCodeAt(0) % avatarColors.length
		);
		return avatarColors[backgroundIndex];
	};

	return (
		<div
			className={`wil-avatar relative inline-flex flex-shrink-0 items-center justify-center font-semibold uppercase text-neutral-100 shadow-inner ${radius} ${sizeClass} ${containerClassName}`}
			style={{ backgroundColor: url ? undefined : _setBgColor(name) }}
		>
			{url && typeof url === "string" ? (
				<Image
					className={`absolute inset-0 h-full w-full object-cover ${radius}`}
					src={url}
					alt={name}
					fill={typeof url === "string" ? true : undefined}
					sizes={sizes || "100px"}
				/>
			) : (
				<Image
					className={`absolute inset-0 h-full w-full object-cover ${radius}`}
					src={url}
					alt={name}
					layout='fill'
					sizes={sizes || "100px"}
				/>
			)}
			{!url && <span className='wil-avatar__name'>{name[0]}</span>}

			{hasChecked && (
				<span
					className={`absolute flex items-center justify-center rounded-full bg-teal-500 text-xs text-white ${hasCheckedClass}`}
				>
					<i className='las la-check'></i>
				</span>
			)}
		</div>
	);
};

export default Avatar;
