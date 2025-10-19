"use client";

import React, { useState } from "react";
import { DownloadCloudIcon, CalendarIcon, FilterIcon } from "lucide-react";
import MetricCard from "@/components/molecules/MetricCard";
import WorldMap from "@/components/molecules/WorldMap";
import PricingBarChart from "@/components/molecules/PricingBarChart";
import PricingOverviewChart from "@/components/molecules/PricingOverviewChart";
import type { WinningProductsData } from "@/data/winningProducts";

interface MetricData {
	label: string;
	value: string;
	change: {
		value: string;
		trend: "positive" | "negative";
	};
	compareText: string;
}

interface PricingBarChartDataPoint {
	month: string;
	comparable: number;
	competitive: number;
	premium: number;
}

interface PricingOverviewDataPoint {
	label: string;
	value: number;
	color: string;
}

interface AnalyticsDashboardProps {
	userName: string;
	metrics: MetricData[];
	winningProductsData: WinningProductsData;
	pricingBarChartData: Record<string, PricingBarChartDataPoint[]>;
	pricingOverviewData: PricingOverviewDataPoint[];
}

export default function AnalyticsDashboard({
	userName,
	metrics,
	winningProductsData,
	pricingBarChartData,
	pricingOverviewData,
}: AnalyticsDashboardProps) {
	const [selectedPeriod, setSelectedPeriod] = useState("30 days");
	const periods = ["12 months", "30 days", "7 days", "24 hours"];

	return (
		<div className="flex flex-1 flex-col items-start gap-6 bg-bg-primary px-4 py-8 md:px-8">
			{/* Header Section */}
			<div className="flex w-full flex-col gap-5">
				<div className="flex flex-col gap-4">
					{/* Page Header */}
					<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
						<div className="flex min-w-[320px] flex-1 flex-col gap-1">
							<h1 className="text-2xl font-semibold leading-8 text-text-primary">
								Welcome back, {userName}
							</h1>
							<p className="text-base leading-6 text-text-secondary">
								Measure your advertising ROI and track and report website traffic.
							</p>
						</div>
						<div className="flex items-center gap-3">
							<button className="flex items-center justify-center gap-1 rounded-lg border border-border-primary bg-bg-primary px-3.5 py-2.5 shadow-sm transition-colors hover:bg-bg-secondary">
								<DownloadCloudIcon className="h-5 w-5 text-fg-quaternary" />
								<span className="px-0.5 text-sm font-semibold leading-5 text-text-secondary">
									Export
								</span>
							</button>
							<button className="flex items-center justify-center gap-1 rounded-lg border-2 border-border-brand-solid bg-bg-brand-solid px-3.5 py-2.5 shadow-sm transition-colors hover:bg-bg-brand-solid-hover">
								<span className="px-0.5 text-sm font-semibold leading-5 text-text-on-brand">
									Insights
								</span>
							</button>
						</div>
					</div>

					{/* Tabs and Filters */}
					<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
						{/* Button Group */}
						<div className="flex items-start overflow-hidden rounded-lg border border-border-primary shadow-sm">
							{periods.map((period, index) => (
								<button
									key={period}
									onClick={() => setSelectedPeriod(period)}
									className={`flex min-h-[40px] items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold leading-5 transition-colors ${
										index !== periods.length - 1 ? "border-r border-border-primary" : ""
									} ${
										selectedPeriod === period
											? "bg-bg-secondary text-text-primary"
											: "bg-bg-primary text-text-secondary hover:bg-bg-secondary"
									}`}
								>
									{period}
								</button>
							))}
						</div>

						{/* Actions */}
						<div className="flex items-center gap-3">
							<button className="flex items-center justify-center gap-1 rounded-lg border border-border-primary bg-bg-primary px-3.5 py-2.5 shadow-sm transition-colors hover:bg-bg-secondary">
								<CalendarIcon className="h-5 w-5 text-fg-quaternary" />
								<span className="px-0.5 text-sm font-semibold leading-5 text-text-tertiary">
									Select dates
								</span>
							</button>
							<button className="flex items-center justify-center gap-1 rounded-lg border border-border-primary bg-bg-primary px-3.5 py-2.5 shadow-sm transition-colors hover:bg-bg-secondary">
								<FilterIcon className="h-5 w-5 text-fg-quaternary" />
								<span className="px-0.5 text-sm font-semibold leading-5 text-text-secondary">
									Filters
								</span>
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Metrics Section */}
			<div className="flex w-full flex-wrap items-start gap-6">
				{metrics.map((metric, index) => (
					<MetricCard key={index} {...metric} />
				))}
			</div>

			{/* Winning Products Section */}
			<div className="w-full">
				<WorldMap 
					totalCount={winningProductsData.totalCount}
					countryData={winningProductsData.countryBreakdown}
					locations={winningProductsData.locations}
				/>
			</div>

			{/* Charts Section */}
			<div className="flex w-full flex-col gap-8 rounded-xl border border-border-primary bg-bg-primary p-4 shadow-sm md:p-6 lg:flex-row lg:items-start lg:gap-12 lg:p-8">
				<PricingBarChart dataByChannel={pricingBarChartData} />
				<PricingOverviewChart data={pricingOverviewData} />
			</div>
		</div>
	);
}
