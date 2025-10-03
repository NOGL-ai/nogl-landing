import React from "react";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

interface AvatarProps {
	src?: string;
	alt?: string;
	size?: number;
	hasChecked?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
	src = "/images/testimonial/Viola_Weller.jpg",
	alt = "Avatar",
	size = 44,
	hasChecked = false,
}) => {
	return (
		<div className='relative'>
			<div className={`h-${size} w-${size} overflow-hidden rounded-full`}>
				<img src={src} alt={alt} className='h-full w-full object-cover' />
			</div>
			{hasChecked && (
				<span className='absolute right-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 ring-4 ring-neutral-900'>
					<CheckBadgeIcon className='h-6 w-6 text-white' />
				</span>
			)}
		</div>
	);
};

export default Avatar;
