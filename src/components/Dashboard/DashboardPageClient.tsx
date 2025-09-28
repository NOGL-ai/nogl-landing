'use client';

import React from 'react';
import StatWidget from '@/components/Dashboard/StatWidget';
import StackedBarChart from '@/components/Dashboard/StackedBarChart';
import PieChart from '@/components/Dashboard/PieChart';
import DataTable from '@/components/Dashboard/DataTable';
import LoadingChart from '@/components/Dashboard/LoadingChart';
import DashboardPageHeader from '@/components/Dashboard/DashboardPageHeader';
import DashboardWidgetGrid, { DashboardSection } from '@/components/Dashboard/DashboardWidgetGrid';

interface DashboardPageClientProps {
  dict: any;
  priceChangesData: any[];
  pieChartData: any[];
  competitorColumns: any[];
  competitorData: any[];
  stockColumns: any[];
  stockData: any[];
}

export default function DashboardPageClient({
  dict,
  priceChangesData,
  pieChartData,
  competitorColumns,
  competitorData,
  stockColumns,
  stockData,
}: DashboardPageClientProps) {
  const handleColorToggle = () => {
    console.log('Color toggle clicked');
    // Add your color toggle logic here
  };

  const handleFullscreenToggle = () => {
    console.log('Fullscreen toggle clicked');
    // Add your fullscreen toggle logic here
  };

  const handleEditWidgets = () => {
    console.log('Edit widgets clicked');
    // Add your edit widgets logic here
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Page Header */}
        <DashboardPageHeader
          title={dict.dashboard.title}
          onColorToggle={handleColorToggle}
          onFullscreenToggle={handleFullscreenToggle}
          onEditWidgets={handleEditWidgets}
        />

        {/* Key Metrics Section */}
        <DashboardSection>
          <DashboardWidgetGrid columns={3}>
            <StatWidget
              title={dict.dashboard.overpricedProduct}
              percentage={39.5}
              value={764}
              total={1263}
              progressColor="#FB3748"
              progressBackgroundColor="#FFEBED"
              className="h-[161px] shadow-sm hover:shadow-md transition-shadow duration-200"
            />
            <StatWidget
              title={dict.dashboard.samePriceProducts}
              percentage={0}
              value={0}
              total={1263}
              progressColor="#E1E4EA"
              progressBackgroundColor="#E1E4EA"
              className="h-[161px] shadow-sm hover:shadow-md transition-shadow duration-200"
            />
            <StatWidget
              title={dict.dashboard.competitiveProducts}
              percentage={32.5}
              value={499}
              total={1263}
              progressColor="#1FC16B"
              progressBackgroundColor="#E9F9F0"
              className="h-[161px] shadow-sm hover:shadow-md transition-shadow duration-200"
            />
          </DashboardWidgetGrid>
        </DashboardSection>

        {/* Charts Section */}
        <DashboardSection>
          <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 lg:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#F2F2F2] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <StackedBarChart
                data={priceChangesData}
                title={dict.dashboard.priceChangesSummary}
                className="h-[442px]"
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#F2F2F2] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <PieChart
                data={pieChartData}
                centerValue="1263"
                centerLabel={dict.dashboard.products}
                title={dict.dashboard.priceGroups}
                className="h-[442px]"
              />
            </div>
          </div>
        </DashboardSection>

        {/* Analysis Section */}
        <DashboardSection>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-4 lg:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#F2F2F2] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <LoadingChart
                title={dict.dashboard.profitStatus}
                height="412px"
                className="w-full"
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#F2F2F2] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <DataTable
                columns={competitorColumns}
                data={competitorData}
                title={dict.dashboard.competitorPriceChanges}
                className="w-full h-[412px]"
              />
            </div>
          </div>
        </DashboardSection>

        {/* Stock Changes Section */}
        <DashboardSection>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#F2F2F2] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
            <DataTable
              columns={stockColumns}
              data={stockData}
              title={dict.dashboard.vendorStockChanges}
              className="w-full"
            />
          </div>
        </DashboardSection>
    </div>
  );
}
