import React, { FC } from "react";

interface LikeSaveBtnsProps {
	onShare?: () => void;
}

const LikeSaveBtns: FC<LikeSaveBtnsProps> = ({ onShare }) => {
	return (
		<div className="flex items-center gap-2">
			<button
				onClick={onShare}
				className="nc-Button relative h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium pl-4 pr-4 py-2 sm:pl-6 sm:pr-6 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0"
			>
				<i className="las la-share-alt text-lg mr-2"></i>
				Share
			</button>
			<div className='flow-root'>
				<div className='-mx-3 -my-1.5 flex text-sm text-neutral-700 dark:text-neutral-300'>
					<span className='flex cursor-pointer rounded-lg px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-5 w-5'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={1.5}
								d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
							/>
						</svg>
						<span className='ml-2.5 hidden sm:block'>Save</span>
					</span>
				</div>
			</div>
		</div>
	);
};

export default LikeSaveBtns;
