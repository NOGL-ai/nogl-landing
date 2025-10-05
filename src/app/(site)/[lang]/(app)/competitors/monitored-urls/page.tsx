'use client';

import React from 'react';
import {
  Search,
  Settings,
  Download,
  Upload,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';

type StockStatus = 'In Stock' | 'Low stock' | 'Out of stock';
type StatusState = 'Enabled' | 'Disabled' | 'Draft';

type TableRow = {
  id: number;
  competitorUrl: string;
  competitorCode: string;
  productName: string;
  sku: string;
  productCode: string;
  productImage: string;
  competitorPrice: number;
  myPrice: number;
  stock: StockStatus;
  status: StatusState;
};

const TABLE_ROWS: TableRow[] = [
  {
    id: 0,
    competitorUrl: 'purelei.com/products/mahina-club-necklace',
    competitorCode: 'None',
    productName: 'Multifunction Printer Canon 0515C106',
    sku: '2',
    productCode: 'B07GJQBX74',
    productImage: '/api/placeholder/48/48',
    competitorPrice: 29.9,
    myPrice: 42,
    stock: 'In Stock',
    status: 'Enabled',
  },
  {
    id: 1,
    competitorUrl: 'printify.com/products/laserjet-pro-400',
    competitorCode: 'SKU-5521',
    productName: 'LaserJet Pro 400 Wireless Printer',
    sku: '5',
    productCode: 'LJP400-5521',
    productImage: '/api/placeholder/48/48',
    competitorPrice: 485.99,
    myPrice: 459,
    stock: 'Low stock',
    status: 'Enabled',
  },
  {
    id: 2,
    competitorUrl: 'techgear.io/product/smart-labeler-plus',
    competitorCode: 'GF-110',
    productName: 'Smart Labeler Plus Portable',
    sku: '3',
    productCode: 'GF-110',
    productImage: '/api/placeholder/48/48',
    competitorPrice: 129.5,
    myPrice: 129.5,
    stock: 'Out of stock',
    status: 'Disabled',
  },
  {
    id: 3,
    competitorUrl: 'cloudprint.com/product/ink-advanced-500',
    competitorCode: 'CP-88',
    productName: 'CloudPrint Ink Advanced 500',
    sku: '8',
    productCode: 'CP-88',
    productImage: '/api/placeholder/48/48',
    competitorPrice: 89.99,
    myPrice: 92.49,
    stock: 'In Stock',
    status: 'Enabled',
  },
  {
    id: 4,
    competitorUrl: 'uniprint.eu/products/ecojet-a4-thermal',
    competitorCode: 'UN-204',
    productName: 'EcoJet A4 Thermal Printer',
    sku: '4',
    productCode: 'UN-204',
    productImage: '/api/placeholder/48/48',
    competitorPrice: 310,
    myPrice: 299,
    stock: 'In Stock',
    status: 'Draft',
  },
];

const stockBadgeClasses: Record<StockStatus, string> = {
  'In Stock': 'border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]',
  'Low stock': 'border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]',
  'Out of stock': 'border-[#FEE4E2] bg-[#FEF3F2] text-[#B42318]',
};

const statusBadgeClasses: Record<StatusState, string> = {
  Enabled: 'border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]',
  Disabled: 'border-[#FEE4E2] bg-[#FEF3F2] text-[#B42318]',
  Draft: 'border-[#D5D7DA] bg-[#F5F5F5] text-[#414651]',
};

const formatCurrency = (value: number) =>
  `€ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatPercent = (value: number) =>
  `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(2)}%`;

const buildUrl = (url: string) => (url.startsWith('http') ? url : `https://${url}`);

