"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface AnimatedSubscribeButtonProps {
	isLoading?: boolean;
	className?: string;
	children?: React.ReactNode;
}

export function AnimatedSubscribeButton({
	isLoading = false,
	className,
	children = "Join Now",
}: AnimatedSubscribeButtonProps) {
	return (
		<motion.button
			type='submit'
			disabled={isLoading}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			className={cn(
				"bg-primary font-satoshi hover:bg-primary-dark inline-flex h-12 min-w-[125px] items-center justify-center rounded-full px-7 text-base font-medium text-white duration-300 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white",
				className
			)}
			aria-label='Subscribe to the newsletter'
		>
			<AnimatePresence mode='wait'>
				{isLoading ? (
					<motion.div
						key='loading'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<Loader2 className='h-4 w-4 animate-spin' />
					</motion.div>
				) : (
					<motion.span
						key='text'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						{children}
					</motion.span>
				)}
			</AnimatePresence>
		</motion.button>
	);
}
