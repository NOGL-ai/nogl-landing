"use client";

import React, { useState } from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Icon } from "../Icon";
import { Product } from "./index";

interface ProductTableAdvancedFiltersProps {
	table: Table<Product>;
	onFiltersChange: (filters: FilterState) => void;
}

interface FilterState {
	priceRange: [number, number];
	brands: string[];
	categories: string[];
	status: string[];
	hasCompetitorData: boolean | null;
	featured: boolean | null;
	highMargin: boolean | null;
	currencies: string[];
}

const BRANDS = ["Ellijewelry", "Nenalina", "Kuzzoi", "Stilnest"];
const CATEGORIES = ["Rings", "Necklaces", "Earrings", "Bracelets"];
const STATUS_OPTIONS = ["active", "inactive", "draft"];
const CURRENCIES = ["EUR", "USD", "GBP"];

export function ProductTableAdvancedFilters({ 
	table, 
	onFiltersChange 
}: ProductTableAdvancedFiltersProps) {
	const [filters, setFilters] = useState<FilterState>({
		priceRange: [0, 1000],
		brands: [],
		categories: [],
		status: [],
		hasCompetitorData: null,
		featured: null,
		highMargin: null,
		currencies: [],
	});

	const [isOpen, setIsOpen] = useState(false);

	const handlePriceRangeChange = (value: number[]) => {
		const newFilters = { ...filters, priceRange: value as [number, number] };
		setFilters(newFilters);
		onFiltersChange(newFilters);
		table.getColumn("price")?.setFilterValue(value);
	};

	const handleBrandFilter = (brand: string, checked: boolean) => {
		const newBrands = checked
			? [...filters.brands, brand]
			: filters.brands.filter((b) => b !== brand);
		const newFilters = { ...filters, brands: newBrands };
		setFilters(newFilters);
		onFiltersChange(newFilters);
		table.getColumn("brand")?.setFilterValue(newBrands.length > 0 ? newBrands : undefined);
	};

	const handleCategoryFilter = (category: string, checked: boolean) => {
		const newCategories = checked
			? [...filters.categories, category]
			: filters.categories.filter((c) => c !== category);
		const newFilters = { ...filters, categories: newCategories };
		setFilters(newFilters);
		onFiltersChange(newFilters);
	};

	const handleStatusFilter = (status: string, checked: boolean) => {
		const newStatus = checked
			? [...filters.status, status]
			: filters.status.filter((s) => s !== status);
		const newFilters = { ...filters, status: newStatus };
		setFilters(newFilters);
		onFiltersChange(newFilters);
	};

	const handleCurrencyFilter = (currency: string, checked: boolean) => {
		const newCurrencies = checked
			? [...filters.currencies, currency]
			: filters.currencies.filter((c) => c !== currency);
		const newFilters = { ...filters, currencies: newCurrencies };
		setFilters(newFilters);
		onFiltersChange(newFilters);
		table.getColumn("currency")?.setFilterValue(newCurrencies.length > 0 ? newCurrencies : undefined);
	};

	const clearAllFilters = () => {
		const clearedFilters: FilterState = {
			priceRange: [0, 1000],
			brands: [],
			categories: [],
			status: [],
			hasCompetitorData: null,
			featured: null,
			highMargin: null,
			currencies: [],
		};
		setFilters(clearedFilters);
		onFiltersChange(clearedFilters);
		table.resetColumnFilters();
	};

	const activeFiltersCount = 
		filters.brands.length + 
		filters.categories.length + 
		filters.status.length + 
		filters.currencies.length +
		(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Button
					variant="secondary"
					onClick={() => setIsOpen(!isOpen)}
					className="relative"
					aria-label={`Advanced filters. ${activeFiltersCount > 0 ? `${activeFiltersCount} filters active.` : 'No filters active.'}`}
					aria-expanded={isOpen}
					aria-haspopup="true"
				>
					<Icon name="Filter" className="mr-2 h-4 w-4" aria-hidden={true} />
					Advanced Filters
					{activeFiltersCount > 0 && (
						<Badge
							variant="secondary"
							className="ml-2 flex h-5 w-5 items-center justify-center rounded-full border-blue-200 bg-blue-100 p-0 text-xs text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
							aria-label={`${activeFiltersCount} active filters`}
						>
							{activeFiltersCount}
						</Badge>
					)}
				</Button>

				{activeFiltersCount > 0 && (
					<Button
						variant="ghost"
						onClick={clearAllFilters}
						className="h-8 px-2"
						aria-label="Clear all active filters"
					>
						<Icon name="FilterX" className="mr-2 h-4 w-4" aria-hidden={true} />
						Clear All
					</Button>
				)}
			</div>

			{isOpen && (
				<div 
					className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
					role="region"
					aria-label="Advanced filter options"
				>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						{/* Price Range Filter */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-900 dark:text-gray-100">
								Price Range
							</label>
							<div className="px-3">
								<Slider
									value={filters.priceRange}
									onValueChange={handlePriceRangeChange}
									max={1000}
									min={0}
									step={10}
									className="w-full"
									aria-label="Price range filter"
								/>
								<div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
									<span>€{filters.priceRange[0]}</span>
									<span>€{filters.priceRange[1]}</span>
								</div>
							</div>
						</div>

						{/* Brand Filter */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-900 dark:text-gray-100">
								Brands
							</label>
							<div className="space-y-1">
								{BRANDS.map((brand) => (
									<div key={brand} className="flex items-center space-x-2">
										<Checkbox
											id={`brand-${brand}`}
											checked={filters.brands.includes(brand)}
											onChange={(checked: boolean) =>
												handleBrandFilter(brand, !!checked)
											}
											ariaLabel={`Filter by ${brand} brand`}
										/>
										<label
											htmlFor={`brand-${brand}`}
											className="text-sm text-gray-700 dark:text-gray-300"
										>
											{brand}
										</label>
									</div>
								))}
							</div>
						</div>

						{/* Currency Filter */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-900 dark:text-gray-100">
								Currency
							</label>
							<div className="space-y-1">
								{CURRENCIES.map((currency) => (
									<div key={currency} className="flex items-center space-x-2">
										<Checkbox
											id={`currency-${currency}`}
											checked={filters.currencies.includes(currency)}
											onChange={(checked: boolean) =>
												handleCurrencyFilter(currency, !!checked)
											}
											ariaLabel={`Filter by ${currency} currency`}
										/>
										<label
											htmlFor={`currency-${currency}`}
											className="text-sm text-gray-700 dark:text-gray-300"
										>
											{currency}
										</label>
									</div>
								))}
							</div>
						</div>

						{/* Quick Filters */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-900 dark:text-gray-100">
								Quick Filters
							</label>
							<div className="grid grid-cols-2 gap-2">
								<Button
									variant="secondary"
									size="sm"
									onClick={() => {
										handlePriceRangeChange([0, 50]);
										handleCategoryFilter("Rings", true);
									}}
									className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
									aria-label="Filter products under €50"
								>
									<Icon name="Minus" className="mr-1 h-3 w-3" aria-hidden={true} />
									Under €50
								</Button>
								<Button
									variant="secondary"
									size="sm"
									onClick={() => {
										handlePriceRangeChange([100, 1000]);
										handleBrandFilter("Stilnest", true);
									}}
									className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
									aria-label="Filter premium products"
								>
									<Icon name="Star" className="mr-1 h-3 w-3" aria-hidden={true} />
									Premium
								</Button>
								<Button
									variant="secondary"
									size="sm"
									onClick={() => {
										// This would need more complex logic in a real app
										console.log("Filter with data");
									}}
									className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
									aria-label="Filter products with competitor data"
								>
									<Icon name="TrendingUp" className="mr-1 h-3 w-3" aria-hidden={true} />
									With Data
								</Button>
								<Button
									variant="secondary"
									size="sm"
									onClick={() => {
										handleBrandFilter("Stilnest", true);
										handleCategoryFilter("Rings", true);
									}}
									className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
									aria-label="Filter Stilnest products"
								>
									<Icon name="Target" className="mr-1 h-3 w-3" aria-hidden={true} />
									Stilnest
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
