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

const competitors = [
  {
    id: 0,
    name: 'Ephemeral',
    domain: 'ephemeral.io',
    avatar: '/api/placeholder/40/40',
    products: 1250,
    position: 60,
    trend: 5,
    trendUp: true,
    date: '22 Jan 2025',
    categories: ['Active', 'In Stock', 'Customer data', '+3'],
    competitorPrice: 29.90,
    myPrice: 42.00,
  },
  {
    id: 1,
    name: 'Stack3d Lab',
    domain: 'stack3dlab.com',
    avatar: '/api/placeholder/40/40',
    products: 980,
    position: 72,
    trend: 4,
    trendUp: false,
    date: '20 Jan 2025',
    categories: ['Active', 'In Stock', 'Business data', '+3'],
    competitorPrice: 35.50,
    myPrice: 32.00,
  },
  {
    id: 2,
    name: 'Warpspeed',
    domain: 'getwarpspeed.com',
    avatar: '/api/placeholder/40/40',
    products: 113,
    position: 78,
    trend: 6,
    trendUp: true,
    date: '24 Jan 2025',
    categories: ['Active', 'In Stock', 'Customer data'],
    competitorPrice: 45.00,
    myPrice: 45.00,
  },
  {
    id: 3,
    name: 'CloudWatch',
    domain: 'cloudwatch.app',
    avatar: '/api/placeholder/40/40',
    products: 2455,
    position: 38,
    trend: 8,
    trendUp: true,
    date: '26 Jan 2025',
    categories: ['Active', 'In Stock', 'Database access'],
    competitorPrice: 52.00,
    myPrice: 48.00,
  },
  {
    id: 4,
    name: 'ContrastAI',
    domain: 'contrastai.com',
    avatar: '/api/placeholder/40/40',
    products: 765,
    position: 42,
    trend: 1,
    trendUp: false,
    date: '18 Jan 2025',
    categories: ['Active', 'In Stock', 'Salesforce', '+3'],
    competitorPrice: 28.00,
    myPrice: 35.50,
  },
  {
    id: 5,
    name: 'Convergence',
    domain: 'convergence.io',
    avatar: '/api/placeholder/40/40',
    products: 1540,
    position: 66,
    trend: 6,
    trendUp: false,
    date: '28 Jan 2025',
    categories: ['Active', 'In Stock', 'Business data', '+3'],
    competitorPrice: 39.99,
    myPrice: 42.00,
  },
  {
    id: 6,
    name: 'Sisyphus',
    domain: 'sisyphus.com',
    avatar: '/api/placeholder/40/40',
    products: 48,
    position: 91,
    trend: 2,
    trendUp: true,
    date: '16 Jan 2025',
    categories: ['Inactive', 'Out of Stock', 'Customer data'],
    competitorPrice: 55.00,
    myPrice: 49.99,
  },
];

