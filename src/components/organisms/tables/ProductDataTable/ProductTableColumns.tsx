"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Product } from "./index";
import { SortableHeader } from "../DataTable/DataTableHeader";
import { SelectionCheckbox } from "../DataTable/DataTableSelection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
	Eye, 
	Edit01, 
	Copy01, 
	Trash01, 
	CheckCircle, 
	AlertCircle,
	ArrowUp,
	ArrowDown,
	ArrowsUp
} from "@untitledui/icons";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsVertical } from "@untitledui/icons";

// Channel icons mapping
const CHANNEL_ICONS: Record<string, { icon: React.ComponentType<any>; title: string; color: string }> = {
	shopify: { icon: () => <div className="w-5 h-5 bg-green-500 rounded" />, title: "Shopify", color: "#96BF48" },
	magento: { icon: () => <div className="w-5 h-5 bg-orange-500 rounded" />, title: "Magento", color: "#EE672F" },
	woocommerce: { icon: () => <div className="w-5 h-5 bg-purple-500 rounded" />, title: "WooCommerce", color: "#96588A" },
	bigcommerce: { icon: () => <div className="w-5 h-5 bg-gray-800 rounded" />, title: "BigCommerce", color: "#121118" },
	ebay: { icon: () => <div className="w-5 h-5 bg-red-500 rounded" />, title: "eBay", color: "#E53238" },
	amazon: { icon: () => <div className="w-5 h-5 bg-yellow-500 rounded" />, title: "Amazon", color: "#FF9900" },
	etsy: { icon: () => <div className="w-5 h-5 bg-orange-500 rounded" />, title: "Etsy", color: "#F16521" },
};

const inferChannelFromProduct = (p: Product): string | undefined => {
	if (p.channel) return p.channel.toLowerCase().trim();
	const src = p.image || "";
	if (src.includes("shopify.com")) return "shopify";
	return undefined;
};

const renderChannel = (ch?: string) => {
	const key = ch?.toLowerCase().trim() || "";
	const channelData = CHANNEL_ICONS[key];
	if (!channelData) return null;
	const IconComponent = channelData.icon;
	return (
		<div className="flex items-center gap-2">
			<IconComponent
				className="h-5 w-5"
				style={{ color: channelData.color }}
				aria-label={channelData.title}
			/>
			<span className="hidden text-sm capitalize sm:inline">
				{channelData.title}
			</span>
		</div>
	);
};

const parseEuro = (input: string | number | null | undefined): number | null => {
	if (input === null || input === undefined) return null;
	if (typeof input === "number") return isFinite(input) ? input : null;
	const cleaned = input.toString().replace(/[^0-9.,-]/g, "").replace(/,(?=\d{3}\b)/g, "");
	const normalized = cleaned.replace(",", ".");
	const n = parseFloat(normalized);
	return isNaN(n) ? null : n;
};

const formatEuro = (n: number | null | undefined) => {
	if (n === null || n === undefined || !isFinite(n)) return "—";
	return new Intl.NumberFormat("de-DE", {
		style: "currency",
		currency: "EUR",
	}).format(n);
};

