"use client";

import { motion, useAnimate, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const NUM_BLOCKS = 5;
const BLOCK_SIZE = 32;
const DURATION_IN_MS = 175;
const DURATION_IN_SECS = DURATION_IN_MS * 0.001;

const TRANSITION: unknown = {
	ease: "easeInOut",
	duration: DURATION_IN_SECS,
};

interface VideoLoaderProps {
	message?: string;
	subMessage?: string;
}

const VideoLoader = ({
	message = "Preparing Your Video Space",
	subMessage = "This will just take a moment...",
}: VideoLoaderProps) => {
	const [blocks, setBlocks] = useState(
		Array.from(Array(NUM_BLOCKS).keys()).map((n) => ({ id: n }))
	);
	const [scope, animate] = useAnimate();

	useEffect(() => {
		shuffle();
	}, []);

	const shuffle = async () => {
		while (true) {
			const [first, second] = pickTwoRandom();
			animate(
				`[data-block-id="${first.id}"]`,
				{ y: -BLOCK_SIZE } as any,
				TRANSITION
			);
			await animate(
				`[data-block-id="${second.id}"]`,
				{ y: BLOCK_SIZE } as any,
				TRANSITION
			);
			await delay(DURATION_IN_MS);

			setBlocks((pv) => {
				const copy = [...pv];
				const indexForFirst = copy.indexOf(first);
				const indexForSecond = copy.indexOf(second);
				copy[indexForFirst] = second;
				copy[indexForSecond] = first;
				return copy;
			});

			await delay(DURATION_IN_MS * 2);
			animate(`[data-block-id="${first.id}"]`, { y: 0 } as any, TRANSITION);
			await animate(
				`[data-block-id="${second.id}"]`,
				{ y: 0 } as any,
				TRANSITION
			);
			await delay(DURATION_IN_MS);
		}
	};

	const pickTwoRandom = () => {
		const index1 = Math.floor(Math.random() * blocks.length);
		let index2 = Math.floor(Math.random() * blocks.length);
		while (index2 === index1) {
			index2 = Math.floor(Math.random() * blocks.length);
		}
		return [blocks[index1], blocks[index2]];
	};

	const delay = (ms: number) =>
		new Promise((resolve) => setTimeout(resolve, ms));

	return (
		<div className='flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-black dark:bg-opacity-20'>
			<div className='flex flex-col items-center space-y-6'>
				<div ref={scope} className='flex divide-x divide-neutral-200'>
					{blocks.map((b) => (
						<motion.div
							layout
							data-block-id={b.id}
							key={b.id}
							transition={TRANSITION}
							style={{
								width: BLOCK_SIZE,
								height: BLOCK_SIZE,
							}}
							className='bg-primary'
						/>
					))}
				</div>
				<AnimatePresence mode='wait'>
					<motion.div
						className='flex flex-col items-center space-y-2'
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<p className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
							{message}
						</p>
						<p className='text-sm text-gray-600 dark:text-gray-400'>
							{subMessage}
						</p>
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
};

export default VideoLoader;
