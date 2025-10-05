"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, Header } from "@tanstack/react-table";
import { Table as UntitledTable } from "@/components/application/table/table";
import { Icon } from "../Icon";

interface DataTableSortableHeaderCellProps<TData> {
	header: Header<TData, unknown>;
	index: number;
	enableColumnResizing?: boolean;
	enableColumnReordering?: boolean;
}

export function DataTableSortableHeaderCell<TData>({
	header,
	index,
	enableColumnResizing = false,
	enableColumnReordering = false,
}: DataTableSortableHeaderCellProps<TData>) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: header.id,
		disabled: !enableColumnReordering,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const isSortable = header.column.getCanSort();
	const sortDirection = header.column.getIsSorted();

	return (
		<UntitledTable.Head
			ref={setNodeRef}
			style={{
				...style,
				width: enableColumnResizing ? header.getSize() : undefined,
			}}
			role="columnheader"
			aria-colindex={index + 1}
			aria-sort={
				isSortable
					? sortDirection === "asc"
						? "ascending"
						: sortDirection === "desc"
						? "descending"
						: "none"
					: undefined
			}
			aria-label={
				header.column.columnDef.header
					? `Column ${index + 1}: ${
							typeof header.column.columnDef.header === "string"
								? header.column.columnDef.header
								: "Sortable column"
					  }`
					: `Column ${index + 1}`
			}
			className={`relative ${isDragging ? "z-50" : ""} ${
				enableColumnReordering ? "cursor-grab active:cursor-grabbing" : ""
			}`}
			{...attributes}
			{...listeners}
		>
			{header.isPlaceholder
				? null
				: flexRender(header.column.columnDef.header, header.getContext())}

			{/* Column Resize Handle */}
			{enableColumnResizing && header.column.getCanResize() && (
				<div
					onMouseDown={header.getResizeHandler()}
					onTouchStart={header.getResizeHandler()}
					className="absolute right-0 top-0 h-full w-1 bg-gray-300 cursor-col-resize select-none touch-none hover:bg-blue-500 dark:bg-gray-600 dark:hover:bg-blue-400"
					aria-label={`Resize column ${header.column.columnDef.header || header.id}`}
					onClick={(e) => e.stopPropagation()}
				/>
			)}

			{/* Drag Handle for Reordering */}
			{enableColumnReordering && (
				<div
					className="absolute left-0 top-0 h-full w-2 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity"
					aria-label={`Drag to reorder column ${header.column.columnDef.header || header.id}`}
					onClick={(e) => e.stopPropagation()}
				>
					<Icon
						name="MoreHorizontal"
						className="h-3 w-3 text-gray-400 dark:text-gray-500"
						aria-hidden={true}
					/>
				</div>
			)}
		</UntitledTable.Head>
	);
}
