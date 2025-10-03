/**
 * UNUSED FILE - TABLE COMPONENT
 *
 * This is an advanced virtual table component with big data capabilities.
 * It's not currently used in the main application but provides a complete
 * table solution for handling large datasets.
 *
 * Features:
 * - Virtual scrolling for performance
 * - Infinite data loading
 * - Server-side operations (sorting, filtering, pagination)
 * - Performance monitoring
 * - Memory optimization
 * - Advanced caching
 *
 * This component requires TanStack Table, TanStack Virtual, and React Query
 * dependencies which are already installed in package.json.
 *
 * To use this component:
 * 1. Import it in your page/component
 * 2. Set up the required data fetching functions
 * 3. Configure the API endpoints
 *
 * Created: [Date when this was added]
 * Status: Unused - not integrated into main app
 */

"use client";

import React, {
	useRef,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	Row,
	SortingState,
	OnChangeFn,
	RowSelectionState,
} from "@tanstack/react-table";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { InfiniteScrollTableProps } from "@/types/infiniteTable";
import { createScrollHandler } from "@/utils/infiniteScrollUtils";
import { PerformanceMonitor } from "@/utils/bigDataUtils";
import { cn } from "@/lib/utils";

interface AdvancedVirtualTableProps<TData>
	extends InfiniteScrollTableProps<TData> {
	// Enhanced virtualization options
	estimatedRowHeight?: number;
	dynamicRowHeight?: boolean;
	rowHeightBuffer?: number;

	// Performance options
	enablePerformanceMonitoring?: boolean;
	enableMemoryOptimization?: boolean;

	// Advanced scrolling
	scrollToIndex?: number;
	onScrollToIndex?: (index: number) => void;

	// Row virtualization
	enableRowVirtualization?: boolean;
	rowOverscan?: number;

	// Column virtualization
	enableColumnVirtualization?: boolean;
	columnOverscan?: number;
	estimatedColumnWidth?: number;
}

