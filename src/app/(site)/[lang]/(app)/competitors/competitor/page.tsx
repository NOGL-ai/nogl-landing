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
    name: 'Pilgrim',
    domain: 'pilgrim.net',
    avatar: 'https://img.logo.dev/pilgrim.net?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 85,
    position: 25,
    trend: 12,
    trendUp: true,
    date: '22 Jan 2025',
    categories: ['Active', 'Jewelry', 'Watches', '+4'],
  },
  {
    id: 1,
    name: 'Amoonic',
    domain: 'amoonic.de',
    avatar: 'https://img.logo.dev/amoonic.de?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 42,
    position: 78,
    trend: 3,
    trendUp: false,
    date: '20 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion', '+4'],
  },
  {
    id: 2,
    name: 'Cluse',
    domain: 'cluse.com',
    avatar: 'https://img.logo.dev/cluse.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 65,
    position: 35,
    trend: 15,
    trendUp: true,
    date: '24 Jan 2025',
    categories: ['Active', 'Watches', 'Accessories'],
  },
  {
    id: 3,
    name: 'Eastside',
    domain: 'eastsidewatches.com',
    avatar: 'https://img.logo.dev/eastsidewatches.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 28,
    position: 88,
    trend: 2,
    trendUp: true,
    date: '26 Jan 2025',
    categories: ['Active', 'Watches', 'Luxury'],
  },
  {
    id: 4,
    name: 'Engelssinn',
    domain: 'engelsinn.de',
    avatar: 'https://img.logo.dev/engelsinn.de?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 38,
    position: 82,
    trend: 1,
    trendUp: false,
    date: '18 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion', '+4'],
  },
  {
    id: 5,
    name: 'fejn',
    domain: 'fejn.com',
    avatar: 'https://img.logo.dev/fejn.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 52,
    position: 65,
    trend: 8,
    trendUp: true,
    date: '28 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design', '+4'],
  },
  {
    id: 6,
    name: 'float',
    domain: 'float.to',
    avatar: 'https://img.logo.dev/float.to?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 15,
    position: 92,
    trend: 1,
    trendUp: true,
    date: '16 Jan 2025',
    categories: ['Inactive', 'Jewelry', 'Minimalist'],
  },
  {
    id: 7,
    name: 'Golden Strawberry',
    domain: 'goldenstrawberry.de',
    avatar: 'https://img.logo.dev/goldenstrawberry.de?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 35,
    position: 85,
    trend: 4,
    trendUp: true,
    date: '25 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    id: 8,
    name: 'Heideman',
    domain: 'heideman-store.de',
    avatar: 'https://img.logo.dev/heideman-store.de?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 48,
    position: 75,
    trend: 2,
    trendUp: false,
    date: '19 Jan 2025',
    categories: ['Active', 'Jewelry', 'Luxury', '+4'],
  },
  {
    id: 9,
    name: 'Hey Happiness',
    domain: 'heyhappiness.com',
    avatar: 'https://img.logo.dev/heyhappiness.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 45,
    position: 80,
    trend: 6,
    trendUp: true,
    date: '27 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    id: 10,
    name: 'Jukserei',
    domain: 'jukserei.com',
    avatar: 'https://img.logo.dev/jukserei.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 22,
    position: 90,
    trend: 3,
    trendUp: true,
    date: '21 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design'],
  },
  {
    id: 11,
    name: 'Luamaya',
    domain: 'luamaya.com',
    avatar: 'https://img.logo.dev/luamaya.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 32,
    position: 88,
    trend: 4,
    trendUp: false,
    date: '23 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion', '+4'],
  },
  {
    id: 12,
    name: 'Nialaya',
    domain: 'nialaya.com',
    avatar: 'https://img.logo.dev/nialaya.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 28,
    position: 90,
    trend: 5,
    trendUp: true,
    date: '26 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design'],
  },
  {
    id: 13,
    name: 'Nonu Berlin',
    domain: 'nonu.shop',
    avatar: 'https://img.logo.dev/nonu.shop?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 42,
    position: 82,
    trend: 7,
    trendUp: true,
    date: '24 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion', '+4'],
  },
  {
    id: 14,
    name: 'Orelia',
    domain: 'orelia.co.uk',
    avatar: 'https://img.logo.dev/orelia.co.uk?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 95,
    position: 40,
    trend: 18,
    trendUp: true,
    date: '28 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    id: 15,
    name: 'Pico Kopenhagen',
    domain: 'picocopenhagen.com',
    avatar: 'https://img.logo.dev/picocopenhagen.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 35,
    position: 85,
    trend: 2,
    trendUp: false,
    date: '20 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design', '+4'],
  },
  {
    id: 16,
    name: 'Purelei',
    domain: 'purelei.com',
    avatar: 'https://img.logo.dev/purelei.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 58,
    position: 70,
    trend: 9,
    trendUp: true,
    date: '25 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    id: 17,
    name: 'Singaluru',
    domain: 'singularu.com',
    avatar: 'https://img.logo.dev/singularu.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 18,
    position: 95,
    trend: 3,
    trendUp: true,
    date: '22 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design'],
  },
  {
    id: 18,
    name: 'The Silver Collective',
    domain: 'thesilvercollective.com',
    avatar: 'https://img.logo.dev/thesilvercollective.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 72,
    position: 60,
    trend: 11,
    trendUp: true,
    date: '27 Jan 2025',
    categories: ['Active', 'Jewelry', 'Silver', '+4'],
  },
  {
    id: 19,
    name: 'Wunderklein',
    domain: 'wunderklein.com',
    avatar: 'https://img.logo.dev/wunderklein.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 38,
    position: 80,
    trend: 4,
    trendUp: false,
    date: '19 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    id: 20,
    name: 'Bynouk',
    domain: 'bynouck.com',
    avatar: 'https://img.logo.dev/bynouck.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 25,
    position: 90,
    trend: 5,
    trendUp: true,
    date: '23 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design', '+4'],
  },
  {
    id: 21,
    name: 'Nana KAY',
    domain: 'nana-kay.com',
    avatar: 'https://img.logo.dev/nana-kay.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 32,
    position: 88,
    trend: 6,
    trendUp: true,
    date: '26 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    id: 22,
    name: 'Rafaela Donata',
    domain: 'rafaela-donata.com',
    avatar: 'https://img.logo.dev/rafaela-donata.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 15,
    position: 95,
    trend: 2,
    trendUp: false,
    date: '21 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design'],
  },
  {
    id: 23,
    name: 'Wanderlust + Co',
    domain: 'wanderlustandco.com',
    avatar: 'https://img.logo.dev/wanderlustandco.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 88,
    position: 50,
    trend: 14,
    trendUp: true,
    date: '28 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion', '+4'],
  },
  {
    id: 24,
    name: 'Engelsrufer',
    domain: 'engelsrufer.de',
    avatar: 'https://img.logo.dev/engelsrufer.de?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 12,
    position: 98,
    trend: 1,
    trendUp: true,
    date: '18 Jan 2025',
    categories: ['Inactive', 'Jewelry', 'Fashion'],
  },
  {
    id: 25,
    name: 'Makaro',
    domain: 'makarojewelry.com',
    avatar: 'https://img.logo.dev/makarojewelry.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 45,
    position: 75,
    trend: 8,
    trendUp: true,
    date: '24 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design', '+4'],
  },
  {
    id: 26,
    name: 'Bruna The Label',
    domain: 'brunathelabel.com',
    avatar: 'https://img.logo.dev/brunathelabel.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 28,
    position: 88,
    trend: 3,
    trendUp: false,
    date: '22 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion'],
  },
  {
    id: 27,
    name: 'PDPaola',
    domain: 'pdpaola.com',
    avatar: 'https://img.logo.dev/pdpaola.com?format=jpg&size=256&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 125,
    position: 35,
    trend: 22,
    trendUp: true,
    date: '27 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion', '+4'],
  },
];

