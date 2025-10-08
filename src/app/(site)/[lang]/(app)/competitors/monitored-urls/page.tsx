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
} from 'lucide-react';
import { computeTrend, formatPercentCompact, formatPercentDetailed } from '@/utils/priceTrend';
import Checkbox from '@/components/ui/checkbox';
import TanStackTable from '@/components/application/table/tanstack-table';
import JewelryProductCell from '@/components/application/table/JewelryProductCell';
import { getProducts } from '@/lib/services/productClient';
import { ProductDTO } from '@/types/product';
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
  const [focusedRowIndex, setFocusedRowIndex] = React.useState<number | null>(null);
  const [productSort, setProductSort] = React.useState<'none' | 'asc' | 'desc'>('none');
  const [priceSort, setPriceSort] = React.useState<'none' | 'asc' | 'desc'>('none');
  const [trendSort, setTrendSort] = React.useState<'none' | 'asc' | 'desc'>('none');

  // API data state
  const [products, setProducts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageLimit] = React.useState(100);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0
  });

  // Fetch products from API
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getProducts({ page: currentPage, limit: pageLimit });
        
        // Store pagination data
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        });
        
        // Map ProductDTO to the expected format for monitored URLs
        const mappedProducts = response.products.map((product: ProductDTO, index: number) => ({
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
        }));
        
        setProducts(mappedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        toast.error('Failed to load products');
        // Fallback to mock data on error
        setProducts(competitors);
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
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentData;
    return currentData.filter(competitor =>
      competitor.name.toLowerCase().includes(q) ||
      competitor.domain.toLowerCase().includes(q) ||
      (competitor.sku && competitor.sku.toLowerCase().includes(q))
    );
  }, [searchQuery, currentData]);

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
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Welcome back, Tim</h1>
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
      <section className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <article className="lg:col-span-2 rounded-xl border border-border-secondary bg-card shadow-sm transition-colors">
          <div className="border-b border-border-secondary p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                  <svg className="h-8 w-8 text-gray-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                    <path d="M2 17L12 22L22 17" />
                    <path d="M2 12L12 17L22 12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Competitor breakdown</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Keep track of vendors and their security ratings.</p>
                </div>
              </div>
              <button className={compactIconButtonClasses} aria-label="More actions">
                <svg className="h-5 w-5 text-quaternary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="10" cy="4" r="1.5" />
                  <circle cx="10" cy="16" r="1.5" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="relative flex h-[184px] items-end">
              <div className="absolute bottom-6 left-0 top-0 w-10 text-right text-xs text-muted-foreground">
                <div className="flex h-full flex-col justify-between">
                  {[100, 80, 60, 40, 20, 0].map(label => (
                    <div key={label}>{label}</div>
                  ))}
                </div>
              </div>
              <div className="ml-12 h-[132px] flex-1">
                <div className="absolute inset-0 ml-12 flex h-[132px] flex-col justify-between">
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-px bg-muted" />
                  ))}
                </div>
                <div className="relative ml-12 flex h-[132px] items-end justify-between px-5">
                  {[
                    { h1: 84, h2: 60, h3: 32 },
                    { h1: 116, h2: 82, h3: 44 },
                    { h1: 52, h2: 32, h3: 14 },
                    { h1: 92, h2: 60, h3: 32 },
                    { h1: 52, h2: 32, h3: 14 },
                    { h1: 108, h2: 76, h3: 40 },
                    { h1: 84, h2: 60, h3: 32 },
                    { h1: 92, h2: 60, h3: 32 },
                    { h1: 84, h2: 60, h3: 32 },
                    { h1: 100, h2: 68, h3: 36 },
                    { h1: 116, h2: 82, h3: 44 },
                    { h1: 76, h2: 52, h3: 28 },
                  ].map((bar, index) => (
                    <div key={index} className="relative w-8" style={{ height: bar.h1 }}>
                      <div className="absolute inset-0 rounded-t-md bg-border-secondary dark:bg-border-secondary" />
                      <div className="absolute inset-x-0 bottom-0 rounded-t-md bg-purple-400 dark:bg-purple-600" style={{ height: bar.h2 }} />
                      <div className="absolute inset-x-0 bottom-0 rounded-t-md bg-purple-600 dark:bg-purple-700" style={{ height: bar.h3 }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-0 left-12 right-0 flex justify-between px-6 text-xs text-muted-foreground">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                  <div key={month}>{month}</div>
                ))}
              </div>
            </div>
            <div className="mt-2 text-center text-xs font-medium text-muted-foreground">Month</div>
          </div>
          <div className="flex justify-end border-t border-border-secondary p-6">
            <button className={secondaryButtonClasses}>
              View full report
            </button>
          </div>
        </article>

        <article className="rounded-xl border border-border-secondary bg-card shadow-sm transition-colors">
          <div className="border-b border-border-secondary p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Products monitored</h2>
                <p className="mt-1 text-sm text-muted-foreground">You're monitoring {currentData.length} products.</p>
              </div>
              <button className={compactIconButtonClasses} aria-label="More actions">
                <svg className="h-5 w-5 text-quaternary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="10" cy="4" r="1.5" />
                  <circle cx="10" cy="16" r="1.5" />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-8 p-6">
            <div className="flex items-start justify-between">
              <div className="relative w-[200px]">
                <svg className="h-auto w-full" viewBox="0 0 200 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                  <path
                    d="M190 100C190 88.181 187.672 76.4778 183.149 65.5585C178.626 54.6392 171.997 44.7177 163.64 36.3604C155.282 28.0031 145.361 21.3738 134.442 16.8508C123.522 12.3279 111.819 10 100 10C88.181 9.99999 76.4779 12.3279 65.5585 16.8508C54.6392 21.3737 44.7177 28.0031 36.3604 36.3604C28.0031 44.7176 21.3738 54.6391 16.8509 65.5584C12.3279 76.4777 10 88.181 10 100"
                    stroke="currentColor"
                    className="text-border-secondary"
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 100C10 80.9939 16.017 62.4756 27.1885 47.0993C38.36 31.723 54.1126 20.2781 72.1885 14.4049C90.2644 8.53169 109.736 8.5317 127.812 14.4049C145.887 20.2781 161.64 31.7231 172.812 47.0994"
                    stroke="currentColor"
                    className="text-purple-600"
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="absolute left-1/2 top-[60px] -translate-x-1/2 text-[30px] font-semibold text-primary">{currentData.length}</div>
              </div>
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                  <path d="M14.6673 4.66663L9.42156 9.91238C9.15755 10.1764 9.02555 10.3084 8.87333 10.3579C8.73943 10.4014 8.5952 10.4014 8.46131 10.3579C8.30909 10.3084 8.17708 10.1764 7.91307 9.91238L6.08823 8.08754C5.82422 7.82353 5.69221 7.69152 5.54 7.64206C5.4061 7.59856 5.26187 7.59856 5.12797 7.64206C4.97575 7.69152 4.84375 7.82353 4.57974 8.08754L1.33398 11.3333M14.6673 4.66663H10.0007M14.6673 4.66663V9.33329" stroke="currentColor" className="text-green-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">10%</span>
              </div>
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground">You've almost reached your goal</h3>
              <p className="mt-1 text-sm text-muted-foreground">You have used 80% of your goal.</p>
            </div>
          </div>
          <div className="flex justify-end border-t border-border-secondary p-6">
            <button className={secondaryButtonClasses}>
              <svg className="h-5 w-5 text-quaternary" fill="none" stroke="currentColor" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.67} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Upgrade plan
            </button>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-border-secondary bg-card shadow-sm transition-colors">
        <div className="border-b border-border-secondary p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 md:gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base md:text-lg font-semibold text-foreground">Products nogled</h2>
                <span className="inline-flex items-center rounded-full border border-border-secondary bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{currentData.length} products</span>
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
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-secondary px-4 md:px-6 py-3">
          <div className="text-xs md:text-sm font-medium text-muted-foreground dark:text-gray-300">
            {pagination.total > 0 ? (
              <>
                Showing {((currentPage - 1) * pageLimit) + 1}-{Math.min(currentPage * pageLimit, pagination.total)} of {pagination.total} products
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
