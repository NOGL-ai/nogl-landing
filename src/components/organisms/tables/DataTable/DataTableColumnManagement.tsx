"use client";

import React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "../Icon";

interface DataTableColumnManagementProps<TData> {
	table: Table<TData>;
}

export function DataTableColumnManagement<TData>({
	table,
}: DataTableColumnManagementProps<TData>) {
	const visibleColumns = table.getAllColumns().filter((column) => column.getIsVisible());
	const hiddenColumns = table.getAllColumns().filter((column) => !column.getIsVisible());

	return (
		<div className="flex items-center space-x-2">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="secondary"
						className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
						aria-label="Manage table columns"
					>
						<Icon name="Columns" className="mr-2 h-4 w-4" aria-hidden={true} />
						Columns
						<Icon name="ChevronDown" className="ml-2 h-4 w-4" aria-hidden={true} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent 
					align="end"
					className="w-48"
					role="menu"
					aria-label="Column visibility options"
				>
					{/* Show all columns */}
					<DropdownMenuCheckboxItem
						checked={hiddenColumns.length === 0}
						onCheckedChange={(value) => {
							if (value) {
								table.getAllColumns().forEach((column) => {
									column.toggleVisibility(true);
								});
							}
						}}
						className="capitalize"
						aria-label="Show all columns"
					>
						Show All
					</DropdownMenuCheckboxItem>
					
					{/* Hide all columns */}
					<DropdownMenuCheckboxItem
						checked={visibleColumns.length === 0}
						onCheckedChange={(value) => {
							if (value) {
								table.getAllColumns().forEach((column) => {
									column.toggleVisibility(false);
								});
							}
						}}
						className="capitalize"
						aria-label="Hide all columns"
					>
						Hide All
					</DropdownMenuCheckboxItem>

					{/* Separator */}
					<div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

					{/* Individual columns */}
					{table
						.getAllColumns()
						.filter((column) => column.getCanHide())
						.map((column) => {
							return (
								<DropdownMenuCheckboxItem
									key={column.id}
									className="capitalize"
									checked={column.getIsVisible()}
									onCheckedChange={(value) => column.toggleVisibility(!!value)}
									aria-label={`${column.getIsVisible() ? 'Hide' : 'Show'} ${column.id} column`}
								>
									{column.id}
								</DropdownMenuCheckboxItem>
							);
						})}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Column count indicator */}
			<div className="text-xs text-gray-500 dark:text-gray-400">
				{visibleColumns.length} of {table.getAllColumns().length} columns
			</div>
		</div>
	);
}
