"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
	children: React.ReactNode;
	className?: string;
	containerClassName?: string;
	id?: string;
}

const Section: React.FC<SectionProps> = ({
	children,
	className = "",
	containerClassName = "",
	id,
}) => {
	return (
		<section id={id} className={cn("py-16 lg:py-24", className)}>
			<div
				className={cn(
					"container mx-auto px-4 sm:px-6 lg:px-8",
					containerClassName
				)}
			>
				{children}
			</div>
		</section>
	);
};

export default Section;
