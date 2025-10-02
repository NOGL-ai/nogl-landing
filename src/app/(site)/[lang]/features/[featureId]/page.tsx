import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n";
import featuresData from "@/components/Home/FeaturesWithImage/featuresData";
import Image from "next/image";
import { notFound } from "next/navigation";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: Locale; featureId: string }>;
}): Promise<Metadata> {
	const { featureId } = await params;
	const feature = featuresData.find(f => f.id.toString() === featureId);
	
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
	const dict = await getDictionary(lang);
	const feature = featuresData.find(f => f.id.toString() === featureId);

	if (!feature) {
		notFound();
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			{/* Feature Header */}
			<div className="text-center mb-12">
				<div className="mb-6">
					<Image
						src={feature.image}
						alt={feature.title}
						width={80}
						height={80}
						className="mx-auto"
					/>
				</div>
				<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
					{feature.title}
				</h1>
				<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
					{feature.description}
				</p>
			</div>

			{/* Feature Content */}
			<div className="prose prose-lg max-w-none dark:prose-invert">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
					<h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
						How It Works
					</h2>
					<p className="text-gray-600 dark:text-gray-300 mb-4">
						This feature leverages advanced AI technology to provide you with comprehensive insights and tools. 
						Our platform processes vast amounts of data to deliver accurate, real-time information that helps 
						you make informed decisions.
					</p>
					<p className="text-gray-600 dark:text-gray-300">
						The system continuously learns and adapts to provide increasingly relevant and personalized 
						experiences for each user, ensuring you get the most value from every interaction.
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-8 mb-8">
					<div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
						<h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
							Key Benefits
						</h3>
						<ul className="space-y-2 text-gray-600 dark:text-gray-300">
							<li className="flex items-start">
								<span className="text-green-500 mr-2">✓</span>
								Improved efficiency and productivity
							</li>
							<li className="flex items-start">
								<span className="text-green-500 mr-2">✓</span>
								Real-time data processing
							</li>
							<li className="flex items-start">
								<span className="text-green-500 mr-2">✓</span>
								Personalized user experience
							</li>
							<li className="flex items-start">
								<span className="text-green-500 mr-2">✓</span>
								Seamless integration with existing workflows
							</li>
						</ul>
					</div>

					<div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
						<h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
							Use Cases
						</h3>
						<ul className="space-y-2 text-gray-600 dark:text-gray-300">
							<li className="flex items-start">
								<span className="text-blue-500 mr-2">•</span>
								Business intelligence and analytics
							</li>
							<li className="flex items-start">
								<span className="text-blue-500 mr-2">•</span>
								Customer behavior analysis
							</li>
							<li className="flex items-start">
								<span className="text-blue-500 mr-2">•</span>
								Market trend identification
							</li>
							<li className="flex items-start">
								<span className="text-blue-500 mr-2">•</span>
								Performance optimization
							</li>
						</ul>
					</div>
				</div>

				<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
					<h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
						Getting Started
					</h3>
					<p className="text-gray-600 dark:text-gray-300 mb-6">
						Ready to experience the power of this feature? Here's how you can get started:
					</p>
					<div className="space-y-4">
						<div className="flex items-start">
							<div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-4 mt-1">
								1
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 dark:text-white mb-1">
									Sign Up or Log In
								</h4>
								<p className="text-gray-600 dark:text-gray-300">
									Create your account or sign in to access the platform
								</p>
							</div>
						</div>
						<div className="flex items-start">
							<div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-4 mt-1">
								2
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 dark:text-white mb-1">
									Configure Your Settings
								</h4>
								<p className="text-gray-600 dark:text-gray-300">
									Set up your preferences and customize the feature to your needs
								</p>
							</div>
						</div>
						<div className="flex items-start">
							<div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-4 mt-1">
								3
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 dark:text-white mb-1">
									Start Using the Feature
								</h4>
								<p className="text-gray-600 dark:text-gray-300">
									Begin exploring and leveraging the full potential of this powerful tool
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Back to Features Link */}
			<div className="text-center mt-12">
				<a
					href="/features"
					className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
				>
					← Back to All Features
				</a>
			</div>
		</div>
	);
}