export function AdvancedVirtualTable<TData>({
	queryKey,
	queryFn,
	fetchSize = 50,
	columns,
	height = 600,
	rowHeight = 50,
	className,
	enableVirtualization = true,
	overscan = 5,
	threshold = 500,
	enableSorting = true,
	sorting = [],
	onSortingChange,
	loading = false,
	emptyState,
	onRowClick,
	onRowDoubleClick,
	enableSelection = false,
	selectedRows = new Set(),
	onRowSelect,
	enableMemoization = true,
	rowKeyExtractor = (row: TData, index: number) => `row-${index}`,

	// Enhanced props
	estimatedRowHeight = 50,
	dynamicRowHeight = true,
	rowHeightBuffer = 10,
	enablePerformanceMonitoring = false,
	enableMemoryOptimization = true,
	scrollToIndex,
	onScrollToIndex,
	enableRowVirtualization = true,
	rowOverscan = 5,
	enableColumnVirtualization = false,
	columnOverscan = 2,
	estimatedColumnWidth = 150,
}: AdvancedVirtualTableProps<TData>) {
	const tableContainerRef = useRef<HTMLDivElement>(null);
	const [rowHeights, setRowHeights] = useState<Map<number, number>>(new Map());
	const [isScrolling, setIsScrolling] = useState(false);

	// Performance monitoring
	const performanceMonitor = useMemo(() => {
		if (!enablePerformanceMonitoring) return null;
		return PerformanceMonitor;
	}, [enablePerformanceMonitoring]);

	// Use infinite scroll hook for data fetching
	const {
		data: flatData,
		totalRowCount,
		totalFetched,
		hasNextPage,
		isLoading,
		isFetching,
		isFetchingNextPage,
		error,
		fetchNextPage,
	} = useInfiniteScroll({
		queryKey,
		queryFn,
		fetchSize,
	});

	// Table configuration with enhanced options
	const table = useReactTable({
		data: flatData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
		enableSorting,
		manualSorting: true,
		enableRowSelection: enableSelection,
		state: {
			sorting,
			rowSelection: selectedRows as unknown as RowSelectionState,
		},
		onSortingChange,
		onRowSelectionChange:
			onRowSelect as unknown as OnChangeFn<RowSelectionState>,
		// Enhanced column sizing
		columnResizeMode: "onChange",
		enableColumnResizing: true,
		// Performance optimizations
		enableMultiRowSelection: true,
		enableSubRowSelection: false,
	});

	// Dynamic row height calculation
	const getRowHeight = useCallback(
		(index: number): number => {
			if (dynamicRowHeight && rowHeights.has(index)) {
				return rowHeights.get(index)! + rowHeightBuffer;
			}
			return estimatedRowHeight;
		},
		[dynamicRowHeight, rowHeights, estimatedRowHeight, rowHeightBuffer]
	);

	// Row virtualization setup
	const rowVirtualizer = useVirtualizer({
		count: flatData.length,
		estimateSize: getRowHeight,
		getScrollElement: () => tableContainerRef.current,
		// Dynamic measurement for better performance
		measureElement:
			dynamicRowHeight &&
			typeof window !== "undefined" &&
			navigator.userAgent.indexOf("Firefox") === -1
				? (element) => {
						if (!element) return estimatedRowHeight;
						const height = element.getBoundingClientRect().height;
						return height + rowHeightBuffer;
					}
				: undefined,
		overscan: rowOverscan,
		// Enhanced scrolling behavior
		scrollMargin: tableContainerRef.current?.offsetTop ?? 0,
	});

	// Column virtualization (if enabled)
	const columnVirtualizer = useVirtualizer({
		count: columns.length,
		estimateSize: () => estimatedColumnWidth,
		getScrollElement: () => tableContainerRef.current,
		horizontal: true,
		overscan: columnOverscan,
	});

	// Enhanced scroll handler with performance monitoring
	const handleScroll = useMemo(() => {
		const baseHandler = createScrollHandler(
			tableContainerRef,
			fetchNextPage,
			isFetching,
			hasNextPage,
			threshold
		);

		return (event: React.UIEvent<HTMLElement>) => {
			if (enablePerformanceMonitoring && performanceMonitor) {
				const endTiming = performanceMonitor.startTiming("scroll-handler");
				baseHandler(event);
				endTiming();
			} else {
				baseHandler(event);
			}

			// Update scrolling state for UI feedback
			setIsScrolling(true);
			setTimeout(() => setIsScrolling(false), 150);
		};
	}, [
		fetchNextPage,
		isFetching,
		hasNextPage,
		threshold,
		enablePerformanceMonitoring,
		performanceMonitor,
	]);

	// Check on mount and after fetch to see if we need to fetch more data
	useEffect(() => {
		if (tableContainerRef.current) {
			const { scrollHeight, scrollTop, clientHeight } =
				tableContainerRef.current;
			if (
				scrollHeight - scrollTop - clientHeight < threshold &&
				!isFetching &&
				hasNextPage
			) {
				fetchNextPage();
			}
		}
	}, [fetchNextPage, isFetching, hasNextPage, threshold, flatData.length]);

	// Scroll to specific index
	useEffect(() => {
		if (scrollToIndex !== undefined && rowVirtualizer) {
			rowVirtualizer.scrollToIndex(scrollToIndex, {
				align: "start",
				behavior: "smooth",
			});
			onScrollToIndex?.(scrollToIndex);
		}
	}, [scrollToIndex, rowVirtualizer, onScrollToIndex]);

	// Scroll to top when sorting changes
	const handleSortingChange: OnChangeFn<SortingState> = useCallback(
		(updater) => {
			onSortingChange?.(updater);
			if (flatData.length > 0) {
				rowVirtualizer.scrollToIndex?.(0);
			}
		},
		[onSortingChange, flatData.length, rowVirtualizer]
	);

	// Update table options
	table.setOptions((prev) => ({
		...prev,
		onSortingChange: handleSortingChange,
	}));

	const { rows } = table.getRowModel();

	// Memoized row renderer with enhanced performance
	const renderRow = useCallback(
		(virtualRow: any) => {
			const row = rows[virtualRow.index] as Row<TData>;
			if (!row) return null;

			const isSelected = selectedRows.has(
				rowKeyExtractor(row.original, virtualRow.index)
			);

			return (
				<tr
					data-index={virtualRow.index}
					ref={(node) => {
						if (dynamicRowHeight && node) {
							const height = node.getBoundingClientRect().height;
							setRowHeights((prev) => {
								const newMap = new Map(prev);
								newMap.set(virtualRow.index, height);
								return newMap;
							});
						}
						rowVirtualizer.measureElement(node);
					}}
					key={rowKeyExtractor(row.original, virtualRow.index)}
					className={cn(
						"flex w-full cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800",
						isSelected && "bg-blue-50 dark:bg-blue-900/20",
						isScrolling && "pointer-events-none" // Disable interactions while scrolling
					)}
					style={{
						position: "absolute",
						transform: `translateY(${virtualRow.start}px)`,
						width: "100%",
						height: virtualRow.size,
					}}
					onClick={() => onRowClick?.(row)}
					onDoubleClick={() => onRowDoubleClick?.(row)}
				>
					{enableColumnVirtualization
						? // Column virtualization
							columnVirtualizer.getVirtualItems().map((virtualColumn) => {
								const cell = row.getVisibleCells()[virtualColumn.index];
								if (!cell) return null;

								return (
									<td
										key={cell.id}
										className='flex items-center px-4 py-2'
										style={{
											position: "absolute",
											left: virtualColumn.start,
											width: virtualColumn.size,
											height: "100%",
										}}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								);
							})
						: // Regular column rendering
							row.getVisibleCells().map((cell) => (
								<td
									key={cell.id}
									className='flex items-center px-4 py-2'
									style={{
										width: cell.column.getSize(),
									}}
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
				</tr>
			);
		},
		[
			rows,
			rowVirtualizer,
			columnVirtualizer,
			rowKeyExtractor,
			selectedRows,
			onRowClick,
			onRowDoubleClick,
			dynamicRowHeight,
			enableColumnVirtualization,
			isScrolling,
		]
	);

	// Memory optimization: Clean up old row heights
	useEffect(() => {
		if (enableMemoryOptimization && rowHeights.size > 1000) {
			const currentIndex = rowVirtualizer.getVirtualItems()[0]?.index || 0;
			const newHeights = new Map();

			// Keep only heights for visible rows and some buffer
			for (
				let i = Math.max(0, currentIndex - 100);
				i < currentIndex + 200;
				i++
			) {
				if (rowHeights.has(i)) {
					newHeights.set(i, rowHeights.get(i)!);
				}
			}

			setRowHeights(newHeights);
		}
	}, [rowHeights, rowVirtualizer, enableMemoryOptimization]);

	if (isLoading) {
		return (
			<div className='flex h-64 items-center justify-center'>
				<div className='text-center'>
					<div className='relative'>
						<div className='h-8 w-8 animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700'></div>
						<div className='border-blue-base absolute left-0 top-0 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent'></div>
					</div>
					<p className='text-text-sub-500 mt-3 font-medium dark:text-gray-400'>
						Loading data...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex h-64 items-center justify-center'>
				<div className='text-center'>
					<div className='bg-red-lighter mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full dark:bg-red-900/20'>
						<svg
							className='text-red-base h-8 w-8'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
							/>
						</svg>
					</div>
					<p className='text-red-base mb-3 font-medium dark:text-red-400'>
						Something went wrong
					</p>
					<p className='text-text-sub-500 mb-4 text-sm dark:text-gray-400'>
						{error.message}
					</p>
					<button
						onClick={() => window.location.reload()}
						className='bg-blue-base hover:bg-primary-dark rounded-lg px-6 py-2 font-medium text-white transition-colors'
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	if (flatData.length === 0 && !isLoading) {
		return (
			<div className='flex h-64 items-center justify-center'>
				{emptyState || (
					<div className='text-center'>
						<p className='text-gray-600 dark:text-gray-400'>
							No data available
						</p>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className='w-full'>
			{/* Enhanced data info with performance metrics */}
			<div className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
				<div className='flex items-center justify-between'>
					<span>
						Showing {totalFetched.toLocaleString()} of{" "}
						{totalRowCount.toLocaleString()} rows
						{isFetchingNextPage && " (Loading more...)"}
					</span>
					{enablePerformanceMonitoring && performanceMonitor && (
						<div className='text-xs text-gray-500'>
							Avg render:{" "}
							{performanceMonitor?.getAverageTime("scroll-handler").toFixed(1)}
							ms
						</div>
					)}
				</div>
			</div>

			{/* Table container with enhanced styling */}
			<div
				ref={tableContainerRef}
				className={cn(
					"relative overflow-auto rounded-lg border border-gray-200 dark:border-gray-700",
					isScrolling && "scroll-smooth",
					className
				)}
				style={{
					height: `${height}px`,
				}}
				onScroll={handleScroll}
			>
				<table className='w-full' style={{ display: "grid" }}>
					{/* Header with column virtualization support */}
					<thead
						className='sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
						style={{
							display: "grid",
						}}
					>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr
								key={headerGroup.id}
								className='flex w-full'
								style={{ display: "flex" }}
							>
								{enableColumnVirtualization
									? columnVirtualizer.getVirtualItems().map((virtualColumn) => {
											const header = headerGroup.headers[virtualColumn.index];
											if (!header) return null;

											return (
												<th
													key={header.id}
													className='flex items-center px-4 py-3 font-medium text-gray-900 dark:text-gray-100'
													style={{
														position: "absolute",
														left: virtualColumn.start,
														width: virtualColumn.size,
													}}
												>
													<div
														className={cn(
															"flex items-center space-x-1",
															header.column.getCanSort() &&
																"cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400"
														)}
														onClick={header.column.getToggleSortingHandler()}
													>
														{flexRender(
															header.column.columnDef.header,
															header.getContext()
														)}
														{{
															asc: " 🔼",
															desc: " 🔽",
														}[header.column.getIsSorted() as string] ?? null}
													</div>
												</th>
											);
										})
									: headerGroup.headers.map((header) => (
											<th
												key={header.id}
												className='flex items-center px-4 py-3 font-medium text-gray-900 dark:text-gray-100'
												style={{
													width: header.getSize(),
												}}
											>
												<div
													className={cn(
														"flex items-center space-x-1",
														header.column.getCanSort() &&
															"cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400"
													)}
													onClick={header.column.getToggleSortingHandler()}
												>
													{flexRender(
														header.column.columnDef.header,
														header.getContext()
													)}
													{{
														asc: " 🔼",
														desc: " 🔽",
													}[header.column.getIsSorted() as string] ?? null}
												</div>
											</th>
										))}
							</tr>
						))}
					</thead>

					{/* Body with enhanced virtualization */}
					<tbody
						className='bg-white dark:bg-gray-900'
						style={{
							display: "grid",
							height: `${rowVirtualizer.getTotalSize()}px`,
							position: "relative",
						}}
					>
						{rowVirtualizer.getVirtualItems().map(renderRow)}
					</tbody>
				</table>
			</div>

			{/* Enhanced loading indicator */}
			{isFetching && (
				<div className='mt-4 text-center'>
					<div className='inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400'>
						<div className='h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600'></div>
						<span>Fetching more data...</span>
						{enablePerformanceMonitoring && performanceMonitor && (
							<span className='text-xs'>
								(
								{performanceMonitor.getAverageTime("scroll-handler").toFixed(1)}
								ms avg)
							</span>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
