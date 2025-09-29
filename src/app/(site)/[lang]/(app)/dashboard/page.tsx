import React from 'react';
import DashboardPageClient from '@/components/Dashboard/DashboardPageClient';
import { getDictionary } from '@/libs/dictionary';
import { Locale } from '@/i18n';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  // Sample data for widgets
  const priceChangesData = [
    { month: dict.dashboard.months.jan, overpriced: 16, samePrice: 65, competitive: 80 },
    { month: dict.dashboard.months.feb, overpriced: 29, samePrice: 34, competitive: 54 },
    { month: dict.dashboard.months.mar, overpriced: 45, samePrice: 32, competitive: 82 },
    { month: dict.dashboard.months.apr, overpriced: 16, samePrice: 22, competitive: 76 },
    { month: dict.dashboard.months.may, overpriced: 36, samePrice: 44, competitive: 80 },
    { month: dict.dashboard.months.jun, overpriced: 28, samePrice: 21, competitive: 58 },
    { month: dict.dashboard.months.jul, overpriced: 16, samePrice: 48, competitive: 80 },
    { month: dict.dashboard.months.aug, overpriced: 16, samePrice: 44, competitive: 45 },
    { month: dict.dashboard.months.sep, overpriced: 16, samePrice: 32, competitive: 17 },
    { month: dict.dashboard.months.oct, overpriced: 30, samePrice: 54, competitive: 80 },
    { month: dict.dashboard.months.nov, overpriced: 16, samePrice: 18, competitive: 80 },
    { month: dict.dashboard.months.dec, overpriced: 16, samePrice: 65, competitive: 80 },
  ];

  const pieChartData = [
    { label: dict.dashboard.pieChartLabels.overpriced, value: 1105, percentage: 87.50, color: '#FB3748' },
    { label: dict.dashboard.pieChartLabels.samePrice, value: 158, percentage: 12.50, color: '#CACFD8' },
    { label: dict.dashboard.pieChartLabels.competitive, value: 95, percentage: 7.50, color: '#1FC16B' },
  ];

  const competitorColumns = [
    { id: 'product', label: dict.dashboard.product, sortable: true, width: '300px' },
    { id: 'competitor', label: dict.dashboard.competitor, sortable: true, width: '180px' },
    { id: 'currency', label: 'Currency', sortable: true, width: '80px' },
    { id: 'change', label: dict.dashboard.change, sortable: true, width: '180px' },
    { id: 'time', label: dict.dashboard.time, sortable: true, width: '100px' },
  ];

  const competitorData = [
    {
      product: {
        name: 'Dior Sauvage Eau de Toilette 75ml Special Edition',
        brand: `${dict.dashboard.brand}: Dior`,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=40&h=40&fit=crop&auto=format'
      },
      competitor: {
        name: 'deloox.com',
        logo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=32&h=32&fit=crop&auto=format'
      },
      currency: 'USD',
      change: { from: '110.49', to: '99.49' },
      time: `3 ${dict.dashboard.daysAgo}`
    },
  ];

  const stockColumns = [
    { id: 'product', label: dict.dashboard.product, sortable: true, width: '300px' },
    { id: 'competitor', label: dict.dashboard.competitor, sortable: true, width: '200px' },
    { id: 'stockChange', label: dict.dashboard.stockChange, sortable: true, width: '400px' },
    { id: 'time', label: dict.dashboard.time, sortable: true, width: '120px' },
  ];

  const stockData = [
    {
      product: {
        name: 'Dior Sauvage Eau de Toilette 75ml Special Edition',
        brand: `${dict.dashboard.brand}: Dior`,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=40&h=40&fit=crop&auto=format'
      },
      competitor: {
        name: 'deloox.com',
        logo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=32&h=32&fit=crop&auto=format'
      },
      stockChange: { from: dict.dashboard.inStock, to: dict.dashboard.outOfStock },
      time: `3 ${dict.dashboard.daysAgo}`
    },
  ];

        return (
          <DashboardPageClient
            dict={dict}
            priceChangesData={priceChangesData}
            pieChartData={pieChartData}
            competitorColumns={competitorColumns}
            competitorData={competitorData}
            stockColumns={stockColumns}
            stockData={stockData}
          />
        );
}
