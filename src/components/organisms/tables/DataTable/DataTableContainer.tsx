"use client";

import { cx } from "@/utils/cx";
import type { ReactNode } from "react";

export interface DataTableContainerProps {
	children: ReactNode;
	className?: string;
	variant?: "default" | "untitled-ui";
}

export function DataTableContainer({
	children,
	className,
	variant = "default",
}: DataTableContainerProps) {
	if (variant === "untitled-ui") {
		return (
			<div
				className={cx(
					"overflow-hidden rounded-xl border border-border bg-white shadow-sm dark:border-border dark:bg-background",
					className
				)}
			>
				{children}
			</div>
		);
	}

	return <div className={className}>{children}</div>;
}
