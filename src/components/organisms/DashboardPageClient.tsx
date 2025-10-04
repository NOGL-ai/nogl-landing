"use client";

import React, { useState, useEffect } from "react";
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
	theme?: 'light' | 'dark';
}

export default function DashboardPageClient({
	dict,
	priceChangesData,
	pieChartData,
	competitorColumns,
	competitorData,
	stockColumns,
	stockData,
	theme = 'light',
}: DashboardPageClientProps) {
	const [isColorWidgetOpen, setIsColorWidgetOpen] = useState(false);
	const [selectedColor, setSelectedColor] = useState<string>("");
	const [mounted, setMounted] = useState(false);

	// Prevent hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

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
			<div className='mx-auto w-full max-w-none space-y-6 px-3 py-4 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 transition-all duration-300'>
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
					<div className='grid grid-cols-1 gap-4 lg:gap-6 xl:gap-8 xl:grid-cols-[2fr_1fr] 2xl:grid-cols-[3fr_1fr]'>
						<div className={`rounded-xl border shadow-sm transition-shadow duration-200 hover:shadow-md ${
							mounted && theme === 'dark' 
								? 'bg-[#181d27] border-[#252b37]' 
								: 'bg-white border-[#F2F2F2]'
						}`}>
							<StackedBarChart
								data={priceChangesData}
								title={dict.dashboard.priceChangesSummary}
								className='h-[442px]'
							/>
						</div>
						<div className={`rounded-xl border shadow-sm transition-shadow duration-200 hover:shadow-md ${
							mounted && theme === 'dark' 
								? 'bg-[#181d27] border-[#252b37]' 
								: 'bg-white border-[#F2F2F2]'
						}`}>
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
					<div className='grid grid-cols-1 gap-4 lg:gap-6 xl:gap-8 xl:grid-cols-[1fr_2fr] 2xl:grid-cols-[1fr_3fr]'>
						<div className={`rounded-xl border shadow-sm transition-shadow duration-200 hover:shadow-md ${
							mounted && theme === 'dark' 
								? 'bg-[#181d27] border-[#252b37]' 
								: 'bg-white border-[#F2F2F2]'
						}`}>
							<LoadingChart
								title={dict.dashboard.profitStatus}
								height='412px'
								className='w-full'
							/>
						</div>
						<div className={`rounded-xl border shadow-sm transition-shadow duration-200 hover:shadow-md ${
							mounted && theme === 'dark' 
								? 'bg-[#181d27] border-[#252b37]' 
								: 'bg-white border-[#F2F2F2]'
						}`}>
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
					<div className={`rounded-xl border shadow-sm transition-shadow duration-200 hover:shadow-md ${
						mounted && theme === 'dark' 
							? 'border-[#252b37] bg-[#181d27]' 
							: 'border-[#F2F2F2] bg-white'
					}`}>
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
