"use client";

import React, { useState } from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Checkbox from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Icon } from "../Icon";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface FilterOption {
	label: string;
	value: string;
	count?: number;
}

interface AdvancedFiltersProps<TData> {
	table: Table<TData>;
	onFiltersChange?: (filters: Record<string, any>) => void;
}

export function DataTableAdvancedFilters<TData>({
	table,
	onFiltersChange,
}: AdvancedFiltersProps<TData>) {
	const [isOpen, setIsOpen] = useState(false);
	const [filters, setFilters] = useState<Record<string, any>>({});

	// Get unique values for filter options
	const getUniqueValues = (columnId: string): FilterOption[] => {
		const column = table.getColumn(columnId);
		if (!column) return [];

		const uniqueValues = new Set<string>();
		table.getRowModel().rows.forEach((row) => {
			const value = row.getValue(columnId);
			if (value !== null && value !== undefined) {
				uniqueValues.add(String(value));
			}
		});

		return Array.from(uniqueValues).map((value) => ({
			label: value,
			value,
			count: table.getRowModel().rows.filter((row) => 
				String(row.getValue(columnId)) === value
			).length,
		}));
	};

	// Get numeric range for sliders
	const getNumericRange = (columnId: string): [number, number] => {
		const column = table.getColumn(columnId);
		if (!column) return [0, 100];

		const values = table.getRowModel().rows
			.map((row) => {
				const value = row.getValue(columnId);
				return typeof value === 'number' ? value : 0;
			})
			.filter((value) => !isNaN(value));

		if (values.length === 0) return [0, 100];
		
		const min = Math.min(...values);
		const max = Math.max(...values);
		return [min, max];
	};

	const handleFilterChange = (key: string, value: any) => {
		const newFilters = { ...filters, [key]: value };
		setFilters(newFilters);
		
		// Apply filters to table
		table.getColumn(key)?.setFilterValue(value);
		
		// Notify parent component
		onFiltersChange?.(newFilters);
	};

	const handleRangeFilter = (columnId: string, range: [number, number]) => {
		handleFilterChange(columnId, range);
	};

	const handleMultiSelectFilter = (columnId: string, selectedValues: string[]) => {
		handleFilterChange(columnId, selectedValues.length > 0 ? selectedValues : undefined);
	};

	const handleDateRangeFilter = (columnId: string, dateRange: DateRange) => {
		handleFilterChange(columnId, dateRange);
	};

	const clearAllFilters = () => {
		const newFilters: Record<string, any> = {};
		Object.keys(filters).forEach((key) => {
			table.getColumn(key)?.setFilterValue(undefined);
		});
		setFilters(newFilters);
		onFiltersChange?.(newFilters);
	};

	const getActiveFiltersCount = () => {
		return Object.values(filters).filter((value) => 
			value !== undefined && 
			value !== null && 
			!(Array.isArray(value) && value.length === 0)
		).length;
	};

	const activeFiltersCount = getActiveFiltersCount();

	return (
		<div className="space-y-4">
			<Button
				variant="secondary"
				size="sm"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2"
				aria-expanded={isOpen}
				aria-controls="advanced-filters"
			>
				<Icon name="Filter" className="h-4 w-4" />
				Advanced Filters
				{activeFiltersCount > 0 && (
					<Badge variant="secondary" className="ml-1">
						{activeFiltersCount}
					</Badge>
				)}
			</Button>

			{isOpen && (
				<div
					id="advanced-filters"
					className="border rounded-lg p-4 space-y-6 bg-white dark:bg-gray-900"
					role="region"
					aria-label="Advanced filtering options"
				>
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">Advanced Filters</h3>
						<Button
							variant="ghost"
							size="sm"
							onClick={clearAllFilters}
							disabled={activeFiltersCount === 0}
						>
							Clear All
						</Button>
					</div>

					{/* Price Range Filter */}
					<div className="space-y-3">
						<Label className="text-sm font-medium">Price Range</Label>
						<PriceRangeFilter
							table={table}
							onRangeChange={(range) => handleRangeFilter('price', range)}
							currentRange={filters.price || getNumericRange('price')}
						/>
					</div>

					{/* Brand Filter */}
					<div className="space-y-3">
						<Label className="text-sm font-medium">Brand</Label>
						<MultiSelectFilter
							options={getUniqueValues('brand')}
							selectedValues={filters.brand || []}
							onSelectionChange={(values) => handleMultiSelectFilter('brand', values)}
							placeholder="Select brands..."
						/>
					</div>

					{/* Status Filter */}
					<div className="space-y-3">
						<Label className="text-sm font-medium">Status</Label>
						<MultiSelectFilter
							options={getUniqueValues('status')}
							selectedValues={filters.status || []}
							onSelectionChange={(values) => handleMultiSelectFilter('status', values)}
							placeholder="Select status..."
						/>
					</div>

					{/* Currency Filter */}
					<div className="space-y-3">
						<Label className="text-sm font-medium">Currency</Label>
						<Select
							value={filters.currency || "all"}
							onValueChange={(value) => handleFilterChange('currency', value === "all" ? undefined : value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select currency..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Currencies</SelectItem>
								{getUniqueValues('currency').map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label} ({option.count})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Date Range Filter */}
					<div className="space-y-3">
						<Label className="text-sm font-medium">Date Range</Label>
						<DateRangeFilter
							onDateRangeChange={(dateRange) => handleDateRangeFilter('createdAt', dateRange)}
							currentRange={filters.createdAt || { from: undefined, to: undefined }}
						/>
					</div>
				</div>
			)}
		</div>
	);
}

// Price Range Filter Component
interface PriceRangeFilterProps {
	table: Table<any>;
	onRangeChange: (range: [number, number]) => void;
	currentRange: [number, number];
}

function PriceRangeFilter({ table, onRangeChange, currentRange }: PriceRangeFilterProps) {
	const numericRange = React.useMemo(() => {
		const column = table.getColumn('price');
		if (!column) return [0, 1000];

		const values = table.getRowModel().rows
			.map((row) => {
				const value = row.getValue('price');
				return typeof value === 'number' ? value : 0;
			})
			.filter((value) => !isNaN(value));

		if (values.length === 0) return [0, 1000];
		
		const min = Math.min(...values);
		const max = Math.max(...values);
		return [min, max];
	}, [table]);

	const handleRangeChange = (newRange: [number, number]) => {
		onRangeChange(newRange);
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
				<span>€{currentRange[0].toFixed(2)}</span>
				<span>€{currentRange[1].toFixed(2)}</span>
			</div>
			<Slider
				value={currentRange}
				onValueChange={handleRangeChange}
				min={numericRange[0]}
				max={numericRange[1]}
				step={0.01}
				className="w-full"
				aria-label="Price range filter"
			/>
		</div>
	);
}

// Multi-Select Filter Component
interface MultiSelectFilterProps {
	options: FilterOption[];
	selectedValues: string[];
	onSelectionChange: (values: string[]) => void;
	placeholder: string;
}

function MultiSelectFilter({ options, selectedValues, onSelectionChange, placeholder }: MultiSelectFilterProps) {
	const [isOpen, setIsOpen] = useState(false);

	const handleToggle = (value: string) => {
		const newSelection = selectedValues.includes(value)
			? selectedValues.filter((v) => v !== value)
			: [...selectedValues, value];
		onSelectionChange(newSelection);
	};

	const handleClear = () => {
		onSelectionChange([]);
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="secondary"
					role="combobox"
					aria-expanded={isOpen}
					className="w-full justify-between"
				>
					{selectedValues.length > 0 ? (
						<div className="flex flex-wrap gap-1">
							{selectedValues.slice(0, 2).map((value) => (
								<Badge key={value} variant="secondary" className="text-xs">
									{value}
								</Badge>
							))}
							{selectedValues.length > 2 && (
								<Badge variant="secondary" className="text-xs">
									+{selectedValues.length - 2} more
								</Badge>
							)}
						</div>
					) : (
						placeholder
					)}
					<Icon name="ChevronDown" className="h-4 w-4 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0" align="start">
				<div className="max-h-60 overflow-auto">
					<div className="p-2 border-b">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Select options</span>
							{selectedValues.length > 0 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={handleClear}
									className="h-6 px-2 text-xs"
								>
									Clear
								</Button>
							)}
						</div>
					</div>
					<div className="p-1">
						{options.map((option) => (
							<div
								key={option.value}
								className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
								onClick={() => handleToggle(option.value)}
							>
								<Checkbox
									checked={selectedValues.includes(option.value)}
									onChange={() => handleToggle(option.value)}
									ariaLabel={`Select ${option.label}`}
								/>
								<Label className="flex-1 cursor-pointer">
									{option.label}
									{option.count !== undefined && (
										<span className="ml-2 text-xs text-gray-500">
											({option.count})
										</span>
									)}
								</Label>
							</div>
						))}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

// Date Range Filter Component
interface DateRangeFilterProps {
	onDateRangeChange: (dateRange: DateRange) => void;
	currentRange: DateRange;
}

function DateRangeFilter({ onDateRangeChange, currentRange }: DateRangeFilterProps) {
	const [isOpen, setIsOpen] = useState(false);

	const handleDateSelect = (range: DateRange | undefined) => {
		const newRange = range || { from: undefined, to: undefined };
		onDateRangeChange(newRange);
	};

	const formatDateRange = () => {
		if (!currentRange.from) return "Select date range...";
		if (!currentRange.to) return format(currentRange.from, "MMM dd, yyyy");
		return `${format(currentRange.from, "MMM dd")} - ${format(currentRange.to, "MMM dd, yyyy")}`;
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="secondary"
					role="combobox"
					aria-expanded={isOpen}
					className="w-full justify-between"
				>
					{formatDateRange()}
					<Icon name="Calendar" className="h-4 w-4 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="range"
					selected={currentRange}
					onSelect={handleDateSelect}
					numberOfMonths={2}
					className="rounded-md border"
				/>
			</PopoverContent>
		</Popover>
	);
}
