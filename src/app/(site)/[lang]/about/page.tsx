import React, { FC } from "react";
import SectionHero from "./SectionHero";
import SectionFounder from "./SectionFounder";
import SectionStatistic from "./SectionStatistic";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import BgGlassmorphism from "@/components/BgGlassmorphism";

import rightImg from "@/images/about-hero-right.png";

export interface PageAboutProps {}

const PageAbout: FC<PageAboutProps> = () => {
	return (
		<div className='nc-PageAbout relative overflow-hidden'>
			{/* Background Effects */}
			<BgGlassmorphism />

			{/* Main Content */}
			<div className='container mx-auto space-y-16 py-16 lg:space-y-28 lg:py-28'>
				{/* Hero Section */}
				<SectionHero
					rightImg={rightImg}
					heading='About Our Platform'
					btnText='Join Our Mission'
					subHeading={`We help teams optimize their operations and improve efficiency through our comprehensive platform solutions.`}
				/>

				{/* Founder Section */}
				<SectionFounder />

				{/* Statistics Section */}
				<div className='relative py-16'>
					<SectionStatistic />
				</div>

				{/* Subscription Section */}
				<SectionSubscribe2 />
			</div>
		</div>
	);
};

export default PageAbout;
