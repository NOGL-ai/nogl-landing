import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n";
import { FeatureSection as Features } from "@/components/organisms/Features";

export const metadata: Metadata = {
	title: "Features - AI Fashion Intelligence Platform",
	description:
		"Discover our AI-powered features for fashion trend forecasting and demand prediction",
	openGraph: {
		type: "website",
		title: "Features - AI Fashion Intelligence Platform",
		description:
			"Discover our AI-powered features for fashion trend forecasting and demand prediction",
	},
};

export default async function FeaturesPage({
	params,
}: {
	params: Promise<{ lang: Locale }>;
}) {
	const { lang } = await params;
	// const dict = await getDictionary(lang);

	return (
		<main>
			<Features />
		</main>
	);
}
