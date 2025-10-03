import { Metadata } from "next";
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

export const metadata: Metadata = {
	title: "Profile | Nogl",
	description: "View and manage your personal profile information",
	keywords: [
		"profile",
		"user profile",
		"personal information",
		"account details",
	],
	openGraph: {
		title: "Profile | Nogl",
		description: "View and manage your personal profile information",
		type: "website",
	},
};

export default function ProfilePage() {
	return (
		<GlassParticlePage>
			<div className='container mx-auto px-4 py-24'>
				<div className='mx-auto max-w-4xl text-center'>
					<div className='mb-16'>
						<h1 className='mb-6 text-4xl font-bold text-gray-900 md:text-6xl dark:text-white'>
							Profile
						</h1>
						<p className='mb-8 text-lg text-gray-600 dark:text-gray-300'>
							View and update your personal profile information and preferences.
						</p>
					</div>
				</div>
			</div>
		</GlassParticlePage>
	);
}
