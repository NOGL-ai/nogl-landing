import Home from "@/components/templates/HomePage";
import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n";

// Updated metadata to align with your platform's unique features and target audience
export const metadata: Metadata = {
	title: `Nogl- AI-Powered Fashion Trend Forecasting & Demand Prediction`,
	description: `Forecast fashion trends and predict demand with AI. Leverage demand sensing, consumer signals, and visual intelligence to reduce markdowns, optimize assortments, and improve full-price sell-through.`,
	openGraph: {
		type: "website",
		title: `Nogl- AI-Powered Fashion Trend Forecasting & Demand Prediction`,
		description: `AI fashion intelligence for demand prediction, localized assortments, and winning product selection.`,
		images: "https://your-image-url.com/platform-og-image.jpg", // Update with an image that represents your platform
	},
	twitter: {
		card: "summary_large_image",
		title: `Nogl- AI-Powered Fashion Trend Forecasting & Demand Prediction`,
		description: `Demand sensing and trend forecasting to increase velocity, turns, and sell-through.`,
		images: "https://your-image-url.com/platform-twitter-image.jpg", // Update with an image that represents your platform
	},
};

export default async function HomePage({
	params,
}: {
	params: Promise<{ lang: Locale }>;
}) {
	const { lang } = await params;
	const dict = await getDictionary(lang);

	return (
		<main>
			<Home dictionary={dict} />
		</main>
	);
}
