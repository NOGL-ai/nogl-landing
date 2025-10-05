"use client";

import React from "react";
import { flexRender, Table } from "@tanstack/react-table";
import { Table as UntitledTable } from "@/components/application/table/table";
import { Icon } from "../Icon";
import { Button } from "@/components/ui/button";

interface DataTableHeaderProps<TData> {
	table: Table<TData>;
	enableSelection?: boolean;
}

export function DataTableHeader<TData>({
	table,
	enableSelection = false,
}: DataTableHeaderProps<TData>) {
	return (
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
						<UntitledTable.Head 
							key={header.id}
							role="columnheader"
							aria-colindex={index + 1}
							aria-sort={
								header.column.getCanSort()
									? header.column.getIsSorted() === "asc"
										? "ascending"
										: header.column.getIsSorted() === "desc"
										? "descending"
										: "none"
									: undefined
							}
							aria-label={header.column.columnDef.header ? 
								`Column ${index + 1}: ${typeof header.column.columnDef.header === 'string' 
									? header.column.columnDef.header 
									: 'Sortable column'}`
								: `Column ${index + 1}`
							}
						>
							{header.isPlaceholder
								? null
								: flexRender(
										header.column.columnDef.header,
										header.getContext()
								  )}
						</UntitledTable.Head>
					))}
				</UntitledTable.Row>
			))}
		</UntitledTable.Header>
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