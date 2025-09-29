'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Slider,
} from '@/components/ui/slider';
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
  Plus
} from 'lucide-react';
import { debounce } from 'lodash';

// Types
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
  category?: string;
  status?: 'active' | 'inactive' | 'draft';
  featured?: boolean;
  margin?: number;
  stock?: number;
  lastUpdated?: string;
}

interface UltimateProductTableProps {
  products: Product[];
}

// Custom filter functions
const globalFilterFn = (row: any, _columnId: string, value: string) => {
  const search = value.toLowerCase();
  return Object.values(row.original).some((cell: any) => {
    if (typeof cell === 'string') {
      return cell.toLowerCase().includes(search);
    }
    if (typeof cell === 'object' && cell !== null) {
      return Object.values(cell).some((nestedValue: any) => 
        typeof nestedValue === 'string' && nestedValue.toLowerCase().includes(search)
      );
    }
    return false;
  });
};

const priceRangeFilter: FilterFn<any> = (row, columnId, value) => {
  const price = parseFloat((row.getValue('price') as string).replace(/[€,]/g, ''));
  const [min, max] = value;
  return price >= min && price <= max;
};

const multiSelectFilter: FilterFn<any> = (row, columnId, value) => {
  if (!value || value.length === 0) return true;
  const cellValue = row.getValue(columnId);
  if (typeof cellValue === 'object' && cellValue !== null) {
    return value.includes((cellValue as any).name);
  }
  return value.includes(cellValue);
};

const UltimateProductTable: React.FC<UltimateProductTableProps> = ({ products }) => {
  // State management
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
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
  });

  // Column definitions
  const columns: ColumnDef<Product>[] = useMemo(
    () => [
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
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }) => (
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={row.getValue('image')}
              alt={row.getValue('name')}
              className="w-full h-full object-cover"
            />
          </div>
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
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const name = row.getValue('name') as string;
          const sku = row.getValue('sku') as string;
          return (
            <div className="space-y-1">
              <div className="font-medium text-sm">{name}</div>
              <div className="text-xs text-gray-500">SKU: {sku}</div>
            </div>
          );
        },
        filterFn: 'includesString',
      },
      {
        accessorKey: 'brand',
        header: 'Brand',
        cell: ({ row }) => {
          const brand = row.getValue('brand') as Product['brand'];
          return (
            <div className="flex items-center space-x-2">
              {brand.logo && (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-5 h-5 rounded"
                />
              )}
              <span className="text-sm font-medium">{brand.name}</span>
            </div>
          );
        },
        filterFn: multiSelectFilter,
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
              <DollarSign className="mr-2 h-4 w-4" />
              Price
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const price = row.getValue('price') as string;
          return (
            <div className="text-right">
              <div className="font-semibold text-green-600">{price}</div>
            </div>
          );
        },
        filterFn: priceRangeFilter,
      },
      {
        accessorKey: 'competitors',
        header: 'Competitors',
        cell: ({ row }) => {
          const competitors = row.getValue('competitors') as Product['competitors'];
          return (
            <div className="space-y-1 text-right">
              <div className="text-xs text-gray-500">Cheapest: {competitors.cheapest}</div>
              <div className="text-xs text-gray-500">Avg: {competitors.avg}</div>
              <div className="text-xs text-gray-500">Highest: {competitors.highest}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'triggeredRule',
        header: 'Status',
        cell: ({ row }) => {
          const rule = row.getValue('triggeredRule') as string;
          const isActive = rule.includes('active');
          return (
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? (
                <CheckCircle className="mr-1 h-3 w-3" />
              ) : (
                <AlertCircle className="mr-1 h-3 w-3" />
              )}
              {rule}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const product = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  onClick={() => console.log('View', product.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onClick={() => console.log('Edit', product.id)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Product
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onClick={() => navigator.clipboard.writeText(product.sku)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy SKU
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onClick={() => console.log('Delete', product.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
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
    setFilters(prev => ({ ...prev, priceRange: value }));
    table.getColumn('price')?.setFilterValue(value);
  };

  const handleBrandFilter = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...filters.brands, brand]
      : filters.brands.filter(b => b !== brand);
    setFilters(prev => ({ ...prev, brands: newBrands }));
    table.getColumn('brand')?.setFilterValue(newBrands.length > 0 ? newBrands : undefined);
  };

  const clearAllFilters = () => {
    setGlobalFilter('');
    setColumnFilters([]);
    setFilters({
      priceRange: [0, 1000],
      brands: [],
      categories: [],
      status: [],
      hasCompetitorData: null,
      featured: null,
      highMargin: null,
    });
  };

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const activeFiltersCount = columnFilters.length + (globalFilter ? 1 : 0);

  return (
    <div className="w-full space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
              globalFilter ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <Input
              placeholder="Search products..."
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                debouncedSetGlobalFilter(e.target.value);
              }}
              className={`pl-10 w-80 transition-colors ${
                globalFilter ? 'border-blue-300 focus:border-blue-500' : ''
              }`}
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs bg-blue-100 text-blue-700 border-blue-200 flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          <Button variant="outline" onClick={clearAllFilters}>
            <FilterX className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns className="mr-2 h-4 w-4" />
                Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
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
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <div className="px-3">
                <Slider
                  value={filters.priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>€{filters.priceRange[0]}</span>
                  <span>€{filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Brands</label>
              <div className="space-y-1">
                {['Ellijewelry', 'Nenalina', 'Kuzzoi', 'Stilnest'].map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={filters.brands.includes(brand)}
                      onCheckedChange={(checked) => handleBrandFilter(brand, !!checked)}
                    />
                    <label htmlFor={`brand-${brand}`} className="text-sm">
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Filters</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handlePriceRangeChange([0, 50]);
                    setFilters(prev => ({ ...prev, categories: ['Rings'] }));
                  }}
                >
                  <Minus className="mr-1 h-3 w-3" />
                  Under €50
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handlePriceRangeChange([100, 1000]);
                    setFilters(prev => ({ ...prev, featured: true }));
                  }}
                >
                  <Star className="mr-1 h-3 w-3" />
                  Premium
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters(prev => ({ ...prev, hasCompetitorData: true }));
                  }}
                >
                  <TrendingUp className="mr-1 h-3 w-3" />
                  With Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleBrandFilter('Stilnest', true);
                    setFilters(prev => ({ ...prev, categories: ['Rings'] }));
                  }}
                >
                  <Target className="mr-1 h-3 w-3" />
                  Stilnest
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selection Info */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {selectedRows.length} product{selectedRows.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Bulk Edit
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                  No results found.
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
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UltimateProductTable;
