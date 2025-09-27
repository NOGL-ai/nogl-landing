import React from 'react';
import StatWidget from '@/components/Dashboard/StatWidget';
import StackedBarChart from '@/components/Dashboard/StackedBarChart';
import PieChart from '@/components/Dashboard/PieChart';
import DataTable from '@/components/Dashboard/DataTable';
import LoadingChart from '@/components/Dashboard/LoadingChart';
import { getDictionary } from '@/libs/dictionary';
import { Locale } from '@/i18n';

export default async function DashboardPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
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
      change: { from: '$110.49', to: '$99.49' },
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
    <div className="p-5">
      {/* Page Header */}
      <div className="mb-3 bg-white dark:bg-gray-800 rounded-xl border border-[#F2F2F2] dark:border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-1.5 flex-1">
            <div className="flex flex-col items-start gap-1 flex-1">
              <h1 className="text-[#14151A] dark:text-white font-bold text-2xl leading-8">
                {dict.dashboard.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#F2F2F2] dark:border-gray-700 p-4 mb-5">
        {/* First Row - Stat Widgets */}
        <div className="grid grid-cols-3 gap-5 mb-5">
          <StatWidget
            title={dict.dashboard.overpricedProduct}
            percentage={39.5}
            value={764}
            total={1263}
            progressColor="#FB3748"
            progressBackgroundColor="#FFEBED"
            className="h-[161px]"
          />
          <StatWidget
            title={dict.dashboard.samePriceProducts}
            percentage={0}
            value={0}
            total={1263}
            progressColor="#E1E4EA"
            progressBackgroundColor="#E1E4EA"
            className="h-[161px]"
          />
          <StatWidget
            title={dict.dashboard.competitiveProducts}
            percentage={32.5}
            value={499}
            total={1263}
            progressColor="#1FC16B"
            progressBackgroundColor="#E9F9F0"
            className="h-[161px]"
          />
        </div>

        {/* Second Row - Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
          <StackedBarChart
            data={priceChangesData}
            title={dict.dashboard.priceChangesSummary}
            className="h-[442px]"
          />
          <PieChart
            data={pieChartData}
            centerValue="1263"
            centerLabel={dict.dashboard.products}
            title={dict.dashboard.priceGroups}
            className="h-[442px]"
          />
        </div>
      </div>

      {/* Third Row - Tables and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5 mb-5">
        <LoadingChart
          title={dict.dashboard.profitStatus}
          height="412px"
          className="w-full"
        />
        <DataTable
          columns={competitorColumns}
          data={competitorData}
          title={dict.dashboard.competitorPriceChanges}
          className="w-full h-[412px]"
        />
      </div>

      {/* Fourth Row - Tables */}
      <div className="bg-white rounded-lg border border-[#E2E4E9] p-4">
        <DataTable
          columns={stockColumns}
          data={stockData}
          title={dict.dashboard.vendorStockChanges}
          className="w-full"
        />
      </div>
    </div>
  );
}
