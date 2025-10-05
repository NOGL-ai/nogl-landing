"use client";

import React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-new";
import { Icon } from "../Icon";

interface DataTablePaginationProps<TData> {
	table: Table<TData>;
}

export function DataTablePagination<TData>({
	table,
}: DataTablePaginationProps<TData>) {
	const selectedRows = table.getFilteredSelectedRowModel().rows.length;
	const totalRows = table.getFilteredRowModel().rows.length;
	const currentPage = table.getState().pagination.pageIndex + 1;
	const totalPages = table.getPageCount();
	const pageSize = table.getState().pagination.pageSize;

	return (
		<nav 
			className="flex items-center justify-between px-2"
			role="navigation"
			aria-label="Table pagination"
		>
			<div 
				className="flex-1 text-sm text-muted-foreground"
				aria-live="polite"
				aria-label={`${selectedRows} of ${totalRows} rows selected`}
			>
				{selectedRows} of {totalRows} row(s) selected.
			</div>
			<div className="flex items-center space-x-6 lg:space-x-8">
				<div className="flex items-center space-x-2">
					<label 
						htmlFor="rows-per-page"
						className="text-sm font-medium"
					>
						Rows per page
					</label>
					<Select
						value={`${pageSize}`}
						onValueChange={(value) => {
							table.setPageSize(Number(value));
						}}
					>
						<SelectTrigger 
							id="rows-per-page"
							className="h-8 w-[70px]"
							aria-label="Select number of rows per page"
						>
							<SelectValue placeholder={String(pageSize)} />
						</SelectTrigger>
						<SelectContent>
							{[10, 20, 30, 40, 50].map((size) => (
								<SelectItem 
									key={size} 
									value={`${size}`}
									aria-label={`${size} rows per page`}
								>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div 
					className="flex w-[100px] items-center justify-center text-sm font-medium"
					aria-label={`Page ${currentPage} of ${totalPages}`}
				>
					Page {currentPage} of {totalPages}
				</div>
				<div className="flex items-center space-x-2" role="group" aria-label="Pagination controls">
					<Button
						variant="secondary"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
						aria-label="Go to first page"
					>
						<Icon name="ArrowLeft" className="h-4 w-4" aria-hidden={true} />
					</Button>
					<Button
						variant="secondary"
						className="h-8 w-8 p-0"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						aria-label="Go to previous page"
					>
						<Icon name="ArrowLeft" className="h-4 w-4" aria-hidden={true} />
					</Button>
					<Button
						variant="secondary"
						className="h-8 w-8 p-0"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						aria-label="Go to next page"
					>
						<Icon name="ArrowRight" className="h-4 w-4" aria-hidden={true} />
					</Button>
					<Button
						variant="secondary"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
						aria-label="Go to last page"
					>
						<Icon name="ArrowRight" className="h-4 w-4" aria-hidden={true} />
					</Button>
				</div>
			</div>
		</nav>
	);
}
