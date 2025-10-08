import React from "react";
// import { getPostBySlug, imageBuilder } from "@/ghost/ghost-utils";
// import RenderBodyContent from "@/components/atoms/RenderBodyContent";
import Link from "next/link";
// import Image from "next/image";
// import { structuredAlgoliaHtmlData } from "@/lib/crawlIndex";
// import CopyToClipboard from "@/components/atoms/CopyToClipboard";
// import SocialShare from "@/components/atoms/SocialShare";

type Props = {
	params: Promise<{
		slug: string;
	}>;
};

// ============================================================================
// GHOST CMS TEMPORARILY DISABLED
// Uncomment when Ghost CMS is properly configured
// ============================================================================

// Disable static generation for this page during build if Ghost is not configured
export const dynamicParams = true;
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
	// const { slug } = await params;
	// const post = await getPostBySlug(slug);
	const siteURL = process.env.SITE_URL;
	const authorName = process.env.AUTHOR_NAME;

	return {
		title: "Blog Post | NOGL",
		description: "Read our latest blog posts and insights",
	};

	/* GHOST CMS VERSION - COMMENTED OUT
	if (post) {
		return {
			title: `${
				post.title || "Single Post Page"
			} | ${authorName} - Next.js SaaS Starter Kit`,
			description: `${post.excerpt?.slice(0, 136) || post.title?.slice(0, 136) || "Read more about this post"}...`,
			author: authorName,
			alternates: {
				canonical: `${siteURL}/blog/${post?.slug}`,
				languages: {
					"en-US": "/en-US",
					"de-DE": "/de-DE",
				},
			},

			robots: {
				index: true,
				follow: true,
				nocache: true,
				googleBot: {
					index: true,
					follow: false,
					"max-video-preview": -1,
					"max-image-preview": "large",
					"max-snippet": -1,
				},
			},

			openGraph: {
				title: `${post.title} | ${authorName}`,
				description: post.excerpt || post.title || "Read more about this post",
				url: `${siteURL}/blog/${post?.slug}`,
				siteName: authorName,
				images: [
					{
						url: imageBuilder(post.feature_image || "").url(),
						width: 1800,
						height: 1600,
						alt: post.title,
					},
				],
				locale: "en_US",
				type: "article",
			},

			twitter: {
				card: "summary_large_image",
				title: `${post.title} | ${authorName}`,
				description: `${post.excerpt?.slice(0, 136) || post.title?.slice(0, 136) || "Read more about this post"}...`,
				creator: `@${authorName}`,
				site: `@${authorName}`,
				images: [imageBuilder(post?.feature_image || "").url()],
				url: `${siteURL}/blog/${post?.slug}`,
			},
		};
	} else {
		return {
			title: "Not Found",
			description: "No blog article has been found",
		};
	}
	*/
}

const SingleBlog = async ({ params }: Props) => {
	const { slug } = await params;
	
	// ============================================================================
	// GHOST CMS DISABLED - Showing placeholder page
	// To re-enable Ghost CMS:
	// 1. Uncomment the imports at the top of this file
	// 2. Replace this function body with the commented code in git history
	// 3. Ensure Ghost environment variables are configured
	// ============================================================================
	
	return (
		<main className='py-35'>
			<div className='mx-auto w-full max-w-[1170px] px-4 text-center'>
				<h1 className='text-3xl font-bold mb-4'>Blog Feature Coming Soon</h1>
				<p className='mt-4 text-gray-600'>Ghost CMS integration is currently being configured.</p>
				<p className='mt-2'>Slug: <code className='bg-gray-100 px-2 py-1 rounded'>{slug}</code></p>
				<Link href='/blog' className='mt-6 inline-block text-blue-600 hover:underline'>
					← Back to Blog
				</Link>
			</div>
		</main>
	);
};

export default SingleBlog;
