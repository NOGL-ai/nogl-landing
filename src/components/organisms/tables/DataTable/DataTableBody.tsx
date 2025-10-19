"use client";

import React from "react";
import { flexRender, Table } from "@tanstack/react-table";
import { Table as UntitledTable } from "@/components/application/table/table";

interface DataTableBodyProps<TData> {
	table: Table<TData>;
	enableSelection?: boolean;
	enableColumnResizing?: boolean;
	enableColumnReordering?: boolean;
	variant?: "default" | "untitled-ui";
}

export function DataTableBody<TData>({
	table,
	enableSelection = false,
	enableColumnResizing = false,
	enableColumnReordering = false,
	variant = "default",
}: DataTableBodyProps<TData>) {
	const rows = table.getRowModel().rows;
	const rowCount = rows?.length || 0;

	return (
		<UntitledTable.Body
			aria-live="polite"
			aria-label="Table body with data rows"
		>
			{rowCount > 0 ? (
				rows.map((row, index) => {
					const isAlternate = index % 2 === 0;
					const rowBg = variant === "untitled-ui"
						? (isAlternate ? "bg-[#FDFDFD]" : "bg-white")
						: row.getIsSelected() ? "bg-blue-50 dark:bg-blue-900/20" : "";

					return (
						<UntitledTable.Row
							key={row.id}
							data-state={row.getIsSelected() && "selected"}
							role="row"
							aria-rowindex={index + 2} // +2 because header is row 1
							aria-selected={row.getIsSelected()}
							className={rowBg}
						>
							{row.getVisibleCells().map((cell, cellIndex) => (
								<UntitledTable.Cell
									key={`${row.id}_${cell.column.id}` }
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
					);
				})
			) : (
				<UntitledTable.Row role="row">
					<UntitledTable.Cell
						colSpan={table.getAllColumns().length}
						className="h-24 text-center text-tertiary dark:text-tertiary"
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
