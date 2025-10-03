import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Settings | Nogl",
	description: "Configure your application preferences and account settings",
	keywords: ["settings", "preferences", "configuration", "account"],
	openGraph: {
		title: "Settings | Nogl",
		description: "Configure your application preferences and account settings",
		type: "website",
	},
};

export default function SettingsPage() {
	return (
		<div className='mx-auto w-full max-w-7xl space-y-6 p-4 transition-all duration-300 lg:p-6'>
			{/* Page Header */}
			<div className='rounded-xl border border-[#F2F2F2] bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md lg:p-8 dark:border-gray-700 dark:bg-gray-800'>
				<div className='text-center'>
					<h1 className='mb-4 text-3xl font-bold text-gray-900 lg:text-4xl dark:text-white'>
						Settings
					</h1>
					<p className='text-lg text-gray-600 dark:text-gray-300'>
						Customize your experience and manage your application preferences.
					</p>
				</div>
			</div>

			{/* Content will go here */}
			<div className='rounded-xl border border-[#F2F2F2] bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md lg:p-8 dark:border-gray-700 dark:bg-gray-800'>
				<p className='text-center text-gray-600 dark:text-gray-300'>
					Settings functionality coming soon...
				</p>
			</div>
		</div>
	);
}
