"use client";

import React, {
	useMemo,
	useRef,
	useState,
	useEffect,
	useCallback,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
	Row,
	SortingState,
	ColumnFiltersState,
	RowSelectionState,
	OnChangeFn,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface VirtualTableProps<TData> {
	data: TData[];
	columns: ColumnDef<TData>[];
	height?: number;
	rowHeight?: number;
	className?: string;
	enableVirtualization?: boolean;
	threshold?: number; // Minimum number of rows to enable virtualization
	onRowClick?: (row: Row<TData>) => void;
	onRowDoubleClick?: (row: Row<TData>) => void;
	selectedRows?: Set<string>;
	onRowSelect?: (rowId: string, selected: boolean) => void;
	loading?: boolean;
	emptyState?: React.ReactNode;
	headerSticky?: boolean;
	overscan?: number;
	enableSorting?: boolean;
	enableFiltering?: boolean;
	enableSelection?: boolean;
	enableMultiRowSelection?: boolean;
	globalFilter?: string;
	onGlobalFilterChange?: (value: string) => void;
	sorting?: SortingState;
	onSortingChange?: OnChangeFn<SortingState>;
	columnFilters?: ColumnFiltersState;
	onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
	rowSelection?: RowSelectionState;
	onRowSelectionChange?: OnChangeFn<RowSelectionState>;
	getRowId?: (row: TData) => string;
	enableRowSelection?: boolean;
	enableMultiSelection?: boolean;
	enableSubRowSelection?: boolean;
	enableSelectAll?: boolean;
	onSelectAll?: (selected: boolean) => void;
	selectAllChecked?: boolean;
	selectAllIndeterminate?: boolean;
}

export function VirtualTable<TData>({
	data,
	columns,
	height = 400,
	rowHeight = 50,
	className,
	enableVirtualization = true,
	threshold = 1000,
	onRowClick,
	onRowDoubleClick,
	selectedRows = new Set(),
	onRowSelect,
	loading = false,
	emptyState,
	headerSticky = true,
	overscan = 5,
	enableSorting = true,
	enableFiltering = true,
	enableSelection = false,
	enableMultiRowSelection = false,
	globalFilter,
	onGlobalFilterChange,
	sorting = [],
	onSortingChange,
	columnFilters = [],
	onColumnFiltersChange,
	rowSelection = {},
	onRowSelectionChange,
	getRowId,
	enableRowSelection = false,
	enableMultiSelection = false,
	enableSubRowSelection = false,
	enableSelectAll = false,
	onSelectAll,
	selectAllChecked = false,
	selectAllIndeterminate = false,
}: VirtualTableProps<TData>) {
	const parentRef = useRef<HTMLDivElement>(null);
	const [isClient, setIsClient] = useState(false);

	// Ensure we're on the client side for virtualization
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Determine if we should use virtualization
	const shouldVirtualize =
		enableVirtualization && data.length >= threshold && isClient;

	// Table configuration
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
		getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
		enableSorting,
		enableFilters: enableFiltering,
		enableRowSelection,
		enableMultiRowSelection,
		enableSubRowSelection,
		getRowId,
		state: {
			sorting,
			columnFilters,
			rowSelection,
			globalFilter,
		},
		onSortingChange,
		onColumnFiltersChange,
		onRowSelectionChange,
		onGlobalFilterChange,
	});

	// Virtual scrolling setup
	const virtualizer = useVirtualizer({
		count: data.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => rowHeight,
		overscan,
	});

	// Memoized row renderer for virtual scrolling
	const renderVirtualRow = useCallback(
		({ index, style }: { index: number; style: React.CSSProperties }) => {
			const row = table.getRowModel().rows[index];
			if (!row) return null;

			const isSelected = selectedRows.has(row.id);

			const handleSelect = (selected: boolean) => {
				onRowSelect?.(row.id, selected);
			};

			const handleClick = () => {
				onRowClick?.(row);
			};

			const handleDoubleClick = () => {
				onRowDoubleClick?.(row);
			};

			return (
				<div
					style={style}
					key={row.id}
					className={cn(
						"flex items-center border-b border-gray-200 dark:border-gray-700",
						"cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
						isSelected && "bg-blue-50 dark:bg-blue-900/20"
					)}
					onClick={handleClick}
					onDoubleClick={handleDoubleClick}
				>
					{row.getVisibleCells().map((cell) => (
						<div
							key={cell.id}
							className='flex-1 px-4 py-3'
							style={{ minWidth: "150px" }}
						>
							{flexRender(cell.column.columnDef.cell, cell.getContext())}
						</div>
					))}
				</div>
			);
		},
		[table, selectedRows, onRowClick, onRowDoubleClick, onRowSelect]
	);

	// Loading state
	if (loading) {
		return (
			<div className={cn("flex h-32 items-center justify-center", className)}>
				<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100'></div>
			</div>
		);
	}

	// Empty state
	if (data.length === 0) {
		return (
			<div
				className={cn(
					"flex h-32 items-center justify-center text-gray-500",
					className
				)}
			>
				{emptyState || "No data available"}
			</div>
		);
	}

	// Non-virtualized table for small datasets
	if (!shouldVirtualize) {
		return (
			<div
				className={cn(
					"rounded-md border border-gray-200 dark:border-gray-700",
					className
				)}
			>
				<Table>
					<TableHeader
						className={cn(
							headerSticky && "sticky top-0 z-10 bg-white dark:bg-gray-900"
						)}
					>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => {
								const isSelected = selectedRows.has(row.id);
								return (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										className={cn(
											"cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
											isSelected && "bg-blue-50 dark:bg-blue-900/20"
										)}
										onClick={() => onRowClick?.(row)}
										onDoubleClick={() => onRowDoubleClick?.(row)}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</TableCell>
										))}
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className='h-24 text-center text-gray-500 dark:text-gray-400'
								>
									No results found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		);
	}

	// Virtualized table for large datasets
	return (
		<div
			className={cn(
				"rounded-md border border-gray-200 dark:border-gray-700",
				className
			)}
		>
			{/* Header */}
			<div
				className={cn(
					"border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
					headerSticky && "sticky top-0 z-10"
				)}
			>
				<div className='flex'>
					{table.getHeaderGroups().map((headerGroup) =>
						headerGroup.headers.map((header) => (
							<div
								key={header.id}
								className='flex-1 px-4 py-3 font-medium text-gray-900 dark:text-gray-100'
								style={{ minWidth: "150px" }}
							>
								{header.isPlaceholder
									? null
									: flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
							</div>
						))
					)}
				</div>
			</div>

			{/* Virtualized Body */}
			<div
				ref={parentRef}
				className='overflow-auto'
				style={{
					height: `${height}px`,
				}}
			>
				<div
					style={{
						height: `${virtualizer.getTotalSize()}px`,
						width: "100%",
						position: "relative",
					}}
				>
					{virtualizer.getVirtualItems().map((virtualItem) => (
						<div
							key={virtualItem.key}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: `${virtualItem.size}px`,
								transform: `translateY(${virtualItem.start}px)`,
							}}
						>
							{renderVirtualRow({
								index: virtualItem.index,
								style: {},
							})}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default VirtualTable;
