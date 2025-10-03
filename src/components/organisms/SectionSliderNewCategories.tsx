"use client";

import React, { FC, useEffect, useState } from "react";
import { TaxonomyType } from "@/data/types";
import { CategoryCard } from "@/components/molecules";
import Heading from "@/shared/Heading";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { PrevBtn, NextBtn } from "../molecules";
import { variants } from "@/utils/animationVariants";
import { useWindowSize } from "react-use";
import { Route } from "next";

export interface SectionSliderNewCategoriesProps {
	className?: string;
	itemClassName?: string;
	heading?: string;
	subHeading?: string;
	categories?: TaxonomyType[];
	categoryCardType?: "card3" | "card4" | "card5";
	itemPerRow?: 4 | 5;
	sliderStyle?: "style1" | "style2";
}

const DEMO_CATS: TaxonomyType[] = [
	{
		id: "1",
		href: "/listing-stay-map" as Route,
		name: "Email Marketing",
		taxonomy: "category" as const,
		count: 17288,
		thumbnail: "/images/SectionSliderNewCategories/email_marketing.jpeg",
	},
	{
		id: "2",
		href: "/listing-stay-map" as Route,
		name: "Meta Ads",
		taxonomy: "category" as const,
		count: 2118,
		thumbnail: "/images/SectionSliderNewCategories/meta_ads.jpeg",
	},
	{
		id: "3",
		href: "/listing-stay-map" as Route,
		name: "How to Pitch",
		taxonomy: "category" as const,
		count: 36612,
		thumbnail: "/images/SectionSliderNewCategories/how_to_pitch.jpeg",
	},
	{
		id: "4",
		href: "/listing-session" as Route,
		name: "B2B Sales",
		taxonomy: "category" as const,
		count: 181,
		thumbnail: "/images/SectionSliderNewCategories/b2b_sales.jpeg",
	},
	{
		id: "5",
		href: "/listing-session" as Route,
		name: "SEO/SEA",
		taxonomy: "category" as const,
		count: 222,
		thumbnail: "/images/SectionSliderNewCategories/seo.jpeg",
	},
	{
		id: "6",
		href: "/listing-session" as Route,
		name: "Content Marketing",
		taxonomy: "category" as const,
		count: 188,
		thumbnail: "/images/SectionSliderNewCategories/content_marketing.jpeg",
	},
	{
		id: "7",
		href: "/listing-session" as Route,
		name: "Social Media Advertising",
		taxonomy: "category" as const,
		count: 211,
		thumbnail: "/images/SectionSliderNewCategories/social_media_marketing.jpg",
	},
	{
		id: "8",
		href: "/listing-stay-map" as Route,
		name: "Lead Generation",
		taxonomy: "category" as const,
		count: 515,
		thumbnail: "/images/SectionSliderNewCategories/leads_generation.jpg",
	},
];

const SectionSliderNewCategories: FC<SectionSliderNewCategoriesProps> = ({
	heading = "Suggestions for discovery",
	subHeading = "Popular places to recommends for you",
	className = "",
	itemClassName = "",
	categories = DEMO_CATS,
	itemPerRow = 5,
	categoryCardType = "card3",
	sliderStyle = "style1",
}) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [direction, setDirection] = useState(0);
	const [numberOfItems, setNumberOfitem] = useState(0);

	const windowWidth = useWindowSize().width;
	useEffect(() => {
		if (windowWidth < 320) {
			return setNumberOfitem(1);
		}
		if (windowWidth < 500) {
			return setNumberOfitem(itemPerRow - 3);
		}
		if (windowWidth < 1024) {
			return setNumberOfitem(itemPerRow - 2);
		}
		if (windowWidth < 1280) {
			return setNumberOfitem(itemPerRow - 1);
		}

		setNumberOfitem(itemPerRow);
	}, [itemPerRow, windowWidth]);

	// Add auto-sliding effect
	useEffect(() => {
		const interval = setInterval(() => {
			if (currentIndex < categories.length - numberOfItems) {
				changeItemId(currentIndex + 1);
			} else {
				changeItemId(0); // Reset to start when reaching the end
			}
		}, 3000); // Change slide every 3 seconds

		return () => clearInterval(interval); // Cleanup on unmount
	}, [currentIndex, categories.length, numberOfItems]);

	function changeItemId(newVal: number) {
		if (newVal > currentIndex) {
			setDirection(1);
		} else {
			setDirection(-1);
		}
		setCurrentIndex(newVal);
	}

	const handlers = useSwipeable({
		onSwipedLeft: () => {
			if (currentIndex < categories?.length - 1) {
				changeItemId(currentIndex + 1);
			}
		},
		onSwipedRight: () => {
			if (currentIndex > 0) {
				changeItemId(currentIndex - 1);
			}
		},
		trackMouse: true,
	});

	const renderCard = (item: TaxonomyType) => {
		switch (categoryCardType) {
			case "card3":
				return <CardCategory3 taxonomy={item} />;
			case "card4":
				return <CardCategory4 taxonomy={item} />;
			case "card5":
				return <CardCategory5 taxonomy={item} />;
			default:
				return <CardCategory3 taxonomy={item} />;
		}
	};

	if (!numberOfItems) return null;

	return (
		<div className={`nc-SectionSliderNewCategories ${className}`}>
			<Heading desc={subHeading} isCenter={sliderStyle === "style2"}>
				{heading}
			</Heading>
			<MotionConfig
				transition={{
					x: { type: "spring", stiffness: 300, damping: 30 },
					opacity: { duration: 0.2 },
				}}
			>
				<div className={`relative flow-root`} {...handlers}>
					<div className={`flow-root overflow-hidden rounded-xl`}>
						<motion.ul
							initial={false}
							className='relative -mx-2 whitespace-nowrap xl:-mx-4'
						>
							<AnimatePresence initial={false} custom={direction}>
								{categories.map((item, indx) => (
									<motion.li
										className={`relative inline-block px-2 xl:px-4 ${itemClassName}`}
										custom={direction}
										initial={{
											x: `${(currentIndex - 1) * -100}%`,
										}}
										animate={{
											x: `${currentIndex * -100}%`,
										}}
										variants={variants(200, 1)}
										key={indx}
										style={{
											width: `calc(1/${numberOfItems} * 100%)`,
										}}
									>
										{renderCard(item)}
									</motion.li>
								))}
							</AnimatePresence>
						</motion.ul>
					</div>

					{currentIndex ? (
						<PrevBtn
							style={{ transform: "translate3d(0, 0, 0)" }}
							onClick={() => changeItemId(currentIndex - 1)}
							className='absolute -left-3 top-1/3 z-[1] h-9 w-9 -translate-y-1/2 text-lg xl:-left-6 xl:h-12 xl:w-12'
						/>
					) : null}

					{categories.length > currentIndex + numberOfItems ? (
						<NextBtn
							style={{ transform: "translate3d(0, 0, 0)" }}
							onClick={() => changeItemId(currentIndex + 1)}
							className='absolute -right-3 top-1/3 z-[1] h-9 w-9 -translate-y-1/2 text-lg xl:-right-6 xl:h-12 xl:w-12'
						/>
					) : null}
				</div>
			</MotionConfig>
		</div>
	);
};

export default SectionSliderNewCategories;
