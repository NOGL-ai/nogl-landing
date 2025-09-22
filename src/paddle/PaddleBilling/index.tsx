"use client";
import { pricingData } from "@/pricing/pricingData";
import PriceItem from "./PriceItem";
import { PaddleLoader } from "@/paddle/paddleLoader";
import CancelSubscription from "./CancelSubscription";
import SectionHeader from "@/components/Common/SectionHeader";

const Pricing = ({ isBilling }: { isBilling?: boolean }) => {
	return (
		<>
			<PaddleLoader />
			<section
				id='pricing'
				className='overflow-hidden rounded-10 bg-white py-15 dark:bg-[#131a2b] md:px-15'
			>
				{!isBilling && (
					<SectionHeader
						title={"Simple Affordable Pricing"}
						description='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent condimentum dictum euismod malesuada lacus, non consequat quam.'
					/>
				)}

				<div className='mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0'>
					<div className='grid grid-cols-1 gap-7.5 md:grid-cols-2 xl:grid-cols-3'>
						{pricingData &&
							pricingData.map((price, key) => (
								<PriceItem
									plan={{ ...price }}
									key={key}
									isBilling={isBilling}
								/>
							))}
					</div>
				</div>
			</section>

			{isBilling && <CancelSubscription />}
		</>
	);
};

export default Pricing;
