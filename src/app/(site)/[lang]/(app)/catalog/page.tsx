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

// Jewelry products data (compatible with Competitor interface)
const jewelryProducts = [
  {
    id: 0,
    name: 'Halskette Geo',
    domain: 'ellijewelry.com',
    avatar: 'https://cdn.shopify.com/s/files/1/0754/3170/6907/files/78843-image-squared-1-1630067079.jpg?v=1756801903',
    sku: '0201493117_16',
    image: 'https://cdn.shopify.com/s/files/1/0754/3170/6907/files/78843-image-squared-1-1630067079.jpg?v=1756801903',
    price: 49.90,
    currency: 'EUR',
    brand: {
      name: 'Ellijewelry',
      logo: '/api/placeholder/24/24',
    },
    competitors: {
      cheapest: 45.90,
      avg: 52.30,
      highest: 58.90,
      cheapestColor: 'green' as const,
      prices: [45.90, 48.50, 52.30, 55.20, 58.90], // Multiple competitor prices
      competitorNames: ['Pilgrim', 'Amoonic', 'Cluse', 'Eastside', 'Engelssinn'],
    },
    triggeredRule: 'price optimization active',
    variants: 3,
    competitorCount: 2,
    margin: 35,
    stock: 15,
    trend: 2.5,
    trendUp: true,
    date: '22 Jan 2025',
    categories: ['Active', 'Jewelry', 'Necklaces'],
    competitorPrice: 45.90,
    myPrice: 49.90,
    // Required Competitor interface properties
    products: 3, // Using variants as products count
    position: 25,
    channel: 'shopify',
  },
  {
    id: 1,
    name: 'Armband Geo',
    domain: 'ellijewelry.com',
    avatar: 'https://cdn.shopify.com/s/files/1/0754/3170/6907/files/78843-image-squared-1-1630067079.jpg?v=1756801903',
    sku: '0201493117_16',
    image: 'https://cdn.shopify.com/s/files/1/0754/3170/6907/files/78843-image-squared-1-1630067079.jpg?v=1756801903',
    price: 69.90,
    currency: 'EUR',
    brand: {
      name: 'Ellijewelry',
      logo: '/api/placeholder/24/24',
    },
    competitors: {
      cheapest: 65.90,
      avg: 72.50,
      highest: 79.90,
      cheapestColor: 'green' as const,
      prices: [65.90, 68.50, 72.50, 76.20, 79.90], // Multiple competitor prices
      competitorNames: ['fejn', 'float', 'Golden Strawberry', 'Heideman', 'Hey Happiness'],
    },
    triggeredRule: 'price optimization active',
    variants: 1,
    competitorCount: 5,
    margin: 28,
    stock: 8,
    trend: -1.2,
    trendUp: false,
    date: '20 Jan 2025',
    categories: ['Active', 'Jewelry', 'Bracelets'],
    competitorPrice: 65.90,
    myPrice: 69.90,
    // Required Competitor interface properties
    products: 1,
    position: 78,
  },
  {
    id: 2,
    name: 'Anhänger | Süßwasserperle',
    domain: 'nenalina.com',
    avatar: 'https://cdn.shopify.com/s/files/1/0754/3170/6907/files/80418-image-squared-1-1642483170_ea9381cc-5ded-4e43-936a-d95edd786ede.jpg?v=1753813240',
    sku: '726061-042',
    image: 'https://cdn.shopify.com/s/files/1/0754/3170/6907/files/80418-image-squared-1-1642483170_ea9381cc-5ded-4e43-936a-d95edd786ede.jpg?v=1753813240',
    price: 99.00,
    currency: 'EUR',
    brand: {
      name: 'Nenalina',
      logo: '/api/placeholder/24/24',
    },
    competitors: {
      cheapest: 89.90,
      avg: 105.50,
      highest: 119.90,
      cheapestColor: 'green' as const,
      prices: [89.90, 95.50, 105.50, 112.30, 119.90], // Multiple competitor prices
      competitorNames: ['Jukserei', 'Luamaya', 'Nialaya', 'Nonu Berlin', 'Orelia'],
    },
    triggeredRule: 'price optimization active',
    variants: 2,
    competitorCount: 5,
    margin: 42,
    stock: 12,
    trend: 3.8,
    trendUp: true,
    date: '24 Jan 2025',
    categories: ['Active', 'Jewelry', 'Pendants'],
    competitorPrice: 89.90,
    myPrice: 99.00,
    // Required Competitor interface properties
    products: 2,
    position: 35,
  },
  {
    id: 3,
    name: 'Halskette Feder',
    domain: 'kuzzoi.com',
    avatar: 'https://cdn.shopify.com/s/files/1/0760/3893/0739/files/92563-image-squared-1-1744873272.jpg?v=1746632949',
    sku: '0103342725_50',
    image: 'https://cdn.shopify.com/s/files/1/0760/3893/0739/files/92563-image-squared-1-1744873272.jpg?v=1746632949',
    price: 49.90,
    currency: 'EUR',
    brand: {
      name: 'Kuzzoi',
      logo: '/api/placeholder/24/24',
    },
    competitors: {
      cheapest: 45.90,
      avg: 52.30,
      highest: 58.90,
      cheapestColor: 'green' as const,
      prices: [45.90, 47.20, 52.30, 55.80, 58.90], // Multiple competitor prices
      competitorNames: ['Bijou Brigitte', 'Christ', 'Pandora', 'Swarovski', 'Tous'],
    },
    triggeredRule: 'price optimization active',
    variants: 4,
    competitorCount: 5,
    margin: 32,
    stock: 20,
    trend: 1.5,
    trendUp: true,
    date: '26 Jan 2025',
    categories: ['Active', 'Jewelry', 'Necklaces'],
    competitorPrice: 45.90,
    myPrice: 49.90,
    // Required Competitor interface properties
    products: 4,
    position: 65,
  },
  {
    id: 4,
    name: 'Siegelring Quadrat',
    domain: 'kuzzoi.com',
    avatar: 'https://cdn.shopify.com/s/files/1/0760/3893/0739/files/92553-image-squared-1-1743745897.jpg?v=1746632953',
    sku: '0603732725_62',
    image: 'https://cdn.shopify.com/s/files/1/0760/3893/0739/files/92553-image-squared-1-1743745897.jpg?v=1746632953',
    price: 69.90,
    currency: 'EUR',
    brand: {
      name: 'Kuzzoi',
      logo: '/api/placeholder/24/24',
    },
    competitors: {
      cheapest: 65.90,
      avg: 72.50,
      highest: 79.90,
      cheapestColor: 'green' as const,
      prices: [65.90, 68.30, 72.50, 75.80, 79.90], // Multiple competitor prices
      competitorNames: ['Cartier', 'Tiffany & Co', 'Bulgari', 'Van Cleef', 'Harry Winston'],
    },
    triggeredRule: 'price optimization active',
    variants: 6,
    competitorCount: 5,
    margin: 25,
    stock: 5,
    trend: -0.8,
    trendUp: false,
    date: '18 Jan 2025',
    categories: ['Active', 'Jewelry', 'Rings'],
    competitorPrice: 65.90,
    myPrice: 69.90,
    // Required Competitor interface properties
    products: 6,
    position: 88,
  },
];