export function ProductTableColumns(products: Product[] = []): ColumnDef<Product>[] {
	return [
		{
			id: "select",
			header: ({ table }) => (
				<SelectionCheckbox
					checked={table.getIsAllPageRowsSelected()}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					ariaLabel="Select all products on current page"
					indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
				/>
			),
			cell: ({ row }) => (
				<SelectionCheckbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					ariaLabel={`Select ${row.original.name}`}
				/>
			),
			enableSorting: false,
			enableHiding: false,
			size: 50,
		},
		{
			accessorKey: "image",
			header: "Image",
			cell: ({ row }) => {
				const product = row.original;
				const imageUrl = row.getValue("image") as string;
				const productUrl = product.productUrl || `/products/${product.id}`;

				return (
					<a
						href={productUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="block h-10 w-10 overflow-hidden rounded-lg bg-gray-100 transition-colors duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:h-12 sm:w-12 dark:bg-gray-700 dark:hover:bg-gray-600"
						aria-label={`View product details for ${product.name}`}
					>
						<img
							src={imageUrl}
							alt={`Product image for ${product.name}`}
							className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
							loading="lazy"
						/>
					</a>
				);
			},
			enableSorting: false,
			enableHiding: false,
			size: 80,
		},
		{
			id: "channel",
			accessorFn: (row) => inferChannelFromProduct(row) || "unknown",
			header: "Channel",
			cell: ({ row }) => {
				const p = row.original as Product;
				const ch = inferChannelFromProduct(p);
				return (
					renderChannel(ch) || (
						<span className="text-xs text-gray-500">—</span>
					)
				);
			},
			size: 120,
		},
		{
			accessorKey: "name",
			header: ({ column }) => (
				<SortableHeader column={column}>
					Product Name
				</SortableHeader>
			),
			cell: ({ row }) => {
				const name = row.getValue("name") as string;
				const sku = row.original.sku as string;
				return (
					<div className="min-w-[200px] space-y-1">
						<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
							{name}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400">
							SKU: {sku}
						</div>
					</div>
				);
			},
			filterFn: "includesString",
			size: 250,
			meta: {
				isRowHeader: true,
			},
		},
		{
			id: "compare",
			accessorFn: (row) => {
				// Simple comparison logic - in real app this would be more complex
				const name = row.name.toLowerCase();
				// This would need access to all products, for now return a mock value
				return Math.floor(Math.random() * 5);
			},
			header: ({ column }) => (
				<SortableHeader column={column}>
					Compare
				</SortableHeader>
			),
			cell: ({ row }) => {
				const count = row.getValue("compare") as number;
				return (
					<div className="flex items-center justify-center">
						<div className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
							{count}
						</div>
					</div>
				);
			},
			size: 80,
		},
		{
			id: "cost",
			accessorFn: (row) => parseEuro(row.cost) ?? null,
			header: ({ column }) => (
				<SortableHeader column={column}>
					Cost
				</SortableHeader>
			),
			cell: ({ row }) => (
				<div className="min-w-[80px] text-right">
					<div className="text-sm">
						{formatEuro(row.getValue("cost") as number | null)}
					</div>
				</div>
			),
			sortingFn: (a, b, _id) => {
				const av = (a.getValue("cost") as number | null) ?? -Infinity;
				const bv = (b.getValue("cost") as number | null) ?? -Infinity;
				return (av as number) - (bv as number);
			},
			size: 100,
		},
		{
			id: "price",
			accessorFn: (row) => parseEuro(row.price) ?? null,
			header: ({ column }) => (
				<SortableHeader column={column}>
					Price
				</SortableHeader>
			),
			cell: ({ row }) => (
				<div className="min-w-[80px] text-right">
					<div className="font-semibold text-green-600">
						{formatEuro(row.getValue("price") as number | null)}
					</div>
				</div>
			),
			sortingFn: (a, b, _id) => {
				const av = (a.getValue("price") as number | null) ?? -Infinity;
				const bv = (b.getValue("price") as number | null) ?? -Infinity;
				return (av as number) - (bv as number);
			},
			size: 100,
		},
		{
			accessorKey: "currency",
			header: ({ column }) => (
				<SortableHeader column={column}>
					Currency
				</SortableHeader>
			),
			cell: ({ row }) => (
				<div className="text-right">
					<div className="text-sm">
						{(row.getValue("currency") as string) || "—"}
					</div>
				</div>
			),
			filterFn: "includesString",
			size: 80,
		},
		{
			id: "minMaxPrice",
			accessorFn: (row) => {
				const min = parseEuro(row.minPrice) ?? parseEuro(row.competitors?.cheapest ?? null);
				const max = parseEuro(row.maxPrice) ?? parseEuro(row.competitors?.highest ?? null);
				return { min, max };
			},
			header: ({ column }) => (
				<SortableHeader column={column}>
					Min/Max Price
				</SortableHeader>
			),
			cell: ({ row }) => {
				const v = row.getValue("minMaxPrice") as { min: number | null; max: number | null };
				return (
					<div className="space-y-0.5 text-right">
						<div className="text-xs text-gray-500 dark:text-gray-400">
							Low: {formatEuro(v?.min ?? null)}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400">
							High: {formatEuro(v?.max ?? null)}
						</div>
					</div>
				);
			},
			sortingFn: (a, b, _id) => {
				const av = (a.getValue("minMaxPrice") as { min: number | null; max: number | null })?.min ?? -Infinity;
				const bv = (b.getValue("minMaxPrice") as { min: number | null; max: number | null })?.min ?? -Infinity;
				return (av as number) - (bv as number);
			},
			size: 120,
		},
		{
			id: "pricePosition",
			accessorFn: (row) => {
				const price = parseEuro(row.price) ?? null;
				const offers = [
					parseEuro(row.competitors?.cheapest ?? null),
					parseEuro(row.competitors?.avg ?? null),
					parseEuro(row.competitors?.highest ?? null),
				].filter((n): n is number => n !== null);
				
				let lower = 0, equal = 0, higher = 0;
				if (price !== null && offers.length > 0) {
					const tol = Math.max(0.02, price * 0.005);
					for (const cp of offers) {
						const diff = cp - price;
						if (Math.abs(diff) <= tol) equal++;
						else if (diff > 0) higher++;
						else lower++;
					}
				}
				return { lower, equal, higher };
			},
			header: "Price Position",
			cell: ({ row }) => {
				const v = row.getValue("pricePosition") as { lower: number; equal: number; higher: number };
				return (
					<div className="flex items-center justify-end gap-2 text-xs">
						<span className="text-green-600">{v.lower} Lower</span>
						<span className="text-gray-600">{v.equal} Equal</span>
						<span className="text-red-600">{v.higher} Higher</span>
					</div>
				);
			},
			size: 150,
		},
		{
			accessorKey: "competitors",
			header: "Competitor Prices",
			cell: ({ row }) => {
				const competitors = row.getValue("competitors") as Product["competitors"];
				const cheapest = parseEuro(competitors?.cheapest ?? null);
				const avg = parseEuro(competitors?.avg ?? null);
				const highest = parseEuro(competitors?.highest ?? null);
				return (
					<div className="space-y-1 text-right">
						<div className="text-xs text-gray-500 dark:text-gray-400">
							Cheapest: {formatEuro(cheapest)}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400">
							Avg: {formatEuro(avg)}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400">
							Highest: {formatEuro(highest)}
						</div>
					</div>
				);
			},
			size: 150,
		},
		{
			accessorKey: "brand",
			header: "Brand",
			cell: ({ row }) => {
				const brand = row.getValue("brand") as Product["brand"];
				return (
					<div className="flex items-center space-x-2">
						{brand.logo && (
							<img
								src={brand.logo}
								alt={`${brand.name} brand logo`}
								className="h-5 w-5 rounded"
								loading="lazy"
							/>
						)}
						<span className="text-sm font-medium" aria-label={`Brand: ${brand.name}`}>
							{brand.name}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "triggeredRule",
			header: "Status",
			cell: ({ row }) => {
				const rule = row.getValue("triggeredRule") as string;
				const isActive = rule.includes("active");
				return (
					<Badge 
						variant={isActive ? "default" : "secondary"}
						aria-label={`Status: ${rule} - ${isActive ? 'Active' : 'Inactive'}`}
					>
						{isActive ? (
							<CheckCircle className="mr-1 h-3 w-3" aria-hidden={true} />
						) : (
							<AlertCircle className="mr-1 h-3 w-3" aria-hidden={true} />
						)}
						{rule}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				const product = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button 
								variant="ghost" 
								className="h-8 w-8 p-0"
								aria-label={`Actions for ${product.name}`}
							>
								<DotsVertical className="h-4 w-4" aria-hidden={true} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem 
								onClick={() => console.log("View", product.id)}
								aria-label={`View details for ${product.name}`}
							>
								<Eye className="mr-2 h-4 w-4" aria-hidden={true} />
								View Details
							</DropdownMenuItem>
							<DropdownMenuItem 
								onClick={() => console.log("Edit", product.id)}
								aria-label={`Edit ${product.name}`}
							>
								<Edit01 className="mr-2 h-4 w-4" aria-hidden={true} />
								Edit Product
							</DropdownMenuItem>
							<DropdownMenuItem 
								onClick={() => navigator.clipboard.writeText(product.sku)}
								aria-label={`Copy SKU ${product.sku} to clipboard`}
							>
								<Copy01 className="mr-2 h-4 w-4" aria-hidden={true} />
								Copy SKU
							</DropdownMenuItem>
							<DropdownMenuItem 
								onClick={() => console.log("Delete", product.id)}
								aria-label={`Delete ${product.name}`}
								className="text-red-600 focus:text-red-600"
							>
								<Trash01 className="mr-2 h-4 w-4" aria-hidden={true} />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
			size: 60,
		},
	];
}
