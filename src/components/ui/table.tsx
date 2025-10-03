"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TableProps
	extends React.TableHTMLAttributes<HTMLTableElement> {
	variant?: "default" | "striped" | "bordered";
	size?: "sm" | "md" | "lg";
}

export interface TableHeadProps
	extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {
	sortable?: boolean;
	onSort?: () => void;
}

export interface TableRowProps
	extends React.HTMLAttributes<HTMLTableRowElement> {
	variant?: "default" | "hover" | "selected";
}

export interface TableCellProps
	extends React.TdHTMLAttributes<HTMLTableCellElement> {
	variant?: "default" | "numeric" | "action";
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
	({ className, variant = "default", size = "md", ...props }, ref) => {
		const variants = {
			default: "border-collapse",
			striped: "border-collapse [&_tbody_tr:nth-child(odd)]:bg-gray-50",
			bordered: "border-collapse border border-gray-200",
		};

		const sizes = {
			sm: "text-sm",
			md: "text-sm",
			lg: "text-base",
		};

		return (
			<div className='relative w-full overflow-auto'>
				<table
					ref={ref}
					className={cn(
						"w-full caption-bottom",
						variants[variant],
						sizes[size],
						className
					)}
					{...props}
				/>
			</div>
		);
	}
);

const TableHeader = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));

const TableBody = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tbody
		ref={ref}
		className={cn("[&_tr:last-child]:border-0", className)}
		{...props}
	/>
));

const TableFooter = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tfoot
		ref={ref}
		className={cn("bg-gray-50 font-medium [&>tr]:last:border-b-0", className)}
		{...props}
	/>
));

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
	({ className, variant = "default", ...props }, ref) => {
		const variants = {
			default:
				"border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50",
			hover:
				"border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-50",
			selected: "border-b bg-gray-50 data-[state=selected]:bg-gray-100",
		};

		return (
			<tr ref={ref} className={cn(variants[variant], className)} {...props} />
		);
	}
);

const TableHead = React.forwardRef<HTMLTableHeaderCellElement, TableHeadProps>(
	({ className, sortable = false, onSort, ...props }, ref) => {
		return (
			<th
				ref={ref}
				className={cn(
					"h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0",
					sortable && "cursor-pointer select-none hover:text-gray-900",
					className
				)}
				onClick={sortable ? onSort : undefined}
				{...props}
			/>
		);
	}
);

const TableCell = React.forwardRef<HTMLTableDataCellElement, TableCellProps>(
	({ className, variant = "default", ...props }, ref) => {
		const variants = {
			default: "p-4 align-middle [&:has([role=checkbox])]:pr-0",
			numeric: "p-4 align-middle text-right [&:has([role=checkbox])]:pr-0",
			action: "p-4 align-middle [&:has([role=checkbox])]:pr-0 w-[100px]",
		};

		return (
			<td ref={ref} className={cn(variants[variant], className)} {...props} />
		);
	}
);

const TableCaption = React.forwardRef<
	HTMLTableCaptionElement,
	React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
	<caption
		ref={ref}
		className={cn("mt-4 text-sm text-gray-500", className)}
		{...props}
	/>
));

Table.displayName = "Table";
TableHeader.displayName = "TableHeader";
TableBody.displayName = "TableBody";
TableFooter.displayName = "TableFooter";
TableRow.displayName = "TableRow";
TableHead.displayName = "TableHead";
TableCell.displayName = "TableCell";
TableCaption.displayName = "TableCaption";

export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableCaption,
};
