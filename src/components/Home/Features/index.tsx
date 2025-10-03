import React from "react";
import featuresData from "./featuresData";
import FeatureItem from "./FeatureItem";
import SectionHeader from "@/components/Common/SectionHeader";
import Image from "next/image";

const Features = () => {
	return (
		<section
			id='features'
			className='z-1 bg-gray-1 py-17.5 lg:py-22.5 xl:py-27.5 relative overflow-hidden dark:bg-black dark:text-white'
		>
			{/* <!-- section title --> */}
			<SectionHeader
				// Updated title to reflect fashion forecasting positioning
				title={"AI Fashion Intelligence for Trend & Demand"}
				// Description emphasizes demand sensing and assortment optimization
				description='Discover demand-sensed trends, predict new-product demand, and optimize assortments.'
			/>

			<div className='z-1 relative mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0'>
				<div className='gap-7.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
					{/* <!-- features item --> */}
					{featuresData?.map((item, key) => (
						<FeatureItem data={item} key={key} />
					))}
				</div>

				{/* <!-- Features Bg Shapes --> */}
				<div className='hidden sm:block'>
					<div className='-z-1 absolute left-0 top-1/2 -translate-y-1/2'>
						<Image
							src='/images/features/features-shape-01.svg'
							alt='shape'
							width={600}
							height={600}
						/>
					</div>
					<div className='-z-1 absolute right-0 top-1/2 -translate-y-1/2'>
						<Image
							src='/images/features/features-shape-02.svg'
							alt='shape'
							width={800}
							height={800}
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Features;
