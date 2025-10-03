import { Metadata } from "next";
import DatafeedSettings from "@/components/ProductFeed/DatafeedSettings";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n";

export const metadata: Metadata = {
	title: "Product Feed | Nogl",
	description: "Manage and optimize your product feeds for better market reach",
	keywords: [
		"product feed",
		"feed management",
		"product distribution",
		"e-commerce",
	],
	openGraph: {
		title: "Product Feed | Nogl",
		description:
			"Manage and optimize your product feeds for better market reach",
		type: "website",
	},
};

export default async function ProductFeedPage({
	params,
}: {
	params: Promise<{ lang: Locale }>;
}) {
	const { lang } = await params;
	// const dict = await getDictionary(lang);

	return <DatafeedSettings />;
}
