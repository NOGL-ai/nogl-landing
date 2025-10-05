"use client";

import React from "react";
import { flexRender, Table } from "@tanstack/react-table";
import { Table as UntitledTable } from "@/components/application/table/table";

interface DataTableBodyProps<TData> {
	table: Table<TData>;
	enableSelection?: boolean;
	enableColumnResizing?: boolean;
	enableColumnReordering?: boolean;
}

export function DataTableBody<TData>({
	table,
	enableSelection = false,
	enableColumnResizing = false,
	enableColumnReordering = false,
}: DataTableBodyProps<TData>) {
	const rows = table.getRowModel().rows;
	const rowCount = rows?.length || 0;

	return (
		<UntitledTable.Body
			aria-live="polite"
			aria-label="Table body with data rows"
		>
			{rowCount > 0 ? (
				rows.map((row, index) => (
					<UntitledTable.Row
						key={row.id}
						data-state={row.getIsSelected() && "selected"}
						role="row"
						aria-rowindex={index + 2} // +2 because header is row 1
						aria-selected={row.getIsSelected()}
						className={row.getIsSelected() ? "bg-blue-50 dark:bg-blue-900/20" : ""}
					>
						{row.getVisibleCells().map((cell, cellIndex) => (
							<UntitledTable.Cell 
								key={cell.id}
								role="gridcell"
								aria-colindex={cellIndex + 1}
								aria-describedby={cell.column.id}
								style={{
									width: enableColumnResizing ? cell.column.getSize() : undefined,
								}}
							>
								{flexRender(
									cell.column.columnDef.cell,
									cell.getContext()
								)}
							</UntitledTable.Cell>
						))}
					</UntitledTable.Row>
				))
			) : (
				<UntitledTable.Row role="row">
					<UntitledTable.Cell
						colSpan={table.getAllColumns().length}
						className="h-24 text-center text-gray-500 dark:text-gray-400"
						role="gridcell"
						aria-colspan={table.getAllColumns().length}
					>
						<div role="status" aria-live="polite">
							No results found.
						</div>
					</UntitledTable.Cell>
				</UntitledTable.Row>
			)}
		</UntitledTable.Body>
	);
}
