import React from "react";

interface SectionHeroArchivePageProps {
	className?: string;
	listingType?: any;
	currentPage?: string;
	currentTab?: string;
}

const SectionHeroArchivePage: React.FC<SectionHeroArchivePageProps> = ({
	className = "",
	listingType,
	currentPage,
	currentTab,
}) => {
	return (
		<div className={`nc-SectionHeroArchivePage flex flex-col relative ${className}`}>
			<div className="flex flex-col lg:flex-row lg:items-center">
				<div className="flex-shrink-0 lg:w-1/2 flex flex-col items-start space-y-6 lg:space-y-10 pb-14 lg:pb-64 xl:pb-80 xl:pr-14 lg:mr-10 xl:mr-0">
					<h2 className="font-medium text-4xl md:text-5xl xl:text-7xl !leading-[114%] ">
						Archive Page
					</h2>
					<span className="text-base md:text-lg text-neutral-500 dark:text-neutral-400">
						Browse through our collection
					</span>
				</div>
			</div>
		</div>
	);
};

export default SectionHeroArchivePage;
