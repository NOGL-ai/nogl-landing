import { Metadata } from "next";
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

export const metadata: Metadata = {
	title: "My Account | Nogl",
	description:
		"Manage your account information, billing, and subscription details",
	keywords: [
		"account",
		"profile",
		"billing",
		"subscription",
		"user management",
	],
	openGraph: {
		title: "My Account | Nogl",
		description:
			"Manage your account information, billing, and subscription details",
		type: "website",
	},
};

export default function AccountPage() {
	return (
		<GlassParticlePage>
			<div className='container mx-auto px-4 py-24'>
				<div className='mx-auto max-w-4xl text-center'>
					<div className='mb-16'>
						<h1 className='mb-6 text-4xl font-bold text-gray-900 md:text-6xl dark:text-white'>
							My Account
						</h1>
						<p className='mb-8 text-lg text-gray-600 dark:text-gray-300'>
							Manage your personal information, billing details, and account
							preferences.
						</p>
					</div>
				</div>
			</div>
		</GlassParticlePage>
	);
}
