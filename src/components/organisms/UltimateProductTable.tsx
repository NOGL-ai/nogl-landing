"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	FilterFn,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Checkbox from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select-new";
import { Badge } from "@/components/ui/badge";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
	Search,
	Filter,
	X,
	ChevronDown,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	MoreHorizontal,
	Eye,
	Edit,
	Copy,
	Trash2,
	Star,
	TrendingUp,
	DollarSign,
	Tag,
	Calendar,
	Settings,
	Download,
	Upload,
	RefreshCw,
	Grid3X3,
	List,
	Columns,
	SortAsc,
	SortDesc,
	FilterX,
	Zap,
	Target,
	BarChart3,
	PieChart,
	Activity,
	AlertCircle,
	CheckCircle,
	Clock,
	Minus,
	Plus,
} from "lucide-react";
import { debounce } from "lodash";
import {
	SiShopify,
	SiWoocommerce,
	SiBigcommerce,
	SiEbay,
	SiAmazon,
	SiEtsy,
	SiWix,
	SiSquarespace,
	SiPrestashop,
	SiMagento,
} from "react-icons/si";

// Types
export interface Product {
	id: string;
	name: string;
	sku: string;
	image: string;
	productUrl?: string; // Product page URL
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

interface UltimateProductTableProps {
	products: Product[];
	enableInfiniteScroll?: boolean;
	onInfiniteScrollToggle?: (enabled: boolean) => void;
	infiniteScrollProps?: unknown;
}

// Custom filter functions
const globalFilterFn = (row: any, _columnId: string, value: string) => {
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
};

const parseEuro = (
	input: string | number | null | undefined
): number | null => {
	if (input === null || input === undefined) return null;
	if (typeof input === "number") return isFinite(input) ? input : null;
	const cleaned = input.replace(/[^0-9.,-]/g, "").replace(/,(?=\d{3}\b)/g, "");
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

const priceRangeFilter: FilterFn<any> = (row, _columnId, value) => {
	const [min, max] = value as [number, number];
	const raw = (row.original?.price ?? row.getValue("price")) as
		| string
		| number
		| undefined;
	const price = parseEuro(raw ?? null) ?? 0;
	return price >= min && price <= max;
};

const multiSelectFilter: FilterFn<any> = (row, columnId, value) => {
	if (!value || value.length === 0) return true;
	const cellValue = row.getValue(columnId);
	if (typeof cellValue === "object" && cellValue !== null) {
		return value.includes((cellValue as any).name);
	}
	return value.includes(cellValue);
};

// Channel helpers using react-icons
const CHANNEL_ICONS: Record<
	string,
	{ icon: React.ComponentType<any>; title: string; color: string }
> = {
	shopify: { icon: SiShopify, title: "Shopify", color: "#96BF48" },
	magento: { icon: SiMagento, title: "Magento", color: "#EE672F" },
	woocommerce: { icon: SiWoocommerce, title: "WooCommerce", color: "#96588A" },
	bigcommerce: { icon: SiBigcommerce, title: "BigCommerce", color: "#121118" },
	ebay: { icon: SiEbay, title: "eBay", color: "#E53238" },
	amazon: { icon: SiAmazon, title: "Amazon", color: "#FF9900" },
	etsy: { icon: SiEtsy, title: "Etsy", color: "#F16521" },
	wix: { icon: SiWix, title: "Wix", color: "#0C6EFC" },
	squarespace: { icon: SiSquarespace, title: "Squarespace", color: "#000000" },
	prestashop: { icon: SiPrestashop, title: "PrestaShop", color: "#DF0067" },
};

const normalizeChannel = (ch?: string | null) =>
	(ch || "").toLowerCase().trim();

const inferChannelFromProduct = (p: Product): string | undefined => {
	if (p.channel) return normalizeChannel(p.channel);
	const src = p.image || "";
	if (src.includes("shopify.com")) return "shopify";
	return undefined;
};

const renderChannel = (ch?: string) => {
	const key = normalizeChannel(ch);
	const channelData = CHANNEL_ICONS[key];
	if (!channelData) return null;
	const IconComponent = channelData.icon;
	return (
		<div className='flex items-center gap-2'>
			<IconComponent
				className='h-5 w-5'
				style={{ color: channelData.color }}
				aria-label={channelData.title}
			/>
			<span className='hidden text-sm capitalize sm:inline'>
				{channelData.title}
			</span>
		</div>
	);
};

const UltimateProductTable: React.FC<UltimateProductTableProps> = ({
	products,
}) => {
	// State management
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		compare: false,
		minMaxPrice: false,
		pricePosition: false,
		competitors: false,
		currency: false,
	});
	const [rowSelection, setRowSelection] = useState({});
	const [globalFilter, setGlobalFilter] = useState("");
	const [viewMode, setViewMode] = useState<"table" | "grid">("table");
	const [showFilters, setShowFilters] = useState(false);

