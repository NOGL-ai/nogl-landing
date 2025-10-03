"use client";
import Pricing from "@/stripe/StripeBilling";
// import Pricing from "@/paddle/PaddleBilling";
// import Pricing from "@/lemonSqueezy/LsBilling";

interface HomePricingProps {
	dictionary: {
		pricing: {
			title: string;
			subtitle: string;
			description: string;
			plans: {
				name: string;
				price: string;
				description: string;
				features: string[];
				buttonText: string;
				popular?: boolean;
			}[];
		};
	};
}

const HomePricing = ({ dictionary }: HomePricingProps) => {
	if (!dictionary?.pricing) {
		return null;
	}

	return (
		<div id='pricing'>
			<Pricing isBilling={false} />
		</div>
	);
};

export default HomePricing;
