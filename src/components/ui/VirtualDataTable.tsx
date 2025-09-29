'use client';

import React, { useMemo, useCallback } from 'react';
import { useVirtualScrolling } from '@/hooks/useVirtualScrolling';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
  SortingState,
  OnChangeFn,
  ColumnFiltersState,
  RowSelectionState,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';

interface VirtualDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  height?: number;
  rowHeight?: number;
  className?: string;
  enableVirtualization?: boolean;
  threshold?: number;
  onRowClick?: (row: Row<TData>) => void;
  onRowDoubleClick?: (row: Row<TData>) => void;
  selectedRows?: Set<string>;
  onRowSelect?: (rowId: string, selected: boolean) => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
  headerSticky?: boolean;
  overscan?: number;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableSelection?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  getRowId?: (row: TData) => string;
  enableRowSelection?: boolean;
  enableMultiSelection?: boolean;
  enableSubRowSelection?: boolean;
  enableSelectAll?: boolean;
  onSelectAll?: (selected: boolean) => void;
  selectAllChecked?: boolean;
  selectAllIndeterminate?: boolean;
  // Performance options
  enableMemoization?: boolean;
  enableRowMemoization?: boolean;
  rowKeyExtractor?: (row: TData, index: number) => string;
}

export function VirtualDataTable<TData>({
  data,
  columns,
  height = 400,
  rowHeight = 50,
  className,
  enableVirtualization = true,
  threshold = 1000,
  onRowClick,
  onRowDoubleClick,
  selectedRows = new Set(),
  onRowSelect,
  loading = false,
  emptyState,
  headerSticky = true,
  overscan = 5,
  enableSorting = true,
  enableFiltering = true,
  enableSelection = false,
  globalFilter,
  onGlobalFilterChange,
  sorting = [],
  onSortingChange,
  columnFilters = [],
  onColumnFiltersChange,
  rowSelection = {},
  onRowSelectionChange,
  getRowId,
  enableRowSelection = false,
  enableMultiSelection = false,
  enableSubRowSelection = false,
  enableSelectAll = false,
  onSelectAll,
  selectAllChecked = false,
  selectAllIndeterminate = false,
  enableMemoization = true,
  enableRowMemoization = true,
  rowKeyExtractor = (row: TData, index: number) => `row-${index}`,
}: VirtualDataTableProps<TData>) {
  // Table configuration
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    enableSorting,
    enableFilters: enableFiltering,
    enableRowSelection,
    enableMultiRowSelection: enableMultiSelection,
    enableSubRowSelection,
    getRowId,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
    onSortingChange,
    onColumnFiltersChange,
    onRowSelectionChange,
    onGlobalFilterChange,
  });

  // Virtual scrolling setup
  const {
    virtualizer,
    parentRef,
    shouldVirtualize,
    isClient,
    virtualItems,
    totalSize,
    scrollToIndex,
    scrollToOffset,
  } = useVirtualScrolling({
    itemCount: data.length,
    itemHeight: rowHeight,
    overscan,
    threshold,
    enabled: enableVirtualization,
  });

  // Memoized row renderer for virtual scrolling
  const renderVirtualRow = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const row = table.getRowModel().rows[index];
      if (!row) return null;

      const isSelected = selectedRows.has(row.id);
      const rowKey = rowKeyExtractor(row.original, index);

      const handleSelect = (selected: boolean) => {
        onRowSelect?.(row.id, selected);
      };

      const handleClick = () => {
        onRowClick?.(row);
      };

      const handleDoubleClick = () => {
        onRowDoubleClick?.(row);
      };

      return (
        <div
          key={rowKey}
          style={style}
          className={cn(
            'flex items-center border-b border-gray-200 dark:border-gray-700',
            'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
            isSelected && 'bg-blue-50 dark:bg-blue-900/20'
          )}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          {row.getVisibleCells().map((cell) => (
            <div
              key={cell.id}
              className="px-4 py-3 flex-1"
              style={{ minWidth: '150px' }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          ))}
        </div>
      );
    },
    [
      table,
      selectedRows,
      onRowClick,
      onRowDoubleClick,
      onRowSelect,
      rowKeyExtractor,
    ]
  );

  // Memoized header renderer
  const headerRenderer = useMemo(() => {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 flex-1"
                style={{ minWidth: '150px' }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }, [table]);

  // Loading state
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center h-32', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-32 text-gray-500', className)}>
        {emptyState || 'No data available'}
      </div>
    );
  }

  // Non-virtualized table for small datasets
  if (!shouldVirtualize || !isClient) {
    return (
      <div className={cn('rounded-md border border-gray-200 dark:border-gray-700', className)}>
        <div className={cn(headerSticky && 'sticky top-0 z-10')}>
          {headerRenderer}
        </div>
        <div className="max-h-96 overflow-auto">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => {
              const isSelected = selectedRows.has(row.id);
              const rowKey = rowKeyExtractor(row.original, index);
              return (
                <div
                  key={rowKey}
                  className={cn(
                    'flex items-center border-b border-gray-200 dark:border-gray-700',
                    'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
                    isSelected && 'bg-blue-50 dark:bg-blue-900/20'
                  )}
                  onClick={() => onRowClick?.(row)}
                  onDoubleClick={() => onRowDoubleClick?.(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      className="px-4 py-3 flex-1"
                      style={{ minWidth: '150px' }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                </div>
              );
            })
          ) : (
            <div className="h-24 text-center text-gray-500 dark:text-gray-400 flex items-center justify-center">
              No results found.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Virtualized table for large datasets
  return (
    <div className={cn('rounded-md border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <div className={cn(headerSticky && 'sticky top-0 z-10')}>
        {headerRenderer}
      </div>

      {/* Virtualized Body */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: `${height}px` }}
      >
        <div
          style={{
            height: `${totalSize}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderVirtualRow({
                index: virtualItem.index,
                style: {},
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Virtual scrolling info */}
      <div className="flex items-center justify-between space-x-2 py-2 px-4 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <div>
          Showing {virtualItems.length} of {data.length.toLocaleString()} rows
          {selectedRows.size > 0 && (
            <span> • {selectedRows.size} selected</span>
          )}
        </div>
        <div>
          Virtual scrolling enabled
        </div>
      </div>
    </div>
  );
}

export default VirtualDataTable;