	// Debounced search
	const debouncedSetGlobalFilter = useCallback(
		debounce((value: string) => setGlobalFilter(value), 300),
		[]
	);

	// Filter state
	const [filters, setFilters] = useState({
		priceRange: [0, 1000],
		brands: [] as string[],
		categories: [] as string[],
		status: [] as string[],
		hasCompetitorData: null as boolean | null,
		featured: null as boolean | null,
		highMargin: null as boolean | null,
		currencies: [] as string[],
	});

	// Compute compare matches based on name similarity and SKU equality
	const compareById = useMemo(() => {
		const normalize = (s: string) =>
			s
				.toLowerCase()
				.replace(/[^a-z0-9\s]/g, " ")
				.replace(/\s+/g, " ")
				.trim();
		const tokenize = (s: string) => {
			const tokens = normalize(s)
				.split(" ")
				.filter((t) => t.length >= 3);
			return new Set(tokens);
		};
		const jaccard = (a: Set<string>, b: Set<string>) => {
			if (a.size === 0 && b.size === 0) return 1;
			let inter = 0;
			Array.from(a).forEach((t) => {
				if (b.has(t)) inter++;
			});
			const uni = a.size + b.size - inter;
			return uni === 0 ? 0 : inter / uni;
		};

		const tokensById = new Map<string, Set<string>>();
		for (const p of products) tokensById.set(p.id, tokenize(p.name));

		const counts: Record<string, number> = Object.create(null);
		for (const p of products) counts[p.id] = 0;

		const threshold = 0.5;
		for (let i = 0; i < products.length; i++) {
			for (let j = i + 1; j < products.length; j++) {
				const a = products[i];
				const b = products[j];
				const sameSku = a.sku && b.sku && a.sku === b.sku;
				const sim = jaccard(tokensById.get(a.id)!, tokensById.get(b.id)!);
				if (sameSku || sim >= threshold) {
					counts[a.id]++;
					counts[b.id]++;
				}
			}
		}
		return counts;
	}, [products]);

	const uniqueCurrencies = useMemo(() => {
		const set = new Set<string>();
		for (const p of products) {
			if (p.currency) set.add(p.currency);
		}
		return Array.from(set);
	}, [products]);

