import React from "react";
import { Blog } from "@/types/blog";
import Image from "next/image";
// import { imageBuilder } from "@/ghost/ghost-utils";
import Link from "next/link";
import { Route } from "next";

const BlogItem = ({ blog }: { blog: Blog }) => {
	if (!blog?.slug) {
		return null; // Or a fallback UI
	}

	const blogUrl = `/blog/${blog.slug}`;
	const authorUrl = blog?.primary_author?.slug
		? `/blog/author/${blog.primary_author.slug}`
		: "#";
	const imageUrl = blog?.feature_image || "/placeholder-image.jpg";

	return (
		<article className='shadow-dropdown dark:bg-gray-dark group overflow-hidden rounded-[15px] bg-white'>
			<Link href={blogUrl as Route} className='block overflow-hidden'>
				<Image
					src={imageUrl}
					alt={blog?.title || "Blog post"}
					className='w-full duration-300 ease-in group-hover:rotate-6 group-hover:scale-125'
					width={500}
					height={500}
					priority={false}
					quality={75}
				/>
			</Link>

			<div className='px-6 py-7'>
				<div className='mb-3 flex flex-wrap items-center gap-6'>
					<Link
						href={authorUrl as Route}
						className='font-satoshi flex items-center gap-2 text-sm font-medium -tracking-[0.1px]'
					>
						{blog?.primary_author?.name || "Anonymous"}
					</Link>
				</div>

				<h3 className='mb-4'>
					<Link
						href={blogUrl as Route}
						className='hover:text-primary-600 dark:hover:text-primary-600 text-xl font-bold text-gray-900 dark:text-white'
					>
						{blog?.title || "Untitled Post"}
					</Link>
				</h3>
			</div>
		</article>
	);
};

export default BlogItem;
