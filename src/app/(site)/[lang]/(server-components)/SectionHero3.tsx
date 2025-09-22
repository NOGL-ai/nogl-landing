import React, { FC } from "react";
import imagePng from "@/images/travelhero2.png";
import Image from "next/image";
import ButtonPrimary from "@/shared/ButtonPrimary";

export interface SectionHero3Props {
	className?: string;
}

const SectionHero3: FC<SectionHero3Props> = ({ className = "" }) => {
	return (
		<div
			className={`nc-SectionHero3 relative ${className}`}
			data-nc-id='SectionHero3'
		>
			<div className='absolute inset-x-0 top-[10%] z-10 mx-auto flex max-w-2xl flex-col items-center space-y-4 text-center sm:top-[15%] lg:space-y-5 xl:space-y-8'>
				<span className='font-semibold text-neutral-900 sm:text-lg md:text-xl'>
					Booking tax-free from Chis. platform
				</span>
				<h2 className='text-3xl font-bold !leading-[115%] text-black sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl '>
					New generation <br /> of booking
				</h2>
				<ButtonPrimary
					sizeClass='px-6 py-3 lg:px-8 lg:py-4 rounded-xl'
					fontSize='text-sm sm:text-base lg:text-lg font-medium'
				>
					Keep calm & travel on
				</ButtonPrimary>
			</div>
			<div className='aspect-w-1 aspect-h-1 sm:aspect-w-4 sm:aspect-h-3 lg:aspect-w-16 lg:aspect-h-9 xl:aspect-h-8 relative '>
				<Image
					className='absolute inset-0 rounded-xl object-cover'
					src={imagePng}
					alt='hero'
					priority
				/>
			</div>
		</div>
	);
};

export default SectionHero3;
