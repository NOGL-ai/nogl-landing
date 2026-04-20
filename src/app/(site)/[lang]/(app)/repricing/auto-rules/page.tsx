import { Metadata } from "next";
import RepricingRules from "@/components/organisms/RepricingRules";
import { listRules } from "@/actions/repricing/rules";

export const metadata: Metadata = {
	title: "Auto Repricing Rules | Nogl",
	description: "Configure and manage your automated repricing rules",
	keywords: [
		"auto repricing",
		"pricing rules",
		"automated pricing",
		"dynamic pricing",
	],
	openGraph: {
		title: "Auto Repricing Rules | Nogl",
		description: "Configure and manage your automated repricing rules",
		type: "website",
	},
};

export default async function AutoRepricingRulesPage() {
	// Server-side fetch — falls back to empty list if not authenticated yet
	const rules = await listRules().catch(() => []);
	return <RepricingRules initialRules={rules} />;
}
