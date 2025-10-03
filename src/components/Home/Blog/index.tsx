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
		<section className='overflow-hidden py-17.5 lg:py-22.5 xl:py-27.5 backdrop-blur-sm' id='blog'>
			{/* <!-- section title --> */}
			<SectionHeader
				title={dictionary.blog.title}
				description={dictionary.blog.description}
			/>

			<div className='mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0'>
				{posts?.length > 0 ? (
					<div className='grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-3'>
						{posts.slice(0, 3).map((item: any, key: number) => (
							<div key={key} className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-lg">
								<BlogItem blog={item} />
							</div>
						))}
					</div>
				) : (
					<p>{dictionary.blog.noPostsText}</p>
				)}
			</div>

			{posts?.length > 3 && (
				<div className='text-center mt-10'>
					<a
						href='/blog'
						className='inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 font-satoshi text-base font-medium text-white duration-300 hover:bg-primary-dark'
					>
						{dictionary.blog.viewAllText}
					</a>
				</div>
			)}
		</section>
	);
};

export default Blog;
