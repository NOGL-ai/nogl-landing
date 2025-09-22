import React, { FC, ReactNode } from "react";
import HeroSearchForm, { SearchTab } from "../../(site)/(client-components)/(HeroSearchForm)/HeroSearchForm";

export interface SectionHeroArchivePageProps {
	className?: string;
	listingType?: ReactNode;
	currentPage: "Stays" | "Experiences" | "Cars" | "Flights" | "Sessions" | "Experts"; // Update these to reflect your platform categories if necessary
	currentTab: SearchTab;
}

const SectionHeroArchivePage: FC<SectionHeroArchivePageProps> = ({
	className = "",
	listingType,
	currentPage,
	currentTab,
}) => {
	return (
		<div
			className={`nc-SectionHeroArchivePage relative flex flex-col ${className}`}
			data-nc-id="SectionHeroArchivePage"
		>
			<div className="flex flex-col items-start space-y-4 pb-4 lg:w-full lg:space-y-6 lg:pb-6">
				<h2 className="text-4xl font-medium leading-[110%] md:text-5xl xl:text-7xl">
					Get Smarter for Less - Tap into Expert Insights Directly
				</h2>
				<p className="text-neutral-500 dark:text-neutral-400 md:text-lg">
					Expand your knowledge and skills by booking sessions with industry leaders.
				</p>
				<div className="flex items-center text-base text-neutral-500 dark:text-neutral-400 md:text-lg">
					<i className="las la-globe text-2xl" aria-label="Global Reach"></i>
					<span className="ml-2.5">Global Availability</span>
					<span className="mx-5"></span>
					{listingType ? (
						listingType
					) : (
						<>
							<i className="las la-graduation-cap text-2xl" aria-label="Sessions"></i>
							<span className="ml-2.5">1200+ Experts</span>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default SectionHeroArchivePage;