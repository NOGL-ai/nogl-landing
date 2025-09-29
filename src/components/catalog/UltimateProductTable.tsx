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

const parseEuro = (input: string | number | null | undefined): number | null => {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number') return isFinite(input) ? input : null;
  const cleaned = input.replace(/[^0-9.,-]/g, '').replace(/,(?=\d{3}\b)/g, '');
  const normalized = cleaned.replace(',', '.');
  const n = parseFloat(normalized);
  return isNaN(n) ? null : n;
};

const formatEuro = (n: number | null | undefined) => {
  if (n === null || n === undefined || !isFinite(n)) return '—';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
};

const priceRangeFilter: FilterFn<any> = (row, _columnId, value) => {
  const [min, max] = value as [number, number];
  const raw = (row.original?.price ?? row.getValue('price')) as string | number | undefined;
  const price = parseEuro(raw ?? null) ?? 0;
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

  // Compute suggested matches based on name similarity and SKU equality
  const suggestedMatchesById = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const tokenize = (s: string) => {
      const tokens = normalize(s).split(' ').filter(t => t.length >= 3);
      return new Set(tokens);
    };
    const jaccard = (a: Set<string>, b: Set<string>) => {
      if (a.size === 0 && b.size === 0) return 1;
      let inter = 0;
      for (const t of Array.from(a)) if (b.has(t)) inter++;
      const uni = a.size + b.size - inter;
      return uni === 0 ? 0 : inter / uni;
    };

    const tokensById = new Map<string, Set<string>>();
    for (const p of products) tokensById.set(p.id, tokenize(p.name));

    const counts: Record<string, number> = Object.create(null);
    for (const p of products) counts[p.id] = 0;

    const threshold = 0.5;
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        const a = products[i];
        const b = products[j];
        const sameSku = a.sku && b.sku && a.sku === b.sku;
        const sim = jaccard(tokensById.get(a.id)!, tokensById.get(b.id)!);
        if (sameSku || sim >= threshold) {
          counts[a.id]++;
          counts[b.id]++;
        }
      }
    }
    return counts;
  }, [products]);

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
        id: 'suggestedMatches',
        accessorFn: (row) => suggestedMatchesById[row.id] ?? 0,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 lg:px-3"
          >
            Suggested matches
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const count = row.getValue('suggestedMatches') as number;
          return (
            <div className="flex items-center justify-center">
              <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center text-xs font-semibold">
                {count}
              </div>
            </div>
          );
        },
      },
      {
        id: 'cost',
        accessorFn: (row) => parseEuro(row.cost) ?? null,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 lg:px-3"
          >
            Cost
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-right">
            <div className="text-sm">{formatEuro(row.getValue('cost') as number | null)}</div>
          </div>
        ),
        sortingFn: (a, b, _id) => {
          const av = (a.getValue('cost') as number | null) ?? -Infinity;
          const bv = (b.getValue('cost') as number | null) ?? -Infinity;
          return (av as number) - (bv as number);
        },
      },
      {
        id: 'price',
        accessorFn: (row) => parseEuro(row.price) ?? null,
        header: ({ column }) => (
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
        ),
        cell: ({ row }) => (
          <div className="text-right">
            <div className="font-semibold text-green-600">{formatEuro(row.getValue('price') as number | null)}</div>
          </div>
        ),
        filterFn: priceRangeFilter,
        sortingFn: (a, b, _id) => {
          const av = (a.getValue('price') as number | null) ?? -Infinity;
          const bv = (b.getValue('price') as number | null) ?? -Infinity;
          return (av as number) - (bv as number);
        },
      },
      {
        id: 'minMaxPrice',
        accessorFn: (row) => {
          const min = parseEuro(row.minPrice) ?? parseEuro(row.competitors?.cheapest ?? null);
          const max = parseEuro(row.maxPrice) ?? parseEuro(row.competitors?.highest ?? null);
          return { min, max };
        },
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 lg:px-3"
          >
            Min/Max Price
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const v = row.getValue('minMaxPrice') as { min: number | null; max: number | null };
          return (
            <div className="text-right space-y-0.5">
              <div className="text-xs text-gray-500">Low: {formatEuro(v?.min ?? null)}</div>
              <div className="text-xs text-gray-500">High: {formatEuro(v?.max ?? null)}</div>
            </div>
          );
        },
        sortingFn: (a, b, _id) => {
          const av = (a.getValue('minMaxPrice') as { min: number | null; max: number | null })?.min ?? -Infinity;
          const bv = (b.getValue('minMaxPrice') as { min: number | null; max: number | null })?.min ?? -Infinity;
          return (av as number) - (bv as number);
        },
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
        id: 'pricePosition',
        accessorFn: (row) => {
          const price = parseEuro(row.price) ?? null;
          const offers: number[] = Array.isArray((row as any).competitorOffers)
            ? ((row as any).competitorOffers as any[])
                .map((v) => parseEuro(v as any))
                .filter((n): n is number => n !== null)
            : [
                parseEuro(row.competitors?.cheapest ?? null),
                parseEuro(row.competitors?.avg ?? null),
                parseEuro(row.competitors?.highest ?? null),
              ].filter((n): n is number => n !== null) as number[];
          let lower = 0, equal = 0, higher = 0;
          if (price !== null && offers.length > 0) {
            const tol = Math.max(0.02, price * 0.005);
            for (const cp of offers) {
              const diff = cp - price;
              if (Math.abs(diff) <= tol) equal++;
              else if (diff > 0) higher++;
              else lower++;
            }
          }
          const avgOffer = offers.length ? offers.reduce((a, b) => a + b, 0) / offers.length : null;
          const netDiff = price !== null && avgOffer !== null ? price - avgOffer : null;
          return { lower, equal, higher, netDiff };
        },
        header: 'Price Position',
        cell: ({ row }) => {
          const v = row.getValue('pricePosition') as { lower: number; equal: number; higher: number };
          return (
            <div className="flex items-center justify-end gap-2 text-xs">
              <span className="text-green-600">{v.lower} Lower</span>
              <span className="text-gray-600">{v.equal} Equal</span>
              <span className="text-red-600">{v.higher} Higher</span>
            </div>
          );
        },
        sortingFn: (a, b, _id) => {
          const av = (a.getValue('pricePosition') as any)?.netDiff ?? 0;
          const bv = (b.getValue('pricePosition') as any)?.netDiff ?? 0;
          return av - bv;
        },
      },
      {
        accessorKey: 'competitors',
        header: 'Competitor Prices',
        cell: ({ row }) => {
          const competitors = row.getValue('competitors') as Product['competitors'];
          const cheapest = parseEuro(competitors?.cheapest ?? null);
          const avg = parseEuro(competitors?.avg ?? null);
          const highest = parseEuro(competitors?.highest ?? null);
          return (
            <div className="space-y-1 text-right">
              <div className="text-xs text-gray-500">Cheapest: {formatEuro(cheapest)}</div>
              <div className="text-xs text-gray-500">Avg: {formatEuro(avg)}</div>
              <div className="text-xs text-gray-500">Highest: {formatEuro(highest)}</div>
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
