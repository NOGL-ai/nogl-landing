"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  ColumnSizingState,
  ColumnOrderState,
} from "@tanstack/react-table";
import { DataTableProps } from "../types";

export function useTableState<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  enablePagination = true,
  enableSorting = true,
  enableFiltering = true,
  enableSelection = false,
  enableGlobalSearch = false,
  enableColumnManagement = false,
  enableColumnResizing = false,
  enableColumnReordering = false,
  pageSize = 10,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);

  // Global filter function
  const globalFilterFn = React.useCallback((row: any, _columnId: string, value: string) => {
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
  }, []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updaterOrValue) => {
      setRowSelection(updaterOrValue);
      if (onRowSelectionChange) {
        // Get the updated row selection state
        const newRowSelection = typeof updaterOrValue === 'function' 
          ? updaterOrValue(rowSelection) 
          : updaterOrValue;
        
        // Get selected rows from the current data based on selection indices
        const selectedRows = data.filter((_, index) => newRowSelection[index]);
        onRowSelectionChange(selectedRows);
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: enableGlobalSearch ? globalFilterFn : "includesString",
    enableColumnResizing: enableColumnResizing,
    columnResizeMode: "onChange",
    onColumnSizingChange: setColumnSizing,
    onColumnOrderChange: setColumnOrder,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnSizing,
      columnOrder,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return {
    table,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    globalFilter,
    setGlobalFilter,
    columnSizing,
    setColumnSizing,
    columnOrder,
    setColumnOrder,
  };
}
