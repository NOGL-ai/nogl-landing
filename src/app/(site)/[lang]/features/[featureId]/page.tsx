import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n";
import featuresData from "@/components/Home/Features/featuresData";
import Image from "next/image";
import { notFound } from "next/navigation";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: Locale; featureId: string }>;
}): Promise<Metadata> {
	const { featureId } = await params;
	const feature = featuresData.find((f) => f.id.toString() === featureId);

	if (!feature) {
		return {
			title: "Feature Not Found",
			description: "The requested feature could not be found",
		};
	}

	return {
		title: feature.title,
		description: feature.description,
		openGraph: {
			title: feature.title,
			description: feature.description,
		},
	};
}

export default async function FeatureDetailPage({
	params,
}: {
	params: Promise<{ lang: Locale; featureId: string }>;
}) {
	const { lang, featureId } = await params;
	// const dict = await getDictionary(lang);
	const feature = featuresData.find((f) => f.id.toString() === featureId);

	if (!feature) {
		notFound();
	}

	return (
		<div className='container mx-auto max-w-4xl px-4 py-8'>
			{/* Feature Header */}
			<div className='mb-12 text-center'>
				<div className='mb-6'>
					<Image
						src={feature.icon}
						alt={feature.title}
						width={80}
						height={80}
						className='mx-auto'
					/>
				</div>
				<h1 className='mb-4 text-4xl font-bold text-gray-900 dark:text-white'>
					{feature.title}
				</h1>
				<p className='mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300'>
					{feature.description}
				</p>
			</div>

			{/* Feature Content */}
			<div className='prose prose-lg dark:prose-invert max-w-none'>
				<div className='mb-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800'>
					<h2 className='mb-4 text-2xl font-semibold text-gray-900 dark:text-white'>
						How It Works
					</h2>
					<p className='mb-4 text-gray-600 dark:text-gray-300'>
						This feature leverages advanced AI technology to provide you with
						comprehensive insights and tools. Our platform processes vast
						amounts of data to deliver accurate, real-time information that
						helps you make informed decisions.
					</p>
					<p className='text-gray-600 dark:text-gray-300'>
						The system continuously learns and adapts to provide increasingly
						relevant and personalized experiences for each user, ensuring you
						get the most value from every interaction.
					</p>
				</div>

				<div className='mb-8 grid gap-8 md:grid-cols-2'>
					<div className='rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 p-6 dark:from-gray-800 dark:to-gray-700'>
						<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
							Key Benefits
						</h3>
						<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
							<li className='flex items-start'>
								<span className='mr-2 text-green-500'>✓</span>
								Improved efficiency and productivity
							</li>
							<li className='flex items-start'>
								<span className='mr-2 text-green-500'>✓</span>
								Real-time data processing
							</li>
							<li className='flex items-start'>
								<span className='mr-2 text-green-500'>✓</span>
								Personalized user experience
							</li>
							<li className='flex items-start'>
								<span className='mr-2 text-green-500'>✓</span>
								Seamless integration with existing workflows
							</li>
						</ul>
					</div>

					<div className='rounded-lg bg-gradient-to-br from-purple-50 to-pink-100 p-6 dark:from-gray-800 dark:to-gray-700'>
						<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
							Use Cases
						</h3>
						<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
							<li className='flex items-start'>
								<span className='mr-2 text-blue-500'>•</span>
								Business intelligence and analytics
							</li>
							<li className='flex items-start'>
								<span className='mr-2 text-blue-500'>•</span>
								Customer behavior analysis
							</li>
							<li className='flex items-start'>
								<span className='mr-2 text-blue-500'>•</span>
								Market trend identification
							</li>
							<li className='flex items-start'>
								<span className='mr-2 text-blue-500'>•</span>
								Performance optimization
							</li>
						</ul>
					</div>
				</div>

				<div className='rounded-lg bg-gray-50 p-8 dark:bg-gray-800'>
					<h3 className='mb-4 text-2xl font-semibold text-gray-900 dark:text-white'>
						Getting Started
					</h3>
					<p className='mb-6 text-gray-600 dark:text-gray-300'>
						Ready to experience the power of this feature? Here's how you can
						get started:
					</p>
					<div className='space-y-4'>
						<div className='flex items-start'>
							<div className='mr-4 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white'>
								1
							</div>
							<div>
								<h4 className='mb-1 font-semibold text-gray-900 dark:text-white'>
									Sign Up or Log In
								</h4>
								<p className='text-gray-600 dark:text-gray-300'>
									Create your account or sign in to access the platform
								</p>
							</div>
						</div>
						<div className='flex items-start'>
							<div className='mr-4 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white'>
								2
							</div>
							<div>
								<h4 className='mb-1 font-semibold text-gray-900 dark:text-white'>
									Configure Your Settings
								</h4>
								<p className='text-gray-600 dark:text-gray-300'>
									Set up your preferences and customize the feature to your
									needs
								</p>
							</div>
						</div>
						<div className='flex items-start'>
							<div className='mr-4 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white'>
								3
							</div>
							<div>
								<h4 className='mb-1 font-semibold text-gray-900 dark:text-white'>
									Start Using the Feature
								</h4>
								<p className='text-gray-600 dark:text-gray-300'>
									Begin exploring and leveraging the full potential of this
									powerful tool
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Back to Features Link */}
			<div className='mt-12 text-center'>
				<a
					href='/features'
					className='inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-blue-700'
				>
					← Back to All Features
				</a>
			</div>
		</div>
	);
}
