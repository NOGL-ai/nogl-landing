'use client';

import React, { useState, useMemo } from 'react';
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
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpDown, ChevronDown, Search, Filter } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  image: string;
  cost: string;
  price: string;
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
    cheapestColor: 'green' | 'red' | 'gray';
  };
  triggeredRule: string;
}

interface EnhancedProductTableProps {
  products: Product[];
}

const EnhancedProductTable: React.FC<EnhancedProductTableProps> = ({ products }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const renderBrandLogo = (brand: Product['brand']) => {
    if (brand.logo && brand.logo !== '/api/placeholder/24/24') {
      return (
        <img 
          src={brand.logo} 
          alt={brand.name} 
          className="w-6 h-6 rounded-full object-cover" 
        />
      );
    }

    // Fallback to brand initial
    return (
      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <span className="text-xs font-bold text-white">{brand.name.charAt(0)}</span>
      </div>
    );
  };

  const renderCompetitorPrices = (competitors: Product['competitors']) => {
    const getTextColor = (color: string) => {
      switch (color) {
        case 'green': return 'text-green-600';
        case 'red': return 'text-red-600';
        default: return 'text-gray-600';
      }
    };

    if (competitors.cheapest === '-') {
      return <span className="text-gray-400">No data</span>;
    }

    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Cheapest:</span>
          <span className={getTextColor(competitors.cheapestColor)}>
            {competitors.cheapest}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Avg:</span>
          <span>{competitors.avg}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Highest:</span>
          <span>{competitors.highest}</span>
        </div>
      </div>
    );
  };

  const columns: ColumnDef<Product>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 lg:px-3"
          >
            Product Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/api/placeholder/40/40';
                }}
              />
            </div>
            <div className="space-y-1">
              <div className="font-medium text-sm">{product.name}</div>
              <div className="text-xs text-gray-500">SKU: {product.sku}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'brand.name',
      header: 'Brand',
      cell: ({ row }) => {
        const brand = row.original.brand;
        return (
          <div className="flex items-center space-x-2">
            {renderBrandLogo(brand)}
            <span className="text-sm font-medium">{brand.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 lg:px-3"
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const price = row.getValue('price') as string;
        return <div className="font-medium">{price}</div>;
      },
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
      cell: ({ row }) => {
        const cost = row.getValue('cost') as string;
        return <div className="text-gray-500">{cost}</div>;
      },
    },
    {
      accessorKey: 'competitors',
      header: 'Competitor Prices',
      cell: ({ row }) => {
        const competitors = row.getValue('competitors') as Product['competitors'];
        return renderCompetitorPrices(competitors);
      },
    },
    {
      accessorKey: 'triggeredRule',
      header: 'Status',
      cell: ({ row }) => {
        const rule = row.getValue('triggeredRule') as string;
        return (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600">{rule}</span>
          </div>
        );
      },
    },
  ];

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
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-8 max-w-sm"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Export
          </Button>
          <Button variant="outline" size="sm">
            <ChevronDown className="mr-2 h-4 w-4" />
            Columns
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
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
                  data-state={row.getIsSelected() && 'selected'}
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
                  className="h-24 text-center"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductTable;
