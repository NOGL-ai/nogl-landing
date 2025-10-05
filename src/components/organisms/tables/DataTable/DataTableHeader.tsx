"use client";

import React from "react";
import { flexRender, Table } from "@tanstack/react-table";
import { Table as UntitledTable } from "@/components/application/table/table";
import { Icon } from "../Icon";
import { Button } from "@/components/ui/button";
import { DataTableDragDropWrapper } from "./DataTableDragDropWrapper";
import { DataTableSortableHeaderCell } from "./DataTableSortableHeaderCell";

interface DataTableHeaderProps<TData> {
	table: Table<TData>;
	enableSelection?: boolean;
	enableColumnResizing?: boolean;
	enableColumnReordering?: boolean;
	variant?: "default" | "untitled-ui";
}

export function DataTableHeader<TData>({
	table,
	enableSelection = false,
	enableColumnResizing = false,
	enableColumnReordering = false,
	variant = "default",
}: DataTableHeaderProps<TData>) {
	return (
		<DataTableDragDropWrapper
			table={table}
			enableColumnReordering={enableColumnReordering}
		>
			<UntitledTable.Header
				aria-label="Table header with column headers"
			>
				{table.getHeaderGroups().map((headerGroup) => (
					<UntitledTable.Row 
						key={headerGroup.id}
						role="row"
						aria-rowindex={1}
					>
						{headerGroup.headers.map((header, index) => (
							<DataTableSortableHeaderCell
								key={header.id}
								header={header}
								index={index}
								enableColumnResizing={enableColumnResizing}
								enableColumnReordering={enableColumnReordering}
								variant={variant}
							/>
						))}
					</UntitledTable.Row>
				))}
			</UntitledTable.Header>
		</DataTableDragDropWrapper>
	);
}

// Sortable header component with proper accessibility
export function SortableHeader({
	column,
	children,
	className,
}: {
	column: any;
	children: React.ReactNode;
	className?: string;
}) {
	const sortDirection = column.getIsSorted();
	const sortLabel = sortDirection === "asc" ? "sorted ascending" : 
	                 sortDirection === "desc" ? "sorted descending" : 
	                 "sortable";

	return (
		<Button
			variant="ghost"
			onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			className={`h-8 px-2 lg:px-3 ${className || ""}`}
			aria-label={`Sort by ${children} - ${sortLabel}`}
		>
			{children}
			{sortDirection === "asc" ? (
				<Icon name="ArrowUp" className="ml-2 h-4 w-4" aria-hidden={true} />
			) : sortDirection === "desc" ? (
				<Icon name="ArrowDown" className="ml-2 h-4 w-4" aria-hidden={true} />
			) : (
				<Icon name="ArrowUpDown" className="ml-2 h-4 w-4" aria-hidden={true} />
			)}
		</Button>
	);
}
