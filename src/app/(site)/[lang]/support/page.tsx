import React from "react";
import Support from "@/components/organisms/Support";
import Link from "next/link";
import { getSEOTags, renderSchemaTags } from "@/lib/seo"; // Ensure renderSchemaTags is imported
import { Metadata } from "next";

const siteName = process.env.SITE_NAME || "Nogl";
const siteUrl = process.env.SITE_URL || "https://www.nogl.ai";
const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || siteUrl;

// Define your schemaData
const schemaData = {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	mainEntity: [
		{
			"@type": "Question",
			name: "How can I contact customer support?",
			acceptedAnswer: {
				"@type": "Answer",
				text: `You can contact our customer support via email at <a href="mailto:support@nogl.tech">support@nogl.tech</a> or through our contact form on the website.`,
			},
		},
		{
			"@type": "Question",
			name: "What is the response time for support inquiries?",
			acceptedAnswer: {
				"@type": "Answer",
				text: "Our support team typically responds to inquiries within 24-48 hours on business days.",
			},
		},
		// Add more FAQs as needed
	],
	publisher: {
		"@type": "Organization",
		name: siteName,
		url: siteUrl,
		logo: {
			"@type": "ImageObject",
			url: `${imageBaseUrl}/logo.png`,
		},
	},
	url: `${siteUrl}/support`,
	dateModified: new Date().toISOString().split("T")[0],
};

export const metadata: Metadata = getSEOTags({
	title: `Support - ${siteName}`,
	description: `Get expert assistance from ${siteName}'s dedicated support team. We're here to resolve your questions and issues quickly and efficiently. Reach out today!`,
	canonicalUrlRelative: "/support",
	type: "website",
	locale: "en_US",
	siteName: siteName,
	// Note: We're not including 'script' here to avoid TypeScript errors
});

const SupportPage = () => {
	return (
		<>
			{/* Render the structured data script */}
			{renderSchemaTags(schemaData)}

			<main>
				<div className='container mx-auto px-4 py-8'>
					<Link href='/' className='mb-4 inline-block text-blue-600 underline'>
						&larr; Back to Home
					</Link>

					{/* <h1 className="text-3xl font-bold mb-6">Support</h1>
          <p className="text-sm text-gray-500 mb-4">
            Last Updated: {new Date().toLocaleDateString()}
          </p> */}

					{/* Support Content */}
					<Support />

					{/* Example FAQ Section */}
				</div>
			</main>
		</>
	);
};

export default SupportPage;
