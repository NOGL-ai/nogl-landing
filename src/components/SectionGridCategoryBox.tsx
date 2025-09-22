import CardCategoryBox1 from "@/components/CardCategoryBox1";
import Heading from "@/shared/Heading";
import { TaxonomyType } from "@/data/types";
import React from "react";

export interface SectionGridCategoryBoxProps {
	categories?: TaxonomyType[];
	headingCenter?: boolean;
	categoryCardType?: "card1";
	className?: string;
	gridClassName?: string;
}

const DEMO_CATS: TaxonomyType[] = [
	{
		id: "1",
		href: "/listing-expertise-strategy",
		name: "Business Strategy",
		taxonomy: "category",
		count: 200,
		thumbnail: "https://images.pexels.com/photos/6476254/pexels-photo-6476254.jpeg",
	},
	{
		id: "2",
		href: "/listing-expertise-entrepreneurship",
		name: "Entrepreneurship",
		taxonomy: "category",
		count: 180,
		thumbnail: "https://images.pexels.com/photos/7367/startup-photos.jpg",
	},
	{
		id: "3",
		href: "/listing-expertise-marketing",
		name: "Digital Marketing",
		taxonomy: "category",
		count: 150,
		thumbnail: "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg",
	},
	{
		id: "4",
		href: "/listing-expertise-seo",
		name: "SEO Optimization",
		taxonomy: "category",
		count: 120,
		thumbnail: "https://images.pexels.com/photos/9822732/pexels-photo-9822732.jpeg",
	},
	{
		id: "5",
		href: "/listing-expertise-finance",
		name: "Financial Planning",
		taxonomy: "category",
		count: 100,
		thumbnail: "https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg",
	},
	{
		id: "6",
		href: "/listing-expertise-software",
		name: "Software Development",
		taxonomy: "category",
		count: 80,
		thumbnail: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg",
	},
	{
		id: "7",
		href: "/listing-expertise-productivity",
		name: "Productivity Hacks",
		taxonomy: "category",
		count: 90,
		thumbnail: "https://images.pexels.com/photos/3299/postit-scrabble-to-do.jpg",
	},
	{
		id: "8",
		href: "/listing-expertise-mentalhealth",
		name: "Mental Health",
		taxonomy: "category",
		count: 110,
		thumbnail: "https://images.pexels.com/photos/1028741/pexels-photo-1028741.jpeg",
	},
];

const SectionGridCategoryBox: React.FC<SectionGridCategoryBoxProps> = ({
	categories = DEMO_CATS,
	categoryCardType = "card1",
	headingCenter = true,
	className = "",
	gridClassName = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
}) => {
	let CardComponentName = CardCategoryBox1;
	switch (categoryCardType) {
		case "card1":
			CardComponentName = CardCategoryBox1;
			break;

		default:
			CardComponentName = CardCategoryBox1;
	}

	return (
		<div className={`nc-SectionGridCategoryBox relative ${className}`}>
			<Heading
				desc='Discover expert-led sessions across diverse domains'
				isCenter={headingCenter}
			>
				Explore Our Expertise
			</Heading>
			<div className={`grid ${gridClassName} gap-5 sm:gap-6 md:gap-8`}>
				{categories.map((item, i) => (
					<CardComponentName key={i} taxonomy={item} />
				))}
			</div>
		</div>
	);
};

export default SectionGridCategoryBox;