const badgeClasses: Record<string, string> = {
  Active: 'border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]',
  Inactive: 'border-[#E9EAEB] bg-[#FAFAFA] text-[#414651]',
  Jewelry: 'border-[#F9DBAF] bg-[#FEF6EE] text-[#B93815]',
  Watches: 'border-[#B2DDFF] bg-[#EFF8FF] text-[#175CD3]',
  Fashion: 'border-[#E9D7FE] bg-[#F9F5FF] text-[#6941C6]',
  Design: 'border-[#C7D7FE] bg-[#EEF4FF] text-[#3538CD]',
  Luxury: 'border-[#FCCEEE] bg-[#FDF2FA] text-[#C11574]',
  Accessories: 'border-[#D5D9EB] bg-[#F8F9FC] text-[#363F72]',
  Silver: 'border-[#D1D5DB] bg-[#F9FAFB] text-[#374151]',
  Minimalist: 'border-[#E5E7EB] bg-[#F3F4F6] text-[#6B7280]',
};

export default function CompetitorPage() {
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set([0, 1, 2, 5, 6]));
  const [activeTab, setActiveTab] = React.useState<'all' | 'monitored' | 'unmonitored'>('all');

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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:py-10 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-[280px] flex-1">
          <h1 className="text-2xl font-semibold text-[#181D27]">Welcome back, Tim</h1>
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

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="lg:col-span-2 rounded-xl border border-[#E9EAEB] bg-white shadow-sm">
          <div className="border-b border-[#E9EAEB] p-6">
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
                  <h2 className="text-lg font-semibold text-[#181D27]">Competitor breakdown</h2>
                  <p className="mt-1 text-sm text-[#535862]">Keep track of vendors and their security ratings.</p>
                </div>
              </div>
              <button className="rounded p-1 transition-colors hover:bg-gray-50" aria-label="More actions">
                <svg className="h-5 w-5 text-[#A4A7AE]" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="10" cy="4" r="1.5" />
                  <circle cx="10" cy="16" r="1.5" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="relative flex h-[184px] items-end">
              <div className="absolute bottom-6 left-0 top-0 w-10 text-right text-xs text-[#535862]">
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
              <div className="absolute bottom-0 left-12 right-0 flex justify-between px-6 text-xs text-[#535862]">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                  <div key={month}>{month}</div>
                ))}
              </div>
            </div>
            <div className="mt-2 text-center text-xs font-medium text-[#535862]">Month</div>
          </div>
          <div className="flex justify-end border-t border-[#E9EAEB] p-6">
            <button className="rounded-lg border border-[#D5D7DA] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#414651] shadow-sm transition-colors hover:bg-gray-50">
              View full report
            </button>
          </div>
        </article>

        <article className="rounded-xl border border-[#E9EAEB] bg-white shadow-sm">
          <div className="border-b border-[#E9EAEB] p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#181D27]">Products monitored</h2>
                <p className="mt-1 text-sm text-[#535862]">You're monitoring 80% of your inventory.</p>
              </div>
              <button className="rounded p-1 transition-colors hover:bg-gray-50" aria-label="More actions">
                <svg className="h-5 w-5 text-[#A4A7AE]" fill="currentColor" viewBox="0 0 20 20">
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
                <div className="absolute left-1/2 top-[60px] -translate-x-1/2 text-[30px] font-semibold text-[#181D27]">240</div>
              </div>
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.6673 4.66663L9.42156 9.91238C9.15755 10.1764 9.02555 10.3084 8.87333 10.3579C8.73943 10.4014 8.5952 10.4014 8.46131 10.3579C8.30909 10.3084 8.17708 10.1764 7.91307 9.91238L6.08823 8.08754C5.82422 7.82353 5.69221 7.69152 5.54 7.64206C5.4061 7.59856 5.26187 7.59856 5.12797 7.64206C4.97575 7.69152 4.84375 7.82353 4.57974 8.08754L1.33398 11.3333M14.6673 4.66663H10.0007M14.6673 4.66663V9.33329" stroke="#17B26A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-medium text-[#067647]">10%</span>
              </div>
            </div>
            <div>
              <h3 className="text-base font-medium text-[#181D27]">You've almost reached your goal</h3>
              <p className="mt-1 text-sm text-[#535862]">You have used 80% of your goal.</p>
            </div>
          </div>
          <div className="flex justify-end border-t border-[#E9EAEB] p-6">
            <button className="flex items-center gap-1 rounded-lg border border-[#D5D7DA] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#414651] shadow-sm transition-colors hover:bg-gray-50">
              <svg className="h-5 w-5 text-[#A4A7AE]" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.67} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Upgrade plan
            </button>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-[#E9EAEB] bg-white shadow-sm">
        <div className="border-b border-[#E9EAEB] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-[#181D27]">Competitor movements</h2>
                <span className="inline-flex items-center rounded-full border border-[#E9D7FE] bg-[#F9F5FF] px-2 py-0.5 text-xs font-medium text-[#6941C6]">240 vendors</span>
              </div>
              <p className="mt-1 text-sm text-[#535862]">Keep track of competitor and their security ratings.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 rounded-lg border border-[#D5D7DA] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#414651] shadow-sm transition-colors hover:bg-gray-50">
                <Upload className="h-5 w-5 text-[#A4A7AE]" />
                Import
              </button>
              <button className="flex items-center gap-1 rounded-lg border-2 border-[#FFFFFF1F] bg-[#7F56D9] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#6941C6]">
                <Plus className="h-5 w-5 text-[#D6BBFB]" />
                Add Competitor
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
            <div className="relative max-w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A4A7AE]" />
              <input
                type="text"
                placeholder="Search"
                className="w-full rounded-lg border border-[#D5D7DA] bg-white py-2 pl-10 pr-16 text-base placeholder:text-[#717680] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[#E9EAEB] px-1.5 py-0.5 text-xs text-[#717680]">⌘K</span>
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
          <table className="w-full">
            <thead className="border-b border-[#E9EAEB] bg-[#FAFAFA]">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === competitors.length}
                      onChange={toggleAll}
                      className="h-5 w-5 rounded-md border-[#7F56D9] text-[#7F56D9] focus:ring-[#7F56D9]"
                    />
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#717680]">
                      Competitor
                      <svg className="h-3 w-3 text-[#A4A7AE]" fill="none" stroke="currentColor" viewBox="0 0 12 12">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 2.5v7m0 0l3.5-3.5M6 9.5L2.5 6" />
                      </svg>
                    </span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717680]">Products</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717680]">Price Position</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717680]">Trend</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717680]">Last updated</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717680]">Categories</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAEB]">
              {competitors.map(competitor => (
                <tr key={competitor.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(competitor.id)}
                        onChange={() => toggleRow(competitor.id)}
                        className="h-5 w-5 rounded-md border-[#7F56D9] text-[#7F56D9] focus:ring-[#7F56D9]"
                      />
                      <div className="flex items-center gap-3">
                        <img 
                          src={competitor.avatar} 
                          alt={`${competitor.name} logo`}
                          className="h-10 w-10 rounded-full border border-black/8 bg-gray-200 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display', 'block');
                          }}
                        />
                        <div className="h-10 w-10 rounded-full border border-black/8 bg-gray-200 hidden" />
                        <div>
                          <div className="text-sm font-medium text-[#181D27]">{competitor.name}</div>
                          <div className="text-sm text-[#535862]">{competitor.domain}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#E9D7FE] bg-[#F9F5FF] text-sm font-semibold text-[#6941C6]">
                        {competitor.products}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E9EAEB]">
                        <div className="h-full rounded-full bg-[#7F56D9]" style={{ width: `${competitor.position}%` }} />
                      </div>
                      <span className="w-8 text-right text-sm font-medium text-[#414651]">{competitor.position}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 ${
                      competitor.trendUp ? 'border-[#ABEFC6] bg-[#ECFDF3]' : 'border-[#FECDCA] bg-[#FEF3F2]'
                    }`}>
                      {competitor.trendUp ? (
                        <ArrowUp className="h-3 w-3 text-[#17B26A]" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-[#F04438]" />
                      )}
                      <span className={`text-xs font-medium ${competitor.trendUp ? 'text-[#067647]' : 'text-[#B42318]'}`}>
                        {competitor.trend}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#535862]">{competitor.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-1">
                      {competitor.categories.slice(0, 3).map(category => (
                        <span
                          key={category}
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClasses[category] ?? 'border-[#E9EAEB] bg-[#FAFAFA] text-[#414651]'}`}
                        >
                          {category === 'Active' && <span className="h-2 w-2 rounded-full bg-[#17B26A]" />}
                          {category === 'Inactive' && <span className="h-2 w-2 rounded-full bg-[#717680]" />}
                          {category}
                        </span>
                      ))}
                      {competitor.categories.length > 3 && (
                        <span className="inline-flex items-center rounded-full border border-[#E9EAEB] bg-[#FAFAFA] px-2 py-0.5 text-xs font-medium text-[#414651]">
                          {competitor.categories[3]}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button className="rounded-lg p-2 transition-colors hover:bg-[#F5F5F5]" aria-label="More actions">
                      <svg className="h-5 w-5 text-[#A4A7AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 5.25a.75.75 0 110-1.5.75.75 0 010 1.5zm0 5.25a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#E9EAEB] px-6 py-3">
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