export default function MonitoredUrlsPage() {
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set([0]));
  const [activeTab, setActiveTab] = React.useState<'all' | 'monitored' | 'unmonitored'>('all');

  const toggleRow = (id: number) => {
    const updated = new Set(selectedRows);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedRows(updated);
  };

  const toggleAll = () => {
    if (selectedRows.size === TABLE_ROWS.length) {
      setSelectedRows(new Set());
      return;
    }
    setSelectedRows(new Set(TABLE_ROWS.map(row => row.id)));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:py-10 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-[280px] flex-1">
          <h1 className="text-2xl font-semibold text-[#181D27]">Welcome back, TIm</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2.5 transition-colors hover:bg-gray-50" aria-label="Search">
            <Search className="h-5 w-5 text-[#A4A7AE]" />
          </button>
          <button className="flex items-center gap-1 rounded-lg border border-[#D5D7DA] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#414651] shadow-sm transition-colors hover:bg-gray-50">
            <Settings className="h-5 w-5 text-[#A4A7AE]" />
            Customize
          </button>
          <button className="flex items-center gap-1 rounded-lg border border-[#D5D7DA] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#414651] shadow-sm transition-colors hover:bg-gray-50">
            <Download className="h-5 w-5 text-[#A4A7AE]" />
            Export
          </button>
        </div>
      </header>

      <section className="rounded-xl border border-[#E9EAEB] bg-white shadow-sm">
        <div className="border-b border-[#E9EAEB] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-[#181D27]">Monitored URLs</h2>
                <span className="inline-flex items-center rounded-full border border-[#E9D7FE] bg-[#F9F5FF] px-2 py-0.5 text-xs font-medium text-[#6941C6]">
                  240 vendors
                </span>
              </div>
              <p className="mt-0.5 text-sm text-[#535862]">Track competitor product URLs and compare prices against your catalog.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 rounded-lg border border-[#D5D7DA] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#414651] shadow-sm transition-colors hover:bg-gray-50">
                <Upload className="h-5 w-5 text-[#A4A7AE]" />
                Import
              </button>
              <button className="flex items-center gap-1 rounded-lg border-2 border-[#FFFFFF1F] bg-[#7F56D9] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#6941C6]">
                <Plus className="h-5 w-5 text-[#D6BBFB]" />
                Add URL
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9EAEB] px-6 py-3">
          <div className="flex overflow-hidden rounded-lg border border-[#D5D7DA] shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === 'all' ? 'border-r border-[#D5D7DA] bg-[#FAFAFA] text-[#252B37]' : 'border-r border-[#D5D7DA] bg-white text-[#414651] hover:bg-gray-50'
              }`}
            >
              View all
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('monitored')}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === 'monitored' ? 'border-r border-[#D5D7DA] bg-[#FAFAFA] text-[#252B37]' : 'border-r border-[#D5D7DA] bg-white text-[#414651] hover:bg-gray-50'
              }`}
            >
              Monitored
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unmonitored')}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === 'unmonitored' ? 'bg-[#FAFAFA] text-[#252B37]' : 'bg-white text-[#414651] hover:bg-gray-50'
              }`}
            >
              Unmonitored
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative max-w-[320px] flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A4A7AE]" />
              <input
                type="text"
                placeholder="Search"
                className="w-full rounded-lg border border-[#D5D7DA] bg-white py-2 pl-10 pr-16 text-base placeholder:text-[#717680] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[#E9EAEB] px-1.5 py-0.5 text-xs text-[#717680]">
                ⌘K
              </span>
            </div>
            <button className="flex items-center gap-1 rounded-lg border border-[#D5D7DA] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#414651] shadow-sm transition-colors hover:bg-gray-50">
              <svg className="h-5 w-5 text-[#A4A7AE]" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.67} d="M3 4h14M6 8h8M9 12h2" />
              </svg>
              Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead className="border-b border-[#E9EAEB] bg-[#FAFAFA]">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="flex items-center gap-3 text-xs font-semibold text-[#717680]">
                    <input
                      type="checkbox"
                      onChange={toggleAll}
                      checked={selectedRows.size === TABLE_ROWS.length}
                      aria-label="Select all rows"
                      className="h-5 w-5 rounded-md border-[#7F56D9] text-[#7F56D9] focus:ring-[#7F56D9]"
                    />
                    Competitor URL
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717680]">Prod. Matched</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717680]">Comp. Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717680]">My Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717680]">Price Position</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717680]">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717680]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#717680]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAEB]">
              {TABLE_ROWS.map(row => {
                const diff = row.myPrice - row.competitorPrice;
                const percent = row.competitorPrice === 0 ? 0 : (diff / row.competitorPrice) * 100;
                const isMatched = Math.abs(diff) < 0.01;
                const isWin = diff < 0 && !isMatched;
                const priceStatus = isMatched ? 'Matched' : isWin ? 'You Win' : 'You Lose';
                const priceColor = isMatched ? 'text-[#414651]' : isWin ? 'text-[#027A48]' : 'text-[#B42318]';
                const barColor = isMatched ? 'bg-[#D5D7DA]' : isWin ? 'bg-[#32D583]' : 'bg-[#F97066]';
                const icon = isMatched ? (
                  <Minus className="h-4 w-4 text-[#717680]" />
                ) : isWin ? (
                  <TrendingDown className="h-4 w-4 text-[#12B76A]" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-[#F04438]" />
                );
                const diffLabel = `${diff >= 0 ? '+' : '−'}${Math.abs(diff).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`;
                const percentLabel = isMatched
                  ? '0.00%'
                  : `${percent >= 0 ? '+' : '−'}${Math.abs(percent).toFixed(2)}%`;
                const barWidth = isMatched ? 0 : Math.min(Math.abs(percent), 100);

                return (
                  <tr key={row.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.id)}
                          onChange={() => toggleRow(row.id)}
                          aria-label={`Select competitor ${row.competitorUrl}`}
                          className="mt-1 h-5 w-5 rounded-md border-[#7F56D9] text-[#7F56D9] focus:ring-[#7F56D9]"
                        />
                        <div className="w-full max-w-[240px]">
                          <a
                            href={buildUrl(row.competitorUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate text-sm font-medium text-[#181D27] hover:text-[#7F56D9]"
                          >
                            {row.competitorUrl}
                          </a>
                          <p className="mt-1 text-xs text-[#717680]">Code: {row.competitorCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 flex-shrink-0 rounded-md bg-gradient-to-br from-[#E9D7FE] via-[#C7D7FE] to-[#F2F4F7]" />
                        <div className="max-w-[260px]">
                          <p className="text-sm font-medium text-[#181D27]">{row.productName}</p>
                          <p className="text-xs text-[#717680]">SKU: {row.sku}</p>
                          <p className="text-xs text-[#717680]">Code: {row.productCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#181D27]">
                        {formatCurrency(row.competitorPrice)}
                        <button className="rounded-full p-1 transition-colors hover:bg-[#F5F5F5]" aria-label="View competitor price">
                          <ArrowUpRight className="h-4 w-4 text-[#175CD3]" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm font-medium text-[#181D27]">{formatCurrency(row.myPrice)}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <div className={`flex flex-wrap items-center gap-2 text-xs font-medium ${priceColor}`}>
                          <span className="flex items-center gap-1">
                            {icon}
                            <span>€ {diffLabel}</span>
                          </span>
                          <span>{percentLabel}</span>
                          <span>{priceStatus}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#F2F4F7]">
                          <div
                            className={`h-full rounded-full ${barColor}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${stockBadgeClasses[row.stock]}`}
                      >
                        {row.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusBadgeClasses[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <button className="rounded-lg p-2 transition-colors hover:bg-[#F5F5F5]" aria-label="More actions">
                        <MoreHorizontal className="h-5 w-5 text-[#A4A7AE]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E9EAEB] px-6 py-3">
          <div className="text-sm font-medium text-[#414651]">Page 1 of 10</div>
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-[#D5D7DA] bg-white px-3 py-2 text-sm font-semibold text-[#414651] shadow-sm transition-colors hover:bg-gray-50">
              Previous
            </button>
            <button className="rounded-lg border border-[#D5D7DA] bg-white px-3 py-2 text-sm font-semibold text-[#414651] shadow-sm transition-colors hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
