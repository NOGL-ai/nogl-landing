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
				className='rounded-10 py-15 md:px-15 overflow-hidden bg-white dark:bg-[#131a2b]'
			>
				{!isBilling && (
					<SectionHeader
						title={"Simple Affordable Pricing"}
						description='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent condimentum dictum euismod malesuada lacus, non consequat quam.'
					/>
				)}

				<div className='mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0'>
					<div className='gap-7.5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
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
