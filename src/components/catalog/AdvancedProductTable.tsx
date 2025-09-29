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
  RowSelectionState,
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
import { 
  ArrowUpDown, 
  ChevronDown, 
  Search, 
  Filter, 
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Star,
  StarOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
}

interface AdvancedProductTableProps {
  products: Product[];
}

const AdvancedProductTable: React.FC<AdvancedProductTableProps> = ({ products }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Enhanced data with additional fields
  const enhancedProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      category: product.name.includes('Ring') ? 'Rings' : 
                product.name.includes('Halskette') ? 'Necklaces' :
                product.name.includes('Armband') ? 'Bracelets' :
                product.name.includes('Ohrstecker') ? 'Earrings' : 'Other',
      status: 'active' as const,
      featured: Math.random() > 0.7
    }));
  }, [products]);

  const renderBrandLogo = (brand: Product['brand']) => {
    if (brand.logo && brand.logo !== '/api/placeholder/24/24') {
      return (
        <img 
          src={brand.logo} 
          alt={brand.name} 
          className="w-8 h-8 rounded-full object-cover border-2 border-gray-200" 
        />
      );
    }

    // Enhanced brand logos with better styling
    const brandColors = {
      'Ellijewelry': 'from-pink-500 to-rose-600',
      'Nenalina': 'from-blue-500 to-cyan-600',
      'Kuzzoi': 'from-purple-500 to-violet-600',
      'Stilnest': 'from-emerald-500 to-teal-600',
    };

    const colorClass = brandColors[brand.name as keyof typeof brandColors] || 'from-gray-500 to-slate-600';

    return (
      <div className={`w-8 h-8 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center shadow-lg`}>
        <span className="text-sm font-bold text-white">{brand.name.charAt(0)}</span>
      </div>
    );
  };

  const renderCompetitorPrices = (competitors: Product['competitors']) => {
    const getTextColor = (color: string) => {
      switch (color) {
        case 'green': return 'text-green-600 font-semibold';
        case 'red': return 'text-red-600 font-semibold';
        default: return 'text-gray-600';
      }
    };

    if (competitors.cheapest === '-') {
      return (
        <div className="text-center">
          <span className="text-gray-400 text-xs">No data</span>
        </div>
      );
    }

    return (
      <div className="space-y-1 min-w-[120px]">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Low:</span>
          <span className={`${getTextColor(competitors.cheapestColor)}`}>
            {competitors.cheapest}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Avg:</span>
          <span className="text-gray-700">{competitors.avg}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">High:</span>
          <span className="text-gray-700">{competitors.highest}</span>
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
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
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
            className="h-8 px-2 lg:px-3 hover:bg-gray-100"
          >
            Product Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center space-x-3 py-2">
            <div className="relative">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/48/48';
                  }}
                />
              </div>
              {product.featured && (
                <div className="absolute -top-1 -right-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
              )}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="font-medium text-sm text-gray-900 truncate">{product.name}</div>
              <div className="text-xs text-gray-500">SKU: {product.sku}</div>
              <div className="text-xs text-blue-600 font-medium">{product.category}</div>
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
          <div className="flex items-center space-x-3">
            {renderBrandLogo(brand)}
            <div>
              <span className="text-sm font-medium text-gray-900">{brand.name}</span>
            </div>
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
            className="h-8 px-2 lg:px-3 hover:bg-gray-100"
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const price = row.getValue('price') as string;
        return (
          <div className="text-right">
            <div className="font-semibold text-gray-900">{price}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
      cell: ({ row }) => {
        const cost = row.getValue('cost') as string;
        return (
          <div className="text-center">
            <span className="text-gray-500">{cost}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'competitors',
      header: 'Market Prices',
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
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700 font-medium">{rule}</span>
          </div>
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
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(product.sku)}
              >
                Copy SKU
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem>
                {product.featured ? (
                  <>
                    <StarOff className="mr-2 h-4 w-4" />
                    Remove from Featured
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Add to Featured
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: enhancedProducts,
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

  // Get unique brands for filter
  const uniqueBrands = useMemo(() => {
    const brands = [...new Set(enhancedProducts.map(p => p.brand.name))];
    return brands;
  }, [enhancedProducts]);

  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="w-full space-y-6">
      {/* Enhanced Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products, SKUs, brands..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-10 h-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Brands</option>
            {uniqueBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          
          <Button variant="outline" size="sm" className="h-10">
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
          
          <Button variant="outline" size="sm" className="h-10">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedRowCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-900">
                {selectedRowCount} of {totalRows} products selected
              </span>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                Bulk Edit
              </Button>
              <Button size="sm" variant="outline">
                Export Selected
              </Button>
              <Button size="sm" variant="destructive">
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold text-gray-700">
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
                  className="hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
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
                  className="h-24 text-center text-gray-500"
                >
                  No products found. Try adjusting your search or filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Enhanced Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-gray-700">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} results
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
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
    </div>
  );
};

export default AdvancedProductTable;
