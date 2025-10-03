"use client";

import React, { useState } from "react";
import StatWidget from "../atoms/StatWidget";
import StackedBarChart from "../molecules/StackedBarChart";
import PieChart from "../molecules/PieChart";
import DataTable from "../molecules/DataTable";
import LoadingChart from "../atoms/LoadingChart";
import DashboardPageHeader from "../molecules/DashboardPageHeader";
import DashboardWidgetGrid, { DashboardSection } from "./DashboardWidgetGrid";
import ColorWidget from "../molecules/ColorWidget";

interface DashboardPageClientProps {
	dict: unknown;
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
	const [isColorWidgetOpen, setIsColorWidgetOpen] = useState(false);
	const [selectedColor, setSelectedColor] = useState<string>("");

	const handleColorToggle = () => {
		setIsColorWidgetOpen(true);
	};

	const handleColorWidgetClose = () => {
		setIsColorWidgetOpen(false);
	};

	const handleColorSelect = (color: string) => {
		setSelectedColor(color);

		// Add your color selection logic here
	};

	const handleFullscreenToggle = () => {
		// Add your fullscreen toggle logic here
	};

	const handleEditWidgets = () => {
		// Add your edit widgets logic here
	};

	return (
		<>
			<div className='mx-auto w-full max-w-7xl space-y-6 p-4 transition-all duration-300 lg:p-6'>
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
							progressColor='#FB3748'
							progressBackgroundColor='#FFEBED'
							className='h-[161px] shadow-sm transition-shadow duration-200 hover:shadow-md'
						/>
						<StatWidget
							title={dict.dashboard.samePriceProducts}
							percentage={0}
							value={0}
							total={1263}
							progressColor='#E1E4EA'
							progressBackgroundColor='#E1E4EA'
							className='h-[161px] shadow-sm transition-shadow duration-200 hover:shadow-md'
						/>
						<StatWidget
							title={dict.dashboard.competitiveProducts}
							percentage={32.5}
							value={499}
							total={1263}
							progressColor='#1FC16B'
							progressBackgroundColor='#E9F9F0'
							className='h-[161px] shadow-sm transition-shadow duration-200 hover:shadow-md'
						/>
					</DashboardWidgetGrid>
				</DashboardSection>

				{/* Charts Section */}
				<DashboardSection>
					<div className='grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-[2fr_1fr]'>
						<div className='rounded-xl border border-[#F2F2F2] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800'>
							<StackedBarChart
								data={priceChangesData}
								title={dict.dashboard.priceChangesSummary}
								className='h-[442px]'
							/>
						</div>
						<div className='rounded-xl border border-[#F2F2F2] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800'>
							<PieChart
								data={pieChartData}
								centerValue='1263'
								centerLabel={dict.dashboard.products}
								title={dict.dashboard.priceGroups}
								className='h-[442px]'
							/>
						</div>
					</div>
				</DashboardSection>

				{/* Analysis Section */}
				<DashboardSection>
					<div className='grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-[1fr_2fr]'>
						<div className='rounded-xl border border-[#F2F2F2] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800'>
							<LoadingChart
								title={dict.dashboard.profitStatus}
								height='412px'
								className='w-full'
							/>
						</div>
						<div className='rounded-xl border border-[#F2F2F2] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800'>
							<DataTable
								columns={competitorColumns}
								data={competitorData}
								title={dict.dashboard.competitorPriceChanges}
								className='h-[412px] w-full'
							/>
						</div>
					</div>
				</DashboardSection>

				{/* Stock Changes Section */}
				<DashboardSection>
					<div className='rounded-xl border border-[#F2F2F2] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800'>
						<DataTable
							columns={stockColumns}
							data={stockData}
							title={dict.dashboard.vendorStockChanges}
							className='w-full'
						/>
					</div>
				</DashboardSection>
			</div>

			{/* Color Widget Modal */}
			<ColorWidget
				isOpen={isColorWidgetOpen}
				onClose={handleColorWidgetClose}
				onColorSelect={handleColorSelect}
			/>
		</>
	);
}
