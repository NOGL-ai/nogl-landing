import Home from "@/components/Home";
import { Metadata } from "next";
import { getDictionary } from "@/libs/dictionary";
import { Locale } from "@/i18n";

// Updated metadata to align with your platform's unique features and target audience
export const metadata: Metadata = {
	title: `Nogl - AI-Powered Expert Sessions Platform`,
	description: `Join expert-led sessions, book meetings, and leverage AI-driven tools like transcription and summaries. Nogl provides a seamless way to connect with industry leaders, powered by cutting-edge AI technology.`,
	openGraph: {
		type: "website",
		title: `Nogl - AI-Powered Expert Sessions Platform`,
		description: `Explore expert sessions and meetings with integrated AI tools for transcription, summaries, and more. Nogl makes it easy to learn, connect, and grow with the help of industry experts.`,
		images:
			"https://your-image-url.com/platform-og-image.jpg", // Update with an image that represents your platform
	},
	twitter: {
		card: "summary_large_image",
		title: `Nogl - AI-Powered Expert Sessions Platform`,
		description: `Book expert sessions and meetings, and enhance your experience with AI-powered transcription, summaries, and more. Nogl connects you with the knowledge you need.`,
		images:
			"https://your-image-url.com/platform-twitter-image.jpg", // Update with an image that represents your platform
	},
};

export default async function HomePage({
	params: { lang },
}: {
	params: { lang: Locale };
}) {
	const dict = await getDictionary(lang);

	return (
		<main>
			<Home dictionary={dict} />
		</main>
	);
}
