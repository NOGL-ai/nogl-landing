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
	ColumnResizingState,
	ColumnOrderState,
} from "@tanstack/react-table";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableBody } from "./DataTableBody";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTableGlobalSearch } from "./DataTableGlobalSearch";
import { DataTableColumnManagement } from "./DataTableColumnManagement";
import { DataTableAdvancedFilters } from "./DataTableAdvancedFilters";
import { Table as UntitledTable } from "@/components/application/table/table";

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
	enableAdvancedFilters?: boolean;
	pageSize?: number;
	className?: string;
	onRowSelectionChange?: (selectedRows: TData[]) => void;
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
	enableAdvancedFilters = false,
	pageSize = 10,
	className,
	onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
	const [globalFilter, setGlobalFilter] = React.useState("");
	const [columnResizing, setColumnResizing] = React.useState<ColumnResizingState>({});
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
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: enableGlobalSearch ? globalFilterFn : "includesString",
		enableColumnResizing: enableColumnResizing,
		columnResizeMode: "onChange",
		onColumnResizingChange: setColumnResizing,
		enableColumnOrdering: enableColumnReordering,
		onColumnOrderChange: setColumnOrder,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter,
			columnResizing,
			columnOrder,
		},
		initialState: {
			pagination: {
				pageSize,
			},
		},
	});

	// Handle row selection changes
	React.useEffect(() => {
		if (onRowSelectionChange) {
			const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
			onRowSelectionChange(selectedRows);
		}
	}, [rowSelection, onRowSelectionChange, table]);

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
			{enableAdvancedFilters && <DataTableAdvancedFilters table={table} />}
			<UntitledTable
				role="table"
				aria-label="Data table"
				aria-rowcount={table.getRowModel().rows.length + 1} // +1 for header
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
