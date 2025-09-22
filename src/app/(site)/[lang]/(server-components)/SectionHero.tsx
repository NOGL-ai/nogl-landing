import React, { FC } from "react";
import imagePng from "@/images/hero-right.png";
import HeroSearchForm from "../(client-components)/(HeroSearchForm)/HeroSearchForm";
import Image from "next/image";
import ButtonPrimary from "@/shared/ButtonPrimary";

export interface SectionHeroProps {
	className?: string;
}

const SectionHero: FC<SectionHeroProps> = ({ className = "" }) => {
	return (
		<div
			className={`nc-SectionHero relative flex flex-col-reverse lg:flex-col ${className}`}
		>
			<div className='flex flex-col lg:flex-row lg:items-center'>
				<div className='flex flex-shrink-0 flex-col items-start space-y-8 pb-14 sm:space-y-10 lg:mr-10 lg:w-1/2 lg:pb-64 xl:mr-0 xl:pr-14'>
					<h2 className='text-4xl font-medium !leading-[114%] md:text-5xl xl:text-7xl '>
						Hotel, car & experiences
					</h2>
					<span className='text-base text-neutral-500 dark:text-neutral-400 md:text-lg'>
						Accompanying us, you have a trip full of experiences. With Chisfis,
						booking accommodation, resort villas, hotels
					</span>
					<ButtonPrimary href='/listing-session' sizeClass='px-5 py-4 sm:px-7'>
						Start your search
					</ButtonPrimary>
				</div>
				<div className='flex-grow'>
					<Image className='w-full' src={imagePng} alt='hero' priority />
				</div>
			</div>

			<div className='z-10 mb-12 hidden w-full lg:-mt-40 lg:mb-0 lg:block'>
				<HeroSearchForm />
			</div>
		</div>
	);
};

export default SectionHero;
