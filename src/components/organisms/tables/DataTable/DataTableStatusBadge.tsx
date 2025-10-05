"use client";

import { BadgeWithDot } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

export type StatusType = "active" | "inactive" | "pending" | "error" | "success";

const statusConfig: Record<
	StatusType,
	{
		label: string;
		color: "success" | "gray" | "warning" | "error" | "brand";
	}
> = {
	active: { label: "Active", color: "success" },
	inactive: { label: "Inactive", color: "gray" },
	pending: { label: "Pending", color: "warning" },
	error: { label: "Error", color: "error" },
	success: { label: "Success", color: "success" },
};

export interface DataTableStatusBadgeProps {
	status: StatusType;
	size?: "sm" | "md" | "lg";
	className?: string;
	customLabel?: string;
}

export function DataTableStatusBadge({
	status,
	size = "sm",
	className,
	customLabel,
}: DataTableStatusBadgeProps) {
	const config = statusConfig[status];

	return (
		<BadgeWithDot
			type="pill-color"
			size={size}
			color={config.color}
			className={className}
		>
			{customLabel || config.label}
		</BadgeWithDot>
	);
}
