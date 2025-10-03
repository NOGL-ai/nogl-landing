import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Reports | Nogl",
	description:
		"Comprehensive business reports and analytics for data-driven decisions",
	keywords: [
		"reports",
		"analytics",
		"business intelligence",
		"data visualization",
	],
	openGraph: {
		title: "Reports | Nogl",
		description:
			"Comprehensive business reports and analytics for data-driven decisions",
		type: "website",
	},
};

export default function ReportsPage() {
	return (
		<div className='mx-auto w-full max-w-7xl space-y-6 p-4 transition-all duration-300 lg:p-6'>
			{/* Page Header */}
			<div className='rounded-xl border border-[#F2F2F2] bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md lg:p-8 dark:border-gray-700 dark:bg-gray-800'>
				<div className='text-center'>
					<h1 className='mb-4 text-3xl font-bold text-gray-900 lg:text-4xl dark:text-white'>
						Reports
					</h1>
					<p className='text-lg text-gray-600 dark:text-gray-300'>
						Generate detailed reports and analytics to drive informed business
						decisions.
					</p>
				</div>
			</div>

			{/* Content will go here */}
			<div className='rounded-xl border border-[#F2F2F2] bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md lg:p-8 dark:border-gray-700 dark:bg-gray-800'>
				<p className='text-center text-gray-600 dark:text-gray-300'>
					Reports functionality coming soon...
				</p>
			</div>
		</div>
	);
}
