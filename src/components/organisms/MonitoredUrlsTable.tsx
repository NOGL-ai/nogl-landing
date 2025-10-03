"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
	Search,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	MoreHorizontal,
	Eye,
	Edit,
	Trash2,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type MonitoredUrlRow = {
	id: string;
	competitorUrl: string;
	code?: string;
	productName?: string;
	sku?: string;
	asinCode?: string;
	competitorPrice?: number | null; // in EUR
	myPrice?: number | null; // in EUR
	pricePosition?: "Lower" | "Equal" | "Higher" | "Analyzing";
	stock?: number | "Analyzing" | null;
	status: "In Progress" | "Active" | "Paused" | "Analyzing";
};

const formatEuro = (n: number | null | undefined) => {
	if (n === null || n === undefined || !isFinite(n)) return "Analyzing...";
	return new Intl.NumberFormat("de-DE", {
		style: "currency",
		currency: "EUR",
	}).format(n);
};

const initialData: MonitoredUrlRow[] = [
	{
		id: "1",
		competitorUrl:
			"purelei.com/products/mahina-club?variant=44037812388105&prirule_jdsnikfkfjsd=10253",
		code: "-",
		productName: "Multifunction Printer Canon 0515C106",
		sku: "2",
		asinCode: "B07GJG8X74",
		competitorPrice: 42,
		myPrice: null,
		pricePosition: "Analyzing",
		stock: "Analyzing",
		status: "In Progress",
	},
	{
		id: "2",
		competitorUrl: "amazon.de/dp/B07GJG8X74",
		code: "B07GJG8X74",
		productName: "Canon Toner 051H",
		sku: "CN-051H",
		asinCode: "B07GJG8X74",
		competitorPrice: 39.99,
		myPrice: 41.5,
		pricePosition: "Higher",
		stock: 5,
		status: "Active",
	},
	{
		id: "3",
		competitorUrl: "shop.example.com/p/sku-123",
		code: "-",
		productName: "Generic Office Paper A4",
		sku: "A4-80GSM-500",
		asinCode: undefined,
		competitorPrice: 4.5,
		myPrice: 4.5,
		pricePosition: "Equal",
		stock: 120,
		status: "Active",
	},
];

