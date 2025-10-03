import React from "react";

interface TopicTagsProps {
	topics: string[];
}

const TopicTags: React.FC<TopicTagsProps> = ({ topics }) => {
	if (!topics.length) return null;

	return (
		<div className='w-full space-y-2'>
			<h3 className='text-sm font-medium uppercase tracking-wider text-neutral-400'>
				Highly Rated in
			</h3>
			<div className='flex flex-wrap justify-center gap-2'>
				{topics.map((topic, index) => (
					<span
						key={index}
						className='rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20'
					>
						{topic}
					</span>
				))}
			</div>
		</div>
	);
};

export default TopicTags;
