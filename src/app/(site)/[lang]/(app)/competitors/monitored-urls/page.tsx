'use client';

'use client';

import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  Download,
  Plus,
  Search,
  Settings,
  Upload,
  Loader2,
  Search as SearchIcon,
} from 'lucide-react';
import { computeTrend, formatPercentCompact, formatPercentDetailed } from '@/utils/priceTrend';
import Checkbox from '@/components/ui/checkbox';
import TanStackTable from '@/components/application/table/tanstack-table';
import JewelryProductCell from '@/components/application/table/JewelryProductCell';
import { getProducts } from '@/lib/services/productClient';
import { ProductDTO } from '@/types/product';
import { SimilaritySearchResult } from '@/types/market-intelligence';
import SimilaritySearchResults from '@/components/competitor/SimilaritySearchResults';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

// Competitor Products Data - for monitored URLs
const competitorProducts = [
  {
    id: 100,
    name: 'Ephemeral',
    sku: 'COMP-EPH-001',
    domain: 'ephemeral.io',
    avatar: '/api/placeholder/40/40',
    brand: {
      name: 'Ephemeral',
      logo: null,
    },
    variants: 1,
    competitorCount: 1,
    competitors: {
      prices: [29.90],
      avg: 29.90,
      cheapest: 29.90,
      highest: 29.90,
    },
    products: 1250,
    position: 60,
    trend: 5,
    trendUp: true,
    date: '22 Jan 2025',
    categories: ['Active', 'In Stock', 'Tracking'],
    competitorPrice: 29.90,
    myPrice: 42.00,
    channel: 'shopify',
  },
  {
    id: 101,
    name: 'Stack3d Lab',
    sku: 'COMP-STK-002',
    domain: 'stack3dlab.com',
    avatar: '/api/placeholder/40/40',
    brand: {
      name: 'Stack3d Lab',
      logo: null,
    },
    variants: 1,
    competitorCount: 1,
    competitors: {
      prices: [35.50],
      avg: 35.50,
      cheapest: 35.50,
      highest: 35.50,
    },
    products: 980,
    position: 72,
    trend: 4,
    trendUp: false,
    date: '20 Jan 2025',
    categories: ['Active', 'In Stock', 'Tracking'],
    competitorPrice: 35.50,
    myPrice: 32.00,
    channel: 'woocommerce',
  },
  {
    id: 102,
    name: 'Warpspeed',
    sku: 'COMP-WSP-003',
    domain: 'getwarpspeed.com',
    avatar: '/api/placeholder/40/40',
    brand: {
      name: 'Warpspeed',
      logo: null,
    },
    variants: 1,
    competitorCount: 1,
    competitors: {
      prices: [45.00],
      avg: 45.00,
      cheapest: 45.00,
      highest: 45.00,
    },
    products: 113,
    position: 78,
    trend: 6,
    trendUp: true,
    date: '24 Jan 2025',
    categories: ['Active', 'In Stock', 'Tracking'],
    competitorPrice: 45.00,
    myPrice: 45.00,
    channel: 'shopify',
  },
];

// Your Products Data - for monitored URLs
const yourProducts = [
  {
    id: 200,
    name: 'Ephemeral',
    sku: 'YOUR-EPH-001',
    domain: 'yourstore.com',
    avatar: '/api/placeholder/40/40',
    brand: {
      name: 'Your Brand',
      logo: null,
    },
    variants: 1,
    competitorCount: 1,
    competitors: {
      prices: [29.90],
      avg: 29.90,
      cheapest: 29.90,
      highest: 29.90,
    },
    products: 1540,
    position: 66,
    trend: 6,
    trendUp: false,
    date: '28 Jan 2025',
    categories: ['Active', 'In Stock', 'Your Catalog'],
    competitorPrice: 29.90,
    myPrice: 42.00,
    channel: 'shopify',
  },
  {
    id: 201,
    name: 'Stack3d Lab',
    sku: 'YOUR-STK-002',
    domain: 'yourstore.com',
    avatar: '/api/placeholder/40/40',
    brand: {
      name: 'Your Brand',
      logo: null,
    },
    variants: 1,
    competitorCount: 1,
    competitors: {
      prices: [35.50],
      avg: 35.50,
      cheapest: 35.50,
      highest: 35.50,
    },
    products: 48,
    position: 91,
    trend: 2,
    trendUp: true,
    date: '16 Jan 2025',
    categories: ['Active', 'In Stock', 'Your Catalog'],
    competitorPrice: 35.50,
    myPrice: 32.00,
    channel: 'woocommerce',
  },
  {
    id: 202,
    name: 'Warpspeed',
    sku: 'YOUR-WSP-003',
    domain: 'yourstore.com',
    avatar: '/api/placeholder/40/40',
    brand: {
      name: 'Your Brand',
      logo: null,
    },
    variants: 1,
    competitorCount: 1,
    competitors: {
      prices: [45.00],
      avg: 45.00,
      cheapest: 45.00,
      highest: 45.00,
    },
    products: 820,
    position: 55,
    trend: 3,
    trendUp: true,
    date: '25 Jan 2025',
    categories: ['Active', 'In Stock', 'Your Catalog'],
    competitorPrice: 45.00,
    myPrice: 45.00,
    channel: 'shopify',
  },
];

