import React from "react";
import featuresData from "./featuresData";
import FeatureItem from "./FeatureItem";
import SectionHeader from "@/components/Common/SectionHeader";
import Image from "next/image";

const Features = () => {
	return (
		<section
			id='features'
			className='relative z-1 overflow-hidden bg-gray-1 py-17.5 dark:bg-black dark:text-white lg:py-22.5 xl:py-27.5'
		>
			{/* <!-- section title --> */}
			<SectionHeader
				// Updated title to reflect fashion forecasting positioning
				title={"AI Fashion Intelligence for Trend & Demand"}
				// Description emphasizes demand sensing and assortment optimization
				description='Discover demand-sensed trends, predict new-product demand, and optimize assortments.'
			/>

			<div className='relative z-1 mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0'>
				<div className='grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-3'>
					{/* <!-- features item --> */}
					{featuresData?.map((item, key) => (
						<FeatureItem data={item} key={key} />
					))}
				</div>

				{/* <!-- Features Bg Shapes --> */}
				<div className='hidden sm:block'>
					<div className='absolute left-0 top-1/2 -z-1 -translate-y-1/2'>
						<Image
							src='/images/features/features-shape-01.svg'
							alt='shape'
							width={600}
							height={600}
						/>
					</div>
					<div className='absolute right-0 top-1/2 -z-1 -translate-y-1/2'>
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
