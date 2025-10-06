'use client';

import React from 'react';
import {
  Download,
  Plus,
  Search,
  Settings,
  Upload,
} from 'lucide-react';
import { CompetitorTable, type Competitor } from '@/components/organisms/tables-v2';

const competitors: Competitor[] = [
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

const iconButtonClasses = 'rounded-lg p-2.5 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40';
const compactIconButtonClasses = 'rounded p-1 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40';
const secondaryButtonClasses = 'inline-flex items-center justify-center gap-1 rounded-lg border border-border-secondary bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60';

export default function CompetitorMonitoringPage() {
  const [activeTab, setActiveTab] = React.useState<'all' | 'monitored' | 'unmonitored'>('all');

  return (
    <>
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
          </div>

          {/* Use the new CompetitorTable component */}
          <CompetitorTable
            competitors={competitors}
            variant="default"
            enableSelection={true}
            enableGlobalSearch={false}
            enableColumnManagement={false}
            enablePagination={true}
            pageSize={20}
            onRowSelectionChange={(selectedRows) => {
              console.log('Selected competitors:', selectedRows);
            }}
          />
        </section>
      </main>
    </>
  );
}
