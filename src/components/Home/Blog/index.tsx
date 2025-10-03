import React from "react";
import BlogItem from "@/components/Blog/BlogItem";
import SectionHeader from "@/components/Common/SectionHeader";
import { getPosts } from "@/ghost/ghost-utils";

interface BlogProps {
	dictionary: {
		blog: {
			title: string;
			description: string;
			viewAllText: string;
			noPostsText: string;
		};
	};
}

const Blog = async ({ dictionary }: BlogProps) => {
	const posts = await getPosts();

	return (
		<section
			className='py-17.5 lg:py-22.5 xl:py-27.5 overflow-hidden backdrop-blur-sm'
			id='blog'
		>
			{/* <!-- section title --> */}
			<SectionHeader
				title={dictionary.blog.title}
				description={dictionary.blog.description}
			/>

			<div className='mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0'>
				{posts?.length > 0 ? (
					<div className='gap-7.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
						{posts.slice(0, 3).map((item: unknown, key: number) => (
							<div
								key={key}
								className='rounded-lg border border-gray-800 bg-white/5 backdrop-blur-sm'
							>
								<BlogItem blog={item} />
							</div>
						))}
					</div>
				) : (
					<p>{dictionary.blog.noPostsText}</p>
				)}
			</div>

			{posts?.length > 3 && (
				<div className='mt-10 text-center'>
					<a
						href='/blog'
						className='bg-primary font-satoshi hover:bg-primary-dark inline-flex items-center justify-center rounded-full px-7 py-3 text-base font-medium text-white duration-300'
					>
						{dictionary.blog.viewAllText}
					</a>
				</div>
			)}
		</section>
	);
};

export default Blog;
