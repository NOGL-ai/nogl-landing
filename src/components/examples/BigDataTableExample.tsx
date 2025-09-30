/**
 * UNUSED FILE - EXAMPLE COMPONENT
 * 
 * This is an example component demonstrating how to use the BigDataTable system.
 * It's not currently used in the main application but serves as a reference
 * for implementing big data tables with virtualization and infinite scrolling.
 * 
 * Features demonstrated:
 * - Virtual scrolling with TanStack Virtual
 * - Infinite data loading with React Query
 * - Performance monitoring
 * - Server-side pagination
 * 
 * To use this component, you would need to:
 * 1. Import it in a page component
 * 2. Set up the required API endpoints
 * 3. Configure the data fetching functions
 * 
 * Created: [Date when this was added]
 * Status: Example/Reference only - not integrated into main app
 */

'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { AdvancedVirtualTable } from '../tables/AdvancedVirtualTable';
import { useOptimizedTable, useTablePerformanceMonitoring } from '@/hooks/useOptimizedTable';
import { 
  createOptimizedDataFetcher, 
  createRealisticMockGenerator,
  PerformanceMonitor 
} from '@/utils/bigDataUtils';

// Example data types
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  brand: string;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
  margin: number;
  stock: number;
  rating: number;
  reviews: number;
  tags: string[];
  description: string;
  image: string;
  competitorPrice?: number;
  marketPosition: 'leader' | 'follower' | 'challenger';
  lastPriceChange: string;
  priceHistory: number[];
}

// Mock data generator for realistic product data
const generateProduct = (index: number, seed?: number): Product => {
  const brands = ['Nike', 'Adidas', 'Puma', 'Under Armour', 'Reebok', 'New Balance', 'Converse', 'Vans'];
  const categories = ['Shoes', 'Clothing', 'Accessories', 'Equipment', 'Footwear'];
  const statuses: ('active' | 'inactive' | 'draft')[] = ['active', 'inactive', 'draft'];
  const marketPositions: ('leader' | 'follower' | 'challenger')[] = ['leader', 'follower', 'challenger'];
  
  const brand = brands[index % brands.length];
  const category = categories[index % categories.length];
  const basePrice = 50 + (index % 500) + Math.random() * 200;
  const cost = basePrice * (0.4 + Math.random() * 0.3);
  const margin = ((basePrice - cost) / basePrice) * 100;
  
  return {
    id: `prod_${index.toString().padStart(8, '0')}`,
    name: `${brand} ${category} ${index + 1}`,
    sku: `${brand.substring(0, 3).toUpperCase()}-${index.toString().padStart(6, '0')}`,
    price: Math.round(basePrice * 100) / 100,
    cost: Math.round(cost * 100) / 100,
    brand,
    category,
    status: statuses[index % statuses.length],
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    margin: Math.round(margin * 100) / 100,
    stock: Math.floor(Math.random() * 1000),
    rating: Math.round((3 + Math.random() * 2) * 10) / 10,
    reviews: Math.floor(Math.random() * 1000),
    tags: [`tag${index % 10}`, `category-${category.toLowerCase()}`],
    description: `High-quality ${category.toLowerCase()} from ${brand} designed for performance and style.`,
    image: `https://picsum.photos/200/200?random=${index}`,
    competitorPrice: basePrice * (0.8 + Math.random() * 0.4),
    marketPosition: marketPositions[index % marketPositions.length],
    lastPriceChange: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    priceHistory: Array.from({ length: 30 }, (_, i) => 
      basePrice * (0.9 + Math.random() * 0.2)
    ),
  };
};

