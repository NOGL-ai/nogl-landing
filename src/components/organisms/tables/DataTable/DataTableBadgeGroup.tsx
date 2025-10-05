"use client";

import { Badge } from "@/components/base/badges/badges";
import type { ReactNode } from "react";
import { cx } from "@/utils/cx";

export interface DataTableBadgeItem {
	label: string;
	color?: "gray" | "brand" | "error" | "warning" | "success";
}

export interface DataTableBadgeGroupProps {
	items: DataTableBadgeItem[];
	maxVisible?: number;
	size?: "sm" | "md" | "lg";
	className?: string;
}

export function DataTableBadgeGroup({
	items,
	maxVisible = 3,
	size = "sm",
	className,
}: DataTableBadgeGroupProps) {
	const visibleItems = items.slice(0, maxVisible);
	const remainingCount = items.length - maxVisible;

	return (
		<div className={cx("flex items-center gap-1", className)}>
			{visibleItems.map((item, index) => (
				<Badge
					key={index}
					type="pill-color"
					size={size}
					color={item.color || "gray"}
				>
					{item.label}
				</Badge>
			))}
			{remainingCount > 0 && (
				<Badge type="pill-color" size={size} color="gray">
					+{remainingCount}
				</Badge>
			)}
		</div>
	);
}
