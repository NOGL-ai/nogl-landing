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
import { getCompetitors } from '@/lib/services/competitorClient';
import { CompetitorDTO } from '@/types/product';
import { useScreenContext } from '@/context/ScreenContext';
import TrackCompetitorModal from '@/components/molecules/TrackCompetitorModal';

// Hardcoded data removed - now using API

const badgeClasses: Record<string, string> = {
  Active: 'border-[#ABEFC6] dark:border-[#067647] bg-[#ECFDF3] dark:bg-[#0a472a] text-[#067647] dark:text-[#ABEFC6]',
  Inactive: 'border-[#E9EAEB] dark:border-[#414651] bg-[#FAFAFA] dark:bg-[#1a1d24] text-[#414651] dark:text-[#D5D7DA]',
  Jewelry: 'border-[#F9DBAF] dark:border-[#B93815] bg-[#FEF6EE] dark:bg-[#4a1d0a] text-[#B93815] dark:text-[#F9DBAF]',
  Watches: 'border-[#B2DDFF] dark:border-[#175CD3] bg-[#EFF8FF] dark:bg-[#0a2540] text-[#175CD3] dark:text-[#B2DDFF]',
  Fashion: 'border-[#E9D7FE] dark:border-[#6941C6] bg-[#F9F5FF] dark:bg-[#2a1a4a] text-[#6941C6] dark:text-[#E9D7FE]',
  Design: 'border-[#C7D7FE] dark:border-[#3538CD] bg-[#EEF4FF] dark:bg-[#1a1c4a] text-[#3538CD] dark:text-[#C7D7FE]',
  Luxury: 'border-[#FCCEEE] dark:border-[#C11574] bg-[#FDF2FA] dark:bg-[#4a0a2e] text-[#C11574] dark:text-[#FCCEEE]',
  Accessories: 'border-[#D5D9EB] dark:border-[#363F72] bg-[#F8F9FC] dark:bg-[#1a1d2e] text-[#363F72] dark:text-[#D5D9EB]',
  Silver: 'border-[#D1D5DB] dark:border-[#374151] bg-[#F9FAFB] dark:bg-[#1a1d24] text-[#374151] dark:text-[#D1D5DB]',
  Minimalist: 'border-[#E5E7EB] dark:border-[#6B7280] bg-[#F3F4F6] dark:bg-[#2a2d34] text-[#6B7280] dark:text-[#E5E7EB]',
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

// Mini Sparkline Chart Component
const MiniSparkline = ({ data, width = 60, height = 20 }: { data: number[], width?: number, height?: number }) => {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-blue-500"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Status Badge Component
const StatusBadge = ({ productCount, maxProducts }: { productCount: number, maxProducts: number }) => {
  const percentage = (productCount / maxProducts) * 100;
  
  if (percentage >= 80) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:border-purple-700 dark:bg-purple-900 dark:text-purple-300">
        <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
        Market Leader
      </span>
    );
  } else if (percentage >= 20) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        Established
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:border-green-700 dark:bg-green-900 dark:text-green-300">
        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Emerging
      </span>
    );
  }
};

