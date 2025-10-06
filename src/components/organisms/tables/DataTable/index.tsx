"use client";

import React from "react";
import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	RowSelectionState,
	ColumnSizingState,
	ColumnOrderState,
} from "@tanstack/react-table";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableBody } from "./DataTableBody";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTableGlobalSearch } from "./DataTableGlobalSearch";
import { DataTableColumnManagement } from "./DataTableColumnManagement";
import { Table as UntitledTable, TableCard } from "@/components/application/table/table";
import { DotsVertical } from "@untitledui/icons";
import { Dropdown } from "@/components/base/dropdown/dropdown";

export interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	searchKey?: string;
	searchPlaceholder?: string;
	enablePagination?: boolean;
	enableSorting?: boolean;
	enableFiltering?: boolean;
	enableSelection?: boolean;
	enableGlobalSearch?: boolean;
	enableColumnManagement?: boolean;
	enableColumnResizing?: boolean;
	enableColumnReordering?: boolean;
	pageSize?: number;
	className?: string;
	onRowSelectionChange?: (selectedRows: TData[]) => void;
	variant?: "default" | "untitled-ui";
	tableTitle?: string;
	tableBadge?: React.ReactNode;
	tableDescription?: string;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	searchKey,
	searchPlaceholder = "Search...",
	enablePagination = true,
	enableSorting = true,
	enableFiltering = true,
	enableSelection = false,
	enableGlobalSearch = false,
	enableColumnManagement = false,
	enableColumnResizing = false,
	enableColumnReordering = false,
	pageSize = 10,
	className,
	onRowSelectionChange,
	variant = "default",
	tableTitle,
	tableBadge,
	tableDescription,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
	const [globalFilter, setGlobalFilter] = React.useState("");
	const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
	const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);

	// Global filter function
	const globalFilterFn = React.useCallback((row: any, _columnId: string, value: string) => {
		const search = value.toLowerCase();
		return Object.values(row.original).some((cell: unknown) => {
			if (typeof cell === "string") {
				return cell.toLowerCase().includes(search);
			}
			if (typeof cell === "object" && cell !== null) {
				return Object.values(cell).some(
					(nestedValue: unknown) =>
						typeof nestedValue === "string" &&
						nestedValue.toLowerCase().includes(search)
				);
			}
			return false;
		});
	}, []);

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: (updaterOrValue) => {
			setRowSelection(updaterOrValue);
			if (onRowSelectionChange) {
				// Get the updated row selection state
				const newRowSelection = typeof updaterOrValue === 'function' 
					? updaterOrValue(rowSelection) 
					: updaterOrValue;
				
				// Get selected rows from the current data based on selection indices
				const selectedRows = data.filter((_, index) => newRowSelection[index]);
				onRowSelectionChange(selectedRows);
			}
		},
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: enableGlobalSearch ? globalFilterFn : "includesString",
		enableColumnResizing: enableColumnResizing,
		columnResizeMode: "onChange",
		onColumnSizingChange: setColumnSizing,
		onColumnOrderChange: setColumnOrder,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter,
			columnSizing,
			columnOrder,
		},
		initialState: {
			pagination: {
				pageSize,
			},
		},
	});

	if (variant === "untitled-ui") {
		return (
			<TableCard.Root size="md" className={className}>
				{tableTitle && (
					<TableCard.Header
						title={tableTitle}
						badge={tableBadge}
						description={tableDescription}
						contentTrailing={
							<Dropdown.Root>
								<Dropdown.DotsButton />
								<Dropdown.Popover className="w-min">
									<Dropdown.Menu>
										<Dropdown.Item>Export</Dropdown.Item>
										<Dropdown.Item>Print</Dropdown.Item>
										<Dropdown.Item>Settings</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown.Popover>
							</Dropdown.Root>
						}
					/>
				)}
				<UntitledTable
					role="table"
					aria-label={tableTitle || "Data table"}
					aria-rowcount={table.getRowModel().rows.length + 1}
					aria-colcount={table.getAllColumns().length}
					size="md"
				>
					<DataTableHeader
						table={table}
						enableSelection={enableSelection}
						enableColumnResizing={enableColumnResizing}
						enableColumnReordering={enableColumnReordering}
						variant={variant}
					/>
					<DataTableBody
						table={table}
						enableSelection={enableSelection}
						enableColumnResizing={enableColumnResizing}
						enableColumnReordering={enableColumnReordering}
						variant={variant}
					/>
				</UntitledTable>
				{enablePagination && <DataTablePagination table={table} />}
			</TableCard.Root>
		);
	}

	return (
		<div
			className={`space-y-4 ${className || ""}`}
			role="region"
			aria-label="Data table with sortable columns and pagination"
		>
			{enableFiltering && !enableGlobalSearch && (
				<DataTableToolbar
					table={table}
					searchKey={searchKey}
					searchPlaceholder={searchPlaceholder}
				/>
			)}
			{enableGlobalSearch && (
				<DataTableGlobalSearch
					table={table}
					placeholder={searchPlaceholder}
				/>
			)}
			<UntitledTable
				role="table"
				aria-label="Data table"
				aria-rowcount={table.getRowModel().rows.length + 1}
				aria-colcount={table.getAllColumns().length}
			>
				<DataTableHeader
					table={table}
					enableSelection={enableSelection}
					enableColumnResizing={enableColumnResizing}
					enableColumnReordering={enableColumnReordering}
				/>
				<DataTableBody
					table={table}
					enableSelection={enableSelection}
					enableColumnResizing={enableColumnResizing}
					enableColumnReordering={enableColumnReordering}
				/>
			</UntitledTable>
			{enablePagination && <DataTablePagination table={table} />}
		</div>
	);
}
