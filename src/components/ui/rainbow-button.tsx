"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import {
	useAnimationCapabilities,
	getAnimationVariants,
	getStaggerTiming,
} from "@/hooks/useAnimationCapabilities";

import { cn } from "@/lib/utils";

interface RainbowButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
}

export function RainbowButton({
	children,
	className,
	...props
}: RainbowButtonProps) {
	const { animationLevel, hasGPU } = useAnimationCapabilities();

	// Extract text from children for word-by-word animation
	const text =
		typeof children === "string"
			? children
			: React.Children.toArray(children)
					.filter((child) => typeof child === "string")
					.join(" ");

	const words = text.split(" ").filter((word) => word.length > 0);
	const nonTextChildren = React.Children.toArray(children).filter(
		(child) => typeof child !== "string"
	);

	// Get adaptive animation variants
	const wordVariants = getAnimationVariants(animationLevel);
	const staggerTiming = getStaggerTiming(animationLevel);

	// Disable complex effects for low-end devices
	const useComplexEffects =
		hasGPU && (animationLevel === "full" || animationLevel === "reduced");

	// Container variants
	const buttonContainerVariants: Variants = {
		hidden: { opacity: animationLevel === "none" ? 1 : 0 },
		visible: {
			opacity: 1,
			transition: {
				...staggerTiming,
				staggerChildren: staggerTiming.staggerChildren * 0.6, // Faster for buttons
			},
		},
	};

	// For no animation preference
	if (animationLevel === "none") {
		return (
			<button
				className={cn(
					"text-primary-foreground group relative inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium transition-colors duration-200",
					"[background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent]",
					"focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
					// Simplified static background
					"bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
					className
				)}
				{...props}
			>
				{children}
			</button>
		);
	}

	return (
		<motion.button
			className={cn(
				"text-primary-foreground focus-visible:ring-ring group relative inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium transition-all duration-300 [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",

				// Complex effects only for capable devices
				useComplexEffects && [
					"before:absolute before:bottom-[-10%] before:left-1/2 before:z-0 before:h-1/6 before:w-2/5 before:-translate-x-1/2 before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:transition-transform before:duration-300 before:[filter:blur(calc(0.4*1rem))]",
					"hover:before:scale-110",
				],

				// Fallback gradient for all devices
				useComplexEffects
					? [
							// Complex rainbow gradients for capable devices
							"bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.4)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
							"dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.4)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
						]
					: [
							// Simple gradient for low-end devices
							"bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
						],

				className
			)}
			variants={buttonContainerVariants}
			initial='hidden'
			animate='visible'
			whileHover={animationLevel === "full" ? { scale: 1.02 } : undefined}
			whileTap={animationLevel !== "minimal" ? { scale: 0.98 } : undefined}
			style={{
				willChange:
					animationLevel === "minimal" ? "opacity" : "transform, opacity",
			}}
			{...props}
		>
			{words.map((word, index) => (
				<motion.span
					key={index}
					variants={wordVariants}
					className='mr-1 inline-block last:mr-0'
					style={{
						willChange:
							animationLevel === "minimal" ? "opacity" : "transform, opacity",
					}}
				>
					{word}
				</motion.span>
			))}
			{nonTextChildren}
		</motion.button>
	);
}