// Enhanced Products Cell Component
const ProductsCell = ({ competitor, maxProducts }: { competitor: any, maxProducts: number }) => {
  // Generate mock trend data for sparkline (last 7 days)
  const trendData = React.useMemo(() => {
    const base = competitor.products;
    const variation = competitor.trend;
    return Array.from({ length: 7 }, (_, i) => {
      const dayVariation = (Math.random() - 0.5) * variation;
      return Math.max(0, Math.round(base + dayVariation));
    });
  }, [competitor.products, competitor.trend]);

  const percentageOfLeader = Math.round((competitor.products / maxProducts) * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="text-base font-semibold text-foreground">{competitor.products.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">({percentageOfLeader}% of leader)</div>
      </div>
      <div className="flex items-center gap-2">
        <MiniSparkline data={trendData} />
        <StatusBadge productCount={competitor.products} maxProducts={maxProducts} />
      </div>
    </div>
  );
};

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
      className="group relative min-w-[280px] space-y-1"
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
            className={`h-full transition-all duration-300 ${isWinning ? 'bg-green-500 dark:bg-green-400' : isEqual ? 'bg-gray-400 dark:bg-gray-500' : 'bg-red-500 dark:bg-red-400'}`}
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center"
          style={{ left: `${progress}%` }}
          aria-hidden="true"
        >
          <div className={`h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm ${isWinning ? 'bg-green-500 dark:bg-green-400' : isEqual ? 'bg-gray-400 dark:bg-gray-500' : 'bg-red-500 dark:bg-red-400'}`}>
            <div className="h-full w-full rounded-full bg-white/30 dark:bg-gray-800/30" />
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
  const screenContext = useScreenContext();
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = React.useState<'all' | 'monitored' | 'unmonitored'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [focusedRowIndex, setFocusedRowIndex] = React.useState<number | null>(null);
  const [productSort, setProductSort] = React.useState<'none' | 'asc' | 'desc'>('none');
  const [priceSort, setPriceSort] = React.useState<'none' | 'asc' | 'desc'>('none');
  const [trendSort, setTrendSort] = React.useState<'none' | 'asc' | 'desc'>('none');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(() => {
    // Load from localStorage or default based on screen size
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('competitor-page-size');
      if (saved) {
        return parseInt(saved, 10);
      }
      // Mobile optimization: smaller default on mobile
      return window.innerWidth < 768 ? 10 : 25;
    }
    return 25;
  });

  // API state
  const [competitors, setCompetitors] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  // Track if we've already sent competitors to screen context to prevent infinite loops
  const screenContextSentRef = React.useRef<string | null>(null);

  // Track Competitor Modal state
  const [showTrackModal, setShowTrackModal] = React.useState(false);

  // Fetch competitors from API
  React.useEffect(() => {
    async function fetchCompetitors() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getCompetitors({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          status: activeTab === 'all' ? undefined : activeTab === 'monitored' ? 'ACTIVE' : 'INACTIVE',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });

        // Map API response to expected format
        const mapped = response.competitors.map((comp: CompetitorDTO, index: number) => ({
          id: index, // Use array index as numeric ID for compatibility
          _dbId: comp.id, // Keep original DB ID
          name: comp.name,
          domain: comp.domain,
          avatar: `https://img.logo.dev/${comp.domain}?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ`,
          products: comp.productCount,
          position: comp.marketPosition || 50,
          trend: 5, // Default trend - could be calculated from price history
          trendUp: true,
          date: new Date(comp.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          categories: comp.categories,
          competitorPrice: 35.00, // Default price - could be fetched from latest price comparison
          myPrice: 42.00,
        }));

        setCompetitors(mapped);
        setTotalPages(response.pagination.totalPages);
        setTotal(response.pagination?.total || 0);
      } catch (err) {
        console.error('Error fetching competitors:', err);
        setError(err instanceof Error ? err.message : 'Failed to load competitors');
        setCompetitors([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompetitors();
  }, [currentPage, itemsPerPage, searchQuery, activeTab]);

  // ✅ Debounce screen context updates to prevent infinite loops
  React.useEffect(() => {
    if (isLoading || competitors.length === 0) {
      return;
    }

    // Only compare key identifiers to prevent unnecessary re-renders
    const stateKey = JSON.stringify({
      ids: competitors.map(c => c.id),
      total,
      currentPage,
      totalPages,
      activeTab,
      searchQuery,
    });

    if (screenContextSentRef.current === stateKey) {
      return; // Skip if same state was already sent
    }

    // ✅ Use longer debounce delay for better stability (100ms instead of 0ms)
    const timer = setTimeout(() => {
      screenContext.setData("competitors", {
        competitors: competitors.map(c => ({
          name: c.name,
          domain: c.domain,
          products: c.products,
          position: c.position,
          priceComparison: {
            competitorPrice: c.competitorPrice,
            myPrice: c.myPrice,
            difference: c.myPrice - c.competitorPrice,
            percentageDiff: ((c.myPrice - c.competitorPrice) / c.competitorPrice) * 100,
            status: c.myPrice < c.competitorPrice ? "winning" : c.myPrice === c.competitorPrice ? "equal" : "losing",
          },
          categories: c.categories,
          lastUpdated: c.date,
        })),
        summary: {
          total: total,
          currentPage: currentPage,
          totalPages: totalPages,
          filter: activeTab,
          searchQuery: searchQuery || null,
        },
        visibleAt: new Date().toISOString(),
      });
      screenContextSentRef.current = stateKey;
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading, competitors, total, currentPage, totalPages, activeTab, searchQuery, screenContext.setData]);

  // Calculate max products for relative scaling
  const maxProducts = React.useMemo(() => {
    if (competitors.length === 0) return 1;
    return Math.max(...competitors.map(c => c.products));
  }, [competitors.length]);

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
    if (!q) return competitors;
    return competitors.filter(competitor =>
      competitor.name.toLowerCase().includes(q) ||
      competitor.domain.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Sort according to product, price or trend toggle
  const sortedCompetitors = React.useMemo(() => {
    if (productSort === 'none' && priceSort === 'none' && trendSort === 'none') return filteredCompetitors;
    const list = [...filteredCompetitors];
    list.sort((a, b) => {
      if (productSort !== 'none') {
        const diff = a.products - b.products;
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

  // Pagination logic - now using server-side pagination
  const paginatedCompetitors = competitors; // Data is already paginated from API

  // Reset to first page when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

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

  // Pagination functions
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1); // Reset to first page
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('competitor-page-size', newSize.toString());
    }
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="mx-auto w-full min-h-screen space-y-6 md:space-y-8 bg-background px-4 md:px-8 pt-6 md:pt-8 pb-8 md:pb-12 text-foreground transition-colors">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading competitors...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="mx-auto w-full min-h-screen space-y-6 md:space-y-8 bg-background px-4 md:px-8 pt-6 md:pt-8 pb-8 md:pb-12 text-foreground transition-colors">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to load competitors</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Try Again
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
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Competitor Analysis</h1>
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
                <h2 className="text-base md:text-lg font-semibold text-foreground">Competitor monitored</h2>
                <span className="inline-flex items-center rounded-full border border-border-secondary bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {total > 0 ? total : sortedCompetitors.length} competitors
                </span>
              </div>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground">Monitor competitor pricing and stay competitive with real-time price tracking.</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button className="hidden sm:flex items-center gap-1 rounded-lg border border-border-secondary bg-background px-3 md:px-3.5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted">
                <Upload className="h-4 md:h-5 w-4 md:w-5 text-quaternary" />
                <span className="hidden md:inline">Import</span>
              </button>
              <button
                onClick={() => setShowTrackModal(true)}
                className="flex items-center gap-1 rounded-lg border-2 border-purple-700 dark:border-white/10 bg-primary px-3 md:px-3.5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 md:h-5 w-4 md:w-5 text-primary-foreground/80" />
                <span className="hidden sm:inline">Track Competitor</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 border-b border-border-secondary px-4 md:px-6 py-3">
          <div className="flex overflow-hidden rounded-lg border border-border-secondary shadow-sm" role="tablist" aria-label="Competitor filter tabs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 ${
                activeTab === 'all' ? 'border-r border-border-secondary bg-muted text-foreground' : 'border-r border-border-secondary bg-background text-muted-foreground hover:bg-muted'
              }`}
              role="tab"
              aria-selected={activeTab === 'all'}
              aria-controls="all-competitors-panel"
              id="all-competitors-tab"
            >
              <span className="hidden sm:inline">All Competitors</span>
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
                placeholder="Search competitors by name or domain"
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
          className="overflow-x-auto"
          role="tabpanel"
          id="all-competitors-panel"
          aria-labelledby="all-competitors-tab"
          hidden={activeTab !== 'all'}
        >
          <TanStackTable
            data={paginatedCompetitors}
            selectedRows={selectedRows}
            onRowSelectionChange={setSelectedRows}
            onSortChange={(sorting) => {
              if (sorting.column === 'products') {
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
            onRowClick={(row) => setFocusedRowIndex(paginatedCompetitors.findIndex(c => c.id === row.id))}
            onRowKeyDown={(e, row, index) => handleKeyDown(e, row.id, index)}
            focusedRowIndex={focusedRowIndex ?? -1}
            maxProducts={maxProducts}
            badgeClasses={badgeClasses}
            ProductsCell={ProductsCell}
            PricePositionCell={PricePositionCell}
            computeTrend={computeTrend}
            formatPercentDetailed={formatPercentDetailed}
            formatPercentCompact={formatPercentCompact}
            showProductsColumn={true}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-secondary px-4 md:px-6 py-3">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className="text-sm text-muted-foreground">
                Rows per page:
              </label>
              <select
                id="page-size"
                value={itemsPerPage}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
              {total > 0 ? (
                <>
                  Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, total)} of {total}
                  <span className="ml-2 text-muted-foreground/70">
                    (Page {currentPage} of {totalPages})
                  </span>
                </>
              ) : (
                'No competitors found'
              )}
              <span className="sr-only">
                Page {currentPage} of {totalPages || 1}
                {searchQuery && ` matching "${searchQuery}"`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={goToPreviousPage}
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
              onClick={goToNextPage}
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-border-secondary bg-background px-3 py-2 text-xs md:text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Go to next page"
              disabled={currentPage >= totalPages || isLoading}
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

      {/* Track Competitor Modal */}
      <TrackCompetitorModal
        open={showTrackModal}
        onOpenChange={setShowTrackModal}
      />
    </>
  );
}
