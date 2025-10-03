"use client";

import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import FlipText from "@/components/ui/flip-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface HeroProps {
	dictionary: {
		hero: {
			introducing: string;
			title: string[];
			description: string;
			buttonText: string;
		};
	};
}

export default function HeroSection({ dictionary }: HeroProps) {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: "-100px" });

	if (!dictionary?.hero) {
		return null;
	}

	const scrollToNewsletter = () => {
		const newsletterElement = document.getElementById("newsletter");
		newsletterElement?.scrollIntoView({ behavior: "smooth" });
	};

	const titleLines = Array.isArray(dictionary.hero.title)
		? dictionary.hero.title
		: [dictionary.hero.title];

	return (
		<section
			id='hero'
			className='relative mx-auto mt-32 max-w-[80rem] px-6 text-center md:px-8'
		>
			<div className='backdrop-filter-[12px] animate-fade-in group inline-flex h-7 translate-y-[-1rem] items-center justify-between gap-1 rounded-full border border-white/5 bg-white/10 px-3 text-xs text-white opacity-0 transition-all ease-in hover:cursor-pointer hover:bg-white/20 dark:text-black'>
				<AnimatedShinyText className='inline-flex items-center justify-center'>
					<span>✨ {dictionary.hero.introducing}</span>
					<ArrowRightIcon className='ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5' />
				</AnimatedShinyText>
			</div>
			<div className='mt-12 space-y-4'>
				{titleLines.map((line, index) => (
					<h1 key={index} className='block'>
						<FlipText
							word={line}
							duration={0.4}
							staggerDelay={0.1}
							className='xsm:text-base lsm:text-lg inline-block bg-gradient-to-br from-black from-30% to-black/40 bg-clip-text py-2 text-base font-medium text-transparent sm:text-xl md:text-3xl lg:text-5xl lg:leading-[1.2] xl:text-6xl dark:from-white dark:to-white/40'
						/>
					</h1>
				))}
			</div>
			<motion.p
				className='mb-16 mt-16 text-balance text-base tracking-tight text-gray-400 md:text-lg'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{
					duration: 0.5,
					delay: 1.2, // After title animations complete
					ease: "easeOut",
				}}
				style={{ willChange: "transform, opacity" }}
			>
				{dictionary.hero.description}
			</motion.p>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{
					duration: 0.5,
					delay: 1.5, // After description
					ease: "easeOut",
				}}
				style={{ willChange: "transform, opacity" }}
			>
				<RainbowButton
					onClick={scrollToNewsletter}
					className='gap-1 rounded-lg text-white dark:text-black'
				>
					{dictionary.hero.buttonText}
					<ArrowRightIcon className='ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1' />
				</RainbowButton>
			</motion.div>
		</section>
	);
}
