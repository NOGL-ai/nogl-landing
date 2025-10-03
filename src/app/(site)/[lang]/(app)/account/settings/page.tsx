import { Metadata } from "next";
import GlassParticlePage from "@/components/Layouts/GlassParticlePage";

export const metadata: Metadata = {
	title: "Account Settings | Nogl",
	description:
		"Configure your account settings, security, and privacy preferences",
	keywords: [
		"account settings",
		"security",
		"privacy",
		"preferences",
		"configuration",
	],
	openGraph: {
		title: "Account Settings | Nogl",
		description:
			"Configure your account settings, security, and privacy preferences",
		type: "website",
	},
};

export default function AccountSettingsPage() {
	return (
		<GlassParticlePage>
			<div className='container mx-auto px-4 py-24'>
				<div className='mx-auto max-w-4xl text-center'>
					<div className='mb-16'>
						<h1 className='mb-6 text-4xl font-bold text-gray-900 md:text-6xl dark:text-white'>
							Account Settings
						</h1>
						<p className='mb-8 text-lg text-gray-600 dark:text-gray-300'>
							Configure your account security, privacy settings, and personal
							preferences.
						</p>
					</div>
				</div>
			</div>
		</GlassParticlePage>
	);
}
