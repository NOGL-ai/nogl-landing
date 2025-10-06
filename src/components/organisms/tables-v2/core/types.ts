"use client";

import { ColumnDef, Table } from "@tanstack/react-table";

// Base table configuration
export interface BaseTableConfig {
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableSelection?: boolean;
  enableGlobalSearch?: boolean;
  enableColumnManagement?: boolean;
  enableColumnResizing?: boolean;
  enableColumnReordering?: boolean;
  pageSize?: number;
  variant?: "default" | "untitled-ui";
}

// Main table props interface
export interface DataTableProps<TData, TValue> extends BaseTableConfig {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  className?: string;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  tableTitle?: string;
  tableBadge?: React.ReactNode;
  tableDescription?: string;
}

// Cell component props
export interface CellProps<TData> {
  table: Table<TData>;
  row?: any;
  column?: any;
  value?: any;
}

// Header component props
export interface HeaderProps<TData> {
  table: Table<TData>;
  enableSelection?: boolean;
  enableColumnResizing?: boolean;
  enableColumnReordering?: boolean;
  variant?: "default" | "untitled-ui";
}

// Body component props
export interface BodyProps<TData> {
  table: Table<TData>;
  enableSelection?: boolean;
  enableColumnResizing?: boolean;
  enableColumnReordering?: boolean;
  variant?: "default" | "untitled-ui";
}

// Pagination props
export interface PaginationProps<TData> {
  table: Table<TData>;
  variant?: "default" | "untitled-ui";
}

// Search props
export interface SearchProps<TData> {
  table: Table<TData>;
  placeholder?: string;
  debounceMs?: number;
}

// Toolbar props
export interface ToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
}

// Selection checkbox props
export interface SelectionCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel: string;
  indeterminate?: boolean;
  disabled?: boolean;
}

// Sortable header props
export interface SortableHeaderProps {
  column: any;
  children: React.ReactNode;
  className?: string;
}

// Domain-specific table props
export interface DomainTableProps<TData, TValue> extends DataTableProps<TData, TValue> {
  // Domain-specific configuration
  domainConfig?: Record<string, any>;
  customCells?: Record<string, React.ComponentType<any>>;
  customFilters?: React.ComponentType<any>;
  customActions?: React.ComponentType<any>;
}

// Export all types
export type {
  ColumnDef,
  Table,
} from "@tanstack/react-table";
