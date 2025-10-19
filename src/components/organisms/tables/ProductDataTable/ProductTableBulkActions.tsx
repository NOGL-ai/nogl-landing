"use client";

import React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "../Icon";
// Define Product interface locally to avoid circular dependency
interface Product {
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
		id: string;
		name: string;
		cheapest: number;
		avg: number;
		highest: number;
		cheapestColor: string;
	}[];
	category: {
		name: string;
		slug: string;
	};
	status: "ACTIVE" | "INACTIVE" | "DRAFT" | "ARCHIVED";
	featured: boolean;
	triggeredRule: string;
	createdAt: string;
	updatedAt: string;
}

interface ProductTableBulkActionsProps {
	table: Table<Product>;
	selectedRows: Product[];
	onExport?: (products: Product[]) => void;
	onBulkEdit?: (products: Product[]) => void;
	onBulkDelete?: (products: Product[]) => void;
}

export function ProductTableBulkActions({
	table,
	selectedRows,
	onExport,
	onBulkEdit,
	onBulkDelete,
}: ProductTableBulkActionsProps) {
	const selectedCount = selectedRows.length;
	const totalRows = table.getFilteredRowModel().rows.length;

	if (selectedCount === 0) {
		return null;
	}

	const handleExport = () => {
		if (onExport) {
			onExport(selectedRows);
		} else {
			// Default export behavior
			const csvContent = [
				["Name", "SKU", "Price", "Brand", "Status"],
				...selectedRows.map(product => [
					product.name,
					product.sku,
					product.price,
					product.brand.name,
					product.triggeredRule
				])
			].map(row => row.join(",")).join("\n");
			
			const blob = new Blob([csvContent], { type: "text/csv" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}
	};

	const handleBulkEdit = () => {
		if (onBulkEdit) {
			onBulkEdit(selectedRows);
		} else {
			console.log("Bulk edit products:", selectedRows.map(p => p.id));
		}
	};

	const handleBulkDelete = () => {
		if (onBulkDelete) {
			onBulkDelete(selectedRows);
		} else {
			if (confirm(`Are you sure you want to delete ${selectedCount} product(s)?`)) {
				console.log("Bulk delete products:", selectedRows.map(p => p.id));
			}
		}
	};

	return (
		<div 
			className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"
			role="region"
			aria-label="Bulk actions for selected products"
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Icon 
						name="CheckCircle" 
						className="h-4 w-4 text-blue-600 dark:text-blue-400" 
						aria-hidden={true}
					/>
					<span className="text-sm font-medium text-blue-800 dark:text-blue-200">
						{selectedCount} product{selectedCount !== 1 ? "s" : ""} selected
					</span>
					<Badge
						variant="secondary"
						className="text-xs"
						aria-label={`${selectedCount} of ${totalRows} total products selected`}
					>
						{selectedCount} of {totalRows}
					</Badge>
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="secondary"
						size="sm"
						onClick={handleExport}
						className="border-border text-secondary hover:bg-secondary_bg dark:border-border dark:text-tertiary dark:hover:bg-gray-700"
						aria-label={`Export ${selectedCount} selected products`}
					>
						<Icon name="Download" className="mr-2 h-4 w-4" aria-hidden={true} />
						Export
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onClick={handleBulkEdit}
						className="border-border text-secondary hover:bg-secondary_bg dark:border-border dark:text-tertiary dark:hover:bg-gray-700"
						aria-label={`Edit ${selectedCount} selected products`}
					>
						<Icon name="Edit" className="mr-2 h-4 w-4" aria-hidden={true} />
						Bulk Edit
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onClick={handleBulkDelete}
						className="border-border text-secondary hover:bg-secondary_bg dark:border-border dark:text-tertiary dark:hover:bg-gray-700"
						aria-label={`Delete ${selectedCount} selected products`}
					>
						<Icon name="Trash2" className="mr-2 h-4 w-4" aria-hidden={true} />
						Delete
					</Button>
				</div>
			</div>
		</div>
	);
}
