"use client";

import React, { useState, useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import Checkbox from '@/components/ui/checkbox';
import type { TrendComputation } from '@/utils/priceTrend';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Types
export interface Competitor {
  id: number;
  name: string;
  domain: string;
  avatar: string;
  products: number;
  position: number;
  trend: number;
  trendUp: boolean;
  date: string;
  categories: string[];
  competitorPrice: number;
  myPrice: number;
}

interface TanStackTableProps {
  data: Competitor[];
  selectedRows: Set<number>;
  onRowSelectionChange: (selectedRows: Set<number>) => void;
  onSortChange?: (sorting: { column: string; direction: 'asc' | 'desc' | 'none' }) => void;
  onRowClick?: (row: Competitor) => void;
  onRowKeyDown?: (event: React.KeyboardEvent, row: Competitor, index: number) => void;
  focusedRowIndex?: number;
  maxProducts?: number;
  badgeClasses?: Record<string, string>;
  ProductsCell?: React.ComponentType<{ competitor: Competitor; maxProducts: number }>;
  PricePositionCell?: React.ComponentType<{ competitorPrice: number; myPrice: number }>;
  computeTrend?: (competitorPrice: number, myPrice: number) => TrendComputation;
  formatPercentDetailed?: (value: number) => string;
  formatPercentCompact?: (value: number) => string;
  showCompetitorColumn?: boolean;
  showProductsColumn?: boolean;
  enableDragDrop?: boolean;
  onDragEnd?: (event: DragEndEvent) => void;
}

const columnHelper = createColumnHelper<Competitor>();

export const TanStackTable: React.FC<TanStackTableProps> = ({
  data,
  selectedRows,
  onRowSelectionChange,
  onSortChange,
  onRowClick,
  onRowKeyDown,
  focusedRowIndex = -1,
  maxProducts,
  badgeClasses = {},
  ProductsCell,
  PricePositionCell,
  computeTrend,
  formatPercentDetailed,
  formatPercentCompact,
  showCompetitorColumn = false,
  showProductsColumn = true,
  enableDragDrop = false,
  onDragEnd,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    if (onDragEnd) {
      onDragEnd(event);
    }
  };

  // Handle row selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onRowSelectionChange(new Set(data.map(item => item.id)));
    } else {
      onRowSelectionChange(new Set());
    }
  };

  const handleRowSelect = (rowId: number, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(rowId);
    } else {
      newSelectedRows.delete(rowId);
    }
    onRowSelectionChange(newSelectedRows);
  };

  // Define columns
  const columns = useMemo<ColumnDef<Competitor>[]>(() => {
    const baseColumns: ColumnDef<Competitor>[] = [
      {
        accessorKey: 'name',
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center gap-3">
            <Checkbox
              checked={table.getIsAllRowsSelected()}
              indeterminate={table.getIsSomeRowsSelected()}
              onChange={(checked) => handleSelectAll(checked)}
              ariaLabel="Select all competitors"
              id="select-all-checkbox"
              className="mr-1"
            />
            <span className="text-xs font-semibold text-muted-foreground">
              {showCompetitorColumn ? 'Product' : 'Competitor'}
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedRows.has(row.original.id)}
              onChange={(checked) => handleRowSelect(row.original.id, checked)}
              ariaLabel={`Select ${row.original.name} competitor`}
              id={`competitor-${row.original.id}-checkbox`}
              className="mr-1"
            />
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 flex-shrink-0">
                <div className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-1">
                  <img
                    src={row.original.avatar}
                    alt={`${row.original.name} logo`}
                    className="h-8 w-8 rounded-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 hidden"
                    style={{ display: 'none' }}
                  >
                    {row.original.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              <div id={`competitor-${row.original.id}-info`} className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground truncate">{row.original.name}</div>
                <div className="text-sm text-muted-foreground truncate">{row.original.domain}</div>
              </div>
            </div>
          </div>
        ),
        enableSorting: true,
        enableHiding: false,
      },
    ];

    // Add Competitor column only if showCompetitorColumn is true
    if (showCompetitorColumn) {
      baseColumns.push({
        accessorKey: 'name',
        id: 'competitor',
        header: 'Competitor',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-full border border-black/8 bg-gray-200"
              aria-hidden="true"
            />
            <div>
              <div className="text-sm font-medium text-foreground">{row.original.name}</div>
              <div className="text-sm text-muted-foreground">{row.original.domain}</div>
            </div>
          </div>
        ),
        enableSorting: true,
      });
    }

    // Add Products column only if showProductsColumn is true
    if (showProductsColumn) {
      baseColumns.push({
        accessorKey: 'products',
        id: 'products',
        header: 'Products',
        cell: ({ row }) => (
          ProductsCell ? (
            <ProductsCell 
              competitor={row.original} 
              maxProducts={maxProducts || 100}
            />
          ) : (
            <div className="text-sm text-foreground">
              {row.original.products.toLocaleString()}
            </div>
          )
        ),
        enableSorting: true,
      });
    }

    // Add Competitor Count column
    baseColumns.push({
      accessorKey: 'competitorCount',
      id: 'competitorCount',
      header: 'Competitors',
      cell: ({ row }) => {
        const count = (row.original as any).competitorCount || 0;
        const getCompetitorCountColor = (count: number) => {
          if (count === 0) return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
          if (count <= 2) return 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300';
          if (count <= 4) return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
          return 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300';
        };

        const getCompetitorCountText = (count: number) => {
          if (count === 0) return 'No competitors';
          if (count === 1) return '1 competitor';
          return `${count} competitors`;
        };

        return (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getCompetitorCountColor(count)}`}>
              {getCompetitorCountText(count)}
            </span>
          </div>
        );
      },
      enableSorting: true,
    });

    // Add remaining columns
    baseColumns.push(
      {
        accessorKey: 'competitorPrice',
        header: 'Competitor Price',
        cell: ({ row }) => (
          PricePositionCell ? (
            <PricePositionCell 
              competitorPrice={row.original.competitorPrice} 
              myPrice={row.original.myPrice}
            />
          ) : (
            <div className="text-sm text-foreground">
              {row.original.competitorPrice.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR',
              })}
            </div>
          )
        ),
        enableSorting: true,
      },
      {
        accessorKey: 'trend',
        header: 'Trend',
        cell: ({ row }) => {
          if (!computeTrend || !formatPercentDetailed || !formatPercentCompact) {
            return <div className="text-sm text-foreground">N/A</div>;
          }
          
          const { value, precise, up, neutral } = computeTrend(row.original.competitorPrice, row.original.myPrice);
          const label = neutral
            ? 'Prices equal'
            : up
            ? `You are ${formatPercentDetailed(-precise)} cheaper than competitor`
            : `You are ${formatPercentDetailed(precise)} more expensive than competitor`;
          
          return (
            <div 
              className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 ${
                neutral
                  ? 'border-border-secondary bg-muted'
                  : up
                  ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900'
                  : 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900'
              }`}
              role="img"
              aria-label={label}
            >
              {!neutral && (up ? (
                <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-400" aria-hidden="true" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600 dark:text-red-400" aria-hidden="true" />
              ))}
              <span className={`text-xs font-medium ${neutral ? 'text-muted-foreground' : up ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {neutral ? '0%' : formatPercentCompact(precise)}
              </span>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: 'categories',
        header: 'Categories',
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-1" role="list" aria-label="Product categories">
            {row.original.categories.slice(0, 2).map((category, index) => (
              <span
                key={category}
                role="listitem"
                className={`inline-flex items-center gap-1 whitespace-nowrap flex-shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClasses[category] ?? 'border-border-secondary bg-muted text-muted-foreground'} ${index === 1 ? 'hidden md:inline-flex' : ''}`}
                aria-label={`Category: ${category}`}
              >
                {category === 'Active' && <span className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" aria-hidden="true" />}
                {category === 'Inactive' && <span className="h-2 w-2 rounded-full bg-gray-500 dark:bg-gray-400" aria-hidden="true" />}
                {category === 'In Stock' && <span className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" aria-hidden="true" />}
                {category === 'Out of Stock' && <span className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400" aria-hidden="true" />}
                {category}
              </span>
            ))}
            {row.original.categories.length > 2 && (
              <span 
                className="inline-flex items-center whitespace-nowrap flex-shrink-0 rounded-full border border-[#E9EAEB] bg-[#FAFAFA] px-2 py-0.5 text-xs font-medium text-muted-foreground"
                role="listitem"
                aria-label={`${row.original.categories.length - 2} additional categories`}
              >
                +{row.original.categories.length - 2}
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <button 
            type="button"
            className="rounded-lg p-2 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40" 
            aria-label={`More actions for ${row.original.name}`}
            aria-haspopup="menu"
          >
            <svg className="h-5 w-5 text-quaternary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 5.25a.75.75 0 110-1.5.75.75 0 010 1.5zm0 5.25a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
          </button>
        ),
        enableSorting: false,
        enableHiding: false,
      }
    );

    return baseColumns;
  }, [selectedRows, maxProducts, badgeClasses, ProductsCell, PricePositionCell, computeTrend, formatPercentDetailed, formatPercentCompact, showCompetitorColumn, showProductsColumn]);

  // Sortable Row Component
  const SortableRow = ({ row, index }: { row: any; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: row.original.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    if (!enableDragDrop) {
      return (
        <tr
          key={row.id}
          className={`transition-colors hover:bg-muted ${
            focusedRowIndex === index ? 'bg-blue-50 dark:bg-blue-900 ring-2 ring-blue-200 dark:ring-blue-800' : ''
          }`}
          tabIndex={focusedRowIndex === index ? 0 : -1}
          onFocus={() => onRowClick?.(row.original)}
          onKeyDown={(e) => onRowKeyDown?.(e, row.original, index)}
          aria-selected={selectedRows.has(row.original.id)}
          aria-label={`Competitor ${row.original.name} from ${row.original.domain}`}
        >
          {row.getVisibleCells().map((cell: any) => (
            <td
              key={cell.id}
              className="px-6 py-4 bg-card"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      );
    }

    return (
      <tr
        ref={setNodeRef}
        style={style}
        className={`transition-colors hover:bg-muted ${
          focusedRowIndex === index ? 'bg-blue-50 dark:bg-blue-900 ring-2 ring-blue-200 dark:ring-blue-800' : ''
        } ${isDragging ? 'z-50' : ''}`}
        onFocus={() => onRowClick?.(row.original)}
        onKeyDown={(e) => onRowKeyDown?.(e, row.original, index)}
        aria-selected={selectedRows.has(row.original.id)}
        aria-label={`Competitor ${row.original.name} from ${row.original.domain}`}
        {...attributes}
        {...listeners}
        tabIndex={focusedRowIndex === index ? 0 : -1}
      >
        {row.getVisibleCells().map((cell: any) => (
          <td
            key={cell.id}
            className="px-6 py-4 bg-card"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    );
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: (updaterOrValue) => {
      setSorting(updaterOrValue);
      // Call parent callback immediately when sorting changes
      if (onSortChange) {
        const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
        if (newSorting.length > 0) {
          const sort = newSorting[0];
          onSortChange({
            column: sort.id,
            direction: sort.desc ? 'desc' : 'asc',
          });
        }
      }
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableSorting: true,
    manualPagination: true, // We handle pagination externally
  });

  const tableContent = (
    <table
      className="w-full"
      aria-label="Competitor monitoring table"
      aria-describedby="table-description"
    >
        <caption id="table-description" className="sr-only">
          Table showing competitor products with pricing information, trends, and categories. 
          Use arrow keys to navigate between rows, space or enter to select, and escape to clear selection.
        </caption>
        <thead className="border-b border-border-secondary bg-muted">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground"
                  scope="col"
                  aria-sort={
                    header.column.getCanSort()
                      ? header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                        ? 'descending'
                        : 'none'
                      : 'none'
                  }
                >
                  {header.isPlaceholder ? null : (
                    <div className="flex items-center gap-1">
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 rounded"
                          aria-label={`Sort by ${header.column.id} ${header.column.getIsSorted() === 'asc' ? 'descending' : 'ascending'}`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown className="h-4 w-4" />
                          ) : (
                            <ChevronsUpDown className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border-secondary bg-card">
          {enableDragDrop ? (
            <SortableContext items={data.map(item => item.id)} strategy={verticalListSortingStrategy}>
              {table.getRowModel().rows.map((row, index) => (
                <SortableRow key={row.id} row={row} index={index} />
              ))}
            </SortableContext>
          ) : (
            table.getRowModel().rows.map((row, index) => (
              <SortableRow key={row.id} row={row} index={index} />
            ))
          )}
        </tbody>
      </table>
  );

  return (
    <div className="w-full bg-card transition-colors">
      {enableDragDrop ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {tableContent}
        </DndContext>
      ) : (
        tableContent
      )}
    </div>
  );
};

export default TanStackTable;
