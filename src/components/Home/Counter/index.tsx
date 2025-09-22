"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import type { Route } from 'next';
import ShimmerButton from "@/components/ui/shimmer-button";

interface CounterProps {
	dictionary: {
		counter: {
			title: string;
			stats: {
				value: string;
				label: string;
			}[];
			heading: string;
			aboutButton: string;
		};
	};
}

const Counter = ({ dictionary }: CounterProps) => {
	const containerRef = useRef<HTMLElement>(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [progress, setProgress] = useState(0);
	const [isAutoPlaying, setIsAutoPlaying] = useState(true);
	const ANIMATION_DURATION = 5000;

	// Add scroll-based animation
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start end", "end start"],
	});

	// Transform scroll progress into opacity and y-offset
	const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
	const yOffset = useTransform(scrollYProgress, [0, 0.2], [50, 0]);

	// Memoize stats to prevent unnecessary recalculations
	const stats = useMemo(() => 
		dictionary.counter.stats.map(stat => ({
			value: parseInt(stat.value),
			label: stat.label
		}))
	, [dictionary.counter.stats]);

	// Memoize circle calculations
	const { radius, circumference, strokeDashoffset } = useMemo(() => {
		const radius = 19;
		const circumference = 2 * Math.PI * radius;
		const strokeDashoffset = circumference - (progress / 100) * circumference;
		return { radius, circumference, strokeDashoffset };
	}, [progress]);

	// Navigation handlers with useCallback
	const handleNext = useCallback(() => {
		setCurrentIndex((prev) => (prev + 1) % stats.length);
		setProgress(0);
		setIsAutoPlaying(false);
	}, [stats.length]);

	const handlePrev = useCallback(() => {
		setCurrentIndex((prev) => (prev - 1 + stats.length) % stats.length);
		setProgress(0);
		setIsAutoPlaying(false);
	}, [stats.length]);

	// Auto-play effect
	useEffect(() => {
		if (!isAutoPlaying) return;

		const timer = setInterval(() => {
			setProgress((oldProgress) => {
				if (oldProgress === 100) {
					setCurrentIndex((prev) => (prev + 1) % stats.length);
					return 0;
				}
				return Math.min(oldProgress + 1, 100);
			});
		}, ANIMATION_DURATION / 100);

		return () => clearInterval(timer);
	}, [isAutoPlaying, stats.length]);

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') handlePrev();
			if (e.key === 'ArrowRight') handleNext();
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleNext, handlePrev]);

	return (
		<motion.section 
			ref={containerRef}
			style={{ opacity, y: yOffset }}
			className="relative px-4 sm:px-6 py-12 sm:py-16 lg:py-24 overflow-hidden"
		>
			<div className="mx-auto max-w-7xl flex flex-col lg:flex-row items-start justify-between gap-4 sm:gap-8">
				<motion.div 
					className="flex flex-col w-full lg:max-w-[280px]"
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
				>
					{/* Header */}
					<div className="mb-3 sm:mb-4 flex items-center justify-between w-full">
						<motion.h3 
							className="font-display text-[13px] tracking-tight text-black/70 dark:text-white/70 uppercase"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2 }}
						>
							{dictionary.counter.title}
						</motion.h3>
						<div className="flex items-center space-x-1 text-[12px] text-black/60 dark:text-white/60 font-medium">
							<span>{String(currentIndex + 1).padStart(2, '0')}</span>
							<span className="mx-0.5 opacity-40">/</span>
							<span className="opacity-40">{String(stats.length).padStart(2, '0')}</span>
						</div>
					</div>

					{/* Progress Bar */}
					<div className="relative mb-4 sm:mb-8 h-[2px] w-full bg-black/5 dark:bg-white/5 overflow-hidden rounded-full">
						<motion.div 
							className="absolute h-full bg-gradient-to-r from-primary to-primary/80 dark:from-white dark:to-white/80"
							initial={{ x: "-100%" }}
							animate={{ x: `${-100 + progress}%` }}
							transition={{ duration: 0.3, ease: "easeOut" }}
						/>
					</div>

					{/* Content */}
					<div className="flex flex-col justify-between min-h-[160px] sm:min-h-[200px] mb-4 sm:mb-8 lg:mb-0">
						<AnimatePresence mode="wait">
							<motion.div 
								key={currentIndex}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.4, ease: "easeOut" }}
								className="flex flex-col"
							>
								<div className="flex items-baseline space-x-1">
									<NumberTicker
										value={stats[currentIndex].value}
										className="font-display text-[40px] sm:text-[48px] font-bold leading-none tracking-tighter md:text-[56px] bg-gradient-to-r from-black to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent"
									/>
									<motion.span 
										className="font-display text-[40px] sm:text-[48px] font-bold leading-none tracking-tighter md:text-[56px] bg-gradient-to-r from-black to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent"
										initial={{ scale: 0.8, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ delay: 0.2 }}
									>
										+
									</motion.span>
								</div>
								<motion.p 
									className="mt-2 font-body text-[14px] sm:text-[15px] font-medium leading-tight text-black/80 dark:text-white/80 whitespace-pre-line"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3 }}
								>
									{stats[currentIndex].label}
								</motion.p>
							</motion.div>
						</AnimatePresence>

						{/* Navigation */}
						<div className="flex items-center gap-3 mt-6">
							<motion.button
								onClick={handlePrev}
								disabled={currentIndex === 0}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 backdrop-blur-sm transition-all hover:border-black disabled:opacity-50 disabled:cursor-not-allowed dark:bg-black/80 dark:border-white/10 dark:hover:border-white hover:shadow-lg"
								aria-label="Previous statistic"
							>
								<motion.svg 
									width="16" 
									height="16" 
									viewBox="0 0 16 16" 
									fill="none"
									whileHover={{ x: -2 }}
									transition={{ type: "spring", stiffness: 400 }}
								>
									<path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
								</motion.svg>
							</motion.button>

							<motion.button
								onClick={handleNext}
								disabled={currentIndex === stats.length - 1}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 backdrop-blur-sm transition-all hover:border-black disabled:opacity-50 disabled:cursor-not-allowed dark:bg-black/80 dark:border-white/10 dark:hover:border-white hover:shadow-lg"
								aria-label="Next statistic"
							>
								<svg
									className="absolute inset-0 h-full w-full"
									viewBox="0 0 32 32"
								>
									<circle
										className="stroke-black/5 dark:stroke-white/5"
										cx="16"
										cy="16"
										r="15"
										strokeWidth="2"
										fill="none"
									/>
									<motion.circle
										className="stroke-black/20 dark:stroke-white/20"
										cx="16"
										cy="16"
										r="15"
										strokeWidth="2"
										fill="none"
										strokeDasharray={circumference}
										strokeDashoffset={strokeDashoffset}
										transform="rotate(-90 16 16)"
										transition={{ duration: 0.3, ease: "easeOut" }}
									/>
								</svg>
								<motion.svg 
									className="relative z-10" 
									width="16" 
									height="16" 
									viewBox="0 0 16 16" 
									fill="none"
									whileHover={{ x: 2 }}
									transition={{ type: "spring", stiffness: 400 }}
								>
									<path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
								</motion.svg>
							</motion.button>
						</div>
					</div>
				</motion.div>

				<motion.div 
					className="flex-1 w-full"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<motion.h2 
						className="font-display text-[32px] sm:text-[40px] lg:text-[48px] leading-tight mb-8 sm:mb-12 lg:mb-16 bg-gradient-to-br from-black to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
					>
						{dictionary.counter.heading}
					</motion.h2>
					
					{/* CTA */}
					<motion.div 
						className="flex items-center gap-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.6 }}
					>
						<motion.div 
							whileHover={{ scale: 1.05 }} 
							whileTap={{ scale: 0.95 }}
							className="relative group"
						>
							<div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
							<Link href={"/auth/signup" as Route}>
								<ShimmerButton
									shimmerColor="#ffffff33"
									background="linear-gradient(135deg, #000000, #333333)"
									className="relative dark:!text-white font-medium flex items-center gap-2 px-6 py-3"
								>
									<span>{dictionary.counter.aboutButton}</span>
									<motion.svg
										className="h-4 w-4"
										viewBox="0 0 16 16"
										fill="none"
										whileHover={{ x: 4 }}
										transition={{ type: "spring", stiffness: 400 }}
									>
										<path
											d="M6 12L10 8L6 4"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</motion.svg>
								</ShimmerButton>
							</Link>
						</motion.div>
					</motion.div>
				</motion.div>
			</div>
		</motion.section>
	);
};

export default Counter;
