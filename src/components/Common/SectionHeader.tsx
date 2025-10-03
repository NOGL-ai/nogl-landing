import React from "react";

const SectionHeader = ({
	title,
	description,
}: {
	title: string;
	description: string;
}) => {
	return (
		<div className='mb-12.5 lg:mb-17.5 mx-auto w-full max-w-[703px] px-4 text-center sm:px-8 xl:px-0'>
			<h2 className='mb-4.5 font-satoshi lg:text-heading-4 xl:text-heading-2 text-3xl font-bold -tracking-[1.6px] text-black dark:text-white'>
				{title}
			</h2>

			<p className='dark:text-gray-4 mx-auto w-full max-w-[585px]'>
				{description}
			</p>
		</div>
	);
};

export default SectionHeader;
