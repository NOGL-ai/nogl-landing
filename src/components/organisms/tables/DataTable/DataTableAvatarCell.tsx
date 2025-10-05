"use client";

import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import type { AvatarProps } from "@/components/base/avatar/avatar";

export interface DataTableAvatarCellProps {
	src?: string | null;
	alt?: string;
	title: string;
	subtitle: string;
	size?: "sm" | "md" | "lg" | "xl";
	verified?: boolean;
	status?: "online" | "offline";
	initials?: string;
}

export function DataTableAvatarCell({
	src,
	alt,
	title,
	subtitle,
	size = "sm",
	verified,
	status,
	initials,
}: DataTableAvatarCellProps) {
	return (
		<AvatarLabelGroup
			src={src}
			alt={alt}
			title={title}
			subtitle={subtitle}
			size={size}
			verified={verified}
			status={status}
			initials={initials}
		/>
	);
}
