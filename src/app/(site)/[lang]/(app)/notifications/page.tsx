import { Metadata } from "next";
import GlassParticlePage from "@/components/Layouts/GlassParticlePage";

export const metadata: Metadata = {
	title: "Notifications | Nogl",
	description:
		"Manage your notifications and stay updated with the latest alerts",
	keywords: ["notifications", "alerts", "updates", "messages", "communication"],
	openGraph: {
		title: "Notifications | Nogl",
		description:
			"Manage your notifications and stay updated with the latest alerts",
		type: "website",
	},
};

export default function NotificationsPage() {
	return (
		<GlassParticlePage>
			<div className='container mx-auto px-4 py-24'>
				<div className='mx-auto max-w-4xl text-center'>
					<div className='mb-16'>
						<h1 className='mb-6 text-4xl font-bold text-gray-900 md:text-6xl dark:text-white'>
							Notifications
						</h1>
						<p className='mb-8 text-lg text-gray-600 dark:text-gray-300'>
							Stay informed with personalized notifications and manage your
							alert preferences.
						</p>
					</div>
				</div>
			</div>
		</GlassParticlePage>
	);
}
