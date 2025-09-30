/**
 * UNUSED FILE - UI COMPONENT
 * 
 * This is a high-performance infinite scroll table component built with
 * TanStack Table, TanStack Virtual, and React Query. It's designed for
 * handling large datasets efficiently but is not currently used in the
 * main application.
 * 
 * Features:
 * - Infinite scrolling with automatic data fetching
 * - Virtual scrolling for optimal performance
 * - Server-side sorting support
 * - TypeScript support
 * - Dark mode support
 * - Error handling and loading states
 * - Row interactions (click, double-click)
 * - Row selection capabilities
 * 
 * Dependencies: @tanstack/react-table, @tanstack/react-virtual, @tanstack/react-query
 * (All dependencies are already installed in package.json)
 * 
 * To use this component:
 * 1. Import it in your page/component
 * 2. Set up the QueryClientProvider (or use existing query client)
 * 3. Create data fetching functions
 * 4. Define column configurations
 * 
 * Created: [Date when this was added]
 * Status: Unused - not integrated into main app
 */

'use client';

import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
  SortingState,
  OnChangeFn,
} from '@tanstack/react-table';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { InfiniteScrollTableProps } from '@/types/infiniteTable';
import { createScrollHandler } from '@/utils/infiniteScrollUtils';
import { cn } from '@/lib/utils';

export function InfiniteScrollTable<TData>({
  queryKey,
  queryFn,
  fetchSize = 50,
  columns,
  height = 600,
  rowHeight = 50,
  className,
  enableVirtualization = true,
  overscan = 5,
  threshold = 500,
  enableSorting = true,
  sorting = [],
  onSortingChange,
  loading = false,
  emptyState,
  onRowClick,
  onRowDoubleClick,
  enableSelection = false,
  selectedRows = new Set(),
  onRowSelect,
  enableMemoization = true,
  rowKeyExtractor = (row: TData, index: number) => `row-${index}`,
}: InfiniteScrollTableProps<TData>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Use infinite scroll hook for data fetching
  const {
    data: flatData,
    totalRowCount,
    totalFetched,
    hasNextPage,
    isLoading,
    isFetching,
    isFetchingNextPage,
    error,
    fetchNextPage,
  } = useInfiniteScroll({
    queryKey,
    queryFn,
    fetchSize,
  });

  // Table configuration
  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    enableSorting,
    manualSorting: true,
    state: {
      sorting,
    },
    onSortingChange,
  });

  // Virtual scrolling setup
  const rowVirtualizer = useVirtualizer({
    count: flatData.length,
    estimateSize: () => rowHeight,
    getScrollElement: () => tableContainerRef.current,
    // Measure dynamic row height, except in Firefox
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan,
  });

  // Scroll handler for infinite loading
  const handleScroll = useMemo(
    () =>
      createScrollHandler(
        tableContainerRef,
        fetchNextPage,
        isFetching,
        hasNextPage,
        threshold
      ),
    [fetchNextPage, isFetching, hasNextPage, threshold]
  );

  // Check on mount and after fetch to see if we need to fetch more data
  useEffect(() => {
    if (tableContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = tableContainerRef.current;
      if (
        scrollHeight - scrollTop - clientHeight < threshold &&
        !isFetching &&
        hasNextPage
      ) {
        fetchNextPage();
      }
    }
  }, [fetchNextPage, isFetching, hasNextPage, threshold, flatData.length]);

  // Scroll to top when sorting changes
  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      onSortingChange?.(updater);
      if (flatData.length > 0) {
        rowVirtualizer.scrollToIndex?.(0);
      }
    },
    [onSortingChange, flatData.length, rowVirtualizer]
  );

  // Update table options
  table.setOptions((prev) => ({
    ...prev,
    onSortingChange: handleSortingChange,
  }));

  const { rows } = table.getRowModel();

  // Memoized row renderer
  const renderRow = useCallback(
    (virtualRow: any) => {
      const row = rows[virtualRow.index] as Row<TData>;
      if (!row) return null;

      return (
        <tr
          data-index={virtualRow.index}
          ref={(node) => rowVirtualizer.measureElement(node)}
          key={rowKeyExtractor(row.original, virtualRow.index)}
          className={cn(
            'flex w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
            selectedRows.has(rowKeyExtractor(row.original, virtualRow.index)) &&
              'bg-blue-50 dark:bg-blue-900/20'
          )}
          style={{
            position: 'absolute',
            transform: `translateY(${virtualRow.start}px)`,
            width: '100%',
          }}
          onClick={() => onRowClick?.(row)}
          onDoubleClick={() => onRowDoubleClick?.(row)}
        >
          {row.getVisibleCells().map((cell) => (
            <td
              key={cell.id}
              className="flex items-center px-4 py-2"
              style={{
                width: cell.column.getSize(),
              }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      );
    },
    [
      rows,
      rowVirtualizer,
      rowKeyExtractor,
      selectedRows,
      onRowClick,
      onRowDoubleClick,
    ]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 dark:border-gray-700"></div>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-base border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-3 text-text-sub-500 dark:text-gray-400 font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-lighter dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-base" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-base dark:text-red-400 font-medium mb-3">Something went wrong</p>
          <p className="text-text-sub-500 dark:text-gray-400 text-sm mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-base text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (flatData.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        {emptyState || (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">No data available</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Data info */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {totalFetched} of {totalRowCount} rows
        {isFetchingNextPage && ' (Loading more...)'}
      </div>

      {/* Table container */}
      <div
        ref={tableContainerRef}
        className={cn(
          'relative overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg',
          className
        )}
        style={{
          height: `${height}px`,
        }}
        onScroll={handleScroll}
      >
        <table className="w-full" style={{ display: 'grid' }}>
          {/* Header */}
          <thead
            className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
            style={{
              display: 'grid',
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="flex w-full"
                style={{ display: 'flex' }}
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="flex items-center px-4 py-3 font-medium text-gray-900 dark:text-gray-100"
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    <div
                      className={cn(
                        'flex items-center space-x-1',
                        header.column.getCanSort() &&
                          'cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Body */}
          <tbody
            className="bg-white dark:bg-gray-900"
            style={{
              display: 'grid',
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map(renderRow)}
          </tbody>
        </table>
      </div>

      {/* Loading indicator */}
      {isFetching && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Fetching more data...</span>
          </div>
        </div>
      )}
    </div>
  );
}
