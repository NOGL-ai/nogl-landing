"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import {
	useAnimationCapabilities,
	getAnimationVariants,
	getStaggerTiming,
} from "@/hooks/useAnimationCapabilities";

interface FlipTextProps {
	word: string;
	duration?: number;
	staggerDelay?: number;
	className?: string;
}

export default function FlipText({
	word,
	duration = 0.4,
	staggerDelay = 0.1,
	className,
}: FlipTextProps) {
	const { animationLevel } = useAnimationCapabilities();

	// Get adaptive animation variants based on device capabilities
	const wordVariants = getAnimationVariants(animationLevel);
	const staggerTiming = getStaggerTiming(animationLevel);

	// Container variants that adapt to device capabilities
	const containerVariants: Variants = {
		hidden: { opacity: animationLevel === "none" ? 1 : 0 },
		visible: {
			opacity: 1,
			transition: staggerTiming,
		},
	};

	// Split by words instead of characters for better performance
	const words = word.split(" ");

	// For 'none' level, render without motion components
	if (animationLevel === "none") {
		return (
			<span className={cn("inline-block", className)}>
				{words.map((wordText, i) => (
					<span key={i} className='mr-2 inline-block last:mr-0'>
						{wordText}
					</span>
				))}
			</span>
		);
	}

	return (
		<motion.span
			className={cn("inline-block", className)}
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			style={{
				willChange:
					animationLevel === "minimal" ? "opacity" : "transform, opacity",
			}}
		>
			{words.map((wordText, i) => (
				<motion.span
					key={i}
					variants={wordVariants}
					className='mr-2 inline-block last:mr-0'
					style={{
						willChange:
							animationLevel === "minimal" ? "opacity" : "transform, opacity",
					}}
				>
					{wordText}
				</motion.span>
			))}
		</motion.span>
	);
}
