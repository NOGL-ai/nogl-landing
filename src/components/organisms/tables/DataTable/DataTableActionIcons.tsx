"use client";

import { Button } from "@/components/ui/button";
import { Trash01, Edit01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

export interface DataTableActionIconsProps {
	onEdit?: () => void;
	onDelete?: () => void;
	editLabel?: string;
	deleteLabel?: string;
	className?: string;
	showEdit?: boolean;
	showDelete?: boolean;
}

export function DataTableActionIcons({
	onEdit,
	onDelete,
	editLabel = "Edit",
	deleteLabel = "Delete",
	className,
	showEdit = true,
	showDelete = true,
}: DataTableActionIconsProps) {
	return (
		<div className={cx("flex items-center gap-1", className)}>
			{showEdit && (
				<Button
					variant="ghost"
					size="sm"
					onClick={onEdit}
					aria-label={editLabel}
					className="h-8 w-8 p-0 text-tertiary hover:text-secondary dark:text-tertiary"
				>
					<Edit01 className="h-4 w-4" aria-hidden={true} />
				</Button>
			)}
			{showDelete && (
				<Button
					variant="ghost"
					size="sm"
					onClick={onDelete}
					aria-label={deleteLabel}
					className="h-8 w-8 p-0 text-tertiary hover:text-red-600 dark:text-tertiary dark:hover:text-red-500"
				>
					<Trash01 className="h-4 w-4" aria-hidden={true} />
				</Button>
			)}
		</div>
	);
}
