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
  Inactive: 'border-[#E9EAEB] bg-[#FAFAFA] text-[#414651]',
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
const secondaryButtonClasses = 'flex items-center gap-1 rounded-lg border border-border-secondary bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40';

// Price Position Component
const PricePositionCell = ({ 
  competitorPrice, 
  myPrice 
}: { 
  competitorPrice: number; 
  myPrice: number;
}) => {
  const priceDiff = myPrice - competitorPrice;
  const percentageDiff = ((priceDiff / competitorPrice) * 100);
  const isWinning = priceDiff < 0;
  const isEqual = priceDiff === 0;
  
  const formatPrice = (price: number) => `€ ${price.toFixed(2)}`;
  const formatDiff = (diff: number) => {
    const sign = diff > 0 ? '+' : '';
    return `${sign}€ ${diff.toFixed(2)}`;
  };
  
  const formatPercentage = (percent: number) => {
    const sign = percent > 0 ? '+' : '';
    return `${sign}${Math.abs(percent).toFixed(2)}%`;
  };

  const getStatusColor = () => {
    if (isEqual) return { bg: 'bg-[#F5F5F5] dark:bg-gray-700', text: 'text-[#717680] dark:text-gray-300', border: 'border-[#E9EAEB] dark:border-gray-600' };
    if (isWinning) return { bg: 'bg-[#ECFDF3] dark:bg-green-900', text: 'text-[#067647] dark:text-green-300', border: 'border-[#ABEFC6] dark:border-green-700' };
    return { bg: 'bg-[#FEF3F2] dark:bg-red-900', text: 'text-[#B42318] dark:text-red-300', border: 'border-[#FECDCA] dark:border-red-700' };
  };

  const getStatusText = () => {
    if (isEqual) return 'Equal';
    return isWinning ? 'You Win' : 'You Lose';
  };

  const colors = getStatusColor();
  const progressPercentage = isEqual ? 50 : (competitorPrice / (competitorPrice + myPrice)) * 100;

  return (
    <div className="group relative min-w-[280px] space-y-2" role="region" aria-label="Price comparison">
      {/* Compact View - Always Visible */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#EEF4FF] dark:bg-blue-900" aria-hidden="true">
            <svg className="h-3.5 w-3.5 text-[#3538CD]" fill="none" stroke="currentColor" viewBox="0 0 16 16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 6L8 2L14 6M3 13.5V7M13 13.5V7M2 13.5H14M5.5 13.5V10H10.5V13.5" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-medium text-[#717680] dark:text-gray-400">Comp. Price</div>
            <div className="font-semibold text-primary" aria-label={`Competitor price: ${formatPrice(competitorPrice)}`}>
              {formatPrice(competitorPrice)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div>
            <div className="text-right text-[10px] font-medium text-[#717680] dark:text-gray-400">My Price</div>
            <div className="text-right font-semibold text-primary" aria-label={`Your price: ${formatPrice(myPrice)}`}>
              {formatPrice(myPrice)}
            </div>
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#F4EBFF] dark:bg-purple-900" aria-hidden="true">
            <svg className="h-3.5 w-3.5 text-[#7F56D9]" fill="none" stroke="currentColor" viewBox="0 0 16 16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14A6 6 0 108 2a6 6 0 000 12zM8 5.33V8m0 2.67h.007" />
            </svg>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar with Position */}
      <div className="relative" role="img" aria-label={`Price comparison bar showing ${isWinning ? 'you are winning' : isEqual ? 'prices are equal' : 'competitor is winning'}`}>
        <div className="h-2 overflow-hidden rounded-full bg-[#E9EAEB] dark:bg-gray-600">
          <div 
            className={`h-full transition-all duration-300 ${isWinning ? 'bg-[#17B26A]' : isEqual ? 'bg-[#717680]' : 'bg-[#F04438]'}`}
            style={{ width: `${progressPercentage}%` }}
            aria-hidden="true"
          />
        </div>
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center"
          style={{ left: `${progressPercentage}%` }}
          aria-hidden="true"
        >
          <div className={`h-4 w-4 rounded-full border-2 border-white shadow-sm ${isWinning ? 'bg-[#17B26A]' : isEqual ? 'bg-[#717680]' : 'bg-[#F04438]'}`}>
            <div className="h-full w-full rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      {/* Status Badge with Difference */}
      <div className="flex items-center justify-between">
        <div 
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${colors.border} ${colors.bg} ${colors.text}`}
          role="status"
          aria-label={`Status: ${getStatusText()}`}
        >
          {!isEqual && (
            isWinning ? (
              <ArrowDown className="h-3 w-3" aria-hidden="true" />
            ) : (
              <ArrowUp className="h-3 w-3" aria-hidden="true" />
            )
          )}
          <span>{getStatusText()}</span>
        </div>
        {!isEqual && (
          <div 
            className={`text-xs font-semibold ${colors.text}`}
            aria-label={`Price difference: ${formatDiff(priceDiff)}, percentage: ${formatPercentage(percentageDiff)}`}
          >
            {formatDiff(priceDiff)} ({formatPercentage(percentageDiff)})
          </div>
        )}
      </div>

      {/* Detailed Tooltip on Hover */}
      <div 
        className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-[320px] rounded-lg border border-[#E9EAEB] bg-white p-4 shadow-lg group-hover:block"
        role="tooltip"
        aria-hidden="true"
      >
        <div className="space-y-3">
          <div className="text-sm font-semibold text-primary">Price Analysis</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 rounded-lg bg-[#EEF4FF] p-3">
              <div className="text-xs text-tertiary">Competitor</div>
              <div className="text-lg font-bold text-[#3538CD]">{formatPrice(competitorPrice)}</div>
            </div>
            <div className="space-y-1 rounded-lg bg-[#F4EBFF] p-3">
              <div className="text-xs text-tertiary">Your Price</div>
              <div className="text-lg font-bold text-[#7F56D9]">{formatPrice(myPrice)}</div>
            </div>
          </div>
          <div className="space-y-2 rounded-lg border border-[#E9EAEB] bg-[#FAFAFA] p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-tertiary">Difference:</span>
              <span className={`text-sm font-semibold ${colors.text}`}>{formatDiff(priceDiff)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-tertiary">Percentage:</span>
              <span className={`text-sm font-semibold ${colors.text}`}>{formatPercentage(percentageDiff)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border-secondary pt-2">
              <span className="text-xs text-tertiary">Status:</span>
              <span className={`text-sm font-bold ${colors.text}`}>{getStatusText()}</span>
            </div>
          </div>
          {!isEqual && (
            <div className={`rounded-lg p-2 text-xs ${colors.bg}`}>
              <span className={colors.text}>
                {isWinning 
                  ? `💡 Great! You're ${Math.abs(percentageDiff).toFixed(1)}% cheaper than your competitor.`
                  : `⚠️ Consider adjusting your price. You're ${percentageDiff.toFixed(1)}% more expensive.`
                }
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
      if (prev.size === competitors.length) {
        return new Set();
      }
      return new Set(competitors.map(item => item.id));
    });
  };

  // Keyboard navigation handlers
  const handleKeyDown = (event: React.KeyboardEvent, competitorId: number, index: number) => {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const nextIndex = Math.min(index + 1, competitors.length - 1);
        setFocusedRowIndex(nextIndex);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prevIndex = Math.max(index - 1, 0);
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

  // Filter competitors based on search query
  const filteredCompetitors = competitors.filter(competitor =>
    competitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    competitor.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
        <div className="mx-auto w-full max-w-7xl min-h-screen space-y-6 bg-background px-4 py-6 text-foreground transition-colors sm:px-6 lg:py-10 lg:px-8">
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

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="lg:col-span-2 rounded-xl border border-border-secondary bg-card shadow-sm transition-colors">
          <div className="border-b border-border-secondary p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                  <svg className="h-8 w-8 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                    <path d="M2 17L12 22L22 17" />
                    <path d="M2 12L12 17L22 12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-primary">Competitor breakdown</h2>
                  <p className="mt-1 text-sm text-tertiary">Keep track of vendors and their security ratings.</p>
                </div>
              </div>
              <button className={compactIconButtonClasses} aria-label="More actions">
                <svg className="h-5 w-5 text-quaternary" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="10" cy="4" r="1.5" />
                  <circle cx="10" cy="16" r="1.5" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="relative flex h-[184px] items-end">
              <div className="absolute bottom-6 left-0 top-0 w-10 text-right text-xs text-tertiary">
                <div className="flex h-full flex-col justify-between">
                  {[100, 80, 60, 40, 20, 0].map(label => (
                    <div key={label}>{label}</div>
                  ))}
                </div>
              </div>
              <div className="ml-12 h-[132px] flex-1">
                <div className="absolute inset-0 ml-12 flex h-[132px] flex-col justify-between">
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-px bg-[#F5F5F5]" />
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
                      <div className="absolute inset-0 rounded-t-md bg-[#E9EAEB]" />
                      <div className="absolute inset-x-0 bottom-0 rounded-t-md bg-[#9E77ED]" style={{ height: bar.h2 }} />
                      <div className="absolute inset-x-0 bottom-0 rounded-t-md bg-[#6941C6]" style={{ height: bar.h3 }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-0 left-12 right-0 flex justify-between px-6 text-xs text-tertiary">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                  <div key={month}>{month}</div>
                ))}
              </div>
            </div>
            <div className="mt-2 text-center text-xs font-medium text-tertiary">Month</div>
          </div>
          <div className="flex justify-end border-t border-border-secondary p-6">
            <button className="rounded-lg border border-border-secondary bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-secondary">
              View full report
            </button>
          </div>
        </article>

        <article className="rounded-xl border border-border-secondary bg-card shadow-sm transition-colors">
          <div className="border-b border-border-secondary p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-primary">Products monitored</h2>
                <p className="mt-1 text-sm text-tertiary">You're monitoring 80% of your inventory.</p>
              </div>
              <button className={compactIconButtonClasses} aria-label="More actions">
                <svg className="h-5 w-5 text-quaternary" fill="currentColor" viewBox="0 0 20 20">
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
                <svg className="h-auto w-full" viewBox="0 0 200 110" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.6673 4.66663L9.42156 9.91238C9.15755 10.1764 9.02555 10.3084 8.87333 10.3579C8.73943 10.4014 8.5952 10.4014 8.46131 10.3579C8.30909 10.3084 8.17708 10.1764 7.91307 9.91238L6.08823 8.08754C5.82422 7.82353 5.69221 7.69152 5.54 7.64206C5.4061 7.59856 5.26187 7.59856 5.12797 7.64206C4.97575 7.69152 4.84375 7.82353 4.57974 8.08754L1.33398 11.3333M14.6673 4.66663H10.0007M14.6673 4.66663V9.33329" stroke="#17B26A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-medium text-[#067647]">10%</span>
              </div>
            </div>
            <div>
              <h3 className="text-base font-medium text-primary">You've almost reached your goal</h3>
              <p className="mt-1 text-sm text-tertiary">You have used 80% of your goal.</p>
            </div>
          </div>
          <div className="flex justify-end border-t border-border-secondary p-6">
            <button className={secondaryButtonClasses}>
              <svg className="h-5 w-5 text-quaternary" fill="none" stroke="currentColor" viewBox="0 0 20 20">
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
                <h2 className="text-lg font-semibold text-primary">Products nogled</h2>
                <span className="inline-flex items-center rounded-full border border-[#E9D7FE] bg-[#F9F5FF] px-2 py-0.5 text-xs font-medium text-[#6941C6]">240 products</span>
              </div>
              <p className="mt-1 text-sm text-tertiary">Monitor competitor pricing and stay competitive with real-time price tracking.</p>
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
                placeholder="Search products, URLs, SKL"
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
              <svg className="h-5 w-5 text-quaternary" fill="none" stroke="currentColor" viewBox="0 0 20 20">
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
            role="table"
            aria-label="Competitor monitoring table"
            aria-describedby="table-description"
          >
            <caption id="table-description" className="sr-only">
              Table showing competitor products with pricing information, trends, and categories. 
              Use arrow keys to navigate between rows, space or enter to select, and escape to clear selection.
            </caption>
            <thead className="border-b border-border-secondary bg-muted">
              <tr role="row">
                <th 
                  className="px-6 py-3 text-left" 
                  role="columnheader" 
                  scope="col"
                  aria-sort={selectedRows.size === competitors.length ? "other" : selectedRows.size > 0 ? "other" : "none" as const}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === competitors.length}
                      onChange={toggleAll}
                      className="h-5 w-5 rounded-md border-[#7F56D9] text-[#7F56D9] focus:ring-[#7F56D9]"
                      aria-label="Select all competitors"
                      aria-describedby="select-all-help"
                    />
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#717680] dark:text-gray-400">
                      Product
                      <svg className="h-3 w-3 text-quaternary" fill="none" stroke="currentColor" viewBox="0 0 12 12" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 2.5v7m0 0l3.5-3.5M6 9.5L2.5 6" />
                      </svg>
                    </span>
                  </div>
                  <div id="select-all-help" className="sr-only">
                    Checkbox to select or deselect all competitors in the table
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717680] dark:text-gray-400" role="columnheader" scope="col">
                  Matched Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717680] dark:text-gray-400" role="columnheader" scope="col">
                  Price Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717680] dark:text-gray-400" role="columnheader" scope="col">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717680] dark:text-gray-400" role="columnheader" scope="col">
                  Categories
                </th>
                <th className="px-4 py-3" role="columnheader" scope="col" aria-label="Actions">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-secondary bg-card">
              {filteredCompetitors.map((competitor, index) => (
                <tr 
                  key={competitor.id} 
                  className={`transition-colors hover:bg-secondary ${
                    focusedRowIndex === index ? 'bg-blue-50 dark:bg-blue-900 ring-2 ring-blue-200 dark:ring-blue-800' : ''
                  }`}
                  role="row"
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, competitor.id, index)}
                  aria-selected={selectedRows.has(competitor.id)}
                  aria-label={`Competitor ${competitor.name} from ${competitor.domain}`}
                >
                  <td className="px-6 py-4 bg-card" role="gridcell">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(competitor.id)}
                        onChange={() => toggleRow(competitor.id)}
                        className="h-5 w-5 rounded-md border-[#7F56D9] text-[#7F56D9] focus:ring-[#7F56D9] dark:border-gray-400 dark:text-gray-400 dark:bg-gray-700"
                        aria-label={`Select ${competitor.name} competitor`}
                        aria-describedby={`competitor-${competitor.id}-info`}
                      />
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-full border border-black/8 dark:border-gray-600 bg-gray-200 dark:bg-gray-600"
                          aria-hidden="true"
                        />
                        <div id={`competitor-${competitor.id}-info`}>
                          <div className="text-sm font-medium text-primary">{competitor.name}</div>
                          <div className="text-sm text-tertiary">{competitor.domain}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-card" role="gridcell">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded-full border border-black/8 bg-gray-200"
                        aria-hidden="true"
                      />
                      <div>
                        <div className="text-sm font-medium text-primary">{competitor.name}</div>
                        <div className="text-sm text-tertiary">{competitor.domain}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-card" role="gridcell">
                    <PricePositionCell 
                      competitorPrice={competitor.competitorPrice} 
                      myPrice={competitor.myPrice}
                    />
                  </td>
                  <td className="px-6 py-4 bg-card" role="gridcell">
                    <div 
                      className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 ${
                        competitor.trendUp ? 'border-[#ABEFC6] bg-[#ECFDF3]' : 'border-[#FECDCA] bg-[#FEF3F2]'
                      }`}
                      role="img"
                      aria-label={`Price trend ${competitor.trendUp ? 'up' : 'down'} by ${competitor.trend}%`}
                    >
                      {competitor.trendUp ? (
                        <ArrowUp className="h-3 w-3 text-[#17B26A]" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-[#F04438]" aria-hidden="true" />
                      )}
                      <span className={`text-xs font-medium ${competitor.trendUp ? 'text-[#067647]' : 'text-[#B42318]'}`}>
                        {competitor.trend}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-card" role="gridcell">
                    <div className="flex flex-wrap items-center gap-1" role="list" aria-label="Product categories">
                      {competitor.categories.slice(0, 2).map(category => (
                        <span
                          key={category}
                          role="listitem"
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClasses[category] ?? 'border-[#E9EAEB] bg-[#FAFAFA] text-[#414651]'}`}
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
                            className="inline-flex items-center rounded-full border border-[#E9EAEB] bg-[#FAFAFA] px-2 py-0.5 text-xs font-medium text-[#414651]"
                            role="listitem"
                            aria-label={`${competitor.categories.length - 2} additional categories`}
                          >
                            +{competitor.categories.length - 2}
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-4" role="gridcell">
                    <button 
                      className="rounded-lg p-2 transition-colors hover:bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#7F56D9]" 
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
          <div className="text-sm font-medium text-[#414651] dark:text-gray-300">
            Page 1 of 10
            <span className="sr-only">
              Showing {filteredCompetitors.length} of {competitors.length} competitors
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="rounded-lg border border-border-secondary bg-primary px-3 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
              aria-label="Go to previous page"
              disabled
            >
              Previous
            </button>
            <button 
              className="rounded-lg border border-border-secondary bg-primary px-3 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
              aria-label="Go to next page"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
