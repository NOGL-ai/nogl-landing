"use client";

import React, { forwardRef } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

type SlideshowItemProps = {
	children: React.ReactNode;
	className?: string;
} & Accordion.AccordionItemProps;

const SlideshowItem = forwardRef<HTMLDivElement, SlideshowItemProps>(
	({ children, className, ...props }, ref) => (
		<Accordion.Item
			className={cn(
				"mt-px overflow-hidden focus-within:relative focus-within:z-10",
				className
			)}
			{...props}
			ref={ref}
		>
			{children}
		</Accordion.Item>
	)
);

SlideshowItem.displayName = "SlideshowItem";

export default SlideshowItem;
