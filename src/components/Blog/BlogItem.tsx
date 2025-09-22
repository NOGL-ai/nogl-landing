import React from "react";
import { Blog } from "@/types/blog";
import Image from "next/image";
import { imageBuilder } from "@/sanity/sanity-utils";
import Link from "next/link";
import { Route } from 'next';

const BlogItem = ({ blog }: { blog: Blog }) => {
	if (!blog?.slug?.current) {
		return null; // Or a fallback UI
	}

	const blogUrl = `/blog/${blog.slug.current}`;
	const authorUrl = blog?.author?.slug?.current
		? `/blog/author/${blog.author.slug.current}`
		: '#';
	const imageUrl = blog?.mainImage
		? imageBuilder(blog.mainImage).url() || '/placeholder-image.jpg'
		: '/placeholder-image.jpg'; // Ensure imageUrl is always a string

	return (
		<article className='group overflow-hidden rounded-[15px] bg-white shadow-dropdown dark:bg-gray-dark'>
			<Link
				href={blogUrl as Route}
				className='block overflow-hidden'
			>
				<Image
					src={imageUrl}
					alt={blog?.title || 'Blog post'}
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
							className='flex items-center gap-2 font-satoshi text-sm font-medium -tracking-[0.1px] dark:text-gray-5'
					>
						{blog?.author?.name || 'Anonymous'}
					</Link>
				</div>

				<h3 className='mb-4'>
					<Link
						href={blogUrl as Route}
						className='text-xl font-bold text-gray-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-600'
					>
						{blog?.title || 'Untitled Post'}
					</Link>
				</h3>
			</div>
		</article>
	);
};

export default BlogItem;
