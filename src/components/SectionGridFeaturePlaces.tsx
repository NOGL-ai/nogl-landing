'use client';

import React, { FC, ReactNode, useState } from "react";
import { DEMO_SESSIONS_LISTINGS } from "@/data/listings";
import { SessionDataType } from "@/data/types";
import HeaderFilter from "./HeaderFilter";
import StayCard2 from "@/components/StayCard2/StayCard2";

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
};

const DEMO_DATA: SessionDataType[] = DEMO_SESSIONS_LISTINGS
	.filter((_, i) => i < 4)
	.map(session => ({
		...session,
		date: formatDate(session.date)
	}));

export interface SectionGridFeaturePlacesProps {
	stayListings?: SessionDataType[];
	gridClass?: string;
	heading?: ReactNode;
	subHeading?: ReactNode;
	headingIsCenter?: boolean;
	tabs?: string[];
	cardType?: "card1" | "card2";
	className?: string;
}

const SectionGridFeaturePlaces: FC<SectionGridFeaturePlacesProps> = ({
	stayListings = DEMO_DATA,
	gridClass = "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8",
	heading = "Featured sessions",
	subHeading = "Popular session that other customers recommend",
	headingIsCenter,
	tabs = ["All", "SEO", "Marketing", "Entrepreneurship", "Sales"],
	cardType = "card2",
	className = "",
}) => {
	const [activeTab, setActiveTab] = useState("All");

	const scrollToNewsletter = () => {
		const newsletterElement = document.getElementById('newsletter');
		newsletterElement?.scrollIntoView({ behavior: 'smooth' });
	};

	const filteredListings = stayListings.filter(session => {
		if (activeTab === "All") return true;
		return session.categoryName === activeTab;
	});

	const renderCard = (session: SessionDataType) => {
		return (
			<div onClick={scrollToNewsletter} className="cursor-pointer transition-opacity hover:opacity-80">
				<StayCard2 key={session.id} data={session} />
			</div>
		);
	};

	return (
		<div className={`nc-SectionGridFeaturePlaces relative ${className}`}>
			<HeaderFilter
				tabActive={activeTab}
				subHeading={subHeading}
				tabs={tabs}
				heading={
					<div className="flex items-center gap-3">
						<h2 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
							{heading}
						</h2>
						<button 
							onClick={scrollToNewsletter}
							className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
						>
							<span>Coming Soon</span>
							<span className="relative flex h-2 w-2">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-400 dark:bg-neutral-500 opacity-75"></span>
								<span className="relative inline-flex h-2 w-2 rounded-full bg-neutral-500 dark:bg-neutral-400"></span>
							</span>
						</button>
					</div>
				}
				onClickTab={setActiveTab}
			/>
			<div className={`grid gap-6 md:gap-8 ${gridClass}`}>
				{filteredListings.map((session) => renderCard(session))}
			</div>
		</div>
	);
};

export default SectionGridFeaturePlaces;