const badgeClasses: Record<string, string> = {
  Active: 'border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]',
  Inactive: 'border-[#E9EAEB] bg-[#FAFAFA] text-muted-foreground',
  'In Stock': 'border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]',
  'Out of Stock': 'border-[#FECDCA] bg-[#FEF3F2] text-[#B42318]',
  'Customer data': 'border-[#B2DDFF] bg-[#EFF8FF] text-[#175CD3]',
  'Business data': 'border-[#E9D7FE] bg-[#F9F5FF] text-[#6941C6]',
  Admin: 'border-[#C7D7FE] bg-[#EEF4FF] text-[#3538CD]',
  Financials: 'border-[#FCCEEE] bg-[#FDF2FA] text-[#C11574]',
  'Database access': 'border-[#D5D9EB] bg-[#F8F9FC] text-[#363F72]',
  Salesforce: 'border-[#F9DBAF] bg-[#FEF6EE] text-[#B93815]',
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
          className="inline-flex items-center gap-1 rounded-md border border-[#E9EAEB] bg-[#FAFAFA] px-2 py-0.5 text-xs font-medium text-muted-foreground"
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
    ? { bg: 'bg-muted dark:bg-gray-700', text: 'text-muted-foreground dark:text-gray-300', border: 'border-[#E9EAEB] dark:border-gray-600' }
    : isWinning
    ? { bg: 'bg-[#ECFDF3] dark:bg-green-900', text: 'text-[#067647] dark:text-green-300', border: 'border-[#ABEFC6] dark:border-green-700' }
    : { bg: 'bg-[#FEF3F2] dark:bg-red-900', text: 'text-[#B42318] dark:text-red-300', border: 'border-[#FECDCA] dark:border-red-700' };

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
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#EEF4FF] dark:bg-blue-900" aria-hidden="true">
            <svg className="h-3.5 w-3.5 text-[#3538CD]" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
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
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#F4EBFF] dark:bg-purple-900" aria-hidden="true">
            <svg className="h-3.5 w-3.5 text-[#7F56D9]" fill="none" stroke="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
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
        <div className="h-2 overflow-hidden rounded-full bg-[#E9EAEB] dark:bg-gray-600">
          <div
            className={`h-full transition-all duration-300 ${isWinning ? 'bg-[#17B26A]' : isEqual ? 'bg-[#717680]' : 'bg-[#F04438]'}`}
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center"
          style={{ left: `${progress}%` }}
          aria-hidden="true"
        >
          <div className={`h-4 w-4 rounded-full border-2 border-white shadow-sm ${isWinning ? 'bg-[#17B26A]' : isEqual ? 'bg-[#717680]' : 'bg-[#F04438]'}`}>
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
        className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-[320px] rounded-lg border border-[#E9EAEB] bg-white p-4 shadow-lg group-hover:block group-focus-within:block"
        role="tooltip"
        aria-hidden="true"
      >
        <div className="space-y-3">
          <div className="text-sm font-semibold text-primary">Price Analysis</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 rounded-lg bg-[#EEF4FF] p-3">
              <div className="text-xs text-muted-foreground">Competitor</div>
              <div className="text-lg font-bold text-[#3538CD]">{fmtPrice(competitorPrice)}</div>
            </div>
            <div className="space-y-1 rounded-lg bg-[#F4EBFF] p-3">
              <div className="text-xs text-muted-foreground">Your Price</div>
              <div className="text-lg font-bold text-[#7F56D9]">{fmtPrice(myPrice)}</div>
            </div>
          </div>
          <div className="space-y-2 rounded-lg border border-[#E9EAEB] bg-[#FAFAFA] p-3">
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

  const toggleAll = () => {
    setSelectedRows(prev => {
      // Select/Deselect only currently visible (sorted) rows
      const visibleIds = new Set(sortedCompetitors.map(item => item.id));
      const allVisibleSelected = sortedCompetitors.every(item => prev.has(item.id));

      const next = new Set(prev);
      if (allVisibleSelected) {
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
      
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-[280px] flex-1">
          <h1 className="text-2xl font-semibold text-foreground">Welcome back, Tim</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className={iconButtonClasses} aria-label="Search">
            <Search className="h-5 w-5 text-quaternary" />
          </button>
          <button className={secondaryButtonClasses}>
            <Settings className="h-5 w-5 text-quaternary" />
            Customize
          </button>
          <button className={secondaryButtonClasses}>
            <Download className="h-5 w-5 text-quaternary" />
            Export
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl min-h-screen space-y-6 bg-background px-4 py-6 text-foreground transition-colors sm:px-6 lg:py-10 lg:px-8">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                      <div className="absolute inset-0 rounded-t-md bg-[#E9EAEB] dark:bg-border-secondary" />
                      <div className="absolute inset-x-0 bottom-0 rounded-t-md bg-[#9E77ED] dark:bg-[#8B5CF6]" style={{ height: bar.h2 }} />
                      <div className="absolute inset-x-0 bottom-0 rounded-t-md bg-[#6941C6] dark:bg-[#7C3AED]" style={{ height: bar.h3 }} />
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
                <p className="mt-1 text-sm text-muted-foreground">You're monitoring 80% of your inventory.</p>
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
                    stroke="#E9EAEB"
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 100C10 80.9939 16.017 62.4756 27.1885 47.0993C38.36 31.723 54.1126 20.2781 72.1885 14.4049C90.2644 8.53169 109.736 8.5317 127.812 14.4049C145.887 20.2781 161.64 31.7231 172.812 47.0994"
                    stroke="#7F56D9"
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="absolute left-1/2 top-[60px] -translate-x-1/2 text-[30px] font-semibold text-primary">240</div>
              </div>
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                  <path d="M14.6673 4.66663L9.42156 9.91238C9.15755 10.1764 9.02555 10.3084 8.87333 10.3579C8.73943 10.4014 8.5952 10.4014 8.46131 10.3579C8.30909 10.3084 8.17708 10.1764 7.91307 9.91238L6.08823 8.08754C5.82422 7.82353 5.69221 7.69152 5.54 7.64206C5.4061 7.59856 5.26187 7.59856 5.12797 7.64206C4.97575 7.69152 4.84375 7.82353 4.57974 8.08754L1.33398 11.3333M14.6673 4.66663H10.0007M14.6673 4.66663V9.33329" stroke="#17B26A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-medium text-[#067647]">10%</span>
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
        <div className="border-b border-border-secondary p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">Products nogled</h2>
                <span className="inline-flex items-center rounded-full border border-border-secondary bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">240 products</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Monitor competitor pricing and stay competitive with real-time price tracking.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className={secondaryButtonClasses}>
                <Upload className="h-5 w-5 text-quaternary" />
                Import
              </button>
              <button className="flex items-center gap-1 rounded-lg border-2 border-[#FFFFFF1F] bg-[#7F56D9] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#6941C6]">
                <Plus className="h-5 w-5 text-[#D6BBFB]" />
                Track Product
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-secondary px-6 py-3">
          <div className="flex overflow-hidden rounded-lg border border-border-secondary shadow-sm" role="tablist" aria-label="Product filter tabs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 ${
                activeTab === 'all' ? 'border-r border-border-secondary bg-muted text-foreground' : 'border-r border-border-secondary bg-background text-muted-foreground hover:bg-muted'
              }`}
              role="tab"
              aria-selected={activeTab === 'all'}
              aria-controls="all-products-panel"
              id="all-products-tab"
            >
              All Products
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('monitored')}
              className={`px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 ${
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
              className={`px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 ${
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
          <div className="flex items-center gap-3">
            <div className="relative max-w-[320px]">
              <label htmlFor="search-input" className="sr-only">
                Search competitors by name or domain
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-quaternary" aria-hidden="true" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, URLs, SKU"
                className="w-full rounded-lg border border-border-secondary bg-background py-2 pl-10 pr-16 text-base text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/40"
                aria-describedby="search-help"
                aria-label="Search competitors by name or domain"
              />
              <span
                id="search-help"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border-secondary bg-background px-1.5 py-0.5 text-xs text-muted-foreground"
                aria-label="Keyboard shortcut: Command K"
              >
                ⌘K
              </span>
            </div>
            <button className={secondaryButtonClasses}>
              <svg className="h-5 w-5 text-quaternary" fill="none" stroke="currentColor" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.67} d="M3 4h14M6 8h8M9 12h2" />
              </svg>
              Filters
            </button>
          </div>
        </div>

        <div 
          className="overflow-x-auto"
          role="tabpanel"
          id="all-products-panel"
          aria-labelledby="all-products-tab"
          hidden={activeTab !== 'all'}
        >
          <table
            className="w-full bg-card transition-colors"
            aria-label="Competitor monitoring table"
            aria-describedby="table-description"
          >
            <caption id="table-description" className="sr-only">
              Table showing competitor products with pricing information, trends, and categories. 
              Use arrow keys to navigate between rows, space or enter to select, and escape to clear selection.
            </caption>
            <thead className="border-b border-border-secondary bg-muted">
              <tr>
                <th 
                  className="px-6 py-3 text-left" 
                  scope="col"
                  aria-sort={productSort === 'none' ? 'none' : productSort === 'asc' ? 'ascending' : 'descending'}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={sortedCompetitors.every(item => selectedRows.has(item.id)) && sortedCompetitors.length > 0}
                      onChange={toggleAll}
                      className="h-5 w-5 rounded-md border-[#7F56D9] text-[#7F56D9] focus:ring-ring/40"
                      aria-label="Select all competitors"
                      aria-describedby="select-all-help"
                    />
                    <button
                      type="button"
                      onClick={toggleProductSort}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 rounded"
                      aria-label={`Sort by product name ${productSort === 'none' ? 'ascending' : productSort === 'asc' ? 'descending' : 'none'}`}
                    >
                      Product
                      {productSort === 'asc' && <ArrowUp className="h-3 w-3" aria-hidden="true" />}
                      {productSort === 'desc' && <ArrowDown className="h-3 w-3" aria-hidden="true" />}
                      {productSort === 'none' && (
                        <svg className="h-3 w-3 text-quaternary" fill="none" stroke="currentColor" viewBox="0 0 12 12" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 2.5v7m0 0l3.5-3.5M6 9.5L2.5 6" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div id="select-all-help" className="sr-only">
                    Checkbox to select or deselect all competitors in the table
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground" scope="col">
                  Matched Product
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground"
                  scope="col"
                  aria-sort={priceSort === 'none' ? 'none' : priceSort === 'asc' ? 'ascending' : 'descending'}
                >
                  <button
                    type="button"
                    onClick={togglePriceSort}
                    className="inline-flex items-center gap-1 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 rounded"
                    aria-label={`Sort by competitor price ${priceSort === 'none' ? 'ascending' : priceSort === 'asc' ? 'descending' : 'none'}`}
                  >
                    Price Position
                    {priceSort === 'asc' && <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />}
                    {priceSort === 'desc' && <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />}
                    {priceSort === 'none' && (
                      <svg className="h-3.5 w-3.5 text-quaternary" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M6 2.5v7m0 0l3.5-3.5M6 9.5L2.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground"
                  scope="col"
                  aria-sort={trendSort === 'none' ? 'none' : trendSort === 'asc' ? 'ascending' : 'descending'}
                >
                  <button
                    type="button"
                    onClick={toggleTrendSort}
                    className="inline-flex items-center gap-1 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 rounded"
                    aria-label={`Sort by trend ${trendSort === 'none' ? 'ascending' : trendSort === 'asc' ? 'descending' : 'none'}`}
                  >
                    Trend
                    {trendSort === 'asc' && <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />}
                    {trendSort === 'desc' && <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />}
                    {trendSort === 'none' && (
                      <svg className="h-3.5 w-3.5 text-quaternary" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M6 2.5v7m0 0l3.5-3.5M6 9.5L2.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground" scope="col">
                  Categories
                </th>
                <th className="px-4 py-3" scope="col" aria-label="Actions">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-secondary bg-card">
              {sortedCompetitors.map((competitor, index) => (
                <tr 
                  key={competitor.id} 
                  className={`transition-colors hover:bg-muted ${
                    focusedRowIndex === index ? 'bg-blue-50 dark:bg-blue-900 ring-2 ring-blue-200 dark:ring-blue-800' : ''
                  }`}
                  tabIndex={focusedRowIndex === index ? 0 : -1}
                  onFocus={() => setFocusedRowIndex(index)}
                  onKeyDown={(e) => handleKeyDown(e, competitor.id, index)}
                  aria-selected={selectedRows.has(competitor.id)}
                  aria-label={`Competitor ${competitor.name} from ${competitor.domain}`}
                >
                  <td className="px-6 py-4 bg-card">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(competitor.id)}
                        onChange={() => toggleRow(competitor.id)}
                        className="h-5 w-5 rounded-md border-[#7F56D9] text-[#7F56D9] focus:ring-ring/40 dark:border-gray-400 dark:text-gray-400 dark:bg-gray-700"
                        aria-label={`Select ${competitor.name} competitor`}
                        aria-describedby={`competitor-${competitor.id}-info`}
                      />
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-full border border-black/8 dark:border-gray-600 bg-gray-200 dark:bg-gray-600"
                          aria-hidden="true"
                        />
                        <div id={`competitor-${competitor.id}-info`}>
                          <div className="text-sm font-medium text-foreground">{competitor.name}</div>
                          <div className="text-sm text-muted-foreground">{competitor.domain}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-card">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded-full border border-black/8 bg-gray-200"
                        aria-hidden="true"
                      />
                      <div>
                        <div className="text-sm font-medium text-foreground">{competitor.name}</div>
                        <div className="text-sm text-muted-foreground">{competitor.domain}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-card">
                    <PricePositionCell 
                      competitorPrice={competitor.competitorPrice} 
                      myPrice={competitor.myPrice}
                    />
                  </td>
                  <td className="px-6 py-4 bg-card">
                    {(() => {
                      const { value, precise, up, neutral } = computeTrend(competitor.competitorPrice, competitor.myPrice);
                      const label = neutral
                        ? 'Prices equal'
                        : up
                        ? `You are ${formatPercentDetailed(-precise)} cheaper than competitor`
                        : `You are ${formatPercentDetailed(precise)} more expensive than competitor`;
                      return (
                        <div 
                          className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 ${
                            neutral
                              ? 'border-[#E9EAEB] bg-[#FAFAFA]'
                              : up
                              ? 'border-[#ABEFC6] bg-[#ECFDF3]'
                              : 'border-[#FECDCA] bg-[#FEF3F2]'
                          }`}
                          role="img"
                          aria-label={label}
                        >
                          {!neutral && (up ? (
                            <ArrowUp className="h-3 w-3 text-[#17B26A]" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-[#F04438]" aria-hidden="true" />
                          ))}
                          <span className={`text-xs font-medium ${neutral ? 'text-muted-foreground' : up ? 'text-[#067647]' : 'text-[#B42318]'}`}>
                            {neutral ? '0%' : formatPercentCompact(precise)}
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 bg-card">
                    <div className="flex flex-wrap items-center gap-1" role="list" aria-label="Product categories">
                      {competitor.categories.slice(0, 2).map(category => (
                        <span
                          key={category}
                          role="listitem"
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClasses[category] ?? 'border-[#E9EAEB] bg-[#FAFAFA] text-muted-foreground'}`}
                          aria-label={`Category: ${category}`}
                        >
                          {category === 'Active' && <span className="h-2 w-2 rounded-full bg-[#17B26A]" aria-hidden="true" />}
                          {category === 'Inactive' && <span className="h-2 w-2 rounded-full bg-[#717680]" aria-hidden="true" />}
                          {category === 'In Stock' && <span className="h-2 w-2 rounded-full bg-[#17B26A]" aria-hidden="true" />}
                          {category === 'Out of Stock' && <span className="h-2 w-2 rounded-full bg-[#F04438]" aria-hidden="true" />}
                          {category}
                        </span>
                      ))}
                        {competitor.categories.length > 2 && (
                          <span 
                            className="inline-flex items-center rounded-full border border-[#E9EAEB] bg-[#FAFAFA] px-2 py-0.5 text-xs font-medium text-muted-foreground"
                            role="listitem"
                            aria-label={`${competitor.categories.length - 2} additional categories`}
                          >
                            +{competitor.categories.length - 2}
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button 
                      type="button"
                      className="rounded-lg p-2 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40" 
                      aria-label={`More actions for ${competitor.name}`}
                      aria-haspopup="menu"
                    >
                      <svg className="h-5 w-5 text-quaternary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 5.25a.75.75 0 110-1.5.75.75 0 010 1.5zm0 5.25a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border-secondary px-6 py-3">
          <div className="text-sm font-medium text-muted-foreground dark:text-gray-300">
            Page 1 of 10
            <span className="sr-only">
              Showing {filteredCompetitors.length} of {competitors.length} competitors
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className={secondaryButtonClasses}
              aria-label="Go to previous page"
              disabled
            >
              Previous
            </button>
            <button
              className={secondaryButtonClasses}
              aria-label="Go to next page"
            >
              Next
            </button>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
