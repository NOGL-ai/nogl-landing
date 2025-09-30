/**
 * UNUSED FILE - EXAMPLE COMPONENT
 * 
 * This is an advanced example component showing the ultimate big data table
 * implementation with all features enabled. It demonstrates the full capabilities
 * of the big data table system but is not used in the main application.
 * 
 * Features demonstrated:
 * - Advanced virtualization
 * - Column virtualization
 * - Memory optimization
 * - Performance monitoring
 * - Real-time metrics
 * - Advanced caching strategies
 * 
 * This is a reference implementation for developers who want to understand
 * the full potential of the big data table system.
 * 
 * Created: [Date when this was added]
 * Status: Example/Reference only - not integrated into main app
 */

'use client';

import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { AdvancedVirtualTable } from '../tables/AdvancedVirtualTable';
import { 
  createOptimizedDataFetcher, 
  createRealisticMockGenerator,
  createOptimizedPrismaFetcher 
} from '@/utils/bigDataUtils';

// Product type for the example
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  brand: string;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  margin: number;
  stock: number;
  rating: number;
  reviews: number;
  image: string;
  createdAt: string;
  updatedAt: string;
}

// Optimized column definitions
const createProductColumns = (): ColumnDef<Product>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 80,
    cell: ({ getValue }) => (
      <div className="font-mono text-xs text-gray-500 truncate">
        {getValue<string>().slice(-6)}
      </div>
    ),
  },
  {
    accessorKey: 'image',
    header: 'Image',
    size: 60,
    cell: ({ getValue }) => (
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
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
    size: 200,
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
          {row.getValue('name')}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {row.getValue('sku')}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'brand',
    header: 'Brand',
    size: 100,
    cell: ({ getValue }) => (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: 'price',
    header: 'Price',
    size: 80,
    cell: ({ getValue }) => (
      <div className="text-right font-mono text-sm font-semibold text-green-600">
        ${getValue<number>().toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: 'margin',
    header: 'Margin %',
    size: 80,
    cell: ({ getValue }) => {
      const margin = getValue<number>();
      const color = margin > 50 ? 'text-green-600' : margin > 30 ? 'text-yellow-600' : 'text-red-600';
      return (
        <div className={`text-right font-mono text-sm ${color}`}>
          {margin.toFixed(1)}%
        </div>
      );
    },
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    size: 60,
    cell: ({ getValue }) => {
      const stock = getValue<number>();
      const color = stock > 100 ? 'text-green-600' : stock > 20 ? 'text-yellow-600' : 'text-red-600';
      return (
        <div className={`text-right font-mono text-sm ${color}`}>
          {stock}
        </div>
      );
    },
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    size: 80,
    cell: ({ getValue }) => {
      const rating = getValue<number>();
      return (
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400">★</span>
          <span className="text-sm font-medium">{rating.toFixed(1)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 80,
    cell: ({ getValue }) => {
      const status = getValue<string>();
      const colors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        draft: 'bg-yellow-100 text-yellow-800',
      };
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
          {status}
        </span>
      );
    },
  },
];

// Mock data generator
const generateProduct = (index: number): Product => {
  const brands = ['Nike', 'Adidas', 'Puma', 'Under Armour', 'Reebok', 'New Balance'];
  const categories = ['Shoes', 'Clothing', 'Accessories', 'Equipment'];
  const statuses: ('active' | 'inactive' | 'draft')[] = ['active', 'inactive', 'draft'];
  
  const brand = brands[index % brands.length];
  const basePrice = 50 + (index % 500) + Math.random() * 200;
  const cost = basePrice * (0.4 + Math.random() * 0.3);
  const margin = ((basePrice - cost) / basePrice) * 100;
  
  return {
    id: `prod_${index.toString().padStart(8, '0')}`,
    name: `${brand} Product ${index + 1}`,
    sku: `${brand.substring(0, 3).toUpperCase()}-${index.toString().padStart(6, '0')}`,
    price: Math.round(basePrice * 100) / 100,
    cost: Math.round(cost * 100) / 100,
    brand,
    category: categories[index % categories.length],
    status: statuses[index % statuses.length],
    margin: Math.round(margin * 100) / 100,
    stock: Math.floor(Math.random() * 1000),
    rating: Math.round((3 + Math.random() * 2) * 10) / 10,
    reviews: Math.floor(Math.random() * 1000),
    image: `https://picsum.photos/200/200?random=${index}`,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
};

export function UltimateBigDataTable() {
  const [dataSource, setDataSource] = useState<'mock' | 'api' | 'prisma'>('mock');
  const [totalRecords, setTotalRecords] = useState(100000);
  const [pageSize, setPageSize] = useState(50);

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
      case 'prisma':
        // Example Prisma fetcher (you would implement this with your actual Prisma setup)
        return createOptimizedPrismaFetcher<Product>(
          async ({ skip, take, orderBy, where }) => {
            // This is a mock implementation - replace with actual Prisma calls
            const mockData = Array.from({ length: take }, (_, i) => 
              generateProduct(skip + i)
            );
            return { data: mockData, total: totalRecords };
          },
          { pageSize }
        );
      default:
        return createRealisticMockGenerator(generateProduct, totalRecords, pageSize);
    }
  }, [dataSource, totalRecords, pageSize]);

  // Column definitions
  const columns = useMemo(() => createProductColumns(), []);

  // Query key with dependencies for proper caching
  const queryKey = useMemo(() => [
    'ultimate-big-data-products',
    dataSource,
    totalRecords,
    pageSize,
  ], [dataSource, totalRecords, pageSize]);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          🚀 Ultimate Big Data Table
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          High-performance table with virtual scrolling, infinite loading, and server-side operations
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Source
            </label>
            <select
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="mock">Mock Data (Fast)</option>
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
        </div>
      </div>

      {/* Performance Features */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
          ⚡ Performance Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Virtual Scrolling</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Infinite Loading</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Server-side Sorting</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Smart Caching</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Memory Optimization</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Performance Monitoring</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <AdvancedVirtualTable
          queryKey={queryKey}
          queryFn={dataFetcher}
          columns={columns}
          height={600}
          rowHeight={60}
          enableVirtualization={true}
          enablePerformanceMonitoring={true}
          enableMemoryOptimization={true}
          dynamicRowHeight={false}
          estimatedRowHeight={60}
          rowOverscan={10}
          enableSorting={true}
          enableSelection={true}
          enableColumnVirtualization={false}
          className="rounded-lg"
        />
      </div>

      {/* Usage Instructions */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          📚 How to Use This Table
        </h3>
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <strong>1. Data Source Selection:</strong> Choose between mock data, API endpoint, or Prisma database
          </div>
          <div>
            <strong>2. Record Count:</strong> Test with different dataset sizes to see performance scaling
          </div>
          <div>
            <strong>3. Page Size:</strong> Adjust how many records are fetched per request
          </div>
          <div>
            <strong>4. Sorting:</strong> Click column headers to sort (handled server-side)
          </div>
          <div>
            <strong>5. Scrolling:</strong> Scroll to automatically load more data
          </div>
          <div>
            <strong>6. Performance:</strong> Monitor real-time metrics in the header
          </div>
        </div>
      </div>
    </div>
  );
}
