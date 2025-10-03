import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Auto Repricing History | Nogl",
	description:
		"View the history of your automated repricing actions and their results",
	keywords: [
		"auto repricing",
		"pricing history",
		"repricing log",
		"pricing analytics",
	],
	openGraph: {
		title: "Auto Repricing History | Nogl",
		description:
			"View the history of your automated repricing actions and their results",
		type: "website",
	},
};

export default function AutoRepricingHistoryPage() {
	return (
		<div className='bg-gray-3 min-h-screen p-6'>
			<div className='mx-auto max-w-7xl'>
				<div className='mb-6 rounded-xl border border-[#F2F2F2] bg-white p-6'>
					<h1 className='text-text-main-900 mb-1 text-2xl font-bold leading-8 tracking-[-0.336px]'>
						Auto Repricing History
					</h1>
					<p className='text-text-sub-500 text-sm leading-5 tracking-[-0.07px]'>
						View the history of your automated repricing actions and track their
						performance impact.
					</p>
				</div>

				<div className='rounded-xl border border-[#DEE0E3] bg-white p-8 text-center'>
					<div className='mx-auto max-w-md'>
						<div className='mb-4'>
							<svg
								className='mx-auto h-16 w-16 text-gray-400'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={1.5}
									d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
								/>
							</svg>
						</div>
						<h3 className='mb-2 text-lg font-semibold text-gray-900'>
							Auto Repricing History
						</h3>
						<p className='mb-4 text-gray-600'>
							This feature is coming soon. You'll be able to view detailed
							history and analytics of your automated repricing actions.
						</p>
						<button className='bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2'>
							Learn More
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
