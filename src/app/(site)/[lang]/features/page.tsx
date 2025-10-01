import { Metadata } from "next";
import { getDictionary } from "@/libs/dictionary";
import { Locale } from "@/i18n";
import Features from "@/components/Home/Features";

export const metadata: Metadata = {
	title: "Features - AI Fashion Intelligence Platform",
	description: "Discover our AI-powered features for fashion trend forecasting and demand prediction",
	openGraph: {
		type: "website",
		title: "Features - AI Fashion Intelligence Platform",
		description: "Discover our AI-powered features for fashion trend forecasting and demand prediction",
	},
};

export default async function FeaturesPage({
	params,
}: {
	params: Promise<{ lang: Locale }>;
}) {
	const { lang } = await params;
	const dict = await getDictionary(lang);

	return (
		<main>
			<Features dictionary={dict} />
		</main>
	);
}