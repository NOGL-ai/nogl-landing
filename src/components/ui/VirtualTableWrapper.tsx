"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface VirtualTableWrapperProps {
	data: any[];
	columns: any[];
	height?: number;
	rowHeight?: number;
	className?: string;
	enableVirtualization?: boolean;
	threshold?: number; // Minimum number of rows to enable virtualization
	onRowClick?: (row: any, index: number) => void;
	onRowDoubleClick?: (row: any, index: number) => void;
	selectedRows?: Set<number>;
	onRowSelect?: (index: number, selected: boolean) => void;
	renderRow?: (props: {
		row: any;
		index: number;
		style: React.CSSProperties;
		isSelected: boolean;
		onSelect: (selected: boolean) => void;
	}) => React.ReactNode;
	loading?: boolean;
	emptyState?: React.ReactNode;
	headerSticky?: boolean;
	overscan?: number; // Number of items to render outside of the visible area
}

export const VirtualTableWrapper: React.FC<VirtualTableWrapperProps> = ({
	data,
	columns,
	height = 400,
	rowHeight = 50,
	className,
	enableVirtualization = true,
	threshold = 1000, // Default threshold of 1000 rows
	onRowClick,
	onRowDoubleClick,
	selectedRows = new Set(),
	onRowSelect,
	renderRow,
	loading = false,
	emptyState,
	headerSticky = true,
	overscan = 5,
}) => {
	const parentRef = useRef<HTMLDivElement>(null);
	const [isClient, setIsClient] = useState(false);

	// Ensure we're on the client side for virtualization
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Determine if we should use virtualization
	const shouldVirtualize =
		enableVirtualization && data.length >= threshold && isClient;

	// Virtual scrolling setup
	const virtualizer = useVirtualizer({
		count: data.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => rowHeight,
		overscan,
	});

	// Memoized row renderer
	const renderVirtualRow = useMemo(() => {
		if (!shouldVirtualize) return null;

		return ({
			index,
			style,
		}: {
			index: number;
			style: React.CSSProperties;
		}) => {
			const row = data[index];
			const isSelected = selectedRows.has(index);

			const handleSelect = (selected: boolean) => {
				onRowSelect?.(index, selected);
			};

			const handleClick = () => {
				onRowClick?.(row, index);
			};

			const handleDoubleClick = () => {
				onRowDoubleClick?.(row, index);
			};

			if (renderRow) {
				return (
					<div style={style} key={index}>
						{renderRow({
							row,
							index,
							style,
							isSelected,
							onSelect: handleSelect,
						})}
					</div>
				);
			}

			return (
				<div
					style={style}
					key={index}
					className={cn(
						"flex items-center border-b border-gray-200 dark:border-gray-700",
						"cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
						isSelected && "bg-blue-50 dark:bg-blue-900/20"
					)}
					onClick={handleClick}
					onDoubleClick={handleDoubleClick}
				>
					{columns.map((column, colIndex) => (
						<div
							key={colIndex}
							className='flex-1 px-4 py-3'
							style={{ minWidth: column.minWidth || "150px" }}
						>
							{column.cell
								? column.cell({ row, index })
								: row[column.accessorKey]}
						</div>
					))}
				</div>
			);
		};
	}, [
		data,
		columns,
		selectedRows,
		onRowClick,
		onRowDoubleClick,
		onRowSelect,
		renderRow,
		shouldVirtualize,
	]);

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
						<TableRow>
							{columns.map((column, index) => (
								<TableHead
									key={index}
									style={{ minWidth: column.minWidth || "150px" }}
								>
									{column.header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((row, index) => {
							const isSelected = selectedRows.has(index);
							return (
								<TableRow
									key={index}
									className={cn(
										"cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
										isSelected && "bg-blue-50 dark:bg-blue-900/20"
									)}
									onClick={() => onRowClick?.(row, index)}
									onDoubleClick={() => onRowDoubleClick?.(row, index)}
								>
									{columns.map((column, colIndex) => (
										<TableCell key={colIndex}>
											{column.cell
												? column.cell({ row, index })
												: row[column.accessorKey]}
										</TableCell>
									))}
								</TableRow>
							);
						})}
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
					{columns.map((column, index) => (
						<div
							key={index}
							className='flex-1 px-4 py-3 font-medium text-gray-900 dark:text-gray-100'
							style={{ minWidth: column.minWidth || "150px" }}
						>
							{column.header}
						</div>
					))}
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
					{virtualizer.getVirtualItems().map((virtualItem) => {
						const RowComponent = renderVirtualRow!;
						return (
							<RowComponent
								key={virtualItem.key}
								index={virtualItem.index}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: `${virtualItem.size}px`,
									transform: `translateY(${virtualItem.start}px)`,
								}}
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default VirtualTableWrapper;
