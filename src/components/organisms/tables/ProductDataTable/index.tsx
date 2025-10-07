"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../DataTable";
import { ProductTableColumns } from "./ProductTableColumns";
import { ProductTableFilters } from "./ProductTableFilters";
import { ProductTableAdvancedFilters } from "./ProductTableAdvancedFilters";
import { ProductTableBulkActions } from "./ProductTableBulkActions";
import { DataTableGlobalSearch } from "../DataTable/DataTableGlobalSearch";
import { DataTableColumnManagement } from "../DataTable/DataTableColumnManagement";
import { Button } from "@/components/ui/button";
import { Icon } from "../Icon";

export interface Product {
	id: string;
	name: string;
	sku: string;
	image: string;
	productUrl?: string;
	cost: string;
	price: string;
	currency?: string;
	minPrice: string;
	maxPrice: string;
	brand: {
		name: string;
		logo: string | null;
	};
	competitors: {
		cheapest: string;
		avg: string;
		highest: string;
		cheapestColor: "green" | "red" | "gray";
	};
	triggeredRule: string;
	channel?: string;
	category?: string;
	status?: "active" | "inactive" | "draft";
	featured?: boolean;
	margin?: number;
	stock?: number;
	lastUpdated?: string;
}

interface ProductDataTableProps {
	products: Product[];
	enableInfiniteScroll?: boolean;
	onInfiniteScrollToggle?: (enabled: boolean) => void;
	infiniteScrollProps?: unknown;
	variant?: "default" | "untitled-ui";
	tableTitle?: string;
	tableBadge?: React.ReactNode;
	tableDescription?: string;
}

export function ProductDataTable({
	products,
	enableInfiniteScroll = false,
	onInfiniteScrollToggle,
	infiniteScrollProps,
	variant = "untitled-ui",
	tableTitle,
	tableBadge,
	tableDescription,
}: ProductDataTableProps) {
	const columns = useMemo(() => ProductTableColumns(products, { variant }), [products, variant]);
	const [viewMode, setViewMode] = useState<"table" | "grid">("table");
	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
	const [filters, setFilters] = useState<any>({});
	const [selectedRows, setSelectedRows] = useState<Product[]>([]);
	const [tableInstance, setTableInstance] = useState<any>(null);

	const handleFiltersChange = (newFilters: any) => {
		setFilters(newFilters);
	};

	const handleExport = (products: Product[]) => {
		console.log("Export products:", products);
		// Implementation would go here
	};

	const handleBulkEdit = (products: Product[]) => {
		console.log("Bulk edit products:", products);
		// Implementation would go here
	};

	const handleBulkDelete = (products: Product[]) => {
		console.log("Bulk delete products:", products);
		// Implementation would go here
	};

	return (
		<div 
			className="space-y-4"
			role="region"
			aria-label="Product data table with filtering and sorting capabilities"
		>
			{/* Header Controls */}
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center">
					{/* Global search is now handled by DataTable component */}
					
					<div className="flex w-full items-center gap-2 sm:w-auto">
						<Button
							variant="secondary"
							onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
							className="relative flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 sm:flex-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
							aria-label={`Advanced filters. ${showAdvancedFilters ? 'Open' : 'Closed'}`}
						>
							<Icon name="Filter" className="mr-2 h-4 w-4" aria-hidden={true} />
							Advanced Filters
						</Button>
					</div>
				</div>

				<div className="flex w-full items-center gap-2 sm:w-auto">
					{/* View Mode Toggle */}
					<div className="flex items-center space-x-1">
						<Button
							variant={viewMode === "table" ? "primary" : "secondary"}
							size="sm"
							onClick={() => setViewMode("table")}
							className={
								viewMode === "table"
									? ""
									: "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
							}
							aria-label="Switch to table view"
						>
							<Icon name="List" className="h-4 w-4" aria-hidden={true} />
						</Button>
						<Button
							variant={viewMode === "grid" ? "primary" : "secondary"}
							size="sm"
							onClick={() => setViewMode("grid")}
							className={
								viewMode === "grid"
									? ""
									: "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
							}
							aria-label="Switch to grid view"
						>
							<Icon name="Grid01" className="h-4 w-4" aria-hidden={true} />
						</Button>
					</div>

					{/* Column Management is now handled by DataTable component */}
				</div>
			</div>

			{/* Advanced Filters */}
			{showAdvancedFilters && (
				<ProductTableAdvancedFilters
					table={tableInstance}
					onFiltersChange={handleFiltersChange}
				/>
			)}

			{/* Quick Filters */}
			<ProductTableFilters />

			{/* Bulk Actions */}
			{selectedRows.length > 0 && (
				<ProductTableBulkActions
					table={tableInstance}
					selectedRows={selectedRows}
					onExport={handleExport}
					onBulkEdit={handleBulkEdit}
					onBulkDelete={handleBulkDelete}
				/>
			)}

			{/* Data Table */}
			<DataTable
				columns={columns}
				data={products}
				searchKey="name"
				searchPlaceholder="Search products by name..."
				enablePagination={true}
				enableSorting={true}
				enableFiltering={true}
				enableSelection={true}
				enableGlobalSearch={true}
				enableColumnManagement={true}
				enableColumnResizing={true}
				enableColumnReordering={true}
				pageSize={20}
				onRowSelectionChange={setSelectedRows}
				variant={variant === 'untitled-ui' ? 'untitled-ui' : 'default'}
			/>
		</div>
	);
}