// Column definitions optimized for big data
const createColumns = (): ColumnDef<Product>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 100,
    cell: ({ getValue }) => (
      <div className="font-mono text-xs text-gray-500">
        {getValue<string>().slice(-8)}
      </div>
    ),
  },
  {
    accessorKey: 'image',
    header: 'Image',
    size: 80,
    cell: ({ getValue }) => (
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={getValue<string>()}
          alt="Product"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Product Name',
    size: 250,
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
          {row.getValue('name')}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          SKU: {row.getValue('sku')}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'brand',
    header: 'Brand',
    size: 120,
    cell: ({ getValue }) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: 'price',
    header: 'Price',
    size: 100,
    cell: ({ getValue }) => (
      <div className="text-right">
        <div className="font-semibold text-green-600">
          ${getValue<number>().toFixed(2)}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'cost',
    header: 'Cost',
    size: 100,
    cell: ({ getValue }) => (
      <div className="text-right">
        <div className="text-sm text-gray-600">
          ${getValue<number>().toFixed(2)}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'margin',
    header: 'Margin %',
    size: 100,
    cell: ({ getValue }) => {
      const margin = getValue<number>();
      const color = margin > 50 ? 'text-green-600' : margin > 30 ? 'text-yellow-600' : 'text-red-600';
      return (
        <div className={`text-right font-medium ${color}`}>
          {margin.toFixed(1)}%
        </div>
      );
    },
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    size: 80,
    cell: ({ getValue }) => {
      const stock = getValue<number>();
      const color = stock > 100 ? 'text-green-600' : stock > 20 ? 'text-yellow-600' : 'text-red-600';
      return (
        <div className={`text-right font-medium ${color}`}>
          {stock}
        </div>
      );
    },
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    size: 100,
    cell: ({ getValue }) => {
      const rating = getValue<number>();
      return (
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400">★</span>
          <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-500">({row.original.reviews})</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 100,
    cell: ({ getValue }) => {
      const status = getValue<string>();
      const colors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        draft: 'bg-yellow-100 text-yellow-800',
      };
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: 'marketPosition',
    header: 'Position',
    size: 120,
    cell: ({ getValue }) => {
      const position = getValue<string>();
      const colors = {
        leader: 'bg-purple-100 text-purple-800',
        follower: 'bg-blue-100 text-blue-800',
        challenger: 'bg-orange-100 text-orange-800',
      };
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[position as keyof typeof colors]}`}>
          {position}
        </span>
      );
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    size: 150,
    cell: ({ getValue }) => {
      const date = new Date(getValue<string>());
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
];

export function BigDataTableExample() {
  const [dataSource, setDataSource] = useState<'mock' | 'api' | 'prisma'>('mock');
  const [totalRecords, setTotalRecords] = useState(100000);
  const [pageSize, setPageSize] = useState(50);
  const [enablePerformanceMonitoring, setEnablePerformanceMonitoring] = useState(true);
  
  const { metrics, recordRender } = useTablePerformanceMonitoring();

  // Create data fetcher based on selected source
  const dataFetcher = useMemo(() => {
    switch (dataSource) {
      case 'mock':
        return createRealisticMockGenerator(
          generateProduct,
          totalRecords,
          pageSize,
          {
            pageSize,
            maxCacheSize: 1000,
            staleTime: 5 * 60 * 1000,
          }
        );
      case 'api':
        return createOptimizedDataFetcher<Product>(
          '/api/products',
          {
            pageSize,
            maxCacheSize: 1000,
            staleTime: 5 * 60 * 1000,
          }
        );
      default:
        return createRealisticMockGenerator(generateProduct, totalRecords, pageSize);
    }
  }, [dataSource, totalRecords, pageSize]);

  // Column definitions
  const columns = useMemo(() => createColumns(), []);

  // Query key with dependencies for proper caching
  const queryKey = useMemo(() => [
    'big-data-products',
    dataSource,
    totalRecords,
    pageSize,
  ], [dataSource, totalRecords, pageSize]);

  // Performance monitoring effect
  React.useEffect(() => {
    if (enablePerformanceMonitoring) {
      recordRender();
    }
  }, [recordRender, enablePerformanceMonitoring]);

  return (
    <div className="w-full space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Big Data Table Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Source
            </label>
            <select
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="mock">Mock Data</option>
              <option value="api">API Endpoint</option>
              <option value="prisma">Prisma Database</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Records
            </label>
            <select
              value={totalRecords}
              onChange={(e) => setTotalRecords(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value={1000}>1,000</option>
              <option value={10000}>10,000</option>
              <option value={100000}>100,000</option>
              <option value={1000000}>1,000,000</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Page Size
            </label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={enablePerformanceMonitoring}
                onChange={(e) => setEnablePerformanceMonitoring(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Performance Monitoring
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {enablePerformanceMonitoring && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-3">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Render Count:</span>
              <span className="ml-2 font-medium">{metrics.renderCount}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Last Render:</span>
              <span className="ml-2 font-medium">{metrics.lastRenderTime.toFixed(2)}ms</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Avg Render:</span>
              <span className="ml-2 font-medium">{metrics.averageRenderTime.toFixed(2)}ms</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Memory:</span>
              <span className="ml-2 font-medium">{metrics.memoryUsage.toFixed(2)}MB</span>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <AdvancedVirtualTable
          queryKey={queryKey}
          queryFn={dataFetcher}
          columns={columns}
          height={600}
          rowHeight={60}
          enableVirtualization={true}
          enablePerformanceMonitoring={enablePerformanceMonitoring}
          enableMemoryOptimization={true}
          dynamicRowHeight={true}
          estimatedRowHeight={60}
          rowOverscan={10}
          enableSorting={true}
          enableSelection={true}
          className="rounded-lg"
        />
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
          🚀 Big Data Table Features
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>Virtual Scrolling:</strong> Only renders visible rows for optimal performance</li>
          <li>• <strong>Infinite Loading:</strong> Automatically loads more data as you scroll</li>
          <li>• <strong>Server-side Operations:</strong> Sorting, filtering, and pagination handled server-side</li>
          <li>• <strong>Memory Optimization:</strong> Cleans up old data to prevent memory leaks</li>
          <li>• <strong>Performance Monitoring:</strong> Real-time metrics for render times and memory usage</li>
          <li>• <strong>Debounced Search:</strong> Optimized search with 300ms debounce</li>
          <li>• <strong>Smart Caching:</strong> Intelligent caching with configurable TTL</li>
        </ul>
      </div>
    </div>
  );
}