// Combined data for the table
const competitors = [...competitorProducts, ...yourProducts];

const badgeClasses: Record<string, string> = {
  Active: 'border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900 dark:text-green-300',
  Inactive: 'border-border-secondary bg-muted text-muted-foreground',
  'In Stock': 'border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900 dark:text-green-300',
  'Out of Stock': 'border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-300',
  'Customer data': 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'Business data': 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900 dark:text-purple-300',
  Admin: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Financials: 'border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-700 dark:bg-pink-900 dark:text-pink-300',
  'Database access': 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
  Salesforce: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-900 dark:text-orange-300',
  Tracking: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'Your Catalog': 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

const iconButtonClasses = 'rounded-lg p-2.5 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40';
const compactIconButtonClasses = 'rounded p-1 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40';
const secondaryButtonClasses = 'inline-flex items-center justify-center gap-1 rounded-lg border border-border-secondary bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60';

// Utility functions for price formatting
const fmtPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const fmtDiff = (diff: number) => {
  const sign = diff > 0 ? '+' : '';
  return `${sign}${fmtPrice(diff)}`;
};

const fmtPct = (percent: number) => {
  const sign = percent > 0 ? '+' : '';
  return `${sign}${Math.abs(percent).toFixed(2)}%`;
};

// computeTrend now imported from utils


// Price Position Component
const PricePositionCell = ({
  competitorPrice,
  myPrice,
}: {
  competitorPrice: number;
  myPrice: number;
}) => {
  // Guard: division by 0 / bad inputs
  const invalid = !(competitorPrice > 0 && Number.isFinite(competitorPrice) && Number.isFinite(myPrice));
  if (invalid) {
    return (
      <div className="min-w-[280px]">
        <span
          role="status"
          className="inline-flex items-center gap-1 rounded-md border border-border-secondary bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
          aria-label="Price comparison not available"
        >
          N/A
        </span>
        <div className="mt-1 text-[11px] text-muted-foreground">Missing or invalid competitor price.</div>
      </div>
    );
  }

  const priceDiff = myPrice - competitorPrice;
  const pctDiff = (priceDiff / competitorPrice) * 100;

  const isEqual = priceDiff === 0;
  const isWinning = priceDiff < 0;

  const colors = isEqual
    ? {
        bg: 'bg-muted dark:bg-gray-700',
        text: 'text-muted-foreground dark:text-gray-300',
        border: 'border-border-secondary dark:border-gray-600',
      }
    : isWinning
    ? {
        bg: 'bg-green-50 dark:bg-green-900',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-700',
      }
    : {
        bg: 'bg-red-50 dark:bg-red-900',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-red-200 dark:border-red-700',
      };

  const statusText = isEqual ? 'Equal' : isWinning ? 'You Win' : 'You Lose';

  // Keep your "fraction of competitor" bar. 50% == equal.
  const progress = isEqual ? 50 : (competitorPrice / (competitorPrice + myPrice)) * 100;

  const srId = React.useId();

  return (
    <div
      className="group relative min-w-[280px] space-y-2"
      role="region"
      aria-label="Price comparison"
      aria-describedby={srId}
    >
      {/* SR-only descriptive text */}
      <div id={srId} className="sr-only">
        Competitor price {fmtPrice(competitorPrice)}. Your price {fmtPrice(myPrice)}.
        Status: {statusText}. Difference {fmtDiff(priceDiff)} ({fmtPct(pctDiff)}).
      </div>

      {/* Compact numbers */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-50 dark:bg-blue-900" aria-hidden="true">
            <svg className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 6L8 2L14 6M3 13.5V7M13 13.5V7M2 13.5H14M5.5 13.5V10H10.5V13.5" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-medium text-muted-foreground dark:text-gray-400">Comp. Price</div>
            <div className="font-semibold text-primary" aria-label={`Competitor price: ${fmtPrice(competitorPrice)}`}>
              {fmtPrice(competitorPrice)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div>
            <div className="text-right text-[10px] font-medium text-muted-foreground dark:text-gray-400">My Price</div>
            <div className="text-right font-semibold text-primary" aria-label={`Your price: ${fmtPrice(myPrice)}`}>
              {fmtPrice(myPrice)}
            </div>
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-50 dark:bg-purple-900" aria-hidden="true">
            <svg className="h-3.5 w-3.5 text-purple-700 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14A6 6 0 108 2a6 6 0 000 12zM8 5.33V8m0 2.67h.007" />
            </svg>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="relative"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-valuetext={`${statusText} (${fmtPct(pctDiff)})`}
        aria-label="Price comparison progress"
      >
        <div className="h-2 overflow-hidden rounded-full bg-border-secondary dark:bg-gray-600">
          <div
            className={`h-full transition-all duration-300 ${isWinning ? 'bg-green-500' : isEqual ? 'bg-gray-500' : 'bg-red-500'}`}
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center"
          style={{ left: `${progress}%` }}
          aria-hidden="true"
        >
          <div className={`h-4 w-4 rounded-full border-2 border-white shadow-sm ${isWinning ? 'bg-green-500' : isEqual ? 'bg-gray-500' : 'bg-red-500'}`}>
            <div className="h-full w-full rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      {/* Hidden meter for proper measurement semantics */}
      <meter className="sr-only" min={0} max={100} value={Math.round(progress)}>
        {statusText} ({fmtPct(pctDiff)})
      </meter>

      {/* Status + diff */}
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${colors.border} ${colors.bg} ${colors.text}`} role="status">
          {!isEqual && (isWinning ? <ArrowDown className="h-3 w-3" aria-hidden="true" /> : <ArrowUp className="h-3 w-3" aria-hidden="true" />)}
          <span>{statusText}</span>
        </div>
        {!isEqual && (
          <div className={`text-xs font-semibold ${colors.text}`}>
            {fmtDiff(priceDiff)} ({fmtPct(pctDiff)})
          </div>
        )}
      </div>

      {/* Tooltip: now keyboard-friendly via focus-within */}
      <div
        className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-[320px] rounded-lg border border-border-secondary bg-background p-4 shadow-lg group-hover:block group-focus-within:block"
        role="tooltip"
        aria-hidden="true"
      >
        <div className="space-y-3">
          <div className="text-sm font-semibold text-primary">Price Analysis</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 rounded-lg bg-blue-50 dark:bg-blue-900 p-3">
              <div className="text-xs text-muted-foreground">Competitor</div>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{fmtPrice(competitorPrice)}</div>
            </div>
            <div className="space-y-1 rounded-lg bg-purple-50 dark:bg-purple-900 p-3">
              <div className="text-xs text-muted-foreground">Your Price</div>
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{fmtPrice(myPrice)}</div>
            </div>
          </div>
          <div className="space-y-2 rounded-lg border border-border-secondary bg-muted p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Difference:</span>
              <span className={`text-sm font-semibold ${colors.text}`}>{fmtDiff(priceDiff)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Percentage:</span>
              <span className={`text-sm font-semibold ${colors.text}`}>{fmtPct(pctDiff)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border-secondary pt-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <span className={`text-sm font-bold ${colors.text}`}>{statusText}</span>
            </div>
          </div>
          {!isEqual && (
            <div className={`rounded-lg p-2 text-xs ${colors.bg}`}>
              <span className={colors.text}>
                {isWinning
                  ? `💡 Great! You're ${fmtPct(-pctDiff)} cheaper than your competitor.`
                  : `⚠️ Consider adjusting your price. You're ${fmtPct(pctDiff)} more expensive.`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CompetitorPage() {
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set([0, 1, 2, 5, 6]));
  const [activeTab, setActiveTab] = React.useState<'all' | 'monitored' | 'unmonitored'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState('');
  const [focusedRowIndex, setFocusedRowIndex] = React.useState<number | null>(null);
  const [productSort, setProductSort] = React.useState<'none' | 'asc' | 'desc'>('none');
  const [priceSort, setPriceSort] = React.useState<'none' | 'asc' | 'desc'>('none');
  const [trendSort, setTrendSort] = React.useState<'none' | 'asc' | 'desc'>('none');

  // Debounce search query to avoid excessive filtering
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // API data state
  const [products, setProducts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageLimit, setPageLimit] = React.useState(() => {
    // Load from localStorage or default based on screen size
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('monitored-urls-page-size');
      if (saved) {
        return parseInt(saved, 10);
      }
      // Mobile optimization: smaller default on mobile
      return window.innerWidth < 768 ? 10 : 25;
    }
    return 25;
  });
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  });

  // Similarity search state
  const [searchResults, setSearchResults] = React.useState<Map<string, SimilaritySearchResult>>(new Map());
  const [isSearching, setIsSearching] = React.useState<Set<string>>(new Set());
  const [expandedResultsRow, setExpandedResultsRow] = React.useState<string | null>(null);
  const [isLoadingSimilarity, setIsLoadingSimilarity] = React.useState(false);
  const [similarityErrors, setSimilarityErrors] = React.useState<Map<string, string>>(new Map());

  // Trigger similarity search when products are loaded
  React.useEffect(() => {
    if (competitors.length > 0 && !isLoadingSimilarity) {
      performBatchSimilaritySearch(competitors);
    }
  }, [competitors.length]); // Only trigger when competitors are first loaded

  // Fetch products from API
  React.useEffect(() => {
    const fetchProducts = async () => {
      const startTime = performance.now();
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Validate parameters before API call
        if (currentPage < 1 || pageLimit < 1 || pageLimit > 100) {
          throw new Error('Invalid pagination parameters');
        }
        
        console.log(`🚀 Fetching products - Page: ${currentPage}, Limit: ${pageLimit}`);
        const response = await getProducts({ page: currentPage, limit: pageLimit });
        
        // Validate API response structure
        if (!response || !response.products || !Array.isArray(response.products)) {
          throw new Error('Invalid API response structure');
        }
        
        // Store pagination data
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        });
        
        // Map ProductDTO to the expected format for monitored URLs
        const mappedProducts = response.products.map((product: ProductDTO, index: number) => {
          // Validate required fields
          if (!product.id || !product.name) {
            console.warn(`Invalid product data at index ${index}:`, product);
            return null;
          }
          
          return {
            id: product.id || `product-${index}`,
            name: product.name,
            domain: product.brand?.name ? `${product.brand.name.toLowerCase().replace(/\s+/g, '')}.com` : 'unknown.com',
            avatar: product.image,
            sku: product.sku,
            image: product.image,
            brand: product.brand ? {
              name: product.brand.name,
              logo: product.brand.logo,
            } : {
              name: 'Unknown Brand',
              logo: null,
            },
            variants: 1, // Default to 1 since variants not in ProductDTO
            competitorCount: product._count?.competitors || 0,
            competitors: product.competitors && product.competitors.length > 0 ? {
              prices: product.competitors.map(c => c.cheapest || c.avg || 0),
              avg: product.competitors.reduce((sum, c) => sum + (c.avg || 0), 0) / product.competitors.length || 0,
              cheapest: Math.min(...product.competitors.map(c => c.cheapest || c.avg || 0)),
              highest: Math.max(...product.competitors.map(c => c.highest || c.avg || 0)),
            } : {
              prices: [0],
              avg: 0,
              cheapest: 0,
              highest: 0,
            },
            products: 1,
            position: 50 + (index % 50), // More realistic position range
            trend: product.competitors && product.competitors.length > 0 ? 
              ((product.price - (product.competitors[0]?.avg || product.price)) / (product.competitors[0]?.avg || product.price)) * 100 : 0,
            trendUp: product.competitors && product.competitors.length > 0 ? 
              product.price > (product.competitors[0]?.avg || product.price) : false,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            categories: product.category ? ['Active', 'In Stock', 'Tracking', product.category.name] : ['Active', 'In Stock', 'Tracking'],
            competitorPrice: product.competitors && product.competitors.length > 0 ? 
              product.competitors[0]?.cheapest || product.competitors[0]?.avg || product.price * 0.9 : product.price * 0.9,
            myPrice: product.price,
            channel: product.channel || 'unknown',
            currency: product.currency || 'EUR',
            status: 'Active',
          };
        }).filter(Boolean); // Remove null entries
        
        setProducts(mappedProducts);
        
        const endTime = performance.now();
        console.log(`✅ Products loaded in ${(endTime - startTime).toFixed(2)}ms - ${mappedProducts.length} products`);
      } catch (err) {
        console.error('Error fetching products:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
        setError(errorMessage);
        toast.error(errorMessage);
        
        // Only fallback to mock data in development or if explicitly configured
        if (process.env.NODE_ENV === 'development') {
          console.warn('Falling back to mock data due to error');
          setProducts(competitors);
        } else {
          // In production, show empty state instead of mock data
          setProducts([]);
        }
      } finally {
        setIsLoading(false);
        setIsInitialLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, pageLimit]);

  // Use API products data instead of hardcoded data
  const currentData = products.length > 0 ? products : competitors;

  // Calculate max products for relative scaling
  const maxProducts = React.useMemo(() => {
    return Math.max(...currentData.map(c => c.products));
  }, [currentData]);

  const toggleRow = (id: number) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = (force?: boolean) => {
    setSelectedRows(prev => {
      // Select/Deselect only currently visible (sorted) rows
      const visibleIds = new Set(sortedCompetitors.map(item => item.id));
      const allVisibleSelected = sortedCompetitors.every(item => prev.has(item.id));

      const next = new Set(prev);
      const shouldSelect = typeof force === 'boolean' ? force : !allVisibleSelected;
      if (!shouldSelect) {
        // Deselect visible
        visibleIds.forEach(id => next.delete(id));
      } else {
        // Select visible
        visibleIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  // Keyboard navigation handlers
  const handleKeyDown = (event: React.KeyboardEvent, competitorId: number, index: number) => {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const length = sortedCompetitors.length;
        const nextIndex = index + 1 >= length ? 0 : index + 1;
        setFocusedRowIndex(nextIndex);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const length = sortedCompetitors.length;
        const prevIndex = index - 1 < 0 ? length - 1 : index - 1;
        setFocusedRowIndex(prevIndex);
        break;
      }
      case ' ':
      case 'Enter':
        event.preventDefault();
        toggleRow(competitorId);
        break;
      case 'Escape':
        setFocusedRowIndex(null);
        break;
    }
  };

  // Filter competitors based on search query (memoized for performance)
  const filteredCompetitors = React.useMemo(() => {
    const q = debouncedSearchQuery.trim().toLowerCase();
    if (!q) return currentData;
    
    // Use more efficient filtering with early returns
    return currentData.filter(competitor => {
      const name = competitor.name?.toLowerCase() || '';
      const domain = competitor.domain?.toLowerCase() || '';
      const sku = competitor.sku?.toLowerCase() || '';
      
      return name.includes(q) || domain.includes(q) || sku.includes(q);
    });
  }, [debouncedSearchQuery, currentData]);

  // Sort according to product, price or trend toggle
  const sortedCompetitors = React.useMemo(() => {
    if (productSort === 'none' && priceSort === 'none' && trendSort === 'none') return filteredCompetitors;
    const list = [...filteredCompetitors];
    list.sort((a, b) => {
      if (productSort !== 'none') {
        const diff = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        return productSort === 'asc' ? diff : -diff;
      }
      if (priceSort !== 'none') {
        // Sort by relative price position: (my - competitor) / competitor
        const relA = (a.myPrice - a.competitorPrice) / a.competitorPrice;
        const relB = (b.myPrice - b.competitorPrice) / b.competitorPrice;
        const diff = relA - relB;
        return priceSort === 'asc' ? diff : -diff;
      }
      if (trendSort !== 'none') {
        // Use derived signed trend from price comparison
        const getSignedTrend = (competitor: typeof a) => {
          const { precise } = computeTrend(competitor.competitorPrice, competitor.myPrice);
          return precise; // signed value for ordering
        };
        
        const diff = getSignedTrend(a) - getSignedTrend(b);
        return trendSort === 'asc' ? diff : -diff;
      }
      return 0;
    });
    return list;
  }, [filteredCompetitors, productSort, priceSort, trendSort]);

  const togglePriceSort = () => {
    setPriceSort(prev => (prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none'));
    setProductSort('none');
    setTrendSort('none'); // Reset trend sort when price sort is active
  };

  const toggleTrendSort = () => {
    setTrendSort(prev => (prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none'));
    setProductSort('none');
    setPriceSort('none'); // Reset price sort when trend sort is active
  };

  const toggleProductSort = () => {
    setProductSort(prev => (prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none'));
    setPriceSort('none');
    setTrendSort('none');
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      // Scroll to top of the page for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage(prev => prev + 1);
      // Scroll to top of the page for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle page limit change
  const handlePageLimitChange = (newLimit: number) => {
    setPageLimit(newLimit);
    setCurrentPage(1); // Reset to first page
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('monitored-urls-page-size', newLimit.toString());
    }
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle similarity search
  const handleFindSimilar = async (product: any) => {
    const productId = product.id.toString();
    const imageUrl = product.image || product.avatar || product.product_page_image_url;
    
    if (!imageUrl) {
      toast.error('Product has no image for similarity search');
      return;
    }

    // Check if already searching or has results
    if (isSearching.has(productId) || searchResults.has(productId)) {
      return;
    }

    setIsSearching(prev => new Set(prev).add(productId));
    
    try {
      const response = await fetch('/api/market-intelligence/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          threshold: 0.75,
          limit: 10,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }
      
      const data: SimilaritySearchResult = await response.json();
      
      setSearchResults(prev => new Map(prev).set(productId, data));
      setExpandedResultsRow(productId);
      
      if (data.success && data.totalMatches > 0) {
        toast.success(`Found ${data.totalMatches} similar products`);
      } else {
        toast('No similar products found above 75% threshold', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('Similarity search error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to search for similar products');
    } finally {
      setIsSearching(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Toggle expanded results row
  const toggleExpandedResults = (productId: string) => {
    setExpandedResultsRow(prev => prev === productId ? null : productId);
  };

  // Helper function to validate image URLs
  const isValidImageUrl = (url: any): boolean => {
    if (!url || typeof url !== 'string') return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Automatic similarity search for all products on page load
  const performBatchSimilaritySearch = async (products: any[]) => {
    const productsWithImages = products.filter(product => {
      const imageUrl = product.image || product.avatar || product.product_page_image_url;
      return isValidImageUrl(imageUrl);
    });

    if (productsWithImages.length === 0) return;

    setIsLoadingSimilarity(true);
    setSimilarityErrors(new Map());

    // Process in batches of 5 to avoid overwhelming the API
    const batchSize = 5;
    const batches = [];
    for (let i = 0; i < productsWithImages.length; i += batchSize) {
      batches.push(productsWithImages.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const promises = batch.map(async (product) => {
        const productId = product.id.toString();
        const imageUrl = product.image || product.avatar || product.product_page_image_url;

        if (!isValidImageUrl(imageUrl)) {
          console.warn(`Skipping product ${productId}: Invalid image URL format`);
          return;
        }

        try {
          const response = await fetch('/api/market-intelligence/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageUrl,
              threshold: 0.75,
              limit: 10,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Search failed');
          }

          const data: SimilaritySearchResult = await response.json();

          setSearchResults(prev => new Map(prev).set(productId, data));

          // Calculate prices from similarity results
          if (data.success && data.matches.length > 0) {
            const prices = data.matches
              .map(match => match.price)
              .filter((price): price is number => typeof price === 'number' && price > 0);

            if (prices.length > 0) {
              const minPrice = Math.min(...prices);
              const closestPrice = data.closestMatch?.price ?? data.matches.find(match => typeof match.price === 'number')?.price ?? minPrice;

              // Update the product data with calculated prices
              // This will be reflected in the table automatically
              product.competitorPrice = minPrice;
              product.myPrice = closestPrice;
            }
          }
        } catch (error) {
          console.error(`Similarity search error for product ${productId}:`, error);
          setSimilarityErrors(prev => new Map(prev).set(productId, 
            error instanceof Error ? error.message : 'Search failed'
          ));
        }
      });

      await Promise.all(promises);
      
      // Small delay between batches to be respectful to the API
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsLoadingSimilarity(false);
  };

  // Show loading state only on initial load
  if (isInitialLoading) {
    return (
      <main className="mx-auto w-full min-h-screen space-y-6 md:space-y-8 bg-background px-4 md:px-8 pt-6 md:pt-8 pb-8 md:pb-12 text-foreground transition-colors">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </main>
    );
  }

  // Show error state
  if (error) {
    return (
      <main className="mx-auto w-full min-h-screen space-y-6 md:space-y-8 bg-background px-4 md:px-8 pt-6 md:pt-8 pb-8 md:pb-12 text-foreground transition-colors">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Screen reader announcements */}
      <div
        id="search-results-announcement"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {searchQuery && `Found ${filteredCompetitors.length} competitors matching "${searchQuery}"`}
      </div>
      
      <main className="mx-auto w-full min-h-screen space-y-6 md:space-y-8 bg-background px-4 md:px-8 pt-6 md:pt-8 pb-8 md:pb-12 text-foreground transition-colors">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3 md:gap-4">
        <div className="min-w-[200px] md:min-w-[280px] flex-1">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Monitored Products</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button className="hidden md:flex p-2.5 rounded-lg hover:bg-muted transition-colors" aria-label="Search">
            <Search className="h-5 w-5 text-quaternary" />
          </button>
          <button className={secondaryButtonClasses}>
            <Settings className="h-5 w-5 text-quaternary" />
            <span className="hidden sm:inline">Customize</span>
          </button>
          <button className={secondaryButtonClasses}>
            <Download className="h-5 w-5 text-quaternary" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      <section className="rounded-xl border border-border-secondary bg-card shadow-sm transition-colors">
        <div className="border-b border-border-secondary p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 md:gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base md:text-lg font-semibold text-foreground">Products nogled</h2>
                <span className="inline-flex items-center rounded-full border border-border-secondary bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{pagination.total} products</span>
              </div>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground">Monitor competitor pricing and stay competitive with real-time price tracking.</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button className="hidden sm:flex items-center gap-1 rounded-lg border border-border-secondary bg-background px-3 md:px-3.5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted">
                <Upload className="h-4 md:h-5 w-4 md:w-5 text-quaternary" />
                <span className="hidden md:inline">Import</span>
              </button>
              <button className="flex items-center gap-1 rounded-lg border-2 border-white/10 bg-primary px-3 md:px-3.5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                <Plus className="h-4 md:h-5 w-4 md:w-5 text-primary-foreground/80" />
                <span className="hidden sm:inline">Track Product</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 border-b border-border-secondary px-4 md:px-6 py-3">
          <div className="flex overflow-hidden rounded-lg border border-border-secondary shadow-sm" role="tablist" aria-label="Product filter tabs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 ${
                activeTab === 'all' ? 'border-r border-border-secondary bg-muted text-foreground' : 'border-r border-border-secondary bg-background text-muted-foreground hover:bg-muted'
              }`}
              role="tab"
              aria-selected={activeTab === 'all'}
              aria-controls="all-products-panel"
              id="all-products-tab"
            >
              <span className="hidden sm:inline">All Products</span>
              <span className="sm:hidden">All</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('monitored')}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 ${
                activeTab === 'monitored' ? 'border-r border-border-secondary bg-muted text-foreground' : 'border-r border-border-secondary bg-background text-muted-foreground hover:bg-muted'
              }`}
              role="tab"
              aria-selected={activeTab === 'monitored'}
              aria-controls="monitored-products-panel"
              id="monitored-products-tab"
            >
              Tracking
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unmonitored')}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 ${
                activeTab === 'unmonitored' ? 'bg-muted text-foreground' : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
              role="tab"
              aria-selected={activeTab === 'unmonitored'}
              aria-controls="unmonitored-products-panel"
              id="unmonitored-products-tab"
            >
              Paused
            </button>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:w-[200px] md:max-w-[320px]">
              <label htmlFor="search-input" className="sr-only">
                Search competitors by name or domain
              </label>
              <Search className="pointer-events-none absolute left-2 md:left-3 top-1/2 h-4 md:h-5 w-4 md:w-5 -translate-y-1/2 text-quaternary" aria-hidden="true" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, URLs, SKU"
                className="w-full rounded-lg border border-border-secondary bg-background py-2 pl-8 md:pl-10 pr-10 md:pr-16 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/40"
                aria-describedby="search-help"
                aria-label="Search competitors by name or domain"
              />
              <span
                id="search-help"
                className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border-secondary bg-background px-1.5 py-0.5 text-xs text-muted-foreground"
                aria-label="Keyboard shortcut: Command K"
              >
                ⌘K
              </span>
            </div>
            <button className="flex items-center gap-1 rounded-lg border border-border-secondary bg-background px-3 md:px-3.5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted">
              <svg className="h-4 md:h-5 w-4 md:w-5 text-quaternary" fill="none" stroke="currentColor" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.67} d="M3 4h14M6 8h8M9 12h2" />
              </svg>
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        <div 
          className={`overflow-x-auto transition-opacity duration-200 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
          role="tabpanel"
          id="all-products-panel"
          aria-labelledby="all-products-tab"
          hidden={activeTab !== 'all'}
        >
          {/* Show loading skeleton for better UX */}
          {isLoading && sortedCompetitors.length === 0 ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <TanStackTable
              data={sortedCompetitors}
              selectedRows={selectedRows}
              onRowSelectionChange={setSelectedRows}
              onSortChange={(sorting) => {
                if (sorting.column === 'name') {
                  setProductSort(sorting.direction);
                  setPriceSort('none');
                  setTrendSort('none');
                } else if (sorting.column === 'competitorPrice') {
                  setPriceSort(sorting.direction);
                  setProductSort('none');
                  setTrendSort('none');
                } else if (sorting.column === 'trend') {
                  setTrendSort(sorting.direction);
                  setProductSort('none');
                  setPriceSort('none');
                }
              }}
              onRowClick={(row) => setFocusedRowIndex(sortedCompetitors.findIndex(c => c.id === row.id))}
              onRowKeyDown={(e, row, index) => handleKeyDown(e, row.id, index)}
              focusedRowIndex={focusedRowIndex ?? -1}
              maxProducts={maxProducts}
              badgeClasses={badgeClasses}
              ProductsCell={({ competitor, maxProducts }) => {
                const comp: any = competitor;
                return (
                  <JewelryProductCell 
                    product={{
                      id: comp.id,
                      name: comp.name,
                      image: comp.avatar || comp.image,
                      sku: comp.sku || `SKU-${comp.id}`,
                      brand: {
                        name: comp.brand?.name || 'Unknown Brand',
                        logo: comp.brand?.logo
                      },
                      myPrice: comp.myPrice || comp.competitorPrice,
                      competitorCount: comp.competitorCount || 0,
                      status: comp.status || 'Active',
                      currency: comp.currency || 'EUR',
                      categories: comp.categories || []
                    }}
                    showPrice={false}
                    showStatus={true}
                    showCompetitorCount={false}
                    showTooltip={true}
                    size="lg"
                  />
                );
              }}
              PricePositionCell={PricePositionCell}
              computeTrend={computeTrend}
              formatPercentDetailed={formatPercentDetailed}
              formatPercentCompact={formatPercentCompact}
              showProductsColumn={false}
              showCompetitorsColumn={true}
              showMaterialsColumn={false}
              showBrandColumn={true}
              brandColumnHeader="Brand"
              showChannelColumn={true}
              firstColumnHeader="Product"
              searchResults={searchResults}
            />
          )}
        </div>

        {/* Similarity Search Status */}
        {isLoadingSimilarity && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mx-4 md:mx-6 mb-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Searching for similar products... This may take a moment.
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-secondary px-4 md:px-6 py-3">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className="text-sm text-muted-foreground">
                Rows per page:
              </label>
              <select
                id="page-size"
                value={pageLimit}
                onChange={(e) => handlePageLimitChange(Number(e.target.value))}
                className="rounded-md border border-border-secondary px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                disabled={isLoading}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            {/* Pagination info */}
            <div className="text-xs md:text-sm font-medium text-muted-foreground dark:text-gray-300">
              {pagination.total > 0 ? (
                <>
                  Showing {((currentPage - 1) * pageLimit) + 1}-{Math.min(currentPage * pageLimit, pagination.total)} of {pagination.total}
                  <span className="ml-2 text-muted-foreground/70">
                    (Page {currentPage} of {pagination.totalPages})
                  </span>
                </>
              ) : (
                'No products found'
              )}
              <span className="sr-only">
                Page {currentPage} of {pagination.totalPages || 1}
                {searchQuery && ` matching "${searchQuery}"`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={handlePreviousPage}
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-border-secondary bg-background px-3 py-2 text-xs md:text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Go to previous page"
              disabled={currentPage <= 1 || isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Loading...</span>
                </>
              ) : (
                'Previous'
              )}
            </button>
            <button
              onClick={handleNextPage}
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-border-secondary bg-background px-3 py-2 text-xs md:text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Go to next page"
              disabled={currentPage >= pagination.totalPages || isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Loading...</span>
                </>
              ) : (
                'Next'
              )}
            </button>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
