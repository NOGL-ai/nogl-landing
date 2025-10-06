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
  showProductsColumn?: boolean;
  productsColumnHeader?: string;
  showMaterialsColumn?: boolean;
  showCompetitorsColumn?: boolean;
  showBrandColumn?: boolean;
  showChannelColumn?: boolean;
  firstColumnHeader?: string;
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
  showProductsColumn = true,
  productsColumnHeader = 'Products',
  showMaterialsColumn = false,
  showCompetitorsColumn = false,
  showBrandColumn = false,
  showChannelColumn = false,
  firstColumnHeader = 'Competitor',
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
              {firstColumnHeader}
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


    // Add Products column only if showProductsColumn is true
    if (showProductsColumn) {
      baseColumns.push({
        accessorKey: 'products',
        id: 'products',
        header: productsColumnHeader,
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


    // Add Materials column only if showMaterialsColumn is true
    if (showMaterialsColumn) {
      baseColumns.push({
        accessorKey: 'variants',
        id: 'variants',
        header: 'Materials',
      cell: ({ row }) => {
        const product = row.original as any;
        const variants = product.variants || 0;
        
        // Generate material distribution
        const getMaterialDistribution = (total: number) => {
          if (total === 0) return [];
          if (total === 1) return [{ type: 'Gold', icon: '◉', color: '#D4AF37', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' }];
          if (total === 2) return [
            { type: 'Gold', icon: '◉', color: '#D4AF37', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
            { type: 'Silver', icon: '◉', color: '#A8A9AD', bgColor: 'bg-gray-50 dark:bg-gray-800/20' }
          ];
          if (total === 3) return [
            { type: 'Gold', icon: '◉', color: '#D4AF37', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
            { type: 'Silver', icon: '◉', color: '#A8A9AD', bgColor: 'bg-gray-50 dark:bg-gray-800/20' },
            { type: 'Rose', icon: '◉', color: '#B76E79', bgColor: 'bg-pink-50 dark:bg-pink-900/20' }
          ];
          // For 4+ variants
          return [
            { type: 'Gold', icon: '◉', color: '#D4AF37', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
            { type: 'Silver', icon: '◉', color: '#A8A9AD', bgColor: 'bg-gray-50 dark:bg-gray-800/20' },
            { type: 'Rose', icon: '◉', color: '#B76E79', bgColor: 'bg-pink-50 dark:bg-pink-900/20' },
            { type: 'Platinum', icon: '◉', color: '#E5E4E2', bgColor: 'bg-slate-50 dark:bg-slate-800/20' }
          ].slice(0, total);
        };

        const materials = getMaterialDistribution(variants);
        
        if (variants === 0) {
          return (
            <div className="flex items-center gap-2 opacity-60">
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="text-xs">—</span>
              </div>
              <span className="text-xs text-muted-foreground">None</span>
            </div>
          );
        }

        return (
          <div className="group relative flex items-center justify-center">
            {/* Material Icons - Compact Circles */}
            <div className="flex -space-x-1">
              {materials.slice(0, 3).map((material, index) => (
                <div
                  key={index}
                  className={`w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center transition-transform group-hover:scale-110 ${material.bgColor}`}
                  style={{ 
                    zIndex: materials.length - index,
                  }}
                  title={material.type}
                >
                  <span className="text-[10px] font-bold" style={{ color: material.color }}>
                    {material.icon}
                  </span>
                </div>
              ))}
              {variants > 3 && (
                <div 
                  className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-[8px] font-semibold text-gray-600 dark:text-gray-300"
                  title={`${variants - 3} more`}
                >
                  +{variants - 3}
                </div>
              )}
            </div>

            {/* Tooltip on hover */}
            <div className="absolute left-1/2 top-full mt-2 hidden group-hover:block z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap transform -translate-x-1/2">
              <div className="flex flex-col gap-0.5">
                {materials.map((material, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <span style={{ color: material.color }}>{material.icon}</span>
                    <span className="font-medium">{material.type}</span>
                  </div>
                ))}
              </div>
              <div className="absolute -top-1 left-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45 transform -translate-x-1/2"></div>
            </div>
          </div>
        );
      },
      enableSorting: true,
      });
    }


    // Add Competitor Count column (Untitled UI inspired) - conditional
    if (showCompetitorsColumn) {
      baseColumns.push({
        accessorKey: 'competitorCount',
        id: 'competitorCount',
        header: 'Competitors',
        cell: ({ row }) => {
          const product = row.original as any;
          const competitorCount = product.competitorCount || 0;
          
          if (competitorCount === 0) {
            return (
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-400">—</span>
                </div>
              </div>
            );
          }

          // Calculate progress percentage (max 10 competitors for 100% fill)
          const maxCompetitors = 10;
          const progressPercentage = Math.min((competitorCount / maxCompetitors) * 100, 100);
          const circumference = 2 * Math.PI * 16; // radius = 16
          const strokeDasharray = `${(progressPercentage / 100) * circumference} ${circumference}`;
          
          return (
            <div className="group relative flex items-center justify-center">
              {/* Circular Progress Chart - Untitled UI Style */}
              <div className="relative w-10 h-10">
                <svg width="40" height="40" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="#E9EAEB"
                    strokeWidth="3"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="#7F56D9"
                    strokeWidth="3"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-out"
                  />
                </svg>
                
                {/* Center count - Untitled UI typography */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {competitorCount}
                  </span>
                </div>
              </div>

              {/* Hover tooltip */}
              <div className="absolute left-1/2 top-full mt-2 hidden group-hover:block z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap transform -translate-x-1/2">
                <div className="space-y-1">
                  <div className="font-semibold">Competitor Analysis</div>
                  <div className="text-gray-300 dark:text-gray-600">
                    {competitorCount} competitor{competitorCount !== 1 ? 's' : ''} found
                  </div>
                  {product.competitors?.competitorNames && (
                    <div className="text-gray-300 dark:text-gray-600">
                      Top: {product.competitors.competitorNames.slice(0, 3).join(', ')}
                      {product.competitors.competitorNames.length > 3 && ` +${product.competitors.competitorNames.length - 3} more`}
                    </div>
                  )}
                </div>
                <div className="absolute -top-1 left-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45 transform -translate-x-1/2"></div>
              </div>
            </div>
          );
        },
        enableSorting: true,
      });
    }

    // Add Brand/Country column - conditional
    if (showBrandColumn) {
      baseColumns.push({
        accessorKey: 'brand',
        id: 'brand',
        header: 'Country',
        cell: ({ row }) => {
          const product = row.original as any;
          const brand = product.brand;
          const domain = product.domain;
          
          // Determine country based on domain or brand
          const getCountryInfo = (domain: string, brandName?: string) => {
            // Check for German brands first (even with .com domains)
            if (brandName?.toLowerCase().includes('elli') || 
                brandName?.toLowerCase().includes('german') || 
                brandName?.toLowerCase().includes('deutsch') ||
                domain?.includes('.de')) {
              return {
                code: 'DE',
                name: 'Germany',
                flag: '🇩🇪',
                color: 'bg-black text-white'
              };
            }
            if (domain?.includes('.com') || domain?.includes('.net')) {
              return {
                code: 'US',
                name: 'United States',
                flag: '🇺🇸',
                color: 'bg-blue-600 text-white'
              };
            }
            if (domain?.includes('.uk') || domain?.includes('.co.uk')) {
              return {
                code: 'UK',
                name: 'United Kingdom',
                flag: '🇬🇧',
                color: 'bg-blue-600 text-white'
              };
            }
            if (domain?.includes('.fr')) {
              return {
                code: 'FR',
                name: 'France',
                flag: '🇫🇷',
                color: 'bg-blue-600 text-white'
              };
            }
            if (domain?.includes('.it')) {
              return {
                code: 'IT',
                name: 'Italy',
                flag: '🇮🇹',
                color: 'bg-green-600 text-white'
              };
            }
            // Default fallback
            return {
              code: 'DE',
              name: 'Germany',
              flag: '🇩🇪',
              color: 'bg-black text-white'
            };
          };

          const countryInfo = getCountryInfo(domain, brand?.name);

          return (
            <div className="group relative flex items-center gap-2.5">
              {/* Brand Logo */}
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-white flex items-center justify-center border border-gray-200 dark:border-gray-300 overflow-hidden shadow-sm">
                  {brand?.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-8 h-8 rounded object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.nextElementSibling?.classList.add('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-300 ${brand?.logo ? 'hidden' : ''}`}>
                    {brand?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                </div>
              </div>
              
              {/* Brand Name and Country */}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {brand?.name || 'Unknown'}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {countryInfo.flag} {countryInfo.code}
                  </span>
                </div>
              </div>

              {/* Hover tooltip */}
              <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                <div className="space-y-1">
                  <div className="font-semibold">Brand & Country</div>
                  <div className="text-gray-300 dark:text-gray-600">
                    {brand?.name || 'Unknown Brand'}
                  </div>
                  <div className="text-gray-300 dark:text-gray-600">
                    {countryInfo.flag} {countryInfo.name}
                  </div>
                  <div className="text-gray-300 dark:text-gray-600">
                    Domain: {domain}
                  </div>
                </div>
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
              </div>
            </div>
          );
        },
        enableSorting: true,
      });
    }

    // Add Channel column - conditional
    if (showChannelColumn) {
      baseColumns.push({
        accessorKey: 'channel',
        id: 'channel',
        header: 'Channel',
        cell: ({ row }) => {
          const product = row.original as any;
          const channel = product.channel || 'shopify';
          
          // Channel logos using logo.dev service
          const channelLogos = {
            shopify: 'https://img.logo.dev/shopify.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
            woocommerce: 'https://img.logo.dev/woocommerce.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
            magento: 'https://img.logo.dev/magento.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
            bigcommerce: 'https://img.logo.dev/bigcommerce.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
            prestashop: 'https://img.logo.dev/prestashop.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
            opencart: 'https://img.logo.dev/opencart.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
          };

          const channelName = channel.charAt(0).toUpperCase() + channel.slice(1);
          const logoUrl = channelLogos[channel as keyof typeof channelLogos] || channelLogos.shopify;

          return (
            <div className="group relative flex items-center gap-2.5">
              {/* Channel Logo */}
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-white flex items-center justify-center border border-gray-200 dark:border-gray-300 overflow-hidden shadow-sm">
                  <img
                    src={logoUrl}
                    alt={channelName}
                    className="w-8 h-8 rounded object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.nextElementSibling?.classList.add('hidden');
                    }}
                  />
                  <div className="hidden w-8 h-8 rounded flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {channelName.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              
              {/* Channel Name */}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {channelName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  D2C
                </span>
              </div>

              {/* Hover tooltip */}
              <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                <div className="space-y-1">
                  <div className="font-semibold">Channel Information</div>
                  <div className="text-gray-300 dark:text-gray-600">
                    {channelName} D2C
                  </div>
                  <div className="text-gray-300 dark:text-gray-600">
                    Direct-to-Consumer
                  </div>
                </div>
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
              </div>
            </div>
          );
        },
        enableSorting: true,
      });
    }

    // Add remaining columns
    baseColumns.push(
      {
        accessorKey: 'competitorPrice',
        header: 'Price Analysis',
        cell: ({ row }) => {
          const product = row.original as any;
          const competitors = product.competitors;
          const myPrice = product.myPrice || product.price;
          
          // If we have multiple competitor prices, show horizontal bar infographic
          if (competitors?.prices && competitors.prices.length > 1) {
            const prices = [...competitors.prices, myPrice].sort((a, b) => a - b);
            const cheapest = Math.min(...competitors.prices);
            const highest = Math.max(...competitors.prices);
            const avg = competitors.avg || competitors.prices.reduce((a: number, b: number) => a + b, 0) / competitors.prices.length;
            const myPosition = prices.indexOf(myPrice) + 1;
            const totalPositions = prices.length;
            
            // Calculate position percentage for bar
            const positionPercent = ((myPosition - 1) / (totalPositions - 1)) * 100;
            
            // Count competitors cheaper and more expensive than you
            const cheaperCount = competitors.prices.filter((price: number) => price < myPrice).length;
            const moreExpensiveCount = competitors.prices.filter((price: number) => price > myPrice).length;
            
            return (
              <div className="space-y-1 min-w-[220px]">
                {/* Price Range Bar with Position Number */}
                <div className="relative h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-visible">
                  {/* Gradient background from green to red */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full" />
                  
                  {/* Your position indicator with number */}
                  <div 
                    className="absolute -top-0.5 w-5 h-5 flex items-center justify-center z-10"
                    style={{ left: `calc(${positionPercent}% - 10px)` }}
                  >
                    <div className="bg-white dark:bg-gray-900 border-2 border-blue-500 shadow-md rounded-full w-5 h-5 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        {myPosition}
                      </span>
                    </div>
                  </div>
                  
                  {/* Price labels at ends */}
                  <div className="absolute -top-4 left-0 text-[10px] font-semibold text-green-600">
                    {cheapest.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </div>
                  <div className="absolute -top-4 right-0 text-[10px] font-semibold text-red-600">
                    {highest.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </div>
                </div>
                
                {/* Compact info row */}
                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="text-green-600 font-medium">{cheaperCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">You:</span>
                    <span className="font-semibold text-blue-600">
                      {myPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Avg:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {avg.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-red-600 font-medium">{moreExpensiveCount}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  </div>
                </div>
              </div>
            );
          }
          
          // Fallback to single price display
          return PricePositionCell ? (
            <PricePositionCell 
              competitorPrice={product.competitorPrice} 
              myPrice={product.myPrice}
            />
          ) : (
            <div className="text-sm text-foreground">
              {product.competitorPrice.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR',
              })}
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
  }, [selectedRows, maxProducts, badgeClasses, ProductsCell, PricePositionCell, computeTrend, formatPercentDetailed, formatPercentCompact, showProductsColumn]);

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
              className="px-6 py-3 bg-card"
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
              className="px-6 py-3 bg-card"
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