	// Column definitions
	const columns: ColumnDef<Product>[] = useMemo(
		() => [
			{
				id: "select",
				header: ({ table }) => (
					<Checkbox
						checked={table.getIsAllPageRowsSelected()}
						onCheckedChange={(value) =>
							table.toggleAllPageRowsSelected(!!value)
						}
						aria-label='Select all'
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
						aria-label='Select row'
					/>
				),
				enableSorting: false,
				enableHiding: false,
				size: 50,
				minSize: 50,
				maxSize: 50,
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
							target='_blank'
							rel='noopener noreferrer'
							className='block h-10 w-10 overflow-hidden rounded-lg bg-gray-100 transition-colors duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:h-12 sm:w-12 dark:bg-gray-700 dark:hover:bg-gray-600'
							title={`View product: ${product.name}`}
						>
							<img
								src={imageUrl}
								alt={product.name}
								className='h-full w-full object-cover transition-transform duration-200 hover:scale-105'
							/>
						</a>
					);
				},
				enableSorting: false,
				enableHiding: false,
				size: 80,
				minSize: 60,
				maxSize: 100,
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
							<span className='text-xs text-gray-500'>—</span>
						)
					);
				},
				size: 120,
				minSize: 100,
				maxSize: 150,
			},
			{
				accessorKey: "name",
				header: ({ column }) => {
					return (
						<Button
							variant='ghost'
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
							className='h-8 px-2 lg:px-3'
						>
							Product Name
							{column.getIsSorted() === "asc" ? (
								<ArrowUp className='ml-2 h-4 w-4' />
							) : column.getIsSorted() === "desc" ? (
								<ArrowDown className='ml-2 h-4 w-4' />
							) : (
								<ArrowUpDown className='ml-2 h-4 w-4' />
							)}
						</Button>
					);
				},
				cell: ({ row }) => {
					const name = row.getValue("name") as string;
					const sku = row.original.sku as string;
					return (
						<div className='min-w-[200px] space-y-1'>
							<div className='text-sm font-medium text-gray-900 dark:text-gray-100'>
								{name}
							</div>
							<div className='text-xs text-gray-500 dark:text-gray-400'>
								SKU: {sku}
							</div>
						</div>
					);
				},
				filterFn: "includesString",
				size: 250,
				minSize: 200,
				maxSize: 400,
			},
			{
				id: "compare",
				accessorFn: (row) => compareById[row.id] ?? 0,
				header: ({ column }) => (
					<Button
						variant='ghost'
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className='h-8 px-2 lg:px-3'
					>
						Compare
						{column.getIsSorted() === "asc" ? (
							<ArrowUp className='ml-2 h-4 w-4' />
						) : column.getIsSorted() === "desc" ? (
							<ArrowDown className='ml-2 h-4 w-4' />
						) : (
							<ArrowUpDown className='ml-2 h-4 w-4' />
						)}
					</Button>
				),
				cell: ({ row }) => {
					const count = row.getValue("compare") as number;
					return (
						<div className='flex items-center justify-center'>
							<div className='flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700'>
								{count}
							</div>
						</div>
					);
				},
			},
			{
				id: "cost",
				accessorFn: (row) => parseEuro(row.cost) ?? null,
				header: ({ column }) => (
					<Button
						variant='ghost'
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className='h-8 px-2 lg:px-3'
					>
						Cost
						{column.getIsSorted() === "asc" ? (
							<ArrowUp className='ml-2 h-4 w-4' />
						) : column.getIsSorted() === "desc" ? (
							<ArrowDown className='ml-2 h-4 w-4' />
						) : (
							<ArrowUpDown className='ml-2 h-4 w-4' />
						)}
					</Button>
				),
				cell: ({ row }) => (
					<div className='min-w-[80px] text-right'>
						<div className='text-sm'>
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
				minSize: 80,
				maxSize: 120,
			},
			{
				id: "price",
				accessorFn: (row) => parseEuro(row.price) ?? null,
				header: ({ column }) => (
					<Button
						variant='ghost'
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className='h-8 px-2 lg:px-3'
					>
						Price
						{column.getIsSorted() === "asc" ? (
							<ArrowUp className='ml-2 h-4 w-4' />
						) : column.getIsSorted() === "desc" ? (
							<ArrowDown className='ml-2 h-4 w-4' />
						) : (
							<ArrowUpDown className='ml-2 h-4 w-4' />
						)}
					</Button>
				),
				cell: ({ row }) => (
					<div className='min-w-[80px] text-right'>
						<div className='font-semibold text-green-600'>
							{formatEuro(row.getValue("price") as number | null)}
						</div>
					</div>
				),
				filterFn: priceRangeFilter,
				sortingFn: (a, b, _id) => {
					const av = (a.getValue("price") as number | null) ?? -Infinity;
					const bv = (b.getValue("price") as number | null) ?? -Infinity;
					return (av as number) - (bv as number);
				},
				size: 100,
				minSize: 80,
				maxSize: 120,
			},
			{
				accessorKey: "currency",
				header: ({ column }) => (
					<Button
						variant='ghost'
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className='h-8 px-2 lg:px-3'
					>
						Currency
						{column.getIsSorted() === "asc" ? (
							<ArrowUp className='ml-2 h-4 w-4' />
						) : column.getIsSorted() === "desc" ? (
							<ArrowDown className='ml-2 h-4 w-4' />
						) : (
							<ArrowUpDown className='ml-2 h-4 w-4' />
						)}
					</Button>
				),
				cell: ({ row }) => (
					<div className='text-right'>
						<div className='text-sm'>
							{(row.getValue("currency") as string) || "—"}
						</div>
					</div>
				),
				filterFn: multiSelectFilter,
			},
			{
				id: "minMaxPrice",
				accessorFn: (row) => {
					const min =
						parseEuro(row.minPrice) ??
						parseEuro(row.competitors?.cheapest ?? null);
					const max =
						parseEuro(row.maxPrice) ??
						parseEuro(row.competitors?.highest ?? null);
					return { min, max };
				},
				header: ({ column }) => (
					<Button
						variant='ghost'
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className='h-8 px-2 lg:px-3'
					>
						Min/Max Price
						{column.getIsSorted() === "asc" ? (
							<ArrowUp className='ml-2 h-4 w-4' />
						) : column.getIsSorted() === "desc" ? (
							<ArrowDown className='ml-2 h-4 w-4' />
						) : (
							<ArrowUpDown className='ml-2 h-4 w-4' />
						)}
					</Button>
				),
				cell: ({ row }) => {
					const v = row.getValue("minMaxPrice") as {
						min: number | null;
						max: number | null;
					};
					return (
						<div className='space-y-0.5 text-right'>
							<div className='text-xs text-gray-500 dark:text-gray-400'>
								Low: {formatEuro(v?.min ?? null)}
							</div>
							<div className='text-xs text-gray-500 dark:text-gray-400'>
								High: {formatEuro(v?.max ?? null)}
							</div>
						</div>
					);
				},
				sortingFn: (a, b, _id) => {
					const av =
						(
							a.getValue("minMaxPrice") as {
								min: number | null;
								max: number | null;
							}
						)?.min ?? -Infinity;
					const bv =
						(
							b.getValue("minMaxPrice") as {
								min: number | null;
								max: number | null;
							}
						)?.min ?? -Infinity;
					return (av as number) - (bv as number);
				},
			},
			{
				accessorKey: "brand",
				header: "Brand",
				cell: ({ row }) => {
					const brand = row.getValue("brand") as Product["brand"];
					return (
						<div className='flex items-center space-x-2'>
							{brand.logo && (
								<img
									src={brand.logo}
									alt={brand.name}
									className='h-5 w-5 rounded'
								/>
							)}
							<span className='text-sm font-medium'>{brand.name}</span>
						</div>
					);
				},
				filterFn: multiSelectFilter,
			},
			{
				id: "pricePosition",
				accessorFn: (row) => {
					const price = parseEuro(row.price) ?? null;
					const offers: number[] = Array.isArray((row as any).competitorOffers)
						? ((row as any).competitorOffers as any[])
								.map((v) => parseEuro(v as any))
								.filter((n): n is number => n !== null)
						: ([
								parseEuro(row.competitors?.cheapest ?? null),
								parseEuro(row.competitors?.avg ?? null),
								parseEuro(row.competitors?.highest ?? null),
							].filter((n): n is number => n !== null) as number[]);
					let lower = 0,
						equal = 0,
						higher = 0;
					if (price !== null && offers.length > 0) {
						const tol = Math.max(0.02, price * 0.005);
						for (const cp of offers) {
							const diff = cp - price;
							if (Math.abs(diff) <= tol) equal++;
							else if (diff > 0) higher++;
							else lower++;
						}
					}
					const avgOffer = offers.length
						? offers.reduce((a, b) => a + b, 0) / offers.length
						: null;
					const netDiff =
						price !== null && avgOffer !== null ? price - avgOffer : null;
					return { lower, equal, higher, netDiff };
				},
				header: "Price Position",
				cell: ({ row }) => {
					const v = row.getValue("pricePosition") as {
						lower: number;
						equal: number;
						higher: number;
					};
					return (
						<div className='flex items-center justify-end gap-2 text-xs'>
							<span className='text-green-600'>{v.lower} Lower</span>
							<span className='text-gray-600'>{v.equal} Equal</span>
							<span className='text-red-600'>{v.higher} Higher</span>
						</div>
					);
				},
				sortingFn: (a, b, _id) => {
					const av = (a.getValue("pricePosition") as any)?.netDiff ?? 0;
					const bv = (b.getValue("pricePosition") as any)?.netDiff ?? 0;
					return av - bv;
				},
			},
			{
				accessorKey: "competitors",
				header: "Competitor Prices",
				cell: ({ row }) => {
					const competitors = row.getValue(
						"competitors"
					) as Product["competitors"];
					const cheapest = parseEuro(competitors?.cheapest ?? null);
					const avg = parseEuro(competitors?.avg ?? null);
					const highest = parseEuro(competitors?.highest ?? null);
					return (
						<div className='space-y-1 text-right'>
							<div className='text-xs text-gray-500 dark:text-gray-400'>
								Cheapest: {formatEuro(cheapest)}
							</div>
							<div className='text-xs text-gray-500 dark:text-gray-400'>
								Avg: {formatEuro(avg)}
							</div>
							<div className='text-xs text-gray-500 dark:text-gray-400'>
								Highest: {formatEuro(highest)}
							</div>
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
						<Badge variant={isActive ? "success" : "secondary"}>
							{isActive ? (
								<CheckCircle className='mr-1 h-3 w-3' />
							) : (
								<AlertCircle className='mr-1 h-3 w-3' />
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
								<Button variant='ghost' className='h-8 w-8 p-0'>
									<MoreHorizontal className='h-4 w-4' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuCheckboxItem
									onClick={() => console.log("View", product.id)}
								>
									<Eye className='mr-2 h-4 w-4' />
									View Details
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									onClick={() => console.log("Edit", product.id)}
								>
									<Edit className='mr-2 h-4 w-4' />
									Edit Product
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									onClick={() => navigator.clipboard.writeText(product.sku)}
								>
									<Copy className='mr-2 h-4 w-4' />
									Copy SKU
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									onClick={() => console.log("Delete", product.id)}
									className='text-red-600'
								>
									<Trash2 className='mr-2 h-4 w-4' />
									Delete
								</DropdownMenuCheckboxItem>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
				size: 60,
				minSize: 60,
				maxSize: 60,
			},
		],
		[]
	);

	// Table instance
	const table = useReactTable({
		data: products,
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
		globalFilterFn,
		columnResizeMode: "onChange",
		defaultColumn: {
			size: 150,
			minSize: 50,
			maxSize: 500,
		},
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter,
		},
	});

	// Filter handlers
	const handlePriceRangeChange = (value: number[]) => {
		setFilters((prev) => ({ ...prev, priceRange: value }));
		table.getColumn("price")?.setFilterValue(value);
	};

	const handleBrandFilter = (brand: string, checked: boolean) => {
		const newBrands = checked
			? [...filters.brands, brand]
			: filters.brands.filter((b) => b !== brand);
		setFilters((prev) => ({ ...prev, brands: newBrands }));
		table
			.getColumn("brand")
			?.setFilterValue(newBrands.length > 0 ? newBrands : undefined);
	};

	const handleCurrencyFilter = (currency: string, checked: boolean) => {
		const newCurrencies = checked
			? [...filters.currencies, currency]
			: filters.currencies.filter((c) => c !== currency);
		setFilters((prev) => ({ ...prev, currencies: newCurrencies }));
		table
			.getColumn("currency")
			?.setFilterValue(newCurrencies.length > 0 ? newCurrencies : undefined);
	};

	const clearAllFilters = () => {
		setGlobalFilter("");
		setColumnFilters([]);
		setFilters({
			priceRange: [0, 1000],
			brands: [],
			categories: [],
			status: [],
			hasCompetitorData: null,
			featured: null,
			highMargin: null,
			currencies: [],
		});
	};

	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const activeFiltersCount = columnFilters.length + (globalFilter ? 1 : 0);

	return (
		<div className='w-full space-y-4'>
			{/* Header Controls */}
			<div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
				<div className='flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center'>
					<div className='relative w-full sm:w-80'>
						<Search
							className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform transition-colors ${
								globalFilter
									? "text-blue-500 dark:text-blue-400"
									: "text-gray-400 dark:text-gray-500"
							}`}
						/>
						<Input
							placeholder='Search products...'
							value={globalFilter}
							onChange={(e) => {
								setGlobalFilter(e.target.value);
								debouncedSetGlobalFilter(e.target.value);
							}}
							className={`w-full border-gray-300 bg-white pl-10 text-gray-900 placeholder-gray-500 transition-colors dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 ${
								globalFilter
									? "border-blue-300 focus:border-blue-500 dark:border-blue-500 dark:focus:border-blue-400"
									: ""
							}`}
						/>
					</div>

					<div className='flex w-full items-center gap-2 sm:w-auto'>
						<Button
							variant='secondary'
							onClick={() => setShowFilters(!showFilters)}
							className='relative flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 sm:flex-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
						>
							<Filter className='mr-2 h-4 w-4' />
							Filters
							{activeFiltersCount > 0 && (
								<Badge
									variant='secondary'
									className='ml-2 flex h-5 w-5 items-center justify-center rounded-full border-blue-200 bg-blue-100 p-0 text-xs text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
								>
									{activeFiltersCount}
								</Badge>
							)}
						</Button>

						<Button
							variant='secondary'
							onClick={clearAllFilters}
							className='flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 sm:flex-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
						>
							<FilterX className='mr-2 h-4 w-4' />
							Clear All
						</Button>
					</div>
				</div>

				<div className='flex w-full items-center gap-2 sm:w-auto'>
					<div className='flex items-center space-x-1'>
						<Button
							variant={viewMode === "table" ? "primary" : "secondary"}
							size='sm'
							onClick={() => setViewMode("table")}
							className={
								viewMode === "table"
									? ""
									: "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
							}
						>
							<List className='h-4 w-4' />
						</Button>
						<Button
							variant={viewMode === "grid" ? "primary" : "secondary"}
							size='sm'
							onClick={() => setViewMode("grid")}
							className={
								viewMode === "grid"
									? ""
									: "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
							}
						>
							<Grid3X3 className='h-4 w-4' />
						</Button>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='secondary'
								className='border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
							>
								<Columns className='mr-2 h-4 w-4' />
								Columns
								<ChevronDown className='ml-2 h-4 w-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className='capitalize'
											checked={column.getIsVisible()}
											onCheckedChange={(value) =>
												column.toggleVisibility(!!value)
											}
										>
											{column.id}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Advanced Filters Panel */}
			{showFilters && (
				<div className='space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800'>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
						{/* Price Range Filter */}
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-900 dark:text-gray-100'>
								Price Range
							</label>
							<div className='px-3'>
								<Slider
									value={filters.priceRange}
									onValueChange={handlePriceRangeChange}
									max={1000}
									min={0}
									step={10}
									className='w-full'
								/>
								<div className='mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400'>
									<span>€{filters.priceRange[0]}</span>
									<span>€{filters.priceRange[1]}</span>
								</div>
							</div>
						</div>

						{/* Brand Filter */}
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-900 dark:text-gray-100'>
								Brands
							</label>
							<div className='space-y-1'>
								{["Ellijewelry", "Nenalina", "Kuzzoi", "Stilnest"].map(
									(brand) => (
										<div key={brand} className='flex items-center space-x-2'>
											<Checkbox
												id={`brand-${brand}`}
												checked={filters.brands.includes(brand)}
												onCheckedChange={(checked) =>
													handleBrandFilter(brand, !!checked)
												}
											/>
											<label
												htmlFor={`brand-${brand}`}
												className='text-sm text-gray-700 dark:text-gray-300'
											>
												{brand}
											</label>
										</div>
									)
								)}
							</div>
						</div>

						{/* Currency Filter */}
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-900 dark:text-gray-100'>
								Currency
							</label>
							<div className='space-y-1'>
								{uniqueCurrencies.map((currency) => (
									<div key={currency} className='flex items-center space-x-2'>
										<Checkbox
											id={`currency-${currency}`}
											checked={filters.currencies.includes(currency)}
											onCheckedChange={(checked) =>
												handleCurrencyFilter(currency, !!checked)
											}
										/>
										<label
											htmlFor={`currency-${currency}`}
											className='text-sm text-gray-700 dark:text-gray-300'
										>
											{currency}
										</label>
									</div>
								))}
							</div>
						</div>

						{/* Quick Filters */}
						<div className='space-y-2'>
							<label className='text-sm font-medium text-gray-900 dark:text-gray-100'>
								Quick Filters
							</label>
							<div className='grid grid-cols-2 gap-2'>
								<Button
									variant='secondary'
									size='sm'
									onClick={() => {
										handlePriceRangeChange([0, 50]);
										setFilters((prev) => ({ ...prev, categories: ["Rings"] }));
									}}
									className='border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
								>
									<Minus className='mr-1 h-3 w-3' />
									Under €50
								</Button>
								<Button
									variant='secondary'
									size='sm'
									onClick={() => {
										handlePriceRangeChange([100, 1000]);
										setFilters((prev) => ({ ...prev, featured: true }));
									}}
									className='border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
								>
									<Star className='mr-1 h-3 w-3' />
									Premium
								</Button>
								<Button
									variant='secondary'
									size='sm'
									onClick={() => {
										setFilters((prev) => ({
											...prev,
											hasCompetitorData: true,
										}));
									}}
									className='border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
								>
									<TrendingUp className='mr-1 h-3 w-3' />
									With Data
								</Button>
								<Button
									variant='secondary'
									size='sm'
									onClick={() => {
										handleBrandFilter("Stilnest", true);
										setFilters((prev) => ({ ...prev, categories: ["Rings"] }));
									}}
									className='border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
								>
									<Target className='mr-1 h-3 w-3' />
									Stilnest
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Selection Info */}
			{selectedRows.length > 0 && (
				<div className='rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-2'>
							<CheckCircle className='h-4 w-4 text-blue-600 dark:text-blue-400' />
							<span className='text-sm font-medium text-blue-800 dark:text-blue-200'>
								{selectedRows.length} product
								{selectedRows.length !== 1 ? "s" : ""} selected
							</span>
						</div>
						<div className='flex items-center space-x-2'>
							<Button
								variant='secondary'
								size='sm'
								className='border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
							>
								<Download className='mr-2 h-4 w-4' />
								Export
							</Button>
							<Button
								variant='secondary'
								size='sm'
								className='border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
							>
								<Edit className='mr-2 h-4 w-4' />
								Bulk Edit
							</Button>
							<Button
								variant='secondary'
								size='sm'
								className='border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
							>
								<Trash2 className='mr-2 h-4 w-4' />
								Delete
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Table */}
			<div className='-mx-4 sm:-mx-6 lg:-mx-8'>
				<div className='overflow-x-auto px-4 sm:px-6 lg:px-8'>
					<div className='rounded-md border border-gray-200 dark:border-gray-700'>
						<Table className='min-w-full'>
							<TableHeader className='sticky top-0 z-10 bg-white dark:bg-gray-800'>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											return (
												<TableHead
													key={header.id}
													className='whitespace-nowrap'
													style={{ width: header.getSize() }}
												>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column.columnDef.header,
																header.getContext()
															)}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell
													key={`${row.id}_${cell.column.id}` }
													className='whitespace-nowrap'
													style={{ width: cell.column.getSize() }}
												>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext()
													)}
												</TableCell>
											))}
										</TableRow>
									))
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
				</div>
			</div>

			{/* Pagination */}
			<div className='flex flex-col items-center justify-between gap-4 py-4 sm:flex-row'>
				<div className='text-muted-foreground text-center text-sm sm:text-left dark:text-gray-400'>
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<div className='flex flex-col items-center gap-4 sm:flex-row sm:gap-6'>
					<div className='flex items-center space-x-2'>
						<p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
							Rows per page
						</p>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}
						>
							<SelectTrigger className='h-8 w-[70px] border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'>
							<SelectValue
								placeholder={`${table.getState().pagination.pageSize}`}
							/>
							</SelectTrigger>
							<SelectContent
								className='border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
							>
								{[10, 20, 30, 40, 50].map((pageSize) => (
									<SelectItem
										key={pageSize}
										value={`${pageSize}`}
										className='text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700'
									>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className='flex w-[100px] items-center justify-center text-sm font-medium text-gray-900 dark:text-gray-100'>
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</div>
					<div className='flex items-center space-x-2'>
						<Button
							variant='secondary'
							className='hidden h-8 w-8 border-gray-300 p-0 text-gray-700 hover:bg-gray-50 lg:flex dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<span className='sr-only'>Go to first page</span>
							<ArrowUp className='h-4 w-4' />
						</Button>
						<Button
							variant='secondary'
							className='h-8 w-8 border-gray-300 p-0 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<span className='sr-only'>Go to previous page</span>
							<ArrowUp className='h-4 w-4' />
						</Button>
						<Button
							variant='secondary'
							className='h-8 w-8 border-gray-300 p-0 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<span className='sr-only'>Go to next page</span>
							<ArrowDown className='h-4 w-4' />
						</Button>
						<Button
							variant='secondary'
							className='hidden h-8 w-8 border-gray-300 p-0 text-gray-700 hover:bg-gray-50 lg:flex dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							<span className='sr-only'>Go to last page</span>
							<ArrowDown className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UltimateProductTable;
