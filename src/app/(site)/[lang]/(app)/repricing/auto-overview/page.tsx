import { Metadata } from "next";
import RepricingPreview from "@/components/molecules/RepricingPreview";

export const metadata: Metadata = {
	title: "Auto Repricing Overview | Nogl",
	description:
		"Preview how your catalog prices would be repriced according to your repricing rules",
	keywords: [
		"auto repricing",
		"pricing preview",
		"repricing rules",
		"dynamic pricing",
	],
	openGraph: {
		title: "Auto Repricing Overview | Nogl",
		description:
			"Preview how your catalog prices would be repriced according to your repricing rules",
		type: "website",
	},
};

export default function AutoRepricingOverviewPage() {
	return (
		<div className='min-h-screen'>
			<RepricingPreview />
		</div>
	);
}
