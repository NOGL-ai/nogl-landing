import { Metadata } from "next";
import ManageRepricingRule from "@/components/organisms/ManageRepricingRule";

export const metadata: Metadata = {
	title: "Manage Repricing Rule | Nogl",
	description: "Create or edit your repricing rules with advanced pricing configuration",
	keywords: [
		"repricing",
		"pricing rules",
		"dynamic pricing",
		"competitor pricing",
		"automated pricing",
	],
	openGraph: {
		title: "Manage Repricing Rule | Nogl",
		description: "Create or edit your repricing rules with advanced pricing configuration",
		type: "website",
	},
};

export default function ManageRepricingRulePage() {
	return <ManageRepricingRule />;
}