const competitors = [
  {
    id: 0,
    name: 'Pilgrim',
    domain: 'pilgrim.net',
    avatar: 'https://img.logo.dev/pilgrim.net?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 85,
    position: 25,
    trend: 12,
    trendUp: true,
    date: '22 Jan 2025',
    categories: ['Active', 'Jewelry', 'Watches', '+4'],
    competitorPrice: 29.90,
    myPrice: 42.00,
    channel: 'shopify',
  },
  {
    id: 1,
    name: 'Amoonic',
    domain: 'amoonic.de',
    avatar: 'https://img.logo.dev/amoonic.de?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 42,
    position: 78,
    trend: 3,
    trendUp: false,
    date: '20 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion', '+4'],
    competitorPrice: 35.50,
    myPrice: 32.00,
  },
  {
    id: 2,
    name: 'Cluse',
    domain: 'cluse.com',
    avatar: 'https://img.logo.dev/cluse.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 65,
    position: 35,
    trend: 15,
    trendUp: true,
    date: '24 Jan 2025',
    categories: ['Active', 'Watches', 'Accessories'],
    competitorPrice: 45.00,
    myPrice: 45.00,
  },
  {
    id: 3,
    name: 'Eastside',
    domain: 'eastsidewatches.com',
    avatar: 'https://img.logo.dev/eastsidewatches.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 28,
    position: 88,
    trend: 2,
    trendUp: true,
    date: '26 Jan 2025',
    categories: ['Active', 'Watches', 'Luxury'],
    competitorPrice: 52.00,
    myPrice: 48.00,
  },
  {
    id: 4,
    name: 'Engelssinn',
    domain: 'engelsinn.de',
    avatar: 'https://img.logo.dev/engelsinn.de?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 38,
    position: 82,
    trend: 1,
    trendUp: false,
    date: '18 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion', '+4'],
    competitorPrice: 28.00,
    myPrice: 35.50,
  },
  {
    id: 5,
    name: 'fejn',
    domain: 'fejn.com',
    avatar: 'https://img.logo.dev/fejn.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 52,
    position: 65,
    trend: 8,
    trendUp: true,
    date: '28 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design', '+4'],
    competitorPrice: 39.99,
    myPrice: 42.00,
  },
  {
    id: 6,
    name: 'float',
    domain: 'float.to',
    avatar: 'https://img.logo.dev/float.to?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 15,
    position: 92,
    trend: 1,
    trendUp: true,
    date: '16 Jan 2025',
    categories: ['Inactive', 'Jewelry', 'Minimalist'],
    competitorPrice: 55.00,
    myPrice: 49.99,
  },
  {
    id: 7,
    name: 'Golden Strawberry',
    domain: 'goldenstrawberry.de',
    avatar: 'https://img.logo.dev/goldenstrawberry.de?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 35,
    position: 85,
    trend: 4,
    trendUp: true,
    date: '25 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion'],
    competitorPrice: 28.00,
    myPrice: 35.50,
  },
  {
    id: 8,
    name: 'Heideman',
    domain: 'heideman-store.de',
    avatar: 'https://img.logo.dev/heideman-store.de?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 48,
    position: 75,
    trend: 2,
    trendUp: false,
    date: '19 Jan 2025',
    categories: ['Active', 'Jewelry', 'Luxury', '+4'],
    competitorPrice: 39.99,
    myPrice: 42.00,
  },
  {
    id: 9,
    name: 'Hey Happiness',
    domain: 'heyhappiness.com',
    avatar: 'https://img.logo.dev/heyhappiness.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 45,
    position: 80,
    trend: 6,
    trendUp: true,
    date: '27 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion'],
    competitorPrice: 45.00,
    myPrice: 45.00,
  },
  {
    id: 10,
    name: 'Jukserei',
    domain: 'jukserei.com',
    avatar: 'https://img.logo.dev/jukserei.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 22,
    position: 90,
    trend: 3,
    trendUp: true,
    date: '21 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design'],
    competitorPrice: 52.00,
    myPrice: 48.00,
  },
  {
    id: 11,
    name: 'Luamaya',
    domain: 'luamaya.com',
    avatar: 'https://img.logo.dev/luamaya.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 32,
    position: 88,
    trend: 4,
    trendUp: false,
    date: '23 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion', '+4'],
    competitorPrice: 28.00,
    myPrice: 35.50,
  },
  {
    id: 12,
    name: 'Nialaya',
    domain: 'nialaya.com',
    avatar: 'https://img.logo.dev/nialaya.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 28,
    position: 90,
    trend: 5,
    trendUp: true,
    date: '26 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design'],
    competitorPrice: 39.99,
    myPrice: 42.00,
  },
  {
    id: 13,
    name: 'Nonu Berlin',
    domain: 'nonu.shop',
    avatar: 'https://img.logo.dev/nonu.shop?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 42,
    position: 82,
    trend: 7,
    trendUp: true,
    date: '24 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion', '+4'],
    competitorPrice: 45.00,
    myPrice: 45.00,
  },
  {
    id: 14,
    name: 'Orelia',
    domain: 'orelia.co.uk',
    avatar: 'https://img.logo.dev/orelia.co.uk?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 95,
    position: 40,
    trend: 18,
    trendUp: true,
    date: '28 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion'],
    competitorPrice: 52.00,
    myPrice: 48.00,
  },
  {
    id: 15,
    name: 'Pico Kopenhagen',
    domain: 'picocopenhagen.com',
    avatar: 'https://img.logo.dev/picocopenhagen.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 35,
    position: 85,
    trend: 2,
    trendUp: false,
    date: '20 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design', '+4'],
    competitorPrice: 28.00,
    myPrice: 35.50,
  },
  {
    id: 16,
    name: 'Purelei',
    domain: 'purelei.com',
    avatar: 'https://img.logo.dev/purelei.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 58,
    position: 70,
    trend: 9,
    trendUp: true,
    date: '25 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion'],
    competitorPrice: 39.99,
    myPrice: 42.00,
  },
  {
    id: 17,
    name: 'Singaluru',
    domain: 'singularu.com',
    avatar: 'https://img.logo.dev/singularu.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 18,
    position: 95,
    trend: 3,
    trendUp: true,
    date: '22 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design'],
    competitorPrice: 55.00,
    myPrice: 49.99,
  },
  {
    id: 18,
    name: 'The Silver Collective',
    domain: 'thesilvercollective.com',
    avatar: 'https://img.logo.dev/thesilvercollective.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 72,
    position: 60,
    trend: 11,
    trendUp: true,
    date: '27 Jan 2025',
    categories: ['Active', 'Jewelry', 'Silver', '+4'],
    competitorPrice: 28.00,
    myPrice: 35.50,
  },
  {
    id: 19,
    name: 'Wunderklein',
    domain: 'wunderklein.com',
    avatar: 'https://img.logo.dev/wunderklein.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 38,
    position: 80,
    trend: 4,
    trendUp: false,
    date: '19 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion'],
    competitorPrice: 45.00,
    myPrice: 45.00,
  },
  {
    id: 20,
    name: 'Bynouk',
    domain: 'bynouck.com',
    avatar: 'https://img.logo.dev/bynouck.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 25,
    position: 90,
    trend: 5,
    trendUp: true,
    date: '23 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design', '+4'],
    competitorPrice: 52.00,
    myPrice: 48.00,
  },
  {
    id: 21,
    name: 'Nana KAY',
    domain: 'nana-kay.com',
    avatar: 'https://img.logo.dev/nana-kay.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 32,
    position: 88,
    trend: 6,
    trendUp: true,
    date: '26 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion'],
    competitorPrice: 28.00,
    myPrice: 35.50,
  },
  {
    id: 22,
    name: 'Rafaela Donata',
    domain: 'rafaela-donata.com',
    avatar: 'https://img.logo.dev/rafaela-donata.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 15,
    position: 95,
    trend: 2,
    trendUp: false,
    date: '21 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design'],
    competitorPrice: 39.99,
    myPrice: 42.00,
  },
  {
    id: 23,
    name: 'Wanderlust + Co',
    domain: 'wanderlustandco.com',
    avatar: 'https://img.logo.dev/wanderlustandco.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 88,
    position: 50,
    trend: 14,
    trendUp: true,
    date: '28 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion', '+4'],
    competitorPrice: 45.00,
    myPrice: 45.00,
  },
  {
    id: 24,
    name: 'Engelsrufer',
    domain: 'engelsrufer.de',
    avatar: 'https://img.logo.dev/engelsrufer.de?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 12,
    position: 98,
    trend: 1,
    trendUp: true,
    date: '18 Jan 2025',
    categories: ['Inactive', 'Jewelry', 'Fashion'],
    competitorPrice: 55.00,
    myPrice: 49.99,
  },
  {
    id: 25,
    name: 'Makaro',
    domain: 'makarojewelry.com',
    avatar: 'https://img.logo.dev/makarojewelry.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 45,
    position: 75,
    trend: 8,
    trendUp: true,
    date: '24 Jan 2025',
    categories: ['Active', 'Jewelry', 'Design', '+4'],
    competitorPrice: 52.00,
    myPrice: 48.00,
  },
  {
    id: 26,
    name: 'Bruna The Label',
    domain: 'brunathelabel.com',
    avatar: 'https://img.logo.dev/brunathelabel.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 28,
    position: 88,
    trend: 3,
    trendUp: false,
    date: '22 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion'],
    competitorPrice: 28.00,
    myPrice: 35.50,
  },
  {
    id: 27,
    name: 'PDPaola',
    domain: 'pdpaola.com',
    avatar: 'https://img.logo.dev/pdpaola.com?format=jpg&size=40&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
    products: 125,
    position: 35,
    trend: 22,
    trendUp: true,
    date: '27 Jan 2025',
    categories: ['Active', 'Jewelry', 'Fashion', '+4'],
    competitorPrice: 39.99,
    myPrice: 42.00,
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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-lg font-semibold text-foreground">{competitor.products.toLocaleString()}</div>
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
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);

  // Use jewelry products data instead of competitors
  const currentData = jewelryProducts;
  
  // Calculate max products for relative scaling
  const maxProducts = React.useMemo(() => {
    return Math.max(...currentData.map(c => c.variants || 0));
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
      const visibleIds = new Set(sortedProducts.map(item => item.id));
      const allVisibleSelected = sortedProducts.every(item => prev.has(item.id));

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
  const handleKeyDown = (event: React.KeyboardEvent, productId: number, index: number) => {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const length = sortedProducts.length;
        const nextIndex = index + 1 >= length ? 0 : index + 1;
        setFocusedRowIndex(nextIndex);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const length = sortedProducts.length;
        const prevIndex = index - 1 < 0 ? length - 1 : index - 1;
        setFocusedRowIndex(prevIndex);
        break;
      }
      case ' ':
      case 'Enter':
        event.preventDefault();
        toggleRow(productId);
        break;
      case 'Escape':
        setFocusedRowIndex(null);
        break;
    }
  };

  // Filter products based on search query (memoized for performance)
  const filteredProducts = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentData;
    return currentData.filter(product =>
      product.name.toLowerCase().includes(q) ||
      product.brand.name.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q)
    );
  }, [searchQuery, currentData]);

  // Sort according to product, price or trend toggle
  const sortedProducts = React.useMemo(() => {
    if (productSort === 'none' && priceSort === 'none') return filteredProducts;
    const list = [...filteredProducts];
    list.sort((a, b) => {
      if (productSort !== 'none') {
        const diff = (a.variants || 0) - (b.variants || 0);
        return productSort === 'asc' ? diff : -diff;
      }
      if (priceSort !== 'none') {
        // Sort by relative price position: (my - competitor) / competitor
        const relA = (a.myPrice - a.competitorPrice) / a.competitorPrice;
        const relB = (b.myPrice - b.competitorPrice) / b.competitorPrice;
        const diff = relA - relB;
        return priceSort === 'asc' ? diff : -diff;
      }
      return 0;
    });
    return list;
  }, [filteredProducts, productSort, priceSort]);

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to first page when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, productSort, priceSort]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const togglePriceSort = () => {
    setPriceSort(prev => (prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none'));
    setProductSort('none');
  };


  const toggleProductSort = () => {
    setProductSort(prev => (prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none'));
    setPriceSort('none');
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
        {searchQuery && `Found ${filteredProducts.length} products matching "${searchQuery}"`}
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
                  <p className="mt-1 text-sm text-muted-foreground">Monitor competitor pricing, product counts, and market positioning.</p>
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
                <div className="absolute left-1/2 top-[60px] -translate-x-1/2 text-[30px] font-semibold text-primary">240</div>
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
                <h2 className="text-base md:text-lg font-semibold text-foreground">Product Catalog</h2>
                <span className="inline-flex items-center rounded-full border border-border-secondary bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {sortedProducts.length} products
                </span>
              </div>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground">Monitor your jewelry products with competitor pricing and inventory tracking.</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button className="hidden sm:flex items-center gap-1 rounded-lg border border-border-secondary bg-background px-3 md:px-3.5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted">
                <Upload className="h-4 md:h-5 w-4 md:w-5 text-quaternary" />
                <span className="hidden md:inline">Import</span>
              </button>
              <button className="flex items-center gap-1 rounded-lg border-2 border-white/10 bg-primary px-3 md:px-3.5 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
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
                Search products by name, brand, or SKU
              </label>
              <Search className="pointer-events-none absolute left-2 md:left-3 top-1/2 h-4 md:h-5 w-4 md:w-5 -translate-y-1/2 text-quaternary" aria-hidden="true" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, brand, or SKU"
                className="w-full rounded-lg border border-border-secondary bg-background py-2 pl-8 md:pl-10 pr-10 md:pr-16 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/40"
                aria-describedby="search-help"
                aria-label="Search products by name, brand, or SKU"
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
            data={paginatedProducts}
            selectedRows={selectedRows}
            onRowSelectionChange={setSelectedRows}
            onSortChange={(sorting) => {
              if (sorting.column === 'products') {
                setProductSort(sorting.direction);
                setPriceSort('none');
              } else if (sorting.column === 'competitorPrice') {
                setPriceSort(sorting.direction);
                setProductSort('none');
              }
            }}
            onRowClick={(row) => setFocusedRowIndex(paginatedProducts.findIndex(c => c.id === row.id))}
            onRowKeyDown={(e, row, index) => handleKeyDown(e, row.id, index)}
            focusedRowIndex={focusedRowIndex ?? -1}
            maxProducts={maxProducts}
            badgeClasses={badgeClasses}
            ProductsCell={({ competitor, maxProducts }) => (
              <JewelryProductCell 
                product={{
                  id: competitor.id,
                  name: competitor.name,
                  image: competitor.avatar,
                  sku: (competitor as any).sku || `SKU-${competitor.id}`,
                  brand: {
                    name: (competitor as any).brand?.name || 'Unknown Brand',
                    logo: (competitor as any).brand?.logo
                  },
                  myPrice: (competitor as any).myPrice || competitor.competitorPrice,
                  competitorCount: (competitor as any).competitorCount || 0,
                  status: (competitor as any).status || 'Active',
                  currency: (competitor as any).currency || 'EUR',
                  categories: (competitor as any).categories || []
                }}
                showPrice={false}
                showStatus={true}
                showCompetitorCount={false}
                showTooltip={true}
                size="md"
              />
            )}
            PricePositionCell={PricePositionCell}
            computeTrend={computeTrend}
            formatPercentDetailed={formatPercentDetailed}
            formatPercentCompact={formatPercentCompact}
            showProductsColumn={false} // Remove Products column
            showCompetitorsColumn={true} // Enable Competitors column for catalog page
            showMaterialsColumn={true} // Enable Materials column for catalog page
            showBrandColumn={true} // Enable Brand column for catalog page
            showChannelColumn={true} // Enable Channel column for catalog page
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-secondary px-4 md:px-6 py-3">
          <div className="text-xs md:text-sm font-medium text-muted-foreground dark:text-gray-300">
            Page {currentPage} of {totalPages}
            <span className="sr-only">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedProducts.length)} of {sortedProducts.length} products
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-border-secondary bg-background px-3 py-2 text-xs md:text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Go to previous page"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 ${
                      currentPage === pageNum
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-border-secondary bg-background px-3 py-2 text-xs md:text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
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