export default function MonitoredUrlsTable() {
	const [data, setData] = useState<MonitoredUrlRow[]>(initialData);
	const [globalFilter, setGlobalFilter] = useState("");
	const [rowSelection, setRowSelection] = useState({});
	const [sorting, setSorting] = useState([]);

	const debouncedSetGlobalFilter = useCallback(
		debounce((value: string) => setGlobalFilter(value), 300),
		[]
	);

	const columns: ColumnDef<MonitoredUrlRow>[] = useMemo(
		() => [
			{
				id: "select",
				header: ({ table }) => (
					<Checkbox
						checked={table.getIsAllPageRowsSelected()}
						onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
						aria-label='Select all'
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(v) => row.toggleSelected(!!v)}
						aria-label='Select row'
					/>
				),
				enableSorting: false,
				enableHiding: false,
			},
			{
				accessorKey: "competitorUrl",
				header: ({ column }) => (
					<Button
						variant='ghost'
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className='h-8 px-2 lg:px-3'
					>
						Competitor URL
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
					const r = row.original;
					return (
						<div className='max-w-[520px] space-y-1'>
							<div
								className='truncate text-sm text-blue-600'
								title={r.competitorUrl}
							>
								{r.competitorUrl}
							</div>
							<div className='space-x-2 text-xs text-gray-500'>
								<span>Code: {r.code ?? "-"}</span>
							</div>
							{r.productName && (
								<div className='text-xs text-gray-700'>{r.productName}</div>
							)}
							<div className='space-x-3 text-xs text-gray-500'>
								{r.sku && <span>SKU: {r.sku}</span>}
								{r.asinCode && <span>Code: {r.asinCode}</span>}
							</div>
						</div>
					);
				},
			},
			{
				id: "prodMatched",
				header: "Prod. Matched",
				cell: ({ row }) => {
					const matched = !!row.original.productName;
					return (
						<div className='flex items-center'>
							{matched ? (
								<Badge variant='secondary'>Yes</Badge>
							) : (
								<Badge variant='outline'>No</Badge>
							)}
						</div>
					);
				},
				enableSorting: false,
			},
			{
				accessorKey: "competitorPrice",
				header: ({ column }) => (
					<Button
						variant='ghost'
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className='h-8 px-2 lg:px-3'
					>
						Comp. Price
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
					<div className='text-right text-sm font-medium'>
						{formatEuro(row.getValue("competitorPrice") as number | null)}
					</div>
				),
				sortingFn: (a, b, id) => {
					const av = (a.getValue(id) as number | null) ?? -Infinity;
					const bv = (b.getValue(id) as number | null) ?? -Infinity;
					return (av as number) - (bv as number);
				},
			},
			{
				accessorKey: "myPrice",
				header: ({ column }) => (
					<Button
						variant='ghost'
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className='h-8 px-2 lg:px-3'
					>
						My Price
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
					<div className='text-right text-sm'>
						{formatEuro(row.getValue("myPrice") as number | null)}
					</div>
				),
				sortingFn: (a, b, id) => {
					const av = (a.getValue(id) as number | null) ?? -Infinity;
					const bv = (b.getValue(id) as number | null) ?? -Infinity;
					return (av as number) - (bv as number);
				},
			},
			{
				accessorKey: "pricePosition",
				header: "Price Position",
				cell: ({ row }) => {
					const v = row.getValue(
						"pricePosition"
					) as MonitoredUrlRow["pricePosition"];
					const color =
						v === "Lower"
							? "text-green-600"
							: v === "Higher"
								? "text-red-600"
								: v === "Equal"
									? "text-gray-600"
									: "text-blue-600";
					return (
						<div className={`text-right text-sm font-medium ${color}`}>
							{v ?? "Analyzing..."}
						</div>
					);
				},
			},
			{
				accessorKey: "stock",
				header: "Stock",
				cell: ({ row }) => {
					const v = row.getValue("stock") as MonitoredUrlRow["stock"];
					return (
						<div className='text-right text-sm'>
							{typeof v === "number" ? v : (v ?? "Analyzing...")}
						</div>
					);
				},
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => {
					const status = row.getValue("status") as MonitoredUrlRow["status"];
					const isActive = status === "Active";
					const isProgress = status === "In Progress" || status === "Analyzing";
					return (
						<div className='flex justify-end'>
							<Badge
								variant={
									isActive ? "default" : isProgress ? "secondary" : "outline"
								}
							>
								{isActive ? (
									<CheckCircle className='mr-1 h-3 w-3' />
								) : (
									<AlertCircle className='mr-1 h-3 w-3' />
								)}
								{status}
							</Badge>
						</div>
					);
				},
			},
			{
				id: "actions",
				enableHiding: false,
				cell: ({ row }) => {
					const r = row.original;
					return (
						<div className='flex justify-end'>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant='ghost' className='h-8 w-8 p-0'>
										<MoreHorizontal className='h-4 w-4' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end'>
									<DropdownMenuCheckboxItem
										onClick={() => console.log("View", r.id)}
									>
										<Eye className='mr-2 h-4 w-4' />
										View
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										onClick={() => console.log("Edit", r.id)}
									>
										<Edit className='mr-2 h-4 w-4' />
										Edit
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										onClick={() => console.log("Delete", r.id)}
										className='text-red-600'
									>
										<Trash2 className='mr-2 h-4 w-4' />
										Delete
									</DropdownMenuCheckboxItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					);
				},
			},
		],
		[]
	);

	const table = useReactTable({
		data,
		columns,
		state: {
			rowSelection,
			globalFilter,
			// @ts-ignore tanstack typing for sorting in this context
			sorting,
		},
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		// @ts-ignore
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	return (
		<div className='w-full space-y-4'>
			{/* Controls */}
			<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				<div className='flex flex-wrap items-center gap-2'>
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
						<Input
							placeholder='Search monitored URLs...'
							value={globalFilter}
							onChange={(e) => {
								setGlobalFilter(e.target.value);
								debouncedSetGlobalFilter(e.target.value);
							}}
							className='w-full pl-10 sm:w-64 md:w-96'
						/>
					</div>
				</div>
				<div className='flex items-center gap-2'>
					<div className='text-sm text-gray-600 dark:text-gray-400'>
						{table.getFilteredRowModel().rows.length} items
					</div>
				</div>
			</div>

			{/* Table */}
			<div className='rounded-md border border-gray-200 dark:border-gray-700'>
				<Table>
					<TableHeader>
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
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
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
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className='h-24 text-center'
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className='flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between'>
				<div className='text-muted-foreground flex-1 text-sm dark:text-gray-400'>
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} selected
				</div>
				<div className='flex flex-wrap items-center gap-3 sm:gap-6 lg:gap-8'>
					<div className='flex items-center gap-2'>
						<p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
							Rows
						</p>
						<select
							className='h-8 w-[70px] rounded-md border border-gray-300 bg-white text-sm dark:border-gray-600 dark:bg-gray-800'
							value={table.getState().pagination.pageSize}
							onChange={(e) => table.setPageSize(Number(e.target.value))}
						>
							{[10, 20, 30, 40, 50].map((size) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</select>
					</div>
					<div className='flex items-center gap-2'>
						<Button
							variant='outline'
							className='h-8 border-gray-300 px-2 dark:border-gray-600'
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							Prev
						</Button>
						<div className='text-sm font-medium text-gray-900 dark:text-gray-100'>
							Page {table.getState().pagination.pageIndex + 1} of{" "}
							{table.getPageCount()}
						</div>
						<Button
							variant='outline'
							className='h-8 border-gray-300 px-2 dark:border-gray-600'
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							Next
